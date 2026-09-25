import { prisma } from '../../config/database';
import {
  CertificateSourceType,
  CertificateVerificationMethod,
  VerificationStatus,
} from '@prisma/client';
import type { CreateCertificateInput, UpdateCertificateInput } from './certificates.schema';

const certificateInclude = {
  student: { select: { id: true, name: true, email: true, institutionId: true } },
  verifier: { select: { id: true, name: true, email: true } },
  document: { select: { id: true, filename: true, accessPolicy: true } },
  skills: { include: { skill: { select: { id: true, name: true, category: true, domain: true } } } },
  portfolioItems: { select: { id: true, title: true } },
};

// ─── Student: own certificate operations ────────────────────────────────────

export async function listMyCertificates(studentId: string) {
  return prisma.certificate.findMany({
    where: { studentId },
    include: certificateInclude,
    orderBy: { issueDate: 'desc' },
  });
}

export async function getCertificateById(id: string, requesterId: string, requesterRole: string) {
  const cert = await prisma.certificate.findUnique({ where: { id }, include: certificateInclude });
  if (!cert) return null;

  // Owner can always view their own
  if (cert.studentId === requesterId) return cert;

  // Admin can view all
  if (requesterRole === 'ADMIN') return cert;

  // Industry/Academician can view if it belongs to a student in their org
  if (requesterRole === 'INDUSTRY') {
    const requester = await prisma.user.findUnique({ where: { id: requesterId }, select: { organizationId: true } });
    // Allow — we can't easily check org scope here without student's institutionId, so restrict to public certs for now
    if (cert.isPublic) return cert;
    return null;
  }

  return null;
}

export async function createCertificate(studentId: string, input: CreateCertificateInput) {
  const { skillIds, credentialUrl, ...data } = input;

  // Validate document ownership if provided
  if (data.documentId) {
    const doc = await prisma.document.findUnique({ where: { id: data.documentId } });
    if (!doc || doc.ownerId !== studentId) throw new Error('Invalid document');
  }

  const cert = await prisma.certificate.create({
    data: {
      ...data,
      credentialUrl: credentialUrl || null,
      studentId,
      issueDate: new Date(data.issueDate),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      verificationStatus: VerificationStatus.SELF_REPORTED,
      verificationMethod: CertificateVerificationMethod.SELF_REPORTED,
      skills: skillIds?.length
        ? { create: skillIds.map(skillId => ({ skillId })) }
        : undefined,
    },
    include: certificateInclude,
  });

  return cert;
}

export async function updateCertificate(id: string, studentId: string, input: UpdateCertificateInput) {
  const existing = await prisma.certificate.findUnique({ where: { id } });
  if (!existing) throw new Error('Certificate not found');
  if (existing.studentId !== studentId) throw new Error('Unauthorized');

  // Only self-reported/pending certs can be edited by student
  if (existing.verificationStatus === VerificationStatus.VERIFIED) {
    throw new Error('Cannot edit a verified certificate');
  }

  const { skillIds, credentialUrl, issueDate, expiryDate, ...data } = input;

  if (data.documentId && data.documentId !== existing.documentId) {
    const doc = await prisma.document.findUnique({ where: { id: data.documentId } });
    if (!doc || doc.ownerId !== studentId) throw new Error('Invalid document');
  }

  // Update skills if provided
  if (skillIds !== undefined) {
    await prisma.certificateSkill.deleteMany({ where: { certificateId: id } });
    if (skillIds.length > 0) {
      await prisma.certificateSkill.createMany({
        data: skillIds.map(skillId => ({ certificateId: id, skillId })),
        skipDuplicates: true,
      });
    }
  }

  return prisma.certificate.update({
    where: { id },
    data: {
      ...data,
      credentialUrl: credentialUrl !== undefined ? credentialUrl || null : undefined,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : expiryDate === null ? null : undefined,
    },
    include: certificateInclude,
  });
}

export async function deleteCertificate(id: string, studentId: string) {
  const existing = await prisma.certificate.findUnique({ where: { id } });
  if (!existing) throw new Error('Certificate not found');
  if (existing.studentId !== studentId) throw new Error('Unauthorized');

  // Cannot delete verified certs
  if (existing.verificationStatus === VerificationStatus.VERIFIED) {
    throw new Error('Cannot delete a verified certificate');
  }

  await prisma.certificate.delete({ where: { id } });
}

// ─── Portfolio integration ───────────────────────────────────────────────────

export async function addCertificateToPortfolio(certificateId: string, studentId: string) {
  const cert = await prisma.certificate.findUnique({ where: { id: certificateId }, include: { skills: { include: { skill: true } } } });
  if (!cert) throw new Error('Certificate not found');
  if (cert.studentId !== studentId) throw new Error('Unauthorized');

  // Check for existing portfolio item linked to this cert
  const existing = await prisma.portfolioItem.findFirst({ where: { certificateId, studentId } });
  if (existing) throw new Error('Already in portfolio');

  return prisma.portfolioItem.create({
    data: {
      studentId,
      certificateId,
      type: 'CERTIFICATE',
      title: cert.title,
      description: `Issued by ${cert.issuer}`,
      date: cert.issueDate,
      documentId: cert.documentId,
      verificationStatus: cert.verificationStatus,
    },
  });
}

// ─── Admin / Verifier: verification operations ──────────────────────────────

export async function listPendingCertificates(adminId: string) {
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { institutionId: true, organizationId: true } });
  const scopeId = admin?.institutionId || admin?.organizationId;

  return prisma.certificate.findMany({
    where: {
      verificationStatus: VerificationStatus.PENDING,
      ...(scopeId && {
        student: { institutionId: scopeId }
      }),
    },
    include: certificateInclude,
    orderBy: { createdAt: 'asc' },
  });
}

export async function verifyCertificate(id: string, verifierId: string) {
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) throw new Error('Certificate not found');
  if (cert.verificationStatus !== VerificationStatus.PENDING) {
    throw new Error('Certificate is not in PENDING state');
  }
  // Cannot verify own certificate
  if (cert.studentId === verifierId) throw new Error('Cannot verify your own certificate');

  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      verificationStatus: VerificationStatus.VERIFIED,
      verificationMethod: CertificateVerificationMethod.ADMIN_VERIFIED,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      rejectionReason: null,
    },
    include: certificateInclude,
  });

  // Update linked portfolio items' verification status
  await prisma.portfolioItem.updateMany({
    where: { certificateId: id },
    data: { verificationStatus: VerificationStatus.VERIFIED },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      userId: cert.studentId,
      type: 'SYSTEM',
      payload: {
        title: 'Certificate Verified ✅',
        message: `Your certificate "${cert.title}" has been verified.`,
        actionUrl: `/student/certifications/${cert.id}`,
      },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: verifierId,
      action: 'CERTIFICATE_VERIFIED',
      entityType: 'Certificate',
      entityId: id,
    },
  });

  return updated;
}

export async function rejectCertificate(id: string, verifierId: string, rejectionReason?: string) {
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) throw new Error('Certificate not found');
  if (cert.verificationStatus !== VerificationStatus.PENDING) {
    throw new Error('Certificate is not in PENDING state');
  }
  if (cert.studentId === verifierId) throw new Error('Cannot reject your own certificate');

  const updated = await prisma.certificate.update({
    where: { id },
    data: {
      verificationStatus: VerificationStatus.REJECTED,
      verificationMethod: CertificateVerificationMethod.ADMIN_VERIFIED,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      rejectionReason: rejectionReason || 'No reason provided',
    },
    include: certificateInclude,
  });

  await prisma.notification.create({
    data: {
      userId: cert.studentId,
      type: 'SYSTEM',
      payload: {
        title: 'Certificate Rejected',
        message: `Your certificate "${cert.title}" was rejected. Reason: ${rejectionReason || 'No reason provided'}`,
        actionUrl: `/student/certifications/${cert.id}`,
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: verifierId,
      action: 'CERTIFICATE_REJECTED',
      entityType: 'Certificate',
      entityId: id,
      metadata: { rejectionReason },
    },
  });

  return updated;
}

// Submit for verification (student action - changes from SELF_REPORTED to PENDING)
export async function submitForVerification(id: string, studentId: string) {
  const cert = await prisma.certificate.findUnique({ where: { id } });
  if (!cert) throw new Error('Certificate not found');
  if (cert.studentId !== studentId) throw new Error('Unauthorized');
  if (cert.verificationStatus !== VerificationStatus.SELF_REPORTED) {
    throw new Error('Certificate is not in SELF_REPORTED state');
  }

  return prisma.certificate.update({
    where: { id },
    data: { verificationStatus: VerificationStatus.PENDING },
    include: certificateInclude,
  });
}

// ─── Internal issuance (from Programs, Internship, Mentorship, Learning) ────

export async function issueCertificateFromSource(
  studentId: string,
  sourceType: CertificateSourceType,
  sourceId: string,
  title: string,
  issuer: string,
  description: string,
  skillIds: string[],
  verificationMethod: CertificateVerificationMethod = CertificateVerificationMethod.INTERNAL_COMPLETION,
) {
  // Idempotency — don't create duplicate
  const existing = await prisma.certificate.findFirst({
    where: { studentId, sourceType, sourceId },
  });
  if (existing) return existing;

  const cert = await prisma.certificate.create({
    data: {
      studentId,
      title,
      issuer,
      description,
      issueDate: new Date(),
      sourceType,
      sourceId,
      verificationStatus: VerificationStatus.VERIFIED,
      verificationMethod,
      isPublic: false,
      skills: skillIds.length
        ? { create: skillIds.map(skillId => ({ skillId })) }
        : undefined,
    },
    include: certificateInclude,
  });

  // Notify student
  await prisma.notification.create({
    data: {
      userId: studentId,
      type: 'SYSTEM',
      payload: {
        title: '🎓 New Certificate Issued',
        message: `You've been issued a certificate: "${title}". Add it to your portfolio!`,
        actionUrl: `/student/certifications/${cert.id}`,
      },
    },
  });

  return cert;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getCertificateAnalytics(institutionId: string) {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', institutionId },
    select: { id: true },
  });
  const studentIds = students.map(s => s.id);

  const [total, verified, pending, bySource] = await Promise.all([
    prisma.certificate.count({ where: { studentId: { in: studentIds } } }),
    prisma.certificate.count({ where: { studentId: { in: studentIds }, verificationStatus: 'VERIFIED' } }),
    prisma.certificate.count({ where: { studentId: { in: studentIds }, verificationStatus: 'PENDING' } }),
    prisma.certificate.groupBy({
      by: ['sourceType'],
      where: { studentId: { in: studentIds } },
      _count: true,
    }),
  ]);

  return { total, verified, pending, bySource };
}

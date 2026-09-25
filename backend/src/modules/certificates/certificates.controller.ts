import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { createCertificateSchema, updateCertificateSchema, verifyCertificateSchema } from './certificates.schema';
import * as svc from './certificates.service';

const getUserId = (req: Request): string => {
  const id = (req.user as any)?.id || (req.user as any)?.userId;
  if (!id) throw new Error('Unauthenticated');
  return id;
};

// GET /api/certificates — student's own
export const getMyCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const certs = await svc.listMyCertificates(getUserId(req));
    res.json(certs);
  } catch (e) { next(e); }
};

// GET /api/certificates/:id
export const getCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cert = await svc.getCertificateById(req.params.id as string, getUserId(req), req.user!.role);
    if (!cert) { res.status(404).json({ error: 'Certificate not found' }); return; }
    res.json(cert);
  } catch (e) { next(e); }
};

// POST /api/certificates
export const createCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = createCertificateSchema.parse(req.body);
    const cert = await svc.createCertificate(getUserId(req), input);
    res.status(201).json(cert);
  } catch (e) {
    if (e instanceof ZodError) { res.status(400).json({ error: e.errors }); return; }
    next(e);
  }
};

// PATCH /api/certificates/:id
export const updateCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = updateCertificateSchema.parse(req.body);
    const cert = await svc.updateCertificate(req.params.id as string, getUserId(req), input);
    res.json(cert);
  } catch (e) {
    if (e instanceof ZodError) { res.status(400).json({ error: e.errors }); return; }
    if ((e as Error).message === 'Unauthorized') { res.status(403).json({ error: 'Forbidden' }); return; }
    if ((e as Error).message.includes('not found')) { res.status(404).json({ error: (e as Error).message }); return; }
    next(e);
  }
};

// DELETE /api/certificates/:id
export const deleteCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await svc.deleteCertificate(req.params.id as string, getUserId(req));
    res.status(204).send();
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') { res.status(403).json({ error: 'Forbidden' }); return; }
    if ((e as Error).message.includes('not found')) { res.status(404).json({ error: (e as Error).message }); return; }
    next(e);
  }
};

// POST /api/certificates/:id/portfolio
export const addToPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await svc.addCertificateToPortfolio(req.params.id as string, getUserId(req));
    res.status(201).json(item);
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') { res.status(403).json({ error: 'Forbidden' }); return; }
    if ((e as Error).message === 'Already in portfolio') { res.status(409).json({ error: 'Already in portfolio' }); return; }
    if ((e as Error).message.includes('not found')) { res.status(404).json({ error: (e as Error).message }); return; }
    next(e);
  }
};

// POST /api/certificates/:id/submit
export const submitForVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cert = await svc.submitForVerification(req.params.id as string, getUserId(req));
    res.json(cert);
  } catch (e) {
    if ((e as Error).message === 'Unauthorized') { res.status(403).json({ error: 'Forbidden' }); return; }
    next(e);
  }
};

// GET /api/certificates/admin/pending — admin sees all pending
export const getPendingCertificates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const certs = await svc.listPendingCertificates(getUserId(req));
    res.json(certs);
  } catch (e) { next(e); }
};

// PATCH /api/certificates/:id/verify
export const verifyCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cert = await svc.verifyCertificate(req.params.id as string, getUserId(req));
    res.json(cert);
  } catch (e) {
    if ((e as Error).message.includes('own certificate')) { res.status(403).json({ error: (e as Error).message }); return; }
    if ((e as Error).message.includes('not in PENDING')) { res.status(409).json({ error: (e as Error).message }); return; }
    next(e);
  }
};

// PATCH /api/certificates/:id/reject
export const rejectCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rejectionReason } = verifyCertificateSchema.parse(req.body);
    const cert = await svc.rejectCertificate(req.params.id as string, getUserId(req), rejectionReason);
    res.json(cert);
  } catch (e) {
    if (e instanceof ZodError) { res.status(400).json({ error: e.errors }); return; }
    if ((e as Error).message.includes('own certificate')) { res.status(403).json({ error: (e as Error).message }); return; }
    next(e);
  }
};

// GET /api/certificates/analytics — admin
export const getCertificateAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const institutionId = req.user?.institutionId || req.user?.organizationId;
    if (!institutionId) { res.status(400).json({ error: 'No institution scope' }); return; }
    const analytics = await svc.getCertificateAnalytics(institutionId);
    res.json(analytics);
  } catch (e) { next(e); }
};

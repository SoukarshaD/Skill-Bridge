import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { cleanupUsers } from './test-cleanup';

const app = createApp();

describe('Academician Phase 8 Integration Tests', () => {
  let academicianToken: string;
  let industryToken: string;
  let studentToken: string;
  let academicianId: string;
  let industryId: string;
  let studentId: string;
  let oppId: string;

  beforeAll(async () => {
    // 1. Setup Academician
    const academician = await prisma.user.create({
      data: {
        role: 'ACADEMICIAN',
        name: 'Dr. Academician',
        email: `dr_${Date.now()}@academician.edu`,
        passwordHash: 'hashed_password',
        isVerified: true
      }
    });
    academicianId = academician.id;
    academicianToken = generateToken({ userId: academician.id, id: academician.id, role: 'ACADEMICIAN' });

    // 2. Setup Industry
    const org = await prisma.organization.create({
      data: { name: 'Tech Corp', type: 'INDUSTRY', isVerified: true }
    });
    const industry = await prisma.user.create({
      data: {
        role: 'INDUSTRY',
        name: 'Industry Recruiter',
        email: `recruiter_${Date.now()}@tech.com`,
        passwordHash: 'hashed_password',
        isVerified: true,
        organizationId: org.id
      }
    });
    industryId = industry.id;
    industryToken = generateToken({ userId: industry.id, id: industry.id, role: 'INDUSTRY' });

    // 3. Setup Student
    const student = await prisma.user.create({
      data: {
        role: 'STUDENT',
        name: 'Student User',
        email: `student_${Date.now()}@uni.edu`,
        passwordHash: 'hashed_password',
        isVerified: true
      }
    });
    studentId = student.id;
    studentToken = generateToken({ userId: student.id, id: student.id, role: 'STUDENT' });

    // 4. Setup Academician Opportunity
    const opp = await prisma.opportunity.create({
      data: {
        organizationId: org.id,
        title: 'Research Collaboration 2026',
        description: 'Collaborate on AI research',
        type: 'RESEARCH_COLLABORATION',
        status: 'PUBLISHED',
      }
    });
    oppId = opp.id;
  });

  afterAll(async () => {
    const users = [academicianId, industryId, studentId].filter((id): id is string => !!id);
    // Delete opportunity skills and opportunities before users/orgs
    await prisma.applicationStatusHistory.deleteMany({
      where: { application: { opportunityId: oppId } }
    });
    await prisma.application.deleteMany({ where: { opportunityId: oppId } });
    await prisma.opportunitySkill.deleteMany({ where: { opportunityId: oppId } });
    await prisma.opportunity.deleteMany({ where: { id: oppId } });
    await cleanupUsers(users);
    await prisma.organization.deleteMany({ where: { name: 'Tech Corp' } });
  });

  describe('PUT /api/users/profile/academician', () => {
    it('should allow ACADEMICIAN to update profile', async () => {
      const res = await request(app)
        .put('/api/users/profile/academician')
        .set('Cookie', [`token=${academicianToken}`])
        .send({
          expertise: ['AI', 'Machine Learning'],
          researchAreas: ['NLP'],
          institution: 'MIT'
        });

      expect(res.status).toBe(200);
      expect(res.body.profile.expertise).toContain('AI');
      expect(res.body.profile.institution).toBe('MIT');
    });

    it('should reject STUDENT attempting to update academic profile', async () => {
      const res = await request(app)
        .put('/api/users/profile/academician')
        .set('Cookie', [`token=${studentToken}`])
        .send({
          expertise: ['Hacking']
        });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/opportunities/academician/browse', () => {
    it('should fetch Academician opportunities for ACADEMICIAN', async () => {
      const res = await request(app)
        .get('/api/opportunities/academician/browse')
        .set('Cookie', [`token=${academicianToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.opportunities.length).toBeGreaterThan(0);
      expect(res.body.opportunities[0].type).toBe('RESEARCH_COLLABORATION');
    });

    it('should reject STUDENT attempting to browse academician opportunities', async () => {
      const res = await request(app)
        .get('/api/opportunities/academician/browse')
        .set('Cookie', [`token=${studentToken}`]);
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/applications', () => {
    it('should allow ACADEMICIAN to apply to opportunity', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Cookie', [`token=${academicianToken}`])
        .send({ opportunityId: oppId });

      expect(res.status).toBe(201);
      expect(res.body.application.studentId).toBe(academicianId);
    });
  });

  describe('GET /api/opportunities/academicians/search', () => {
    it('should allow INDUSTRY to search academicians and NOT leak credentials', async () => {
      const res = await request(app)
        .get('/api/opportunities/academicians/search?query=AI')
        .set('Cookie', [`token=${industryToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.academicians.length).toBeGreaterThan(0);
      const acad = res.body.academicians[0];
      
      // Strict payload verification (No Leakage)
      expect(acad.id).toBe(academicianId);
      expect(acad.name).toBe('Dr. Academician');
      expect(acad.email).toContain('@academician.edu');
      expect(acad.passwordHash).toBeUndefined(); // MUST NOT leak
      expect(acad.role).toBeUndefined(); // Excluded by strict select
      
      expect(acad.academicProfile.expertise).toContain('AI');
      expect(acad.academicProfile.institution).toBe('MIT');
    });

    it('should reject STUDENT attempting to search academicians', async () => {
      const res = await request(app)
        .get('/api/opportunities/academicians/search')
        .set('Cookie', [`token=${studentToken}`]);
      expect(res.status).toBe(403);
    });
  });
});

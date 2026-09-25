import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/database';

vi.mock('../config/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    careerRole: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    learningResource: {
      findMany: vi.fn(),
    },
    opportunity: {
      findMany: vi.fn(),
    },
    portfolioItem: {
      findMany: vi.fn(),
    },
    certificate: {
      findMany: vi.fn(),
    },
    internship: {
      findMany: vi.fn(),
    },
    projectWorkspace: {
      findMany: vi.fn(),
    }
  }
}));

vi.mock('../middleware/auth.middleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = { id: 'test-student-id', role: 'STUDENT', organizationId: null };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  }
}));

const app = createApp();

describe('Career Guidance API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/career-guidance/recommendations', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/career-guidance/recommendations');
      expect(res.status).toBe(401);
    });

    it('returns recommendations for authenticated student', async () => {
      const mockUser = {
        id: 'test-student-id',
        role: 'STUDENT',
        studentProfile: {
          studentSkills: [
            { skillId: 'skill-1', proficiency: 4, skill: { name: 'JavaScript' } },
            { skillId: 'skill-2', proficiency: 2, skill: { name: 'Python' } }
          ]
        }
      };

      const mockRoles = [
        {
          id: 'role-1',
          title: 'Frontend Developer',
          requiredSkills: [
            { skillId: 'skill-1', requiredProficiency: 4, weight: 2.0, skill: { name: 'JavaScript' } },
            { skillId: 'skill-3', requiredProficiency: 3, weight: 1.0, skill: { name: 'React' } }
          ]
        }
      ];

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.careerRole.findMany as any).mockResolvedValue(mockRoles);

      const res = await request(app)
        .get('/api/career-guidance/recommendations')
        .set('Authorization', 'Bearer dummy-token');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.recommendations).toHaveLength(1);
      
      const rec = res.body.recommendations[0];
      // JavaScript (skill-1): min(4/4, 1) = 1 * 2.0 = 2.0
      // React (skill-3): min(0/3, 1) = 0 * 1.0 = 0
      // Total weight: 3.0
      // Score: 2.0 / 3.0 = 67%
      expect(rec.score).toBe(67);
      expect(rec.matchedSkills).toHaveLength(1); // JavaScript
      expect(rec.missingSkills).toHaveLength(1); // React
      expect(rec.missingSkills[0].studentProficiency).toBe(0); // missing skill is 0
    });
  });

  describe('GET /api/career-guidance/path/:roleId', () => {
    it('returns 401 for unauthenticated request', async () => {
      const res = await request(app).get('/api/career-guidance/path/role-1');
      expect(res.status).toBe(401);
    });

    it('returns career pathway for authenticated student', async () => {
      const mockUser = {
        id: 'test-student-id',
        role: 'STUDENT',
        studentProfile: {
          studentSkills: []
        }
      };

      const mockRole = {
        id: 'role-1',
        title: 'Backend Developer',
        requiredSkills: [
          { skillId: 'skill-2', requiredProficiency: 3, weight: 1.0, skill: { name: 'Python' } }
        ]
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.careerRole.findUnique as any).mockResolvedValue(mockRole);
      (prisma.learningResource.findMany as any).mockResolvedValue([]);
      (prisma.opportunity.findMany as any).mockResolvedValue([]);
      (prisma.portfolioItem.findMany as any).mockResolvedValue([]);
      (prisma.certificate.findMany as any).mockResolvedValue([]);
      (prisma.internship.findMany as any).mockResolvedValue([]);
      (prisma.projectWorkspace.findMany as any).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/career-guidance/path/role-1')
        .set('Authorization', 'Bearer dummy-token');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.pathway.role.id).toBe('role-1');
      expect(res.body.pathway.readinessPercentage).toBe(0);
      expect(res.body.pathway.skillGaps).toHaveLength(1);
      expect(res.body.pathway.evidence).toBeDefined();
    });
  });
});

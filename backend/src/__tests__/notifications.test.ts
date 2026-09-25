import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';

const app = createApp();

describe('Notifications Integration Tests', () => {
  let studentToken: string;
  let studentId: string;
  let notificationId: string;

  beforeAll(async () => {
    // Setup user
    const student = await prisma.user.create({
      data: {
        role: 'STUDENT',
        name: 'Notification Test User',
        email: `notif_${Date.now()}@test.edu`,
        passwordHash: 'hashed',
        isVerified: true
      }
    });
    studentId = student.id;
    studentToken = generateToken({ userId: student.id, id: student.id, role: 'STUDENT' });

    // Create a mock notification
    const notification = await prisma.notification.create({
      data: {
        userId: studentId,
        type: 'SYSTEM',
        payload: { message: 'Welcome to the system!' }
      }
    });
    notificationId = notification.id;
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId: studentId } });
    await prisma.user.delete({ where: { id: studentId } });
  });

  describe('GET /api/notifications', () => {
    it('should return a list of notifications for the user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Cookie', [`token=${studentToken}`]);
      
      expect(res.status).toBe(200);
      expect(res.body.notifications).toBeDefined();
      expect(res.body.notifications.length).toBe(1);
      expect(res.body.notifications[0].isRead).toBe(false);
      expect(res.body.notifications[0].payload.message).toBe('Welcome to the system!');
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark a specific notification as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .set('Cookie', [`token=${studentToken}`]);
      
      expect(res.status).toBe(200);
      expect(res.body.notification.isRead).toBe(true);
    });

    it('should return 404 for a non-existent notification', async () => {
      const res = await request(app)
        .patch('/api/notifications/invalid-id-here/read')
        .set('Cookie', [`token=${studentToken}`]);
      
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Cookie', [`token=${studentToken}`]);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../app';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import { cleanupUsers } from './test-cleanup';

const app = createApp();

describe('Auth API', () => {
  beforeAll(async () => {
    const testUsers = await prisma.user.findMany({ where: { email: { contains: 'test' } }, select: { id: true } });
    const userIds = testUsers.map(u => u.id);
    await cleanupUsers(userIds);
  });

  afterAll(async () => {
    const testUsers = await prisma.user.findMany({ where: { email: { contains: 'test' } }, select: { id: true } });
    const userIds = testUsers.map(u => u.id);
    await cleanupUsers(userIds);
  });


  describe('POST /api/auth/register', () => {
    it('should register a new student successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'student.test@example.com',
          password: 'password123',
          role: 'STUDENT',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('student.test@example.com');
      expect(response.body.user.role).toBe('STUDENT');
      // Should set a token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'invalid-email',
          password: 'password123',
          role: 'STUDENT',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail if email is already in use', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student 2',
          email: 'student.test@example.com',
          password: 'password123',
          role: 'STUDENT',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student.test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('student.test@example.com');
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student.test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info when authenticated', async () => {
      // First get a user
      const passwordHash = await bcrypt.hash("password123", 10);
      const user = await prisma.user.create({
        data: {
          name: "Me Test User",
          email: "me.test@example.com",
          passwordHash,
          role: "STUDENT"
        }
      });
      
      const token = generateToken({ id: user.id, userId: user.id, role: user.role });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('me.test@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});

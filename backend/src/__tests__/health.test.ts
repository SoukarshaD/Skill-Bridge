import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Health Check', () => {
  it('GET /api/health should return 200 with success message', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Academia-Industry Portal API is running');
    expect(response.body.timestamp).toBeDefined();
  });
});

import http from 'http';
import fetch from 'node-fetch';

async function verifySecurity() {
  const API = 'http://localhost:4000/api';
  console.log('--- EXPLICIT NEGATIVE AUTHORIZATION TESTS ---');
  
  // 1. Unauthenticated Request
  const res1 = await fetch(`${API}/users/profile`);
  console.log(`Unauthenticated GET /api/users/profile: ${res1.status} (Expected: 401)`);
  
  // 2. Unauthenticated POST to protected route
  const res2 = await fetch(`${API}/opportunities`, { method: 'POST' });
  console.log(`Unauthenticated POST /api/opportunities: ${res2.status} (Expected: 401)`);
  
  console.log('\n--- PASSWORD HASH OMISSION TESTS ---');
  // 3. Register a temporary user to get a token
  const email = `test-${Date.now()}@example.com`;
  const registerRes = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Audit User', email, password: 'password123', role: 'STUDENT' })
  });
  
  const setCookie = registerRes.headers.get('set-cookie');
  console.log(`Registration successful: ${registerRes.status === 201}, Cookie received: ${!!setCookie}`);
  
  const meRes = await fetch(`${API}/auth/me`, {
    headers: { 'Cookie': setCookie || '' }
  });
  const meData = await meRes.json();
  console.log(`GET /api/auth/me leaks passwordHash? ${'passwordHash' in (meData.user || meData) ? 'YES' : 'NO'}`);
  
  const profileRes = await fetch(`${API}/users/profile`, {
    headers: { 'Cookie': setCookie || '' }
  });
  const profileData = await profileRes.json();
  console.log(`GET /api/users/profile leaks passwordHash? ${'passwordHash' in (profileData.user || profileData) ? 'YES' : 'NO'}`);
  
  console.log('\n--- ROLE ISOLATION TEST (403) ---');
  // Student trying to post an opportunity (Requires INDUSTRY role)
  const oppRes = await fetch(`${API}/opportunities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': setCookie || '' },
    body: JSON.stringify({ title: 'Hack', description: 'hack', requirements: 'hack', location: 'hack', type: 'INTERNSHIP', duration: '1 month' })
  });
  console.log(`Student POST /api/opportunities: ${oppRes.status} (Expected: 403)`);
}

verifySecurity().catch(console.error);

// Automated Auth Test Suite for Deal&Demand
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'deal-and-demand-super-secret-key-2026';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 Starting Deal&Demand Automated Auth Tests...\n');

  try {
    // 1. Valid Customer Login
    console.log('Test 1: Valid Customer Login');
    const custRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@demo.com',
        password: 'password123',
        role: 'customer',
      }),
    });
    const custData = await custRes.json();
    assert(custRes.status === 200, 'Customer login returns 200 status');
    assert(custData.success === true, 'Response success is true');
    assert(typeof custData.token === 'string' && custData.token.length > 20, 'JWT token returned');
    assert(custData.user?.role === 'CUSTOMER', 'User role is CUSTOMER');
    assert(custData.user?.email === 'customer@demo.com', 'User email is customer@demo.com');

    // 2. Valid Worker Login
    console.log('\nTest 2: Valid Worker Login');
    const workerRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'worker@demo.com',
        password: 'password123',
        role: 'worker',
      }),
    });
    const workerData = await workerRes.json();
    assert(workerRes.status === 200, 'Worker login returns 200 status');
    assert(workerData.user?.role === 'WORKER', 'User role is WORKER');
    assert(workerData.user?.workerProfile !== null, 'Worker profile is included');

    // 3. Valid Admin Login
    console.log('\nTest 3: Valid Admin Login');
    const adminRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@demo.com',
        password: 'password123',
        role: 'admin',
      }),
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 200, 'Admin login returns 200 status');
    assert(adminData.user?.role === 'ADMIN', 'User role is ADMIN');

    // 4. Invalid Password
    console.log('\nTest 4: Invalid Password Rejection');
    const badPassRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@demo.com',
        password: 'wrongpassword999',
        role: 'customer',
      }),
    });
    const badPassData = await badPassRes.json();
    assert(badPassRes.status === 401, 'Invalid password returns 401 status');
    assert(badPassData.success === false, 'Success is false');
    assert(badPassData.message === 'Invalid credentials.', 'Accurate error message returned');

    // 5. Role Mismatch
    console.log('\nTest 5: Role Mismatch Rejection');
    const roleMismatchRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'worker@demo.com',
        password: 'password123',
        role: 'customer', // Attempting to log into customer portal with worker account
      }),
    });
    const roleMismatchData = await roleMismatchRes.json();
    assert(roleMismatchRes.status === 403, 'Role mismatch returns 403 status');
    assert(roleMismatchData.success === false, 'Success is false');
    assert(
      roleMismatchData.message.includes('This account is registered as a worker'),
      `Role mismatch message indicates registration: "${roleMismatchData.message}"`
    );

    // 6. Expired Token Rejection
    console.log('\nTest 6: Expired Token Handling');
    const expiredToken = jwt.sign(
      { userId: custData.user.id, email: custData.user.email, role: 'CUSTOMER' },
      JWT_SECRET,
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );
    const expiredRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const expiredData = await expiredRes.json();
    assert(expiredRes.status === 401, 'Expired token returns 401 status');
    assert(expiredData.success === false, 'Expired token success is false');

    // 7. Session Restoration via /auth/me
    console.log('\nTest 7: Valid Session Restoration (/auth/me)');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${custData.token}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Session restore returns 200 status');
    assert(meData.success === true, 'Session restore success is true');
    assert(meData.user?.name === custData.user.name, 'Restores correct user profile');

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();

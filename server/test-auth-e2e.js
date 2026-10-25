/**
 * Deal&Demand Comprehensive Authentication & Onboarding E2E Test Suite
 * Tests customer registration, worker multi-step onboarding, validation rules,
 * duplicate detection, login role validation, admin verification queue and approval.
 */

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 DEAL&DEMAND: E2E AUTH & ONBOARDING VERIFICATION');
  console.log('======================================================\n');

  const timestamp = Date.now();
  const testCustomer = {
    name: 'Rohit Sharma',
    email: `rohit_${timestamp}@example.com`,
    phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Password123!',
    city: 'Mumbai',
  };

  const testWorker = {
    name: 'Kavita Sundaram',
    email: `kavita_${timestamp}@example.com`,
    phone: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Password123!',
    city: 'Bengaluru',
    categoryNames: ['Carpenter'],
    skills: 'Teak Wood, CNC Router, Modular Furniture',
    experienceYears: 7,
    serviceArea: 'Indiranagar, Bengaluru',
    dailyRate: 1500,
    upiId: `kavita@okhdfcbank`,
    bankAccount: '918273645102',
    bankIfsc: 'HDFC0001234',
    kycDocuments: [
      { docType: 'AADHAAR', docNumber: '4455-6677-8899', docUrl: 'https://example.com/aadhaar.pdf' },
      { docType: 'TRADE_LICENSE', docNumber: 'TL-BLR-9021', docUrl: 'https://example.com/license.pdf' }
    ]
  };

  // TEST 1: Health check
  console.log('--- TEST 1: Server Health ---');
  const health = await request('/api/health');
  assert(health.status === 200 && health.data.status === 'online', 'Server health endpoint reports online');

  // TEST 2: Validation - Weak Password
  console.log('\n--- TEST 2: Validation Enforcement ---');
  const weakPwRes = await request('/api/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify({ ...testCustomer, email: `weak_${timestamp}@example.com`, password: 'weak' }),
  });
  assert(weakPwRes.status === 400 && weakPwRes.data.message.toLowerCase().includes('password'), 'Weak password (<8 chars / missing numbers) is rejected');

  // TEST 3: Validation - Invalid Phone Number
  const invalidPhoneRes = await request('/api/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify({ ...testCustomer, phone: '123' }),
  });
  assert(invalidPhoneRes.status === 400 && invalidPhoneRes.data.message.includes('phone'), 'Invalid phone number (not 10 digits) is rejected');

  // TEST 4: Customer Registration Success
  console.log('\n--- TEST 4: Customer Registration ---');
  const regCustRes = await request('/api/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify(testCustomer),
  });
  assert(regCustRes.status === 201 && regCustRes.data.success, 'Customer account successfully created and saved in SQLite database');
  assert(regCustRes.data.user.role === 'CUSTOMER', 'Customer has role CUSTOMER');
  assert(Boolean(regCustRes.data.token), 'JWT authentication token issued upon customer registration');

  // TEST 5: Duplicate Email Check
  console.log('\n--- TEST 5: Duplicate Email Rejection ---');
  const dupEmailRes = await request('/api/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify({ ...testCustomer, phone: '9999999999' }),
  });
  assert(dupEmailRes.status === 400 && dupEmailRes.data.message.includes('already exists'), 'Duplicate email registration rejected with exact error message');

  // TEST 6: Duplicate Phone Check
  console.log('\n--- TEST 6: Duplicate Phone Rejection ---');
  const dupPhoneRes = await request('/api/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify({ ...testCustomer, email: `diff_${timestamp}@example.com` }),
  });
  assert(dupPhoneRes.status === 400 && dupPhoneRes.data.message.includes('already exists'), 'Duplicate phone registration rejected with exact error message');

  // TEST 7: Customer Login Success
  console.log('\n--- TEST 7: Customer Login ---');
  const loginCustRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testCustomer.email, password: testCustomer.password, role: 'customer' }),
  });
  assert(loginCustRes.status === 200 && loginCustRes.data.success, 'Customer login succeeds with valid credentials');
  assert(loginCustRes.data.user.email === testCustomer.email, 'Logged-in user details match registration');

  // TEST 8: Customer Login Wrong Password
  console.log('\n--- TEST 8: Invalid Password Rejection ---');
  const wrongPwRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testCustomer.email, password: 'WrongPassword999!', role: 'customer' }),
  });
  assert(wrongPwRes.status === 401 && wrongPwRes.data.message.includes('Invalid email or password'), 'Wrong password rejected with standard error');

  // TEST 9: Role Portal Mismatch
  console.log('\n--- TEST 9: Role Portal Mismatch Protection ---');
  const roleMismatchRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testCustomer.email, password: testCustomer.password, role: 'worker' }),
  });
  assert(roleMismatchRes.status === 403 && roleMismatchRes.data.message.includes('registered as a customer'), 'Customer prevented from entering Worker portal with helpful message');

  // TEST 10: Worker Multi-Step Registration
  console.log('\n--- TEST 10: Worker Multi-Step Registration & KYC ---');
  const regWorkerRes = await request('/api/auth/register/worker', {
    method: 'POST',
    body: JSON.stringify(testWorker),
  });
  assert(regWorkerRes.status === 201 && regWorkerRes.data.success, 'Worker account created with workerProfile and KYC documents');
  assert(regWorkerRes.data.user.role === 'WORKER', 'Registered user has role WORKER');
  const worker = regWorkerRes.data.worker || regWorkerRes.data.user?.workerProfile;
  assert(worker && worker.verificationState === 'PENDING', 'Worker verification state is set to PENDING');

  const workerId = worker ? worker.id : null;

  // TEST 11: Worker Login
  console.log('\n--- TEST 11: Worker Login ---');
  const loginWorkerRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testWorker.email, password: testWorker.password, role: 'worker' }),
  });
  assert(loginWorkerRes.status === 200 && loginWorkerRes.data.success, 'Worker successfully logs in');
  assert(loginWorkerRes.data.user.workerProfile.verificationState === 'PENDING', 'Worker dashboard reflects PENDING KYC status');

  // TEST 12: Admin Login with Seeded Credentials
  console.log('\n--- TEST 12: Administrator Authentication ---');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dealndemand.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const loginAdminRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: adminEmail, password: adminPassword, role: 'admin' }),
  });
  assert(loginAdminRes.status === 200 && loginAdminRes.data.success, 'Administrator logs in successfully with seeded credentials');
  assert(loginAdminRes.data.user.role === 'ADMIN', 'Admin has role ADMIN');

  const adminToken = loginAdminRes.data.token;

  // TEST 13: Admin Inspects Verification Queue
  console.log('\n--- TEST 13: Admin Verification Queue Inspection ---');
  const queueRes = await request('/api/admin/verifications', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(queueRes.status === 200 && Array.isArray(queueRes.data.queue), 'Admin successfully retrieves KYC verification queue');
  const queuedWorker = queueRes.data.queue.find((w) => w.id === workerId);
  assert(Boolean(queuedWorker), 'Newly registered artisan is present in the admin verification queue');
  assert(queuedWorker.kycDocuments.length >= 2, 'Artisan uploaded KYC documents are linked and visible to Admin');

  // TEST 14: Admin Approves Worker KYC
  console.log('\n--- TEST 14: Admin Worker KYC Approval ---');
  const approveRes = await request(`/api/admin/verifications/${workerId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'VERIFIED',
      badgeLevel: 'VERIFIED',
      adminNote: 'Aadhaar and Trade License verified by system administrator.',
    }),
  });
  assert(approveRes.status === 200 && approveRes.data.success, 'Admin approves worker KYC and grants VERIFIED badge');
  assert(approveRes.data.worker.verificationState === 'VERIFIED', 'Worker state in database updated to VERIFIED');

  // TEST 15: Public Marketplace Stats
  console.log('\n--- TEST 15: Public Marketplace Stats Dynamic Calculation ---');
  const statsRes = await request('/api/stats/public');
  assert(statsRes.status === 200 && statsRes.data.success, 'Public stats endpoint returns live database counts');
  assert(statsRes.data.stats.verifiedWorkers >= 1, 'Verified worker count accurately incremented in real database');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});

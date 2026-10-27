// Comprehensive End-to-End Test for Chat, Security, Masking, and Admin Endpoints
const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✅ ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING DEAL&DEMAND CHAT & ADMIN TEST SUITE');
  console.log('======================================================\n');

  // 1. Authenticate Admin
  console.log('1. Authenticating Admin User...');
  const adminLogin = await request(`${API_BASE}/auth/login`, { method: 'POST' }, {
    email: 'admin@dealndemand.com',
    password: 'AdminPassword123!',
  });
  assert(adminLogin.status === 200, 'Admin login succeeded');
  const adminToken = adminLogin.data.token;
  assert(Boolean(adminToken), 'Admin token returned');

  // 2. Register / Login Test Customer
  console.log('\n2. Registering / Authenticating Test Customer...');
  const customerEmail = `customer_${Date.now()}@example.com`;
  const customerReg = await request(`${API_BASE}/auth/register/customer`, { method: 'POST' }, {
    name: 'Rohan Sharma',
    email: customerEmail,
    phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Password123!',
    city: 'Bengaluru',
  });
  assert(customerReg.status === 201, 'Customer registration returned 201');
  const customerToken = customerReg.data.token;
  const customerId = customerReg.data.user.id;

  // 3. Register / Login Test Worker
  console.log('\n3. Registering / Authenticating Test Artisan (Worker)...');
  const workerEmail = `artisan_${Date.now()}@example.com`;
  const workerReg = await request(`${API_BASE}/auth/register/worker`, { method: 'POST' }, {
    name: 'Suresh Kumar',
    email: workerEmail,
    phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Password123!',
    city: 'Bengaluru',
    yearsExperience: 7,
    serviceArea: 'Bengaluru',
    categories: ['carpenter'],
  });
  assert(workerReg.status === 201, 'Worker registration returned 201');
  const workerToken = workerReg.data.token;
  const workerUserId = workerReg.data.user.id;
  const workerProfileId = workerReg.data.worker.id;

  // 4. Customer Posts a Deal
  console.log('\n4. Customer Posting a Requirement / Deal...');
  // Fetch categories
  const catRes = await request(`${API_BASE}/categories`);
  const carpenterCat = catRes.data.categories.find(c => c.slug === 'carpenter') || catRes.data.categories[0];

  const dealRes = await request(`${API_BASE}/deals`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  }, {
    title: 'Custom Teak Wood Bookshelf',
    description: 'Need a 6-tier custom bookshelf made from Burma Teak wood.',
    categoryId: carpenterCat.id,
    minBudget: 15000,
    maxBudget: 28000,
    city: 'Bengaluru',
    address: 'Indiranagar 100ft Rd',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    urgency: 'NORMAL',
  });
  assert(dealRes.status === 201, 'Deal created successfully');
  const dealId = dealRes.data.deal.id;

  // 5. Worker Submits Quotation (Auto Chat Creation Test)
  console.log('\n5. Worker Submitting Quotation (Ensures Chat Thread Auto-Created)...');
  const quoteRes = await request(`${API_BASE}/quotations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` },
  }, {
    requirementId: dealId,
    totalPrice: 22000,
    timelineDays: 10,
    warrantyMonths: 12,
    deliveryTerms: 'Hand-crafted and on-site assembly included',
    notes: 'Premium teak with melamine polish finish',
  });
  assert(quoteRes.status === 201, 'Quotation submitted successfully');
  const quoteId = quoteRes.data.quotation.id;

  // 6. Test Chat get-or-create idempotency (no duplicates)
  console.log('\n6. Testing POST /api/chats/get-or-create (Uniqueness & Idempotency)...');
  const chat1 = await request(`${API_BASE}/chats/get-or-create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  }, {
    requirementId: dealId,
    workerId: workerProfileId,
  });
  assert(chat1.status === 200, 'Customer get-or-create chat returned 200');
  const chatId = chat1.data.chat.id;
  assert(Boolean(chatId), 'Valid chat ID generated');

  const chat2 = await request(`${API_BASE}/chats/get-or-create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` },
  }, {
    requirementId: dealId,
    customerId: customerId,
  });
  assert(chat2.status === 200, 'Worker get-or-create chat returned 200');
  assert(chat2.data.chat.id === chatId, 'Both parties resolve to the identical conversation thread');

  // 7. Message Sending & Contact Masking Test
  console.log('\n7. Testing Message Sending and Contact Masking (Before Deal Accepted)...');
  const msgSendRes = await request(`${API_BASE}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  }, {
    text: 'Hello Suresh, call me at 9876543210 or email test@gmail.com to check site dimensions at www.mysite.com',
  });
  assert(msgSendRes.status === 201, 'Message sent successfully');

  // Fetch messages from worker side
  const workerMsgRes = await request(`${API_BASE}/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  assert(workerMsgRes.status === 200, 'Worker fetched messages');
  const fetchedMsg = workerMsgRes.data.messages[0];
  assert(fetchedMsg.text.includes('[contact hidden until deal is confirmed]'), 'Phone, email, and link are masked');
  assert(!fetchedMsg.text.includes('9876543210'), 'Raw phone number is not exposed');
  assert(!fetchedMsg.text.includes('test@gmail.com'), 'Raw email is not exposed');

  // 8. Authorization Check (Third Party Forbidden)
  console.log('\n8. Testing Security: Third-Party Access Rejection (403)...');
  const thirdPartyReg = await request(`${API_BASE}/auth/register/customer`, { method: 'POST' }, {
    name: 'Intruder User',
    email: `intruder_${Date.now()}@example.com`,
    phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'Password123!',
    city: 'Mumbai',
  });
  const thirdPartyToken = thirdPartyReg.data.token;

  const unauthorizedRead = await request(`${API_BASE}/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${thirdPartyToken}` },
  });
  assert(unauthorizedRead.status === 403, 'Unauthorized third party blocked from reading chat (HTTP 403)');

  const unauthorizedSend = await request(`${API_BASE}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${thirdPartyToken}` },
  }, { text: 'Spam message' });
  assert(unauthorizedSend.status === 403, 'Unauthorized third party blocked from sending in chat (HTTP 403)');

  // 9. Quotation Acceptance -> Order Created -> System Message & Unmasking
  console.log('\n9. Customer Accepts Quotation (Order Escrow Hold & Chat Unmasking)...');
  const acceptRes = await request(`${API_BASE}/quotations/${quoteId}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customerToken}` },
  }, { deliveryAddress: 'Indiranagar 100ft Rd' });
  assert(acceptRes.status === 200, 'Quotation accepted into Escrow');
  const orderId = acceptRes.data.order.id;

  // Check chat messages now
  const postAcceptMessages = await request(`${API_BASE}/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(postAcceptMessages.data.isDealAccepted === true, 'isDealAccepted is true');
  const unmaskedMsg = postAcceptMessages.data.messages.find(m => m.id === fetchedMsg.id);
  assert(unmaskedMsg.text.includes('9876543210'), 'Masking removed after quotation acceptance: direct phone visible');

  const systemMsg = postAcceptMessages.data.messages.find(m => m.text.includes('Quotation of ₹22,000 accepted. Work can begin.'));
  assert(Boolean(systemMsg), 'Automated system milestone message posted into conversation thread');

  // 10. Admin Endpoints Verification
  console.log('\n10. Testing Admin User Management & Audit Endpoints...');
  const usersList = await request(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(usersList.status === 200, 'GET /api/admin/users returned 200');
  assert(Array.isArray(usersList.data.users), 'Users array returned');
  assert(usersList.data.totalCount >= 3, 'User count reflects persistent DB');

  // Block worker test
  const blockRes = await request(`${API_BASE}/admin/users/${workerUserId}/block`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
  }, { isBlocked: true, reason: 'Test verification suspension' });
  assert(blockRes.status === 200, 'PUT /api/admin/users/:id/block succeeded');
  assert(blockRes.data.user.isBlocked === true, 'User is marked isBlocked: true');

  // Check Audit Log
  const auditRes = await request(`${API_BASE}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(auditRes.status === 200, 'GET /api/admin/audit-logs returned 200');
  assert(auditRes.data.logs.some(l => l.action === 'USER_BLOCKED'), 'USER_BLOCKED event captured in audit trail');

  // Unblock worker
  const unblockRes = await request(`${API_BASE}/admin/users/${workerUserId}/block`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
  }, { isBlocked: false, reason: 'Reinstated by admin test' });
  assert(unblockRes.status === 200, 'PUT /api/admin/users/:id/block reinstated user');

  // Admin Dispute / Order Chat Transcript (Read-Only)
  console.log('\n11. Testing Admin Read-Only Order Chat Transcript Viewer...');
  const transcriptRes = await request(`${API_BASE}/admin/orders/${orderId}/chat`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(transcriptRes.status === 200, 'GET /api/admin/orders/:orderId/chat returned 200');
  assert(Boolean(transcriptRes.data.chat), 'Chat object returned to admin');
  assert(transcriptRes.data.messages.length >= 2, 'Admin receives all contract messages for dispute review');

  console.log('\n======================================================');
  console.log('🎉 ALL 11 TEST SUITES PASSED FLAWLESSLY!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n💥 TEST EXECUTION FAILED:', err);
  process.exit(1);
});

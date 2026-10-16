const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const customer = await prisma.user.findUnique({
    where: { email: 'customer@demo.com' },
    include: {
      requirements: {
        include: {
          orders: { include: { escrow: true, milestones: true } },
          quotations: true
        }
      }
    }
  });

  console.log('Customer:', customer?.name, customer?.email);
  console.log('Requirements count:', customer?.requirements?.length);
  for (const r of customer.requirements || []) {
    console.log('-', r.title, '| Status:', r.status, '| Quotes:', r.quotations.length, '| Orders:', r.orders.length);
    for (const o of r.orders) {
      console.log('   Order:', o.orderNumber, 'status:', o.status, 'Escrow held:', o.escrow?.amountHeld, 'Escrow status:', o.escrow?.status);
    }
  }

  const worker = await prisma.user.findUnique({
    where: { email: 'worker@demo.com' },
    include: {
      workerProfile: {
        include: {
          quotations: true,
          workerOrders: true,
          payouts: true
        }
      }
    }
  });
  console.log('\nWorker:', worker?.name, worker?.email);
  console.log('Worker profile exists:', !!worker?.workerProfile);
  console.log('Quotations:', worker?.workerProfile?.quotations?.length);
  console.log('Orders:', worker?.workerProfile?.orders?.length);
  console.log('Payouts:', worker?.workerProfile?.payouts?.length);

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@demo.com' }
  });
  console.log('\nAdmin:', admin?.name, admin?.email);

  const kycCount = await prisma.kYCDocument.count();
  const disputeCount = await prisma.dispute.count();
  const escrowCount = await prisma.escrowTransaction.count();
  console.log('KYC Docs:', kycCount, '| Disputes:', disputeCount, '| Escrows:', escrowCount);
}

run().catch(console.error).finally(() => prisma.$disconnect());

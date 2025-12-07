import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { email: 'vendor1@example.com' },
    update: {},
    create: {
      name: 'Tech Solutions Inc.',
      email: 'vendor1@example.com',
      contactPerson: 'John Doe',
      phone: '+1-555-0101',
      category: 'IT Equipment',
      notes: 'Preferred vendor for IT equipment'
    }
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { email: 'vendor2@example.com' },
    update: {},
    create: {
      name: 'Office Supplies Co.',
      email: 'vendor2@example.com',
      contactPerson: 'Jane Smith',
      phone: '+1-555-0102',
      category: 'Office Supplies',
      notes: 'Good pricing on bulk orders'
    }
  });

  const vendor3 = await prisma.vendor.upsert({
    where: { email: 'vendor3@example.com' },
    update: {},
    create: {
      name: 'Global Electronics',
      email: 'vendor3@example.com',
      contactPerson: 'Bob Johnson',
      phone: '+1-555-0103',
      category: 'Electronics',
      rating: 4.5
    }
  });

  console.log('Created vendors:', { vendor1, vendor2, vendor3 });

  // Create a sample RFP
  const sampleRFP = await prisma.rFP.create({
    data: {
      title: 'Sample Office Equipment Procurement',
      description: 'Procurement of laptops and monitors for new office setup',
      requirements: [
        {
          item: 'Laptops',
          quantity: 20,
          specifications: '16GB RAM, Intel i7 or equivalent'
        },
        {
          item: 'Monitors',
          quantity: 15,
          specifications: '27-inch, 4K resolution'
        }
      ],
      budget: 50000,
      deadline: new Date('2024-12-31'),
      paymentTerms: 'Net 30',
      warranty: '1 year minimum',
      deliveryTerms: 'Within 30 days',
      status: 'draft'
    }
  });

  console.log('Created sample RFP:', sampleRFP);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


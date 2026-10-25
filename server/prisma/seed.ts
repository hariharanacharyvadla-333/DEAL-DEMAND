import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting minimal, clean Deal&Demand seed...');

  // 1. Core Category Configuration
  const categoriesData = [
    {
      slug: 'carpenter',
      name: 'Carpenter',
      iconName: 'Hammer',
      commissionPct: 5.0,
      description: 'Doors, windows, bespoke wardrobes, modular furniture, and repair woodwork.',
      fields: [
        { fieldName: 'itemType', label: 'Item Type', fieldType: 'dropdown', options: JSON.stringify(['Door', 'Window', 'Wardrobe', 'Kitchen Cabinet', 'Bed', 'Dining Table', 'TV Unit', 'Staircase Handrail', 'Other Custom Item']), isRequired: true, sortOrder: 1 },
        { fieldName: 'material', label: 'Wood Material', fieldType: 'dropdown', options: JSON.stringify(['CP Teak Wood', 'Sal Wood', 'Marine Plywood (BWP)', 'MDF', 'Commercial Ply', 'Engineered Wood']), isRequired: true, sortOrder: 2 },
        { fieldName: 'dimensions', label: 'Dimensions (H x W x Depth in ft or inches)', fieldType: 'text', placeholder: 'e.g., 7ft x 3.5ft x 35mm', isRequired: true, sortOrder: 3 },
        { fieldName: 'quantity', label: 'Quantity / Units', fieldType: 'number', placeholder: '1', isRequired: true, sortOrder: 4 },
        { fieldName: 'finish', label: 'Finish Preference', fieldType: 'dropdown', options: JSON.stringify(['Matte Polish', 'Glossy PU', 'Veneer Polish', 'Laminate / Mica', 'Duco Paint', 'Unfinished']), isRequired: true, sortOrder: 5 },
        { fieldName: 'hardwarePreference', label: 'Hardware Grade', fieldType: 'dropdown', options: JSON.stringify(['Standard Brass / SS', 'Premium Soft-Close (Hafele/Hettich)', 'Worker Recommended', 'None']), isRequired: false, sortOrder: 6 },
        { fieldName: 'installationRequired', label: 'Installation on site required', fieldType: 'toggle', isRequired: true, sortOrder: 7 },
      ],
    },
    {
      slug: 'welder-fabricator',
      name: 'Welder & Fabricator',
      iconName: 'Flame',
      commissionPct: 5.0,
      description: 'Gates, grills, railings, MS/SS structural sheds, and custom metalwork.',
      fields: [
        { fieldName: 'itemType', label: 'Fabrication Item', fieldType: 'dropdown', options: JSON.stringify(['Main Compound Gate', 'Window Safety Grill', 'Balcony Railing', 'Rooftop Truss / Shed', 'Spiral Staircase', 'Industrial Rack']), isRequired: true, sortOrder: 1 },
        { fieldName: 'metalType', label: 'Metal Specification', fieldType: 'dropdown', options: JSON.stringify(['Mild Steel (MS)', 'Stainless Steel 304 Grade', 'Aluminium', 'Wrought Iron']), isRequired: true, sortOrder: 2 },
        { fieldName: 'dimensions', label: 'Dimensions / Area (sq ft or running ft)', fieldType: 'text', placeholder: 'e.g., 14ft x 6ft compound gate', isRequired: true, sortOrder: 3 },
        { fieldName: 'finish', label: 'Protective Finish', fieldType: 'dropdown', options: JSON.stringify(['Satin Powder Coat', 'Anti-Rust Red Oxide + Enamel Paint', 'Mirror Polish (SS)', 'Galvanized']), isRequired: true, sortOrder: 4 },
      ],
    },
    {
      slug: 'painter',
      name: 'Painter',
      iconName: 'Paintbrush',
      commissionPct: 4.5,
      description: 'Interior and exterior painting, texture wall art, waterproofing primer, and polishing.',
      fields: [
        { fieldName: 'type', label: 'Painting Scope', fieldType: 'dropdown', options: JSON.stringify(['Interior Painting', 'Exterior Painting', 'Full House (Int + Ext)', 'Single Feature Wall / Texture']), isRequired: true, sortOrder: 1 },
        { fieldName: 'areaSqFt', label: 'Approx Carpet Area (in sq ft)', fieldType: 'number', placeholder: 'e.g., 1200', isRequired: true, sortOrder: 2 },
        { fieldName: 'numRooms', label: 'Number of Rooms', fieldType: 'dropdown', options: JSON.stringify(['1 BHK', '2 BHK', '3 BHK', '4+ BHK / Villa', 'Commercial Office']), isRequired: true, sortOrder: 3 },
        { fieldName: 'paintBrand', label: 'Preferred Paint Brand', fieldType: 'dropdown', options: JSON.stringify(['Asian Paints Royale', 'Berger Silk', 'Nerolac Impressions', 'Dulux Velvet', 'Economy / Worker choice']), isRequired: false, sortOrder: 4 },
        { fieldName: 'puttyAndPrimer', label: 'Putty & Sanding Needed', fieldType: 'toggle', isRequired: true, sortOrder: 5 },
      ],
    },
    {
      slug: 'mason',
      name: 'Mason',
      iconName: 'BrickWall',
      commissionPct: 5.0,
      description: 'Brickwork, plastering, boundary walls, civil renovations, and concrete casting.',
      fields: [
        { fieldName: 'workType', label: 'Masonry Scope', fieldType: 'dropdown', options: JSON.stringify(['Brick / Block Wall Construction', 'Plastering (Internal / External)', 'Boundary Wall', 'Slab Casting / Lintel', 'Demolition & Rebuilding']), isRequired: true, sortOrder: 1 },
        { fieldName: 'areaSqFt', label: 'Approx Dimension or Area', fieldType: 'text', placeholder: 'e.g., 20ft length x 6ft height', isRequired: true, sortOrder: 2 },
        { fieldName: 'materialsSupplied', label: 'Who supplies cement/sand/bricks?', fieldType: 'dropdown', options: JSON.stringify(['Customer Supplies Materials (Labour Only)', 'Worker Supplies Everything (With Material)']), isRequired: true, sortOrder: 3 },
      ],
    },
    {
      slug: 'plumber',
      name: 'Plumber',
      iconName: 'Wrench',
      commissionPct: 5.0,
      description: 'Bathroom fittings, leakage repairs, water tanks, pipeline layout, and pumps.',
      fields: [
        { fieldName: 'serviceType', label: 'Plumbing Job', fieldType: 'dropdown', options: JSON.stringify(['Full Bathroom Fitting', 'Pipeline Installation / Concealed', 'Water Tank / Motor Pump Installation', 'Tap / Diverter Repair & Replacement', 'Drainage / Sewage Unclogging']), isRequired: true, sortOrder: 1 },
        { fieldName: 'numberOfPoints', label: 'Number of Water Points / Fixtures', fieldType: 'number', placeholder: '4', isRequired: true, sortOrder: 2 },
      ],
    },
    {
      slug: 'electrician',
      name: 'Electrician',
      iconName: 'Zap',
      commissionPct: 5.0,
      description: 'Wiring, switchboards, decorative lighting, MCB distribution, inverters, and appliances.',
      fields: [
        { fieldName: 'serviceType', label: 'Electrical Job', fieldType: 'dropdown', options: JSON.stringify(['Complete House Concealed Wiring', 'Switchboard & Socket Installation', 'Chandelier / Fan / Light Fitting', 'Inverter / Solar Setup', 'MCB Tripping / Fault Diagnosis']), isRequired: true, sortOrder: 1 },
        { fieldName: 'propertySize', label: 'Property Size', fieldType: 'dropdown', options: JSON.stringify(['1-2 Rooms', '2-3 BHK Flat', 'Independent Villa / House', 'Commercial Shop']), isRequired: true, sortOrder: 2 },
      ],
    },
    {
      slug: 'tiler',
      name: 'Tiler',
      iconName: 'Grid',
      commissionPct: 5.0,
      description: 'Vitrified floor tiles, Italian marble laying, bathroom wall tiles, and granite counters.',
      fields: [
        { fieldName: 'tileType', label: 'Tile / Stone Type', fieldType: 'dropdown', options: JSON.stringify(['Vitrified Floor Tiles (4x2 / 2x2)', 'Ceramic Wall Tiles', 'Italian Marble / Granite Slab', 'Wooden Finish Planks']), isRequired: true, sortOrder: 1 },
        { fieldName: 'areaSqFt', label: 'Total Area (sq ft)', fieldType: 'number', placeholder: 'e.g., 650', isRequired: true, sortOrder: 2 },
      ],
    },
    {
      slug: 'modular-kitchen',
      name: 'Modular Kitchen Specialist',
      iconName: 'Utensils',
      commissionPct: 4.0,
      description: 'L-shape, U-shape, parallel and island modular kitchens with acrylic and PU shutters.',
      fields: [
        { fieldName: 'layoutType', label: 'Kitchen Layout', fieldType: 'dropdown', options: JSON.stringify(['L-Shaped', 'U-Shaped', 'Straight / Single Wall', 'Parallel Counter', 'Island Kitchen']), isRequired: true, sortOrder: 1 },
        { fieldName: 'shutterFinish', label: 'Shutter Finish', fieldType: 'dropdown', options: JSON.stringify(['High-Gloss Acrylic', 'PU Lacquered Finish', 'Anti-Fingerprint Matte Laminate', 'Glass Profile']), isRequired: true, sortOrder: 2 },
      ],
    },
    {
      slug: 'interior-designer',
      name: 'Interior Designer',
      iconName: 'Compass',
      commissionPct: 4.0,
      description: 'End-to-end 3D architectural renders, space planning, lighting design, and decor styling.',
      fields: [
        { fieldName: 'scope', label: 'Design Scope', fieldType: 'dropdown', options: JSON.stringify(['Full Residential Interior', 'Living Room + Dining', 'Modular Kitchen & Bedrooms Only', 'Commercial / Retail Office']), isRequired: true, sortOrder: 1 },
      ],
    },
    {
      slug: 'false-ceiling',
      name: 'False Ceiling Specialist',
      iconName: 'Layers',
      commissionPct: 5.0,
      description: 'Gypsum suspended ceilings, POP mouldings, cove lights, and acoustic grid panels.',
      fields: [
        { fieldName: 'ceilingType', label: 'Ceiling Design', fieldType: 'dropdown', options: JSON.stringify(['Gypsum Board with Cove Light Profiles', 'Grid False Ceiling (Armstrong)', 'POP Ornamental Moulding', 'Wooden Rafter Ceiling']), isRequired: true, sortOrder: 1 },
      ],
    },
    {
      slug: 'aluminium-glass',
      name: 'Aluminium & Glass Fitter',
      iconName: 'Maximize2',
      commissionPct: 5.0,
      description: 'Toughened glass shower cubicles, sliding partitions, soundproof windows, and spider glazing.',
      fields: [
        { fieldName: 'itemType', label: 'Glass / Aluminium Work', fieldType: 'dropdown', options: JSON.stringify(['Toughened Glass Shower Partition (10mm/12mm)', 'Domal / Soundproof Sliding Windows', 'Office Glass Partition with Door', 'Patch Fitting Glass Entrance']), isRequired: true, sortOrder: 1 },
      ],
    },
    {
      slug: 'cctv-security',
      name: 'CCTV & Security Installer',
      iconName: 'Video',
      commissionPct: 5.0,
      description: 'IP cameras, DVR/NVR setup, biometric attendance locks, video door phones, and alarms.',
      fields: [
        { fieldName: 'cameraCount', label: 'Number of Cameras Needed', fieldType: 'dropdown', options: JSON.stringify(['2-4 Cameras (Apartment / Small Shop)', '6-8 Cameras (Villa / Large Floor)', '10+ Cameras (Commercial / Warehouse)']), isRequired: true, sortOrder: 1 },
      ],
    },
    {
      slug: 'waterproofing',
      name: 'Waterproofing Specialist',
      iconName: 'ShieldAlert',
      commissionPct: 5.0,
      description: 'Terrace crack filling, chemical membrane coating, bathroom seepage injection grouting.',
      fields: [
        { fieldName: 'leakageArea', label: 'Affected Location', fieldType: 'dropdown', options: JSON.stringify(['Roof Terrace / Slab', 'Bathroom Sunken Slab', 'External Wall Seepage', 'Basement Retaining Wall']), isRequired: true, sortOrder: 1 },
      ],
    },
    {
      slug: 'cleaning-pest',
      name: 'Cleaning & Pest Control',
      iconName: 'Sparkles',
      commissionPct: 5.0,
      description: 'Deep post-construction scrubbing, termite piping drilling, kitchen anti-grease treatment.',
      fields: [
        { fieldName: 'serviceRequired', label: 'Service Scope', fieldType: 'dropdown', options: JSON.stringify(['Full House Deep Cleaning', 'Anti-Termite Drilling Treatment', 'Kitchen & Bathroom Intensive Scrub', 'Sofa & Carpet Shampooing']), isRequired: true, sortOrder: 1 },
      ],
    },
  ];

  for (const catData of categoriesData) {
    const { fields, ...catFields } = catData;
    
    // Check if category already exists
    let existingCategory = await prisma.category.findUnique({
      where: { slug: catFields.slug },
      include: { fields: true },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          ...catFields,
          fields: {
            create: fields.map((f) => ({
              fieldName: f.fieldName,
              label: f.label,
              fieldType: f.fieldType,
              options: f.options,
              isRequired: f.isRequired,
              placeholder: f.placeholder,
              sortOrder: f.sortOrder,
            })),
          },
        },
      });
    }
  }
  console.log(`✅ Verified ${categoriesData.length} core categories and dynamic fields.`);

  // 2. Seed Single Administrator Account from Environment Variables
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@dealndemand.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { role: 'ADMIN' },
      ],
    },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'Deal&Demand Admin',
        role: 'ADMIN',
        phone: '+91 9999900000',
        city: 'Bengaluru',
      },
    });
    console.log(`✅ Created single system Administrator: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Administrator account already exists (${existingAdmin.email}). Skipping.`);
  }

  console.log('🎉 Seed complete! No mock data, no fake workers, and no demo records.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

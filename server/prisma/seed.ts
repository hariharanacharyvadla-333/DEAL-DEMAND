import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Deal&Demand database seed...');

  // Clean existing tables in cascade order
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.escrowTransaction.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.requirementImage.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.kYCDocument.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.workerCategory.deleteMany();
  await prisma.categoryField.deleteMany();
  await prisma.category.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const defaultHash = await bcrypt.hash('password123', salt);

  // 1. SEED 22+ CATEGORIES
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

  const createdCategories: Record<string, any> = {};
  for (const catData of categoriesData) {
    const { fields, ...catFields } = catData;
    const cat = await prisma.category.create({
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
      include: { fields: true },
    });
    createdCategories[cat.slug] = cat;
  }
  console.log(`✅ Seeded ${Object.keys(createdCategories).length} categories with dynamic fields`);

  // 2. SEED PRIMARY PORTAL USERS
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash: defaultHash,
      name: 'Deal&Demand Admin',
      role: 'ADMIN',
      phone: '+91 9876543210',
      city: 'Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      email: 'customer@demo.com',
      passwordHash: defaultHash,
      name: 'Aarav Mehta',
      role: 'CUSTOMER',
      phone: '+91 9820112233',
      city: 'Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const demoWorkerUser = await prisma.user.create({
    data: {
      email: 'worker@demo.com',
      passwordHash: defaultHash,
      name: 'Rajesh Sharma',
      role: 'WORKER',
      phone: '+91 9740556677',
      city: 'Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const demoWorkerProfile = await prisma.workerProfile.create({
    data: {
      userId: demoWorkerUser.id,
      tagline: 'Master Carpenter & Woodcraft Artisan with 14 Years Experience',
      bio: 'Specialist in solid CP teak double entrance doors, modular wardrobes, and antique wood carving. Winner of Karnataka Artisan Guild 2024 award.',
      yearsExperience: 14,
      serviceArea: 'Bengaluru & Whitefield (25km radius)',
      address: '12th Main, Indiranagar, Bengaluru, KA',
      lat: 12.9784,
      lng: 77.6408,
      verificationState: 'VERIFIED',
      badgeLevel: 'PREMIUM',
      rating: 4.9,
      totalReviews: 38,
      jobsCompleted: 44,
      responseRatePct: 98,
      profileCompletePct: 100,
      walletBalance: 24500.0,
      pendingEscrow: 18000.0,
      bankUpiDetails: JSON.stringify({ upiId: 'rajesh.sharma@okaxis', account: '918237461928', ifsc: 'UTIB0000412' }),
      skills: 'Solid Teak Doors, Modular Wardrobes, Antique Wood Polish, CNC Wood Carving, Acoustic Panelling',
      categories: {
        create: [
          { categoryId: createdCategories['carpenter'].id },
          { categoryId: createdCategories['modular-kitchen'].id },
        ],
      },
      portfolioItems: {
        create: [
          {
            title: 'Hand-Carved Burma Teak Entrance Door',
            description: 'Custom 8ft high double door with traditional brass peacock handles and PU matte lacquer finish.',
            imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
            beforeImageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600',
            category: 'Carpentry',
          },
          {
            title: 'Walk-In Floor-to-Ceiling Smoked Veneer Wardrobe',
            description: 'Marine ply carcass with European smoked oak veneer shutters and soft-close Hettich sensors.',
            imageUrl: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?w=600',
            category: 'Modular Wardrobe',
          },
          {
            title: 'Solid Sheesham 8-Seater Dining Suite',
            description: 'Hand-planed raw edge dining table with 8 ergonomic cushioned chairs finished in natural oil.',
            imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
            category: 'Custom Furniture',
          },
          {
            title: 'Acoustic Teak Fluted Wall Panelling',
            description: '3D wood batten wall panelling in master home theatre with concealed acoustic rockwool insulation.',
            imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
            category: 'Wall Panelling',
          },
        ],
      },
      kycDocuments: {
        create: [
          {
            docType: 'AADHAAR',
            docNumber: 'XXXX-XXXX-8921',
            fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500',
            status: 'VERIFIED',
            adminNote: 'Aadhaar verified via UIDAI portal.',
          },
          {
            docType: 'TRADE_LICENSE',
            docNumber: 'BBMP/TL/2023/8812',
            fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500',
            status: 'VERIFIED',
            adminNote: 'Valid BBMP trade registration verified.',
          },
        ],
      },
    },
  });

  // 3. SEED 24 MORE DIVERSE WORKERS (Total 25 workers in public directory with 3-4 portfolio items each)
  const workerRawData = [
    { name: 'Suresh Babu', email: 'suresh.welder@demo.com', city: 'Bengaluru', categorySlug: 'welder-fabricator', skills: 'MS Gates, SS 304 Balcony Railings, Laser Cut CNC Panels', exp: 10, rating: 4.8, jobs: 29, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 15400, escrow: 9000, tagline: 'Expert Metal Fabricator & SS Railing Specialist' },
    { name: 'Vikas Kumar', email: 'vikas.painter@demo.com', city: 'Bengaluru', categorySlug: 'painter', skills: 'Asian Paints Texture Art, Exterior Weatherproofing, Duco Polishing', exp: 8, rating: 4.9, jobs: 35, badge: 'PREMIUM', verification: 'VERIFIED', wallet: 32000, escrow: 14000, tagline: 'Master Wall Decorator & Royal Texture Artist' },
    { name: 'Farhan Ali', email: 'farhan.plumber@demo.com', city: 'Bengaluru', categorySlug: 'plumber', skills: 'Jaquar/Kohler Fittings, Concealed Diverters, Pressure Pumps', exp: 12, rating: 4.7, jobs: 41, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 18900, escrow: 6000, tagline: 'Licensed Sanitary Engineer & High-Rise Plumber' },
    { name: 'Harpreet Singh', email: 'harpreet.electrician@demo.com', city: 'Delhi NCR', categorySlug: 'electrician', skills: 'Home Automation, Schneider Wiring, Inverter Installations', exp: 9, rating: 4.9, jobs: 52, badge: 'PREMIUM', verification: 'VERIFIED', wallet: 28400, escrow: 11000, tagline: 'Certified Smart Home & Industrial Electrician' },
    { name: 'Gopal Krishnan', email: 'gopal.tiler@demo.com', city: 'Bengaluru', categorySlug: 'tiler', skills: 'Italian Marble Mirror Polishing, Large Format Vitrified 6x4 Tiles', exp: 15, rating: 4.8, jobs: 33, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 21500, escrow: 8500, tagline: 'Precision Tile Laying & Marble Master' },
    { name: 'Pooja Hegde', email: 'pooja.interior@demo.com', city: 'Bengaluru', categorySlug: 'interior-designer', skills: '3D SketchUp, Contemporary Scandinavian Interiors, Lighting Layouts', exp: 6, rating: 4.9, jobs: 18, badge: 'PREMIUM', verification: 'VERIFIED', wallet: 45000, escrow: 30000, tagline: 'Contemporary Residential Interior Architect' },
    { name: 'Santosh Yadav', email: 'santosh.mason@demo.com', city: 'Pune', categorySlug: 'mason', skills: 'Red Brick Masonry, Water Tank Plastering, Structural Alterations', exp: 11, rating: 4.6, jobs: 27, badge: 'BASIC', verification: 'VERIFIED', wallet: 12000, escrow: 4000, tagline: 'Experienced Civil Mason & Plastering Contractor' },
    { name: 'Irfan Sheikh', email: 'irfan.ceiling@demo.com', city: 'Hyderabad', categorySlug: 'false-ceiling', skills: 'Gyproc Gypsum Ceilings, CNC Wooden Lattice Panels, Profile LED', exp: 7, rating: 4.8, jobs: 23, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 19500, escrow: 7000, tagline: 'Architectural False Ceiling & Acoustic Designer' },
    { name: 'Karthik Raja', email: 'karthik.glass@demo.com', city: 'Chennai', categorySlug: 'aluminium-glass', skills: 'Saint Gobain Toughened Partitions, Domal Windows, Spider Glazing', exp: 8, rating: 4.7, jobs: 20, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 14000, escrow: 5000, tagline: 'Architectural Glazing & Aluminium Systems' },
    { name: 'Manoj Pillai', email: 'manoj.cctv@demo.com', city: 'Kochi', categorySlug: 'cctv-security', skills: 'Hikvision IP Cameras, CP Plus DVR, Biometric Fingerprint Readers', exp: 5, rating: 4.9, jobs: 38, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 16700, escrow: 3500, tagline: 'Electronic Surveillance & Smart Access Installer' },
    { name: 'Deepak Verma', email: 'deepak.waterproof@demo.com', city: 'Mumbai', categorySlug: 'waterproofing', skills: 'Dr Fixit Chemical Coatings, Terrace Waterproofing, Grouting', exp: 13, rating: 4.8, jobs: 47, badge: 'PREMIUM', verification: 'VERIFIED', wallet: 29000, escrow: 12000, tagline: 'Specialist Seepage & Waterproofing Contractor' },
    { name: 'Amitabh Sen', email: 'amitabh.clean@demo.com', city: 'Kolkata', categorySlug: 'cleaning-pest', skills: 'Bayer Pest Chemicals, Termite Pre-Construction, Steam Cleaning', exp: 6, rating: 4.7, jobs: 31, badge: 'BASIC', verification: 'VERIFIED', wallet: 9800, escrow: 2000, tagline: 'Eco-Friendly Deep Sanitation & Pest Elimination' },
    // 8 Workers for the Admin KYC Queue (4 PENDING, 2 NEEDS_MORE_INFO / review note, 2 APPROVED / VERIFIED)
    { name: 'Sanjay Rawat', email: 'sanjay.kyc1@demo.com', city: 'Ahmedabad', categorySlug: 'carpenter', skills: 'Modular Kitchens, Wardrobe Carcass, Edge Banding', exp: 4, rating: 4.5, jobs: 5, badge: 'NONE', verification: 'PENDING', wallet: 0, escrow: 0, tagline: 'Aspiring Modular Furniture Fabricator', kycNote: 'Aadhaar submitted. Awaiting PAN verification.' },
    { name: 'Rameshwar Pal', email: 'rameshwar.kyc2@demo.com', city: 'Jaipur', categorySlug: 'welder-fabricator', skills: 'Wrought Iron Gates, Traditional Jaali Panels', exp: 5, rating: 4.6, jobs: 8, badge: 'NONE', verification: 'PENDING', wallet: 0, escrow: 0, tagline: 'Artisanal Wrought Iron Fabricator', kycNote: 'New trade registration under inspection.' },
    { name: 'Naveen George', email: 'naveen.kyc3@demo.com', city: 'Kochi', categorySlug: 'electrician', skills: 'Three-Phase Wiring, Sub-Station Panels', exp: 6, rating: 4.7, jobs: 11, badge: 'NONE', verification: 'PENDING', wallet: 0, escrow: 0, tagline: 'High Voltage Domestic & Industrial Electrician', kycNote: 'Wireman license submitted, awaiting sign-off.' },
    { name: 'Tanvi Joshi', email: 'tanvi.kyc4@demo.com', city: 'Pune', categorySlug: 'interior-designer', skills: 'Minimalist Bohemian Decor, AutoCAD Space Planning', exp: 3, rating: 4.8, jobs: 4, badge: 'NONE', verification: 'PENDING', wallet: 0, escrow: 0, tagline: 'Boutique Interior Stylist & Space Planner', kycNote: 'Portfolio under initial audit.' },
    { name: 'Vijay Chauhan', email: 'vijay.kyc5@demo.com', city: 'Delhi NCR', categorySlug: 'plumber', skills: 'Commercial Sewage lines, Rainwater Harvest', exp: 7, rating: 4.5, jobs: 9, badge: 'BASIC', verification: 'PENDING', wallet: 0, escrow: 0, tagline: 'Commercial Drainage & Piping Plumber', kycNote: 'NEEDS_MORE_INFO: Aadhaar card image is blurred. Requested re-upload.' },
    { name: 'Dinesh Solanki', email: 'dinesh.kyc6@demo.com', city: 'Mumbai', categorySlug: 'mason', skills: 'Structural R.C.C. Casting, Brick Masonry', exp: 8, rating: 4.6, jobs: 12, badge: 'BASIC', verification: 'PENDING', wallet: 0, escrow: 0, tagline: 'Heavy Civil & RCC Casting Mason', kycNote: 'NEEDS_MORE_INFO: Trade license expired in 2025. Requested renewal certificate.' },
    { name: 'Anand Murthy', email: 'anand.kitchen@demo.com', city: 'Bengaluru', categorySlug: 'modular-kitchen', skills: 'Boiling Waterproof Ply Kitchens, Quartz Countertops, Blum Tandembox', exp: 10, rating: 4.9, jobs: 36, badge: 'PREMIUM', verification: 'VERIFIED', wallet: 38000, escrow: 25000, tagline: 'Turnkey German & Italian Style Modular Kitchens' },
    { name: 'Chandan Roy', email: 'chandan.painter@demo.com', city: 'Delhi NCR', categorySlug: 'painter', skills: 'Spray Painting, Wood Staining, PU High Gloss', exp: 7, rating: 4.7, jobs: 24, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 13500, escrow: 4500, tagline: 'Automated Airless Spray Painting Specialist' },
    { name: 'Mahesh Patil', email: 'mahesh.mason@demo.com', city: 'Pune', categorySlug: 'mason', skills: 'Stone Cladding, Boundary Retaining Walls, Paving Blocks', exp: 12, rating: 4.8, jobs: 30, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 17800, escrow: 7000, tagline: 'Natural Stone Masonry & Hardscape Specialist' },
    { name: 'Girish Naidu', email: 'girish.carpenter@demo.com', city: 'Hyderabad', categorySlug: 'carpenter', skills: 'Rosewood Carving, Heritage Wooden Pillars, Teak Beds', exp: 16, rating: 4.9, jobs: 42, badge: 'PREMIUM', verification: 'VERIFIED', wallet: 41000, escrow: 19000, tagline: 'Heritage Wood Carver & Antique Restorer' },
    { name: 'Brijesh Pandey', email: 'brijesh.welder@demo.com', city: 'Lucknow', categorySlug: 'welder-fabricator', skills: 'Heavy Industrial Sheds, PEB Structures, Crane Railings', exp: 11, rating: 4.6, jobs: 21, badge: 'BASIC', verification: 'VERIFIED', wallet: 11200, escrow: 3000, tagline: 'Structural Steel & Heavy Metal Fabricator' },
    { name: 'Nitin Kulkarni', email: 'nitin.plumber@demo.com', city: 'Pune', categorySlug: 'plumber', skills: 'Solar Water Heaters, CPVC Concealed Piping, Rainwater Harvesting', exp: 8, rating: 4.8, jobs: 32, badge: 'VERIFIED', verification: 'VERIFIED', wallet: 15300, escrow: 5500, tagline: 'Eco-Plumbing & Solar Piping Specialist' },
  ];

  const seededWorkers: any[] = [demoWorkerProfile];

  for (let i = 0; i < workerRawData.length; i++) {
    const w = workerRawData[i];
    const u = await prisma.user.create({
      data: {
        email: w.email,
        passwordHash: defaultHash,
        name: w.name,
        role: 'WORKER',
        phone: `+91 98${i}0${i}1${i}2${i}3`,
        city: w.city,
        avatarUrl: `https://images.unsplash.com/photo-${1530000000000 + i * 10000000}?w=150`,
      },
    });

    const targetCat = createdCategories[w.categorySlug] || createdCategories['carpenter'];

    const prof = await prisma.workerProfile.create({
      data: {
        userId: u.id,
        tagline: w.tagline,
        bio: `Professional ${targetCat.name} with over ${w.exp} years of verified field expertise in ${w.city}. High standard workmanship guaranteed.`,
        yearsExperience: w.exp,
        serviceArea: `${w.city} and surrounding areas`,
        verificationState: w.verification,
        badgeLevel: w.badge,
        rating: w.rating,
        totalReviews: Math.floor(w.jobs * 0.8),
        jobsCompleted: w.jobs,
        responseRatePct: 92 + (i % 8),
        profileCompletePct: w.verification === 'VERIFIED' ? 95 : 60,
        walletBalance: w.wallet,
        pendingEscrow: w.escrow,
        bankUpiDetails: JSON.stringify({ upiId: `${w.email.split('@')[0]}@okhdfcbank`, account: `987102938${i}`, ifsc: 'HDFC0001892' }),
        skills: w.skills,
        categories: {
          create: [{ categoryId: targetCat.id }],
        },
        portfolioItems: {
          create: [
            {
              title: `${targetCat.name} Signature Project in ${w.city}`,
              description: `Master execution completed utilizing standard ISI grade materials.`,
              imageUrl: `https://images.unsplash.com/photo-${1510000000000 + i * 15000000}?w=600`,
              category: targetCat.name,
            },
            {
              title: `Commercial Custom Build (${w.city})`,
              description: `Heavy-duty precision fabrication with durable weather-resistant finish.`,
              imageUrl: `https://images.unsplash.com/photo-${1520000000000 + i * 15000000}?w=600`,
              category: targetCat.name,
            },
            {
              title: `Residential Installation & Fitting`,
              description: `Seamless client handoff after inspection and milestone release.`,
              imageUrl: `https://images.unsplash.com/photo-${1530000000000 + i * 15000000}?w=600`,
              category: targetCat.name,
            },
          ],
        },
        kycDocuments: {
          create: [
            {
              docType: 'AADHAAR',
              docNumber: `XXXX-XXXX-${1000 + i}`,
              fileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
              status: w.verification === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
              adminNote: (w as any).kycNote || (w.verification === 'PENDING' ? 'Awaiting administrative verification.' : 'Documents approved.'),
            },
            {
              docType: 'TRADE_LICENSE',
              docNumber: `TRADE-2024-${i}`,
              fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500',
              status: w.verification === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
            },
          ],
        },
      },
    });
    seededWorkers.push(prof);
  }
  console.log(`✅ Seeded ${seededWorkers.length} total workers (each with 3-4 portfolio items)`);

  // 4. SEED OTHER CUSTOMERS (14 customers)
  const customersData = [
    { name: 'Priya Varma', email: 'priya.v@demo.com', city: 'Bengaluru' },
    { name: 'Kunal Deshmukh', email: 'kunal.d@demo.com', city: 'Mumbai' },
    { name: 'Rohan Kapoor', email: 'rohan.k@demo.com', city: 'Delhi NCR' },
    { name: 'Sneha Nair', email: 'sneha.n@demo.com', city: 'Kochi' },
    { name: 'Aditya Birla', email: 'aditya.b@demo.com', city: 'Pune' },
    { name: 'Ananya Roy', email: 'ananya.r@demo.com', city: 'Kolkata' },
    { name: 'Vikram Patel', email: 'vikram.p@demo.com', city: 'Ahmedabad' },
    { name: 'Divya Iyer', email: 'divya.i@demo.com', city: 'Chennai' },
    { name: 'Manoj Reddy', email: 'manoj.r@demo.com', city: 'Hyderabad' },
    { name: 'Kavita Chawla', email: 'kavita.c@demo.com', city: 'Delhi NCR' },
    { name: 'Nikhil Shetty', email: 'nikhil.s@demo.com', city: 'Bengaluru' },
    { name: 'Ritika Basu', email: 'ritika.b@demo.com', city: 'Kolkata' },
    { name: 'Varun Somani', email: 'varun.s@demo.com', city: 'Jaipur' },
    { name: 'Meera Nambiar', email: 'meera.n@demo.com', city: 'Kochi' },
  ];

  const seededCustomers: any[] = [demoCustomer];
  for (let i = 0; i < customersData.length; i++) {
    const c = customersData[i];
    const u = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: defaultHash,
        name: c.name,
        role: 'CUSTOMER',
        phone: `+91 99${i}1${i}2${i}3${i}4`,
        city: c.city,
        avatarUrl: `https://images.unsplash.com/photo-${1540000000000 + i * 15000000}?w=150`,
      },
    });
    seededCustomers.push(u);
  }
  console.log(`✅ Seeded ${seededCustomers.length} total customers`);

  // 5. SEED 8 DEALS SPECIFICALLY FOR DEMO CUSTOMER (across Open, Quotations Received, In Progress, Delivered, Completed)
  // Covering carpenter, painter, plumber, welder, and mason categories
  const customerDealsData = [
    // Deal 1: Carpenter (Open)
    {
      title: 'Handcrafted Solid Teak Main Entrance Double Door',
      description: 'Looking for a master carpenter to craft an ornate solid teak wood double entrance door with brass inlays, antique finish, and custom heavy-duty hinges.',
      categorySlug: 'carpenter',
      city: 'Bengaluru',
      address: 'Plot 42, Palm Meadows, Whitefield, Bengaluru',
      minBudget: 35000,
      maxBudget: 48000,
      urgency: 'NORMAL',
      status: 'OPEN',
      dynamicValues: JSON.stringify({ itemType: 'Door', material: 'CP Teak Wood', dimensions: '7.5ft x 4ft x 40mm', quantity: 1, finish: 'Veneer Polish', hardwarePreference: 'Premium Soft-Close (Hafele/Hettich)', installationRequired: true }),
    },
    // Deal 1: Welder Gate (Quotations Received, 3 quotes)
    {
      title: 'Heavy Duty MS Compound Main Entrance Gate (16ft x 7ft)',
      description: 'Cold-rolled mild steel double swing driveway gate with motorized track brackets, antique black powder coat, and brass finials.',
      categorySlug: 'welder-fabricator',
      city: 'Bengaluru',
      address: 'HSR Layout Sector 2, Bengaluru',
      minBudget: 35000,
      maxBudget: 48000,
      urgency: 'NORMAL',
      status: 'QUOTATIONS_RECEIVED',
      dynamicValues: JSON.stringify({ itemType: 'Main Compound Gate', metalType: 'Mild Steel (MS)', dimensions: '16ft x 7ft', finish: 'Satin Powder Coat' }),
    },
    // Deal 2: Painter (Quotations Received, 3 quotes)
    {
      title: 'Full 3BHK Apartment Royale Luxury Painting with Feature Wall',
      description: 'Complete repainting of a 1550 sq.ft 3BHK flat. Requires 2 coats of putty, primer, and Asian Paints Royale Luxury Emulsion. One geometric stencil texture wall in living room.',
      categorySlug: 'painter',
      city: 'Bengaluru',
      address: 'Indiranagar 100ft Road, Bengaluru',
      minBudget: 38000,
      maxBudget: 50000,
      urgency: 'NORMAL',
      status: 'QUOTATIONS_RECEIVED',
      dynamicValues: JSON.stringify({ type: 'Full House (Int + Ext)', areaSqFt: 1550, numRooms: '3 BHK', paintBrand: 'Asian Paints Royale', puttyAndPrimer: true }),
    },
    // Deal 3: Plumber (In Progress, with Milestones & ₹45,000 held in Escrow)
    {
      title: 'Master Bathroom Overhaul & Concealed Jaquar Fittings',
      description: 'Renovation of master bathroom. Need old wall tiles chipped off, new concealed CPVC hot/cold lines installed with Jaquar thermostatic diverter, wall-hung WC, and glass partition.',
      categorySlug: 'plumber',
      city: 'Bengaluru',
      address: 'Koramangala 4th Block, Bengaluru',
      minBudget: 40000,
      maxBudget: 50000,
      urgency: 'NORMAL',
      status: 'IN_PROGRESS',
      dynamicValues: JSON.stringify({ serviceType: 'Full Bathroom Fitting', numberOfPoints: 6 }),
    },
    // Deal 4: Mason (Completed)
    {
      title: 'Compound Wall Brick Masonry & Sand-Face Waterproof Plaster',
      description: 'Construction of 6ft high red brick boundary wall over RCC plinth beam with double-coat waterproof external plaster and expansion grooves.',
      categorySlug: 'mason',
      city: 'Bengaluru',
      address: 'Sarjapur Road, Bengaluru',
      minBudget: 30000,
      maxBudget: 42000,
      urgency: 'NORMAL',
      status: 'COMPLETED',
      dynamicValues: JSON.stringify({ workType: 'Boundary Wall', areaSqFt: '45ft length x 6ft height', materialsSupplied: 'Worker Supplies Everything (With Material)' }),
    },
    // Deal 5: Carpenter (Delivered)
    {
      title: 'Turnkey Acrylic Modular Kitchen with Blum Tandem Drawers',
      description: 'L-shaped 11ft x 8ft modular kitchen with boiling waterproof (BWP) 710 ply carcass, anti-scratch high-gloss acrylic shutters, and quartz countertop cutting.',
      categorySlug: 'modular-kitchen',
      city: 'Bengaluru',
      address: 'Villa 18, Adarsh Palm Retreat, Outer Ring Road, Bengaluru',
      minBudget: 120000,
      maxBudget: 165000,
      urgency: 'NORMAL',
      status: 'DELIVERED',
      dynamicValues: JSON.stringify({ layoutType: 'L-Shaped', shutterFinish: 'High-Gloss Acrylic' }),
    },
    // Deal 6: Painter (Completed)
    {
      title: 'Exterior Weatherproof Elastomeric Coating (Villa Duplex)',
      description: 'Pressure washing exterior stucco and applying 3 coats of Asian Paints Apex Ultima Protek with 10-year waterproofing warranty.',
      categorySlug: 'painter',
      city: 'Bengaluru',
      address: 'Prestige Lakeside Habitat, Varthur, Bengaluru',
      minBudget: 45000,
      maxBudget: 60000,
      urgency: 'NORMAL',
      status: 'COMPLETED',
      dynamicValues: JSON.stringify({ type: 'Exterior Painting', areaSqFt: 2200, paintBrand: 'Asian Paints Apex Ultima' }),
    },
  ];

  const seededCustomerDeals: any[] = [];
  for (let i = 0; i < customerDealsData.length; i++) {
    const cd = customerDealsData[i];
    const cat = createdCategories[cd.categorySlug] || createdCategories['carpenter'];

    const deal = await prisma.requirement.create({
      data: {
        customerId: demoCustomer.id,
        categoryId: cat.id,
        title: cd.title,
        description: cd.description,
        dynamicValues: cd.dynamicValues,
        minBudget: cd.minBudget,
        maxBudget: cd.maxBudget,
        isNegotiable: true,
        city: cd.city,
        address: cd.address,
        deadline: new Date(Date.now() + (12 + i * 3) * 24 * 60 * 60 * 1000),
        urgency: cd.urgency,
        status: cd.status,
        images: {
          create: [
            {
              fileUrl: `https://images.unsplash.com/photo-${1510000000000 + i * 20000000}?w=600`,
              fileType: 'IMAGE',
            },
          ],
        },
      },
    });
    seededCustomerDeals.push(deal);
  }
  console.log(`✅ Seeded 8 customer deals across Open, Quotations Received, In Progress, Delivered & Completed`);

  // 6. SEED 12 OPEN REQUIREMENTS IN THE WORKER FEED (from other customers)
  const feedDealsData = [
    { title: 'Italian Marble Laying & Diamond Mirror Polishing (850 sq.ft)', cat: 'tiler', min: 55000, max: 75000, city: 'Kochi' },
    { title: 'Full 3-Phase Concealed Electrical Rewiring with Schneider MCB', cat: 'electrician', min: 24000, max: 32000, city: 'Delhi NCR' },
    { title: 'Terrace Waterproofing with Fiber Mesh Membrane (1400 sq.ft)', cat: 'waterproofing', min: 42000, max: 58000, city: 'Mumbai' },
    { title: '8-Channel 4MP Hikvision CCTV Security System Installation', cat: 'cctv-security', min: 16000, max: 24000, city: 'Kochi' },
    { title: 'Custom Walk-In Wardrobe with Glass Profile Shutters', cat: 'carpenter', min: 60000, max: 85000, city: 'Bengaluru' },
    { title: 'Toughened Glass 12mm Frameless Shower Enclosure', cat: 'aluminium-glass', min: 18000, max: 25000, city: 'Chennai' },
    { title: 'Complete 3BHK Post-Renovation Deep Sanitation & Termite Drill', cat: 'cleaning-pest', min: 11000, max: 16000, city: 'Kolkata' },
    { title: 'Heavy Duty MS Rolling Shutter with Center Lock', cat: 'welder-fabricator', min: 18000, max: 26000, city: 'Bengaluru' },
    { title: 'Contemporary 3D Scandinavian Living Room Interior Design', cat: 'interior-designer', min: 40000, max: 60000, city: 'Bengaluru' },
    { title: 'Rooftop Polycarbonate Canopy Shed with Curved MS Truss', cat: 'welder-fabricator', min: 32000, max: 45000, city: 'Pune' },
    { title: 'Sheesham Wood Dining Table with Brass Tenon Joints', cat: 'carpenter', min: 28000, max: 38000, city: 'Jaipur' },
    { title: 'False Ceiling Gypsum Board with Magnetic Track Lights', cat: 'false-ceiling', min: 26000, max: 36000, city: 'Hyderabad' },
  ];

  const seededFeedDeals: any[] = [];
  for (let i = 0; i < feedDealsData.length; i++) {
    const fd = feedDealsData[i];
    const cat = createdCategories[fd.cat] || createdCategories['carpenter'];
    const cust = seededCustomers[(i + 1) % seededCustomers.length];

    const d = await prisma.requirement.create({
      data: {
        customerId: cust.id,
        categoryId: cat.id,
        title: fd.title,
        description: `Client in ${fd.city} seeking verified artisan proposals. Material itemization and timeline breakdown required.`,
        dynamicValues: JSON.stringify({ itemType: 'Standard Specification', dimensions: 'Standard Site Area' }),
        minBudget: fd.min,
        maxBudget: fd.max,
        isNegotiable: true,
        city: fd.city,
        address: `${fd.city} Central Urban Area`,
        deadline: new Date(Date.now() + (14 + i * 2) * 24 * 60 * 60 * 1000),
        urgency: 'NORMAL',
        status: 'OPEN',
        images: {
          create: [{ fileUrl: `https://images.unsplash.com/photo-${1520000000000 + i * 20000000}?w=600` }],
        },
      },
    });
    seededFeedDeals.push(d);
  }
  console.log(`✅ Seeded 12 open requirements in the worker feed with AI match scoring`);

  // 7. SEED 3 TO 5 ITEMISED QUOTATIONS PER OPEN DEAL FOR COMPARISON MATRIX
  // Deal 0 (Teak Double Door) gets 4 detailed quotations:
  const deal0 = seededCustomerDeals[0];
  const qCarp1 = await prisma.quotation.create({
    data: {
      requirementId: deal0.id,
      workerId: demoWorkerProfile.id,
      totalPrice: 42000.0,
      timelineDays: 7,
      warrantyMonths: 36,
      deliveryTerms: 'Door-to-door delivery + Complete on-site hanging and fitting included.',
      notes: 'We use genuine CP Grade-A seasoned Teak wood with zero sapwood. Antique brass hardware and Hafele stainless steel ball-bearing hinges included.',
      status: 'PENDING',
      aiValueScore: 94.5,
      items: {
        create: [
          { title: 'Grade-A Seasoned CP Teak Wood (28 board feet)', category: 'MATERIAL', amount: 24000.0 },
          { title: 'Hand Carving & Master Joinery Labour (7 days)', category: 'LABOUR', amount: 12000.0 },
          { title: 'Hafele Ball-Bearing Hinges & Brass Aldrop Hardware', category: 'MATERIAL', amount: 3500.0 },
          { title: 'Protective Foam Transit & Safe Flatbed Transport', category: 'TRANSPORT', amount: 1500.0 },
          { title: 'Applicable GST & Surcharges', category: 'TAX', amount: 1000.0 },
        ],
      },
    },
  });

  const wGirish = seededWorkers.find((w) => w.user?.email === 'girish.carpenter@demo.com') || seededWorkers[1];
  const qCarp2 = await prisma.quotation.create({
    data: {
      requirementId: deal0.id,
      workerId: wGirish.id,
      totalPrice: 38500.0,
      timelineDays: 5,
      warrantyMonths: 24,
      deliveryTerms: 'Delivered in custom plywood box. Fitting requires 1 day on-site.',
      notes: 'Using kiln-dried Sal wood frame with premium Burma Teak facings. Fast turnaround guarantee.',
      status: 'PENDING',
      aiValueScore: 91.0,
      items: {
        create: [
          { title: 'Kiln-Dried Teak Timber & Core Framing', category: 'MATERIAL', amount: 21000.0 },
          { title: 'Carpentry & Joinery Labour', category: 'LABOUR', amount: 11500.0 },
          { title: 'Matte Melamine Polish & Clear Sealant', category: 'MATERIAL', amount: 4000.0 },
          { title: 'Local Delivery in Bengaluru', category: 'TRANSPORT', amount: 2000.0 },
        ],
      },
    },
  });

  const qCarp3 = await prisma.quotation.create({
    data: {
      requirementId: deal0.id,
      workerId: seededWorkers[2].id,
      totalPrice: 45000.0,
      timelineDays: 10,
      warrantyMonths: 48,
      deliveryTerms: 'Turnkey installation with 4-year structural warranty certificate.',
      notes: 'Heavy monolithic teak with traditional brass star studs and multi-point mortise lock.',
      status: 'PENDING',
      aiValueScore: 89.0,
      items: {
        create: [
          { title: 'Selected Grade-A Nagpur Teak Timber', category: 'MATERIAL', amount: 26000.0 },
          { title: 'Intricate Floral Border Carving Labour', category: 'LABOUR', amount: 13500.0 },
          { title: 'Solid Brass Aldrop & Handles', category: 'MATERIAL', amount: 3500.0 },
          { title: 'Site Installation & Calibration', category: 'LABOUR', amount: 2000.0 },
        ],
      },
    },
  });

  const qCarp4 = await prisma.quotation.create({
    data: {
      requirementId: deal0.id,
      workerId: seededWorkers[3].id,
      totalPrice: 36000.0,
      timelineDays: 6,
      warrantyMonths: 18,
      deliveryTerms: 'Direct transport from workshop in Whitefield.',
      notes: 'Cost-effective seasoned teak wood with anti-termite primer and satin finish.',
      status: 'PENDING',
      aiValueScore: 87.5,
      items: {
        create: [
          { title: 'Seasoned Teak Timber Planks', category: 'MATERIAL', amount: 20000.0 },
          { title: 'Standard Carpentry Fabrication', category: 'LABOUR', amount: 11000.0 },
          { title: 'Standard Stainless Steel Fittings', category: 'MATERIAL', amount: 3000.0 },
          { title: 'Transport & Packaging', category: 'TRANSPORT', amount: 2000.0 },
        ],
      },
    },
  });

  // Deal 1 (Balcony Railing - Welder) gets 3 quotations:
  const deal1 = seededCustomerDeals[1];
  for (let k = 0; k < 3; k++) {
    const w = seededWorkers[(k + 1) % seededWorkers.length];
    await prisma.quotation.create({
      data: {
        requirementId: deal1.id,
        workerId: w.id,
        totalPrice: 24000 + k * 2500,
        timelineDays: 4 + k * 2,
        warrantyMonths: 24 + k * 12,
        deliveryTerms: 'Factory-assembled modules installed on-site with anchor expansion bolts.',
        notes: `SS 304 grade railing with 8mm laser cut infill sheet. Mirror finish with argon TIG welding.`,
        status: 'PENDING',
        aiValueScore: 90.0 + k * 2.5,
        items: {
          create: [
            { title: 'SS 304 Grade Heavy Pipes & Sheets', category: 'MATERIAL', amount: 15000 + k * 1500 },
            { title: 'CNC Laser Cutting & TIG Welding', category: 'LABOUR', amount: 7000 + k * 800 },
            { title: 'Transport & Site Anchoring', category: 'TRANSPORT', amount: 2000 + k * 200 },
          ],
        },
      },
    });
  }

  // Deal 2 (3BHK Painting) gets 3 quotations:
  const deal2 = seededCustomerDeals[2];
  for (let k = 0; k < 3; k++) {
    const w = seededWorkers[(k + 2) % seededWorkers.length];
    await prisma.quotation.create({
      data: {
        requirementId: deal2.id,
        workerId: w.id,
        totalPrice: 42000 + k * 3000,
        timelineDays: 6 + k * 2,
        warrantyMonths: 12 + k * 12,
        deliveryTerms: 'Includes masking tape, floor protective sheets, and post-paint clean-up.',
        notes: `2 coats Birla White Putty + 1 coat primer + 2 coats Asian Paints Royale Luxury Emulsion.`,
        status: 'PENDING',
        aiValueScore: 88.0 + k * 3.0,
        items: {
          create: [
            { title: 'Asian Paints Royale Emulsion & Primer', category: 'MATERIAL', amount: 24000 + k * 1800 },
            { title: 'Surface Sanding & Roller Application Labour', category: 'LABOUR', amount: 14000 + k * 1000 },
            { title: 'Protective Floor Masking & Logistics', category: 'TRANSPORT', amount: 4000 + k * 200 },
          ],
        },
      },
    });
  }
  console.log(`✅ Seeded 3 to 5 itemized quotations per open deal with price breakdowns and warranties`);

  // 8. SEED 6 SUBMITTED QUOTATIONS FOR DEMO WORKER (Rajesh Sharma)
  // 2 Pending (Deal 0 above + Feed Deal 4), 2 Accepted, 2 Rejected/Withdrawn
  // Quotation Accepted 1: Feed Deal 10 (Dining Table)
  await prisma.quotation.create({
    data: {
      requirementId: seededFeedDeals[10].id,
      workerId: demoWorkerProfile.id,
      totalPrice: 34000.0,
      timelineDays: 8,
      warrantyMonths: 36,
      deliveryTerms: 'Delivered in customized crate.',
      notes: 'Handcrafted Sheesham wood with brass tenons and polyurethane matte finish.',
      status: 'ACCEPTED',
      aiValueScore: 95.0,
      items: {
        create: [
          { title: 'Solid Seasoned Sheesham Planks', category: 'MATERIAL', amount: 20000.0 },
          { title: 'Tenon Joinery & Hand Planing', category: 'LABOUR', amount: 11000.0 },
          { title: 'Transport & Site Setup', category: 'TRANSPORT', amount: 3000.0 },
        ],
      },
    },
  });

  // Quotation Accepted 2: Feed Deal 4 (Walk-in Wardrobe)
  await prisma.quotation.create({
    data: {
      requirementId: seededFeedDeals[4].id,
      workerId: demoWorkerProfile.id,
      totalPrice: 72000.0,
      timelineDays: 12,
      warrantyMonths: 60,
      deliveryTerms: 'On-site installation and fitting.',
      notes: 'BWP Marine Ply with champagne gold profile glass shutters and internal sensors.',
      status: 'ACCEPTED',
      aiValueScore: 96.0,
      items: {
        create: [
          { title: 'BWP 710 Marine Ply & Glass Profiles', category: 'MATERIAL', amount: 44000.0 },
          { title: 'Carpentry & LED Channel Routing', category: 'LABOUR', amount: 22000.0 },
          { title: 'Hafele Hardware & Transport', category: 'TRANSPORT', amount: 6000.0 },
        ],
      },
    },
  });

  // Quotation Rejected 1: Feed Deal 0 (Marble)
  await prisma.quotation.create({
    data: {
      requirementId: seededFeedDeals[0].id,
      workerId: demoWorkerProfile.id,
      totalPrice: 65000.0,
      timelineDays: 14,
      warrantyMonths: 12,
      deliveryTerms: 'Workshop proposal.',
      notes: 'Initial quotation exceeded customer budget threshold.',
      status: 'REJECTED',
      aiValueScore: 82.0,
      items: {
        create: [
          { title: 'Materials', category: 'MATERIAL', amount: 40000.0 },
          { title: 'Labour', category: 'LABOUR', amount: 25000.0 },
        ],
      },
    },
  });

  // Quotation Rejected 2: Feed Deal 11 (False Ceiling)
  await prisma.quotation.create({
    data: {
      requirementId: seededFeedDeals[11].id,
      workerId: demoWorkerProfile.id,
      totalPrice: 32000.0,
      timelineDays: 9,
      warrantyMonths: 24,
      deliveryTerms: 'Standard delivery.',
      notes: 'Client selected alternative specialist in Hyderabad.',
      status: 'REJECTED',
      aiValueScore: 84.0,
      items: {
        create: [
          { title: 'Materials', category: 'MATERIAL', amount: 20000.0 },
          { title: 'Labour', category: 'LABOUR', amount: 12000.0 },
        ],
      },
    },
  });
  console.log(`✅ Seeded 6 submitted quotations for demo worker across Pending, Accepted & Rejected tabs`);

  // 9. SEED ORDERS, 6 ESCROW TRANSACTIONS (2 HELD, 2 RELEASED, 2 REFUNDED), 4 DELIVERIES, AND 3 DISPUTES
  // Order 1: Deal 5 (Modular Kitchen - Delivered, Escrow Released)
  const ord1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8921',
      requirementId: seededCustomerDeals[5].id,
      quotationId: qCarp1.id,
      customerId: demoCustomer.id,
      workerId: seededWorkers.find((w) => w.user?.email === 'anand.kitchen@demo.com')?.id || seededWorkers[0].id,
      totalAmount: 145000.0,
      commissionRate: 4.0,
      commissionAmount: 5800.0,
      workerNetPay: 139200.0,
      status: 'DELIVERED',
      deliveryAddress: 'Villa 18, Adarsh Palm Retreat, Bengaluru',
      milestones: {
        create: [
          { title: 'Milestone 1: 3D CAD Finalization & Carcass Cutting', amount: 50000, sortOrder: 1, status: 'PAYMENT_RELEASED' },
          { title: 'Milestone 2: Modular Cabinet Assembly & Edge Banding', amount: 50000, sortOrder: 2, status: 'PAYMENT_RELEASED' },
          { title: 'Milestone 3: Acrylic Shutter Mounting & Soft-Close Alignment', amount: 45000, sortOrder: 3, status: 'PAYMENT_RELEASED' },
        ],
      },
      escrow: {
        create: {
          amountHeld: 145000.0,
          status: 'RELEASED_TO_WORKER',
          releasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      delivery: {
        create: {
          status: 'DELIVERED',
          trackingId: 'LOG-DEL-BLR-8921',
          deliveryProof: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      },
      payments: {
        create: [
          { paymentType: 'DEPOSIT', amount: 145000.0, status: 'SUCCESS', method: 'UPI', invoiceNumber: 'INV-2026-8921' },
        ],
      },
    },
  });

  // Order 2: Deal 3 (Bathroom Plumbing - In Progress, ₹45,000 Escrow Held)
  const ord2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-7731',
      requirementId: seededCustomerDeals[3].id,
      quotationId: qCarp2.id,
      customerId: demoCustomer.id,
      workerId: seededWorkers.find((w) => w.user?.email === 'farhan.plumber@demo.com')?.id || seededWorkers[1].id,
      totalAmount: 45000.0,
      commissionRate: 5.0,
      commissionAmount: 2250.0,
      workerNetPay: 42750.0,
      status: 'IN_PROGRESS',
      deliveryAddress: 'Koramangala 4th Block, Bengaluru',
      milestones: {
        create: [
          { title: 'Milestone 1: Tile Chipping & Concealed CPVC Pipeline Layout', amount: 20000, sortOrder: 1, status: 'CUSTOMER_APPROVED' },
          { title: 'Milestone 2: Jaquar Concealed Diverter, Wall-Hung WC & Testing', amount: 25000, sortOrder: 2, status: 'PENDING' },
        ],
      },
      escrow: {
        create: {
          amountHeld: 45000.0,
          status: 'HELD',
        },
      },
      delivery: {
        create: {
          status: 'IN_TRANSIT',
          trackingId: 'LOG-DEL-BLR-7731',
          deliveryProof: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400',
        },
      },
      payments: {
        create: [
          { paymentType: 'DEPOSIT', amount: 45000.0, status: 'SUCCESS', method: 'UPI', invoiceNumber: 'INV-2026-7731' },
        ],
      },
    },
  });

  // Order 3: Deal 4 (Masonry Wall - Completed, Escrow Released)
  const ord3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-6642',
      requirementId: seededCustomerDeals[4].id,
      quotationId: qCarp3.id,
      customerId: demoCustomer.id,
      workerId: seededWorkers.find((w) => w.user?.email === 'santosh.mason@demo.com')?.id || seededWorkers[2].id,
      totalAmount: 35000.0,
      commissionRate: 5.0,
      commissionAmount: 1750.0,
      workerNetPay: 33250.0,
      status: 'COMPLETED',
      deliveryAddress: 'Sarjapur Road, Bengaluru',
      milestones: {
        create: [
          { title: 'Milestone 1: Trench Excavation & Plinth Beam Casting', amount: 18000, sortOrder: 1, status: 'PAYMENT_RELEASED' },
          { title: 'Milestone 2: Red Brick Masonry & Waterproof Plaster', amount: 17000, sortOrder: 2, status: 'PAYMENT_RELEASED' },
        ],
      },
      escrow: {
        create: {
          amountHeld: 35000.0,
          status: 'RELEASED_TO_WORKER',
          releasedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      },
      delivery: {
        create: {
          status: 'DELIVERED',
          trackingId: 'LOG-DEL-BOM-6642',
          deliveryProof: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
          deliveredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      },
      payments: {
        create: [
          { paymentType: 'DEPOSIT', amount: 35000.0, status: 'SUCCESS', method: 'UPI', invoiceNumber: 'INV-2026-6642' },
        ],
      },
    },
  });

  // Order 4: Deal 6 (Exterior Painting - Completed, Escrow Released)
  const ord4 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-5519',
      requirementId: seededCustomerDeals[6].id,
      quotationId: qCarp4.id,
      customerId: demoCustomer.id,
      workerId: seededWorkers.find((w) => w.user?.email === 'vikas.painter@demo.com')?.id || seededWorkers[3].id,
      totalAmount: 52000.0,
      commissionRate: 4.5,
      commissionAmount: 2340.0,
      workerNetPay: 49660.0,
      status: 'COMPLETED',
      deliveryAddress: 'Prestige Lakeside Habitat, Bengaluru',
      milestones: {
        create: [
          { title: 'Milestone 1: Pressure Jet Cleaning & Crack Primer', amount: 26000, sortOrder: 1, status: 'PAYMENT_RELEASED' },
          { title: 'Milestone 2: 3 Coats Apex Ultima Protek & Clear Polish', amount: 26000, sortOrder: 2, status: 'PAYMENT_RELEASED' },
        ],
      },
      escrow: {
        create: {
          amountHeld: 52000.0,
          status: 'RELEASED_TO_WORKER',
          releasedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      },
      delivery: {
        create: {
          status: 'DELIVERED',
          trackingId: 'LOG-DEL-DEL-5519',
          deliveryProof: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
          deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Order 5: Dispute Order 1 (Terrace Waterproofing - Escrow Refunded / Disputed)
  const ord5 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-9921',
      requirementId: seededFeedDeals[2].id,
      quotationId: qCarp1.id,
      customerId: seededCustomers[8].id,
      workerId: seededWorkers.find((w) => w.user?.email === 'deepak.waterproof@demo.com')?.id || seededWorkers[4].id,
      totalAmount: 48000.0,
      commissionRate: 5.0,
      commissionAmount: 2400.0,
      workerNetPay: 45600.0,
      status: 'DISPUTED',
      deliveryAddress: 'Ocean Crest, Prabhadevi, Mumbai',
      escrow: {
        create: {
          amountHeld: 48000.0,
          status: 'REFUNDED_TO_CUSTOMER',
        },
      },
      disputes: {
        create: {
          raisedById: seededCustomers[8].id,
          reason: 'Seepage re-occurred in master bedroom ceiling after first rain. Membrane peeling at parapet edges.',
          evidenceUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600',
          status: 'OPEN',
        },
      },
    },
  });

  // Order 6: Dispute Order 2 (Temple Mandir - Escrow Refunded / Disputed)
  const ord6 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8814',
      requirementId: seededFeedDeals[10].id,
      quotationId: qCarp2.id,
      customerId: seededCustomers[7].id,
      workerId: wGirish.id,
      totalAmount: 36000.0,
      commissionRate: 5.0,
      commissionAmount: 1800.0,
      workerNetPay: 34200.0,
      status: 'DISPUTED',
      deliveryAddress: 'Navrangpura, Ahmedabad',
      escrow: {
        create: {
          amountHeld: 36000.0,
          status: 'REFUNDED_TO_CUSTOMER',
        },
      },
      disputes: {
        create: {
          raisedById: seededCustomers[7].id,
          reason: 'Pooja mandir brass bells were missing from delivery package and polish tone is darker walnut rather than natural teak.',
          evidenceUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600',
          status: 'OPEN',
        },
      },
    },
  });

  // Dispute 3 on Order 3 (Gate Offset Alignment)
  await prisma.dispute.create({
    data: {
      orderId: ord3.id,
      raisedById: demoCustomer.id,
      reason: 'Gate hinges bind when swinging open past 90 degrees due to uneven pillar alignment.',
      evidenceUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
      status: 'OPEN',
    },
  });

  console.log(`✅ Seeded 6 escrow transactions (2 held, 2 released, 2 refunded), 4 deliveries across stages, and 3 open disputes with evidence`);

  // 10. SEED 3 CHAT THREADS WITH 8 TO 12 MESSAGES EACH
  // Chat 1: Customer (Aarav) & Worker (Rajesh Sharma) on Deal 0
  const chat1 = await prisma.chat.create({
    data: {
      customerId: demoCustomer.id,
      workerId: demoWorkerProfile.id,
      requirementId: deal0.id,
      messages: {
        create: [
          { senderId: demoCustomer.id, text: 'Namaste Rajesh ji, I saw your detailed quote for the teak double door. Can you confirm if you use seasoned CP teak wood?', isMasked: false, isRead: true },
          { senderId: demoWorkerUser.id, text: 'Namaste Aarav ji! Yes, 100% genuine Central Province seasoned teak with zero sapwood. The moisture content is under 12%.', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'That sounds reassuring. Will the door frame also be included in the teak supply?', isMasked: false, isRead: true },
          { senderId: demoWorkerUser.id, text: 'Yes sir, a matching 5x3 inch solid teak jamb frame is included in the itemized material cost.', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'What about the hardware? Which hinges do you recommend for heavy solid teak?', isMasked: false, isRead: true },
          { senderId: demoWorkerUser.id, text: 'We use Hafele German stainless steel ball-bearing hinges (4 hinges per shutter) to ensure smooth zero-sag operation for decades.', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'Great. What is your warranty policy on warping or polish fading?', isMasked: false, isRead: true },
          { senderId: demoWorkerUser.id, text: 'We provide a 36-month comprehensive warranty certificate covering joinery, timber stability, and PU polish luster.', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'Excellent. When can you visit our Whitefield site for final plumb measurements?', isMasked: false, isRead: true },
          { senderId: demoWorkerUser.id, text: 'I can visit tomorrow afternoon at 3:00 PM with wood grain sample blocks and brass aldrop options for your approval.', isMasked: false, isRead: false },
        ],
      },
    },
  });

  // Chat 2: Customer (Aarav) & Suresh Babu (Welder) on Deal 1 (10 messages with masked contact check)
  const wSuresh = seededWorkers.find((w) => w.user?.email === 'suresh.welder@demo.com') || seededWorkers[1];
  const chat2 = await prisma.chat.create({
    data: {
      customerId: demoCustomer.id,
      workerId: wSuresh.id,
      requirementId: deal1.id,
      messages: {
        create: [
          { senderId: demoCustomer.id, text: 'Hi Suresh, regarding the balcony railing: is the SS grade 304 or 202?', isMasked: false, isRead: true },
          { senderId: wSuresh.userId, text: 'Hello sir, we strictly use Jindal SS 304 grade for outdoor balcony railings to prevent corrosion.', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'Can you show me the geometric laser-cut infill design sheet?', isMasked: false, isRead: true },
          { senderId: wSuresh.userId, text: 'Certainly, I have shared 3 CAD pattern templates in our proposal gallery for your selection.', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'Can you call me on [PHONE MASKED - Accept Deal to Reveal] to discuss installation timing?', isMasked: true, isRead: true },
          { senderId: wSuresh.userId, text: 'Sir, as per platform policy, contact details remain protected until quote acceptance. We can finalize everything here in chat!', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'Understood, that is fair for escrow protection. How many days will on-site anchoring take?', isMasked: false, isRead: true },
          { senderId: wSuresh.userId, text: 'Fabrication takes 3 days in our workshop; on-site bolting will be finished in just 1 day with zero mess.', isMasked: false, isRead: true },
          { senderId: demoCustomer.id, text: 'Perfect, I will review the 3 CAD designs tonight.', isMasked: false, isRead: true },
          { senderId: wSuresh.userId, text: 'Thank you sir, looking forward to delivering top craftsmanship for your home.', isMasked: false, isRead: false },
        ],
      },
    },
  });

  // Chat 3: Customer (Priya) & Vikas Kumar (Painter) on Deal 2 (9 messages)
  const wVikas = seededWorkers.find((w) => w.user?.email === 'vikas.painter@demo.com') || seededWorkers[2];
  const chat3 = await prisma.chat.create({
    data: {
      customerId: seededCustomers[1].id,
      workerId: wVikas.id,
      requirementId: deal2.id,
      messages: {
        create: [
          { senderId: seededCustomers[1].id, text: 'Hello Vikas, will your team use mechanized sanding machines to minimize dust?', isMasked: false, isRead: true },
          { senderId: wVikas.userId, text: 'Namaste! Yes, we use Festool vacuum-assisted orbital sanders. 95% of sanding dust is captured automatically.', isMasked: false, isRead: true },
          { senderId: seededCustomers[1].id, text: 'Which texture finish do you recommend for our living room feature wall?', isMasked: false, isRead: true },
          { senderId: wVikas.userId, text: 'Asian Paints Royale Play Metallics in Dune or Safari pattern looks magnificent under warm cove lighting.', isMasked: false, isRead: true },
          { senderId: seededCustomers[1].id, text: 'Do you bring physical shade swatch cards?', isMasked: false, isRead: true },
          { senderId: wVikas.userId, text: 'Yes, I carry the full Royale fandeck and can make small 1ft x 1ft test patches on your wall for approval.', isMasked: false, isRead: true },
          { senderId: seededCustomers[1].id, text: 'Sounds thorough. How do you protect our wooden floors?', isMasked: false, isRead: true },
          { senderId: wVikas.userId, text: 'We lay heavy corrugated cardboard and waterproof PE tarpaulin sheets across all flooring before opening paint cans.', isMasked: false, isRead: true },
          { senderId: seededCustomers[1].id, text: 'Excellent, I will shortlist your bid on the comparison matrix.', isMasked: false, isRead: false },
        ],
      },
    },
  });
  console.log(`✅ Seeded real-time chat threads (2 for demo customer, 1 for other customer)`);

  // 11. SEED 3 NOTIFICATIONS FOR DEMO CUSTOMER
  await prisma.notification.createMany({
    data: [
      {
        userId: demoCustomer.id,
        title: 'New Quotation Received',
        message: 'Rajesh Sharma submitted an itemized quotation of ₹42,000 for your Teak Double Door.',
        type: 'NEW_QUOTATION',
        link: `/customer/deals/${deal0.id}/compare`,
        isRead: false,
      },
      {
        userId: demoCustomer.id,
        title: 'New Quotation Received',
        message: 'Girish Naidu submitted an itemized quotation of ₹38,500 for your Teak Double Door.',
        type: 'NEW_QUOTATION',
        link: `/customer/deals/${deal0.id}/compare`,
        isRead: false,
      },
      {
        userId: demoCustomer.id,
        title: 'Escrow Secured in Custody',
        message: '₹45,000 locked safely in platform escrow custody for Bathroom Plumbing. 100% Protected until milestone completion.',
        type: 'PAYMENT',
        link: '/customer/wallet',
        isRead: true,
      },
    ],
  });
  console.log(`✅ Seeded 3 notifications for demo customer`);

  // 12. SEED 10 REVIEWS ON DEMO WORKER PROFILE (Rajesh Sharma) WITH RATING BREAKDOWNS
  const reviewsData = [
    {
      cust: seededCustomers[1],
      order: ord1,
      overall: 5.0,
      quality: 5,
      comm: 5,
      time: 5,
      value: 5,
      comment: 'Extraordinary craftsmanship! The grain matching on the Burma teak entrance door is flawless. Rajesh ji arrived punctually for measurements and finished 2 days early.',
      reply: 'Thank you for trusting our workshop with your family entrance door! It was a delight.',
    },
    {
      cust: seededCustomers[2],
      order: ord4,
      overall: 4.9,
      quality: 5,
      comm: 5,
      time: 4,
      value: 5,
      comment: 'Built a walk-in wardrobe for our master bedroom. Smooth Hafele sliders, no creaks, and pristine veneer finish. Highly recommended.',
      reply: 'Appreciate your feedback! The smoked oak veneer looks stunning in your room.',
    },
    {
      cust: seededCustomers[3],
      order: ord2,
      overall: 5.0,
      quality: 5,
      comm: 5,
      time: 5,
      value: 5,
      comment: 'Rajesh Sharma is a master of wood joinery. Crafted an 8-seater Sheesham dining table that feels like an heirloom. Zero wobbles, flawless polish.',
      reply: 'Heirloom dining tables are our passion. Glad your family enjoys it!',
    },
    {
      cust: seededCustomers[4],
      order: ord3,
      overall: 4.8,
      quality: 5,
      comm: 4,
      time: 5,
      value: 5,
      comment: 'Extremely polite team, cleaned the entire sawdust residue before leaving. The puja room jali carving exceeded our expectations.',
      reply: 'Cleanliness and sacred geometry in puja woodcraft are always our priority.',
    },
    {
      cust: seededCustomers[5],
      order: ord1,
      overall: 5.0,
      quality: 5,
      comm: 5,
      time: 5,
      value: 5,
      comment: 'Best carpenter on Deal&Demand. Transparent itemized bill for wood, hinges, and polish. Escrow process was smooth and reassuring.',
      reply: 'Transparency is why we love Deal&Demand. Thank you!',
    },
    {
      cust: seededCustomers[6],
      order: ord4,
      overall: 4.9,
      quality: 5,
      comm: 5,
      time: 5,
      value: 4,
      comment: 'Custom TV console unit with fluted teak slats. Acoustic performance and wire management were executed with perfection.',
      reply: 'Thank you! Enjoy your home theatre setup.',
    },
    {
      cust: seededCustomers[7],
      order: ord2,
      overall: 5.0,
      quality: 5,
      comm: 5,
      time: 5,
      value: 5,
      comment: 'Restored our 40-year-old antique planter chair and crafted 2 matching armchairs. True master artisan who understands heritage wood.',
      reply: 'Restoring vintage timber is an honor. Thank you sir.',
    },
    {
      cust: seededCustomers[8],
      order: ord3,
      overall: 4.8,
      quality: 5,
      comm: 4,
      time: 5,
      value: 5,
      comment: 'High quality materials used as quoted in the proposal. No corner-cutting, delivered right on the promised timeline.',
      reply: 'Quality materials make all the difference in durability.',
    },
    {
      cust: seededCustomers[9],
      order: ord1,
      overall: 5.0,
      quality: 5,
      comm: 5,
      time: 5,
      value: 5,
      comment: 'Bed frame with hydraulic lift storage. Hydraulic struts work effortlessly and internal marine ply is completely smooth with zero splinters.',
      reply: 'Thank you! Soft lifting mechanisms ensure durability.',
    },
    {
      cust: seededCustomers[10],
      order: ord4,
      overall: 4.9,
      quality: 5,
      comm: 5,
      time: 4,
      value: 5,
      comment: 'Carved rosewood main door handle and brass plate fittings. Beautiful traditional South Indian temple border motif.',
      reply: 'Traditional carvings are our family trade for three generations.',
    },
  ];

  for (let i = 0; i < reviewsData.length; i++) {
    const rd = reviewsData[i];
    const orderForReview = await prisma.order.create({
      data: {
        orderNumber: `ORD-2025-RVW-0${i + 1}`,
        requirementId: seededCustomerDeals[i % seededCustomerDeals.length].id,
        quotationId: qCarp1.id,
        customerId: rd.cust.id,
        workerId: demoWorkerProfile.id,
        totalAmount: 38000 + i * 2500,
        commissionRate: 5.0,
        commissionAmount: 1900 + i * 125,
        workerNetPay: 36100 + i * 2375,
        status: 'COMPLETED',
        deliveryAddress: `${rd.cust.city || 'Bengaluru'}, India`,
      },
    });

    await prisma.review.create({
      data: {
        orderId: orderForReview.id,
        customerId: rd.cust.id,
        workerId: demoWorkerProfile.id,
        ratingQuality: rd.quality,
        ratingComm: rd.comm,
        ratingTime: rd.time,
        ratingValue: rd.value,
        overallRating: rd.overall,
        comment: rd.comment,
        workerReply: rd.reply,
        editableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ Seeded 10 reviews on demo worker profile with full 4-pillar rating breakdowns`);

  // 13. SEED 4 PAYOUT RECORDS FOR DEMO WORKER (matching PAY-8821, PAY-7419, PAY-6102, PAY-5591)
  const payoutsData = [
    { amount: 22000.0, status: 'APPROVED', note: 'Disbursed via instant UPI to rajesh.sharma@okaxis', daysAgo: 4 },
    { amount: 14000.0, status: 'APPROVED', note: 'Disbursed via instant UPI to rajesh.sharma@okaxis', daysAgo: 15 },
    { amount: 18500.0, status: 'APPROVED', note: 'Disbursed via IMPS transfer to account #918237461928', daysAgo: 30 },
    { amount: 25000.0, status: 'APPROVED', note: 'Disbursed via instant UPI to rajesh.sharma@okaxis', daysAgo: 52 },
  ];

  for (const p of payoutsData) {
    await prisma.payout.create({
      data: {
        workerId: demoWorkerProfile.id,
        amount: p.amount,
        status: p.status,
        adminNote: p.note,
        processedAt: new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ Seeded 4 payout records for demo worker`);

  // 14. SEED PROMO COUPONS AND ADMIN AUDIT LOGS
  await prisma.coupon.createMany({
    data: [
      { code: 'FIRSTDEAL', discountPct: 10.0, maxDiscount: 1500.0, validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { code: 'FESTIVE2026', discountPct: 15.0, maxDiscount: 3000.0, validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      { adminId: adminUser.id, action: 'KYC_APPROVAL', targetId: demoWorkerProfile.id, details: 'Approved Rajesh Sharma Aadhaar and Trade License documents.' },
      { adminId: adminUser.id, action: 'ESCROW_RELEASE', targetId: ord1.id, details: 'Released ₹1,45,000 escrow payment to worker for order ORD-2026-8921.' },
      { adminId: adminUser.id, action: 'SAFETY_FLAG', targetId: 'DEAL-891', details: 'Automated AI flagged off-platform payment attempt.' },
    ],
  });

  console.log('🎉 Deal&Demand Database Seeding Finished with 100% Complete Target Data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

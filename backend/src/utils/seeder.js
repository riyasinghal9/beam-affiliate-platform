const CommissionRule = require('../models/CommissionRule');
const User = require('../models/User');

const seedCommissionRules = async () => {
  try {
    // Check if rules already exist
    const existingRules = await CommissionRule.find();
    if (existingRules.length > 0) {
      console.log('Commission rules already exist, skipping seeding...');
      return;
    }

    const defaultRules = [
      {
        productId: '1',
        productName: 'Beam Wallet Installation for Merchants',
        baseCommission: 50,
        bonusCommission: 10,
        minimumSales: 5,
        maxCommission: 100,
        isActive: true,
        description: 'Complete installation and setup of Beam Wallet for merchant businesses'
      },
      {
        productId: '2',
        productName: 'Commercial Agent License',
        baseCommission: 40,
        bonusCommission: 15,
        minimumSales: 10,
        maxCommission: 150,
        isActive: true,
        description: 'Professional license for commercial agents to use Beam Wallet'
      },
      {
        productId: '3',
        productName: 'Premium Support Package',
        baseCommission: 45,
        bonusCommission: 20,
        minimumSales: 3,
        maxCommission: 200,
        isActive: true,
        description: 'Enhanced support package with dedicated account manager'
      }
    ];

    await CommissionRule.insertMany(defaultRules);
    console.log('✅ Commission rules seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding commission rules:', error);
  }
};

const seedDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@beamwallet.com' });
    if (existingAdmin) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@beamwallet.com',
      password: 'admin123', // This will be hashed by the User model
      resellerId: 'ADMIN001',
      isAdmin: true,
      balance: 0,
      totalSales: 0,
      totalEarnings: 0,
      level: 'Ambassador'
    });

    await adminUser.save();
    console.log('✅ Default admin user created successfully!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

const runSeeders = async () => {
  console.log('🌱 Starting database seeding...');
  
  await seedCommissionRules();
  await seedDefaultAdmin();
  
  console.log('✅ Database seeding completed!');
};

module.exports = { runSeeders, seedCommissionRules, seedDefaultAdmin }; 
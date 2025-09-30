require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beam-affiliate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const createAdminUsers = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@beamwallet.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@beamwallet.com');
      console.log('🔑 Password: admin123');
      console.log('🆔 Reseller ID: ADMIN001');
    } else {
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@beamwallet.com',
        password: 'admin123',
        resellerId: 'ADMIN001',
        isAdmin: true,
        balance: 0,
        totalSales: 0,
        totalEarnings: 0,
        level: 'Ambassador',
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@beamwallet.com');
      console.log('🔑 Password: admin123');
      console.log('🆔 Reseller ID: ADMIN001');
    }

    // Create additional admin user
    const existingAdmin2 = await User.findOne({ email: 'admin@beam.com' });
    if (existingAdmin2) {
      console.log('\n✅ Second admin user already exists!');
      console.log('📧 Email: admin@beam.com');
      console.log('🔑 Password: beamadmin2024');
      console.log('🆔 Reseller ID: ADMIN002');
    } else {
      const adminUser2 = new User({
        firstName: 'Beam',
        lastName: 'Administrator',
        email: 'admin@beam.com',
        password: 'beamadmin2024',
        resellerId: 'ADMIN002',
        isAdmin: true,
        balance: 0,
        totalSales: 0,
        totalEarnings: 0,
        level: 'Ambassador',
        isActive: true
      });

      await adminUser2.save();
      console.log('\n✅ Second admin user created successfully!');
      console.log('📧 Email: admin@beam.com');
      console.log('🔑 Password: beamadmin2024');
      console.log('🆔 Reseller ID: ADMIN002');
    }

    console.log('\n👑 Role: Admin for both users');
    console.log('🔐 Both users have full admin privileges');
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  }
};

const main = async () => {
  console.log('🚀 Setting up admin credentials...');
  await connectDB();
  await createAdminUsers();
  mongoose.connection.close();
  console.log('\n✅ Setup completed!');
};

main().catch(console.error); 
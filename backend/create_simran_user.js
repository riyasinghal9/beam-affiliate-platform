const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createSimranUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/beam-affiliate');
    console.log('Connected to MongoDB');
    
    // Check if simran user already exists
    const existingSimran = await User.findOne({ email: 'simran17@gmail.com' });
    if (existingSimran) {
      console.log('✅ Simran user already exists!');
      console.log('📧 Email: simran17@gmail.com');
      console.log('🔑 Password: password123');
      console.log('🆔 Reseller ID:', existingSimran.resellerId);
      console.log('💰 Balance:', existingSimran.balance);
      console.log('📈 Total Earnings:', existingSimran.totalEarnings);
      return;
    }
    
    // Create simran user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const simran = new User({
      firstName: 'Simran',
      lastName: 'Kaur',
      email: 'simran17@gmail.com',
      password: hashedPassword,
      resellerId: 'SIM001',
      isReseller: true,
      level: 'Intermediate',
      balance: 0,
      totalEarnings: 0,
      totalSales: 0,
      totalClicks: 0,
      isActive: true,
      socialMedia: 'Instagram: @simran_kaur',
      experience: '2 years in digital marketing',
      goals: ['Increase earnings', 'Build customer base', 'Learn new strategies']
    });
    
    await simran.save();
    console.log('✅ Simran user created successfully!');
    console.log('📧 Email: simran17@gmail.com');
    console.log('🔑 Password: password123');
    console.log('🆔 Reseller ID: SIM001');
    console.log('💰 Balance: $0');
    console.log('📈 Total Earnings: $0');
    
  } catch (error) {
    console.error('❌ Error creating simran user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSimranUser();

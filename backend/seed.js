require('dotenv').config();
const mongoose = require('mongoose');
const Division = require('./models/Division');
const District = require('./models/District');
const Thana = require('./models/Thana');
const User = require('./models/User');

// Sample data
const divisionsData = [
  { name: 'Dhaka', code: 'DHK' },
  { name: 'Chittagong', code: 'CTG' },
  { name: 'Khulna', code: 'KHL' },
  { name: 'Rajshahi', code: 'RAJ' },
];

const districtsData = [
  // Dhaka Division
  { name: 'Dhaka City', code: 'DHK-01', division: null },
  { name: 'Gazipur', code: 'DHK-02', division: null },
  { name: 'Narayanganj', code: 'DHK-03', division: null },
  // Chittagong Division
  { name: 'Chittagong City', code: 'CTG-01', division: null },
  { name: 'Cox\s Bazar', code: 'CTG-02', division: null },
];

const thanasData = [
  // Dhaka City Thanas
  { name: 'Dhanmondi', code: 'DHK-01-01', district: null },
  { name: 'Gulshan', code: 'DHK-01-02', district: null },
  { name: 'Motijheel', code: 'DHK-01-03', district: null },
  // Gazipur Thanas
  { name: 'Gazipur Sadar', code: 'DHK-02-01', district: null },
  { name: 'Sreepur', code: 'DHK-02-02', district: null },
  // Chittagong City Thanas
  { name: 'Chittagong Sadar', code: 'CTG-01-01', district: null },
  { name: 'Halishahar', code: 'CTG-01-02', district: null },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Division.deleteMany({});
    await District.deleteMany({});
    await Thana.deleteMany({});
    console.log('Cleared existing data');

    // Create divisions
    const createdDivisions = await Division.insertMany(divisionsData);
    console.log(`Created ${createdDivisions.length} divisions`);

    // Update districts with division IDs
    const updatedDistrictsData = districtsData.map((district) => {
      if (district.code.startsWith('DHK')) {
        district.division = createdDivisions[0]._id;
      } else if (district.code.startsWith('CTG')) {
        district.division = createdDivisions[1]._id;
      }
      return district;
    });

    const createdDistricts = await District.insertMany(updatedDistrictsData);
    console.log(`Created ${createdDistricts.length} districts`);

    // Update thanas with district IDs
    const updatedThanasData = thanasData.map((thana) => {
      if (thana.code.startsWith('DHK-01')) {
        thana.district = createdDistricts[0]._id; // Dhaka City
      } else if (thana.code.startsWith('DHK-02')) {
        thana.district = createdDistricts[1]._id; // Gazipur
      } else if (thana.code.startsWith('CTG-01')) {
        thana.district = createdDistricts[3]._id; // Chittagong City
      }
      return thana;
    });

    const createdThanas = await Thana.insertMany(updatedThanasData);
    console.log(`Created ${createdThanas.length} thanas`);

    // Create/update admin user (credentials come from environment, never hardcoded)
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await User.deleteOne({ email: process.env.ADMIN_EMAIL });
      await User.create({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`✓ Admin user created: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('• Skipped admin user (set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create one)');
    }

    // Create/update public demo user (safe to share — normal citizen role)
    await User.deleteOne({ email: 'demo@nagardarpan.com' });
    await User.create({
      name: 'Demo User',
      email: 'demo@nagardarpan.com',
      password: 'demo1234',
      role: 'citizen',
    });
    console.log('✓ Demo user created: demo@nagardarpan.com');

    console.log('✓ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

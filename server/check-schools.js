import mongoose from 'mongoose';
import dotenv from 'dotenv';
import School from './src/models/School.js';
import User from './src/models/User.js';

dotenv.config();

async function checkSchools() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check schools
    const schools = await School.find({});
    console.log('Schools in database:');
    schools.forEach(s => {
      console.log(`  - ${s.name}: ${s._id.toString()}`);
    });

    // Check a few users
    console.log('\nSample users:');
    const users = await User.find({}).populate('schoolId').limit(5);
    users.forEach(u => {
      console.log(`  - ${u.username}: schoolId=${u.schoolId ? u.schoolId._id.toString() : 'NULL'}, school=${u.schoolId ? u.schoolId.name : 'NO SCHOOL'}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSchools();

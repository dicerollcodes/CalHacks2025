import mongoose from 'mongoose';
import User from './src/models/User.js';
import School from './src/models/School.js';
import dotenv from 'dotenv';

dotenv.config();

async function assignBerkeleyToAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find UC Berkeley
    const berkeley = await School.findOne({ domain: 'berkeley.edu' });
    if (!berkeley) {
      console.error('UC Berkeley not found in database!');
      process.exit(1);
    }

    console.log(`Found UC Berkeley: ${berkeley.name} (${berkeley._id})`);

    // Update all users to have UC Berkeley as their school
    const result = await User.updateMany(
      {},
      { $set: { schoolId: berkeley._id } }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} users to UC Berkeley`);
    console.log(`   Total users matched: ${result.matchedCount}`);

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignBerkeleyToAll();

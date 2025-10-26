import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    const users = await User.find({}).populate('schoolId').limit(10);
    console.log(`\nFound ${users.length} users:`);

    users.forEach(u => {
      console.log('\n---');
      console.log('Username:', u.username);
      console.log('School:', u.schoolId?.name || 'NO SCHOOL');
      console.log('Has Roommate Prefs:', !!u.roommatePreferences);
      if (u.roommatePreferences) {
        console.log('  Gender:', u.roommatePreferences.gender || 'not set');
        console.log('  Gender Pref:', u.roommatePreferences.genderPreference || 'not set');
        console.log('  Pets:', u.roommatePreferences.pets || 'not set');
      }
    });

    await mongoose.connection.close();
    console.log('\n\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();

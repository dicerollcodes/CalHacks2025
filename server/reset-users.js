import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import School from './src/models/School.js';
import MatchCache from './src/models/MatchCache.js';

dotenv.config();

const fakeUsers = [
  {
    email: 'alice.chen@berkeley.edu',
    name: 'Alice Chen',
    username: 'alicechen',
    privateInterests: [
      'Rock climbing',
      'Bubble tea enthusiast',
      'Korean BBQ',
      'Indie folk music',
      'Thrifting vintage fashion'
    ]
  },
  {
    email: 'marcus.williams@berkeley.edu',
    name: 'Marcus Williams',
    username: 'marcusw',
    privateInterests: [
      'Building mechanical keyboards',
      'Competitive gaming (League of Legends)',
      'Anime and manga',
      'Late night ramen runs',
      'Photography'
    ]
  },
  {
    email: 'sofia.rodriguez@berkeley.edu',
    name: 'Sofia Rodriguez',
    username: 'sofiarodriguez',
    privateInterests: [
      'Astronomy and stargazing',
      'Playing acoustic guitar',
      'Baking sourdough bread',
      'Environmental activism',
      'Yoga and meditation'
    ]
  },
  {
    email: 'james.park@berkeley.edu',
    name: 'James Park',
    username: 'jpark',
    privateInterests: [
      'Stock market investing',
      'Golf',
      'Reading business books',
      'Classic cars',
      'Jazz music'
    ]
  },
  {
    email: 'maya.patel@berkeley.edu',
    name: 'Maya Patel',
    username: 'mayapatel',
    privateInterests: [
      'Rock climbing',
      'Indie folk music',
      'Making pour-over coffee',
      'Urban sketching',
      'Thrifting vintage fashion'
    ]
  },
  {
    email: 'david.kim@berkeley.edu',
    name: 'David Kim',
    username: 'davidkim',
    privateInterests: [
      'Competitive gaming (League of Legends)',
      'Building mechanical keyboards',
      'Late night ramen runs',
      'Crypto trading',
      'EDM festivals'
    ]
  }
];

async function resetUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get Berkeley school
    const berkeley = await School.findOne({ domain: 'berkeley.edu' });
    if (!berkeley) {
      console.error('❌ Berkeley school not found in database');
      process.exit(1);
    }

    // Delete all users except eddyzow
    console.log('Deleting all users except eddyzow...');
    const deleteResult = await User.deleteMany({
      username: { $ne: 'eddyzow' }
    });
    console.log(`✓ Deleted ${deleteResult.deletedCount} users\n`);

    // Clear all match cache
    console.log('Clearing all match cache...');
    const cacheResult = await MatchCache.deleteMany({});
    console.log(`✓ Cleared ${cacheResult.deletedCount} cached matches\n`);

    // Create fake users
    console.log('Creating fake users...\n');
    for (const userData of fakeUsers) {
      const user = new User({
        ...userData,
        schoolId: berkeley._id,
        emailVerified: true
      });
      await user.save();

      console.log(`✓ Created: ${userData.username}`);
      console.log(`  Name: ${userData.name}`);
      console.log(`  Interests: ${userData.privateInterests.join(', ')}`);
      console.log('');
    }

    console.log('\n✅ Database reset complete!');
    console.log('\nGenerated users:');
    console.log('1. alicechen - Rock climbing, Bubble tea, Korean BBQ, Indie folk, Vintage fashion');
    console.log('2. marcusw - Keyboards, League of Legends, Anime, Ramen, Photography');
    console.log('3. sofiarodriguez - Astronomy, Guitar, Sourdough, Environmental activism, Yoga');
    console.log('4. jpark - Stock investing, Golf, Business books, Classic cars, Jazz');
    console.log('5. mayapatel - Rock climbing, Indie folk, Pour-over coffee, Urban sketching, Vintage fashion');
    console.log('6. davidkim - League of Legends, Keyboards, Ramen, Crypto, EDM festivals');

  } catch (error) {
    console.error('❌ Failed to reset users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
  }
}

resetUsers();

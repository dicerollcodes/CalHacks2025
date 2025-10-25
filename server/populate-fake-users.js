import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import School from './src/models/School.js';

dotenv.config();

const fakeUsers = [
  {
    username: 'eddyzow',
    email: 'eddyzow@berkeley.edu',
    name: 'Eddy Zow',
    avatar: '🚀',
    interests: ['programming', 'web development', 'AI', 'hackathons', 'coffee'],
    socials: {
      instagram: '@eddyzow',
      discord: 'eddyzow#0001'
    }
  },
  {
    username: 'alice',
    email: 'alice@berkeley.edu',
    name: 'Alice Chen',
    avatar: '👩‍💻',
    interests: ['programming', 'machine learning', 'hiking', 'coffee', 'indie music'],
    socials: {
      instagram: '@alicechen',
      discord: 'alice#1234'
    }
  },
  {
    username: 'bob',
    email: 'bob@berkeley.edu',
    name: 'Bob Martinez',
    avatar: '👨‍🎨',
    interests: ['coding', 'AI', 'rock climbing', 'espresso', 'alternative rock'],
    socials: {
      instagram: '@bobmart',
      twitter: '@bobmartinez'
    }
  },
  {
    username: 'charlie',
    email: 'charlie@berkeley.edu',
    name: 'Charlie Kim',
    avatar: '🎮',
    interests: ['League of Legends', 'gaming', 'streaming', 'anime', 'ramen'],
    socials: {
      discord: 'charlie#5678',
      twitter: '@charliekim'
    }
  },
  {
    username: 'diana',
    email: 'diana@berkeley.edu',
    name: 'Diana Patel',
    avatar: '🎯',
    interests: ['Valorant', 'competitive gaming', 'fitness', 'cooking', 'K-pop'],
    socials: {
      instagram: '@dianapatel',
      discord: 'diana#9999'
    }
  },
  {
    username: 'evan',
    email: 'evan@berkeley.edu',
    name: 'Evan Wright',
    avatar: '🎸',
    interests: ['guitar', 'music production', 'concerts', 'photography', 'travel'],
    socials: {
      instagram: '@evanwright',
      twitter: '@evanw'
    }
  },
  {
    username: 'fiona',
    email: 'fiona@berkeley.edu',
    name: 'Fiona Lee',
    avatar: '📚',
    interests: ['reading', 'writing', 'poetry', 'tea', 'museum hopping'],
    socials: {
      instagram: '@fionalee',
      linkedin: 'fiona-lee'
    }
  },
  {
    username: 'george',
    email: 'george@berkeley.edu',
    name: 'George Thompson',
    avatar: '⚽',
    interests: ['soccer', 'basketball', 'sports analytics', 'fantasy football', 'gym'],
    socials: {
      instagram: '@gthompson',
      discord: 'george#4321'
    }
  },
  {
    username: 'hannah',
    email: 'hannah@berkeley.edu',
    name: 'Hannah Rodriguez',
    avatar: '🧪',
    interests: ['chemistry', 'research', 'baking', 'board games', 'podcasts'],
    socials: {
      linkedin: 'hannah-rodriguez',
      instagram: '@hannahrod'
    }
  }
];

async function populateFakeUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Create or get school
    let school = await School.findOne({ domain: 'berkeley.edu' });
    if (!school) {
      school = await School.create({
        name: 'UC Berkeley',
        domain: 'berkeley.edu'
      });
      console.log('✓ Created UC Berkeley school');
    } else {
      console.log('✓ Using existing UC Berkeley school');
    }

    // Create or update users (without deleting)
    console.log('Adding/updating users...\n');
    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of fakeUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });

      if (existingUser) {
        console.log(`  ⊙ Skipped ${userData.name} (@${userData.username}) - already exists`);
        skippedCount++;
      } else {
        const user = await User.create({
          username: userData.username,
          email: userData.email,
          emailVerified: true,
          name: userData.name,
          avatar: userData.avatar,
          privateInterests: userData.interests,
          socials: userData.socials,
          schoolId: school._id
        });

        console.log(`  ✓ Created ${user.name} (@${user.username})`);
        console.log(`    Interests: ${user.privateInterests.join(', ')}`);
        createdCount++;
      }
    }

    console.log(`\n✅ Done! Created ${createdCount} new users, skipped ${skippedCount} existing users`);

    console.log('\n💡 All test users (login via email verification):');
    fakeUsers.forEach(u => {
      console.log(`  • ${u.email} (@${u.username})`);
    });

    console.log('\n💡 Good matches to try:');
    console.log('  • eddyzow & alice (programming & web dev)');
    console.log('  • eddyzow & bob (AI & hackathons)');
    console.log('  • alice & bob (programming/coding should match perfectly)');
    console.log('  • charlie & diana (League/Valorant should be related)');

  } catch (error) {
    console.error('Failed to populate users:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
  }
}

populateFakeUsers();

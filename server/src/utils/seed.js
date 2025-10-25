import dotenv from 'dotenv';
import mongoose from 'mongoose';
import School from '../models/School.js';
import User from '../models/User.js';
import { connectDB } from '../config/database.js';
import { generateShareableId } from './helpers.js';

dotenv.config();

const schools = [
  { name: 'UC Berkeley', domain: 'berkeley.edu' },
  { name: 'Stanford University', domain: 'stanford.edu' },
  { name: 'MIT', domain: 'mit.edu' },
  { name: 'Harvard University', domain: 'harvard.edu' }
];

const sampleUsers = [
  {
    name: 'Alex Chen',
    avatar: '👨‍💻',
    socials: {
      instagram: 'alex.chen',
      discord: 'alexc#1234'
    },
    schoolIndex: 0, // UC Berkeley
    privateInterests: [
      'Anime',
      'Mechanical keyboards',
      'Competitive programming',
      'J-pop',
      'Cybersecurity',
      'Building custom PCs',
      'Japanese language learning',
      'Manga collecting'
    ]
  },
  {
    name: 'Maya Rodriguez',
    avatar: '👩‍🎨',
    socials: {
      instagram: 'maya.art',
      twitter: 'mayarodriguez'
    },
    schoolIndex: 0, // UC Berkeley
    privateInterests: [
      'Digital art',
      'Cosplay',
      'Anime conventions',
      'K-pop dance covers',
      'Character design',
      'Comic books',
      'Korean dramas',
      'Fan art'
    ]
  },
  {
    name: 'Jordan Lee',
    avatar: '🎮',
    socials: {
      discord: 'jordan#9999',
      instagram: 'jordan.gaming'
    },
    schoolIndex: 0, // UC Berkeley
    privateInterests: [
      'Valorant',
      'League of Legends',
      'Game design',
      'Streaming on Twitch',
      'Esports',
      'PC gaming',
      'Speedrunning',
      'Fighting games'
    ]
  },
  {
    name: 'Sam Park',
    avatar: '📚',
    socials: {
      instagram: 'samreads',
      linkedin: 'sam-park'
    },
    schoolIndex: 0, // UC Berkeley
    privateInterests: [
      'Fantasy novels',
      'Dungeons & Dragons',
      'World building',
      'Writing fan fiction',
      'Tabletop RPGs',
      'Magic: The Gathering',
      'Book collecting',
      'Creative writing'
    ]
  },
  {
    name: 'Riley Watson',
    avatar: '🎵',
    socials: {
      instagram: 'riley.music',
      twitter: 'rileyw'
    },
    schoolIndex: 1, // Stanford
    privateInterests: [
      'K-pop',
      'Anime soundtracks',
      'Music production',
      'Playing guitar',
      'Concert going',
      'Idol culture',
      'Japanese rock',
      'Vinyl collecting'
    ]
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await School.deleteMany({});
    console.log('✓ Data cleared\n');

    // Create schools
    console.log('Creating schools...');
    const createdSchools = await School.insertMany(schools);
    console.log(`✓ Created ${createdSchools.length} schools\n`);

    // Create users
    console.log('Creating users...');
    const usersToCreate = await Promise.all(
      sampleUsers.map(async (userData) => {
        const shareableId = await generateShareableId();
        return {
          name: userData.name,
          avatar: userData.avatar,
          socials: userData.socials,
          schoolId: createdSchools[userData.schoolIndex]._id,
          privateInterests: userData.privateInterests,
          shareableId
        };
      })
    );

    const createdUsers = await User.insertMany(usersToCreate);
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Display user info
    console.log('📋 Sample Users:');
    console.log('='.repeat(60));
    for (const user of createdUsers) {
      const school = createdSchools.find(s => s._id.equals(user.schoolId));
      console.log(`
${user.avatar} ${user.name}
   School: ${school.name}
   Shareable Link: /user/${user.shareableId}
   Interests: ${user.privateInterests.slice(0, 3).join(', ')}...
      `);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nExample API calls:');
    console.log(`GET  http://localhost:3000/api/users/${createdUsers[0].shareableId}`);
    console.log(`POST http://localhost:3000/api/match`);
    console.log(`     Body: { "viewerId": "${createdUsers[0].shareableId}", "targetUserId": "${createdUsers[1].shareableId}" }`);
    console.log(`GET  http://localhost:3000/api/recommendations/${createdUsers[0].shareableId}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

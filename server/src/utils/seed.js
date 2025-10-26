import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import mongoose from 'mongoose';
import School from '../models/School.js';
import User from '../models/User.js';
import { connectDB } from '../config/database.js';

const schools = [
  { name: 'UC Berkeley', domain: 'berkeley.edu' },
  { name: 'Stanford University', domain: 'stanford.edu' },
  { name: 'MIT', domain: 'mit.edu' },
  { name: 'Harvard University', domain: 'harvard.edu' }
];

const sampleUsers = [
  {
    name: 'Alex Chen',
    username: 'alexchen',
    email: 'alexchen@berkeley.edu',
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
    ],
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '01:00',
      wakeTime: '09:00',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    name: 'Maya Rodriguez',
    username: 'mayarodriguez',
    email: 'maya.rodriguez@berkeley.edu',
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
    ],
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '00:30',
      wakeTime: '08:30',
      cleanliness: 'very-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    name: 'Jordan Lee',
    username: 'jordanlee',
    email: 'jordan.lee@berkeley.edu',
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
    ],
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '02:00',
      wakeTime: '10:00',
      cleanliness: 'relaxed',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    name: 'Sam Park',
    username: 'sampark',
    email: 'sam.park@berkeley.edu',
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
    ],
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '22:00',
      wakeTime: '06:30',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'allergic'
    }
  },
  {
    name: 'Riley Watson',
    username: 'rileywatson',
    email: 'riley.watson@stanford.edu',
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
    ],
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '23:00',
      wakeTime: '07:30',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
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
        return {
          name: userData.name,
          username: userData.username,
          email: userData.email,
          emailVerified: true,
          avatar: userData.avatar,
          socials: userData.socials,
          schoolId: createdSchools[userData.schoolIndex]._id,
          privateInterests: userData.privateInterests,
          roommatePreferences: userData.roommatePreferences || {}
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
   Username: ${user.username}
   School: ${school.name}
   Profile Link: /user/${user.username}
   Interests: ${user.privateInterests.slice(0, 3).join(', ')}...
      `);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nExample API calls:');
    console.log(`GET  http://localhost:3000/api/users/${createdUsers[0].username}`);
    console.log(`POST http://localhost:3000/api/match`);
    console.log(`     Body: { "viewerId": "${createdUsers[0]._id}", "targetUserId": "${createdUsers[1]._id}" }`);
    console.log(`GET  http://localhost:3000/api/recommendations/${createdUsers[0]._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

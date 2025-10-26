import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import School from './src/models/School.js';

dotenv.config();

const fakeUsers = [
  {
    username: 'eddyzhao',
    email: 'eddyzhao@berkeley.edu',
    name: 'Eddy Zhao',
    avatar: '🚀',
    interests: ['web development', 'AI', 'hackathons', 'entrepreneurship', 'coffee'],
    socials: {
      instagram: '@eddyzhao',
      linkedin: 'eddy-zhao'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '01:00',
      wakeTime: '09:00',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'alexchen',
    email: 'alexchen@berkeley.edu',
    name: 'Alex Chen',
    avatar: '👨‍💻',
    interests: ['machine learning', 'deep learning', 'kaggle', 'data science', 'python'],
    socials: {
      github: 'alexchen',
      linkedin: 'alex-chen'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '02:00',
      wakeTime: '10:00',
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'relaxed',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'sophiamartinez',
    email: 'sophiamartinez@berkeley.edu',
    name: 'Sophia Martinez',
    avatar: '🎨',
    interests: ['painting', 'digital art', 'illustration', 'watercolor', 'art history'],
    socials: {
      instagram: '@sophiaart',
      twitter: '@sophiamartinez'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '22:00',
      wakeTime: '06:30',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'moderately-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'liamwong',
    email: 'liamwong@berkeley.edu',
    name: 'Liam Wong',
    avatar: '🎮',
    interests: ['League of Legends', 'Valorant', 'gaming', 'esports', 'streaming'],
    socials: {
      twitch: 'liamwong',
      discord: 'liamwong#1234'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '03:00',
      wakeTime: '11:00',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'relaxed',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'allergic'
    }
  },
  {
    username: 'emmajohnson',
    email: 'emmajohnson@berkeley.edu',
    name: 'Emma Johnson',
    avatar: '🏃‍♀️',
    interests: ['running', 'marathons', 'crossfit', 'nutrition', 'yoga'],
    socials: {
      instagram: '@emmafitness',
      strava: 'emmajohnson'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '21:30',
      wakeTime: '05:30',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'noahpatel',
    email: 'noahpatel@berkeley.edu',
    name: 'Noah Patel',
    avatar: '🎸',
    interests: ['guitar', 'bass', 'rock music', 'jazz', 'music theory'],
    socials: {
      instagram: '@noahmusic',
      spotify: 'noahpatel'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '00:00',
      wakeTime: '08:00',
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'outside-only',
      pets: 'no-pets'
    }
  },
  {
    username: 'oliviakim',
    email: 'oliviakim@berkeley.edu',
    name: 'Olivia Kim',
    avatar: '📚',
    interests: ['literature', 'poetry', 'creative writing', 'book clubs', 'coffee shops'],
    socials: {
      goodreads: 'oliviakim',
      instagram: '@oliviareads'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '22:30',
      wakeTime: '07:00',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'ethanthompson',
    email: 'ethanthompson@berkeley.edu',
    name: 'Ethan Thompson',
    avatar: '⚽',
    interests: ['soccer', 'basketball', 'sports', 'FIFA', 'fantasy sports'],
    socials: {
      instagram: '@ethansports',
      twitter: '@ethanthompson'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '23:00',
      wakeTime: '07:30',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'avarodriguez',
    email: 'avarodriguez@berkeley.edu',
    name: 'Ava Rodriguez',
    avatar: '🧪',
    interests: ['chemistry', 'research', 'lab work', 'science', 'STEM'],
    socials: {
      linkedin: 'ava-rodriguez',
      researchgate: 'avarodriguez'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '22:00',
      wakeTime: '06:00',
      gender: 'female',
      genderPreference: 'no-preference',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'allergic'
    }
  },
  {
    username: 'masonlee',
    email: 'masonlee@berkeley.edu',
    name: 'Mason Lee',
    avatar: '🎬',
    interests: ['filmmaking', 'cinematography', 'video editing', 'photography', 'movies'],
    socials: {
      instagram: '@masonfilms',
      vimeo: 'masonlee'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '01:30',
      wakeTime: '09:30',
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'isabellawang',
    email: 'isabellawang@berkeley.edu',
    name: 'Isabella Wang',
    avatar: '🎹',
    interests: ['piano', 'classical music', 'composing', 'orchestra', 'chamber music'],
    socials: {
      instagram: '@isabellapiano',
      youtube: 'isabellawang'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '23:00',
      wakeTime: '07:00',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'lucasgarcia',
    email: 'lucasgarcia@berkeley.edu',
    name: 'Lucas Garcia',
    avatar: '🏔️',
    interests: ['hiking', 'rock climbing', 'camping', 'backpacking', 'outdoors'],
    socials: {
      instagram: '@lucasoutdoors',
      alltrails: 'lucasgarcia'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '21:00',
      wakeTime: '05:00',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'relaxed',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'miadavis',
    email: 'miadavis@berkeley.edu',
    name: 'Mia Davis',
    avatar: '🍳',
    interests: ['cooking', 'baking', 'food photography', 'recipes', 'culinary arts'],
    socials: {
      instagram: '@miacooks',
      tiktok: '@miadavis'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '23:30',
      wakeTime: '08:00',
      gender: 'female',
      genderPreference: 'no-preference',
      cleanliness: 'very-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'jamesanderson',
    email: 'jamesanderson@berkeley.edu',
    name: 'James Anderson',
    avatar: '🎭',
    interests: ['theater', 'acting', 'improv', 'drama', 'Shakespeare'],
    socials: {
      instagram: '@jamesactor',
      twitter: '@jamesanderson'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '01:00',
      wakeTime: '09:00',
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'outside-only',
      pets: 'no-pets'
    }
  },
  {
    username: 'charlottebrown',
    email: 'charlottebrown@berkeley.edu',
    name: 'Charlotte Brown',
    avatar: '🌱',
    interests: ['environmental science', 'sustainability', 'gardening', 'climate change', 'ecology'],
    socials: {
      instagram: '@charlottegreen',
      twitter: '@cbrown'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '22:00',
      wakeTime: '06:30',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'benjaminwilson',
    email: 'benjaminwilson@berkeley.edu',
    name: 'Benjamin Wilson',
    avatar: '🤖',
    interests: ['robotics', 'mechanical engineering', 'Arduino', 'electronics', 'maker culture'],
    socials: {
      github: 'benjaminwilson',
      instagram: '@benbuilds'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '02:00',
      wakeTime: '10:00',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'relaxed',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'ameliamiller',
    email: 'ameliamiller@berkeley.edu',
    name: 'Amelia Miller',
    avatar: '💃',
    interests: ['dance', 'ballet', 'hip hop', 'choreography', 'performance'],
    socials: {
      instagram: '@ameliadance',
      tiktok: '@ameliamiller'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '23:30',
      wakeTime: '07:30',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'henrymoore',
    email: 'henrymoore@berkeley.edu',
    name: 'Henry Moore',
    avatar: '📱',
    interests: ['app development', 'iOS', 'Swift', 'mobile design', 'startups'],
    socials: {
      github: 'henrymoore',
      linkedin: 'henry-moore'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '01:00',
      wakeTime: '09:00',
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'harperpatel',
    email: 'harperpatel@berkeley.edu',
    name: 'Harper Patel',
    avatar: '🎨',
    interests: ['graphic design', 'UI/UX', 'Figma', 'branding', 'typography'],
    socials: {
      dribbble: 'harperpatel',
      behance: 'harperpatel'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '00:00',
      wakeTime: '08:00',
      gender: 'non-binary',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'jacktaylor',
    email: 'jacktaylor@berkeley.edu',
    name: 'Jack Taylor',
    avatar: '🎲',
    interests: ['board games', 'D&D', 'tabletop RPGs', 'card games', 'game design'],
    socials: {
      instagram: '@jackgames',
      discord: 'jacktaylor#5678'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '02:00',
      wakeTime: '10:00',
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'relaxed',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'lilywhite',
    email: 'lilywhite@berkeley.edu',
    name: 'Lily White',
    avatar: '🧘‍♀️',
    interests: ['yoga', 'meditation', 'mindfulness', 'wellness', 'spirituality'],
    socials: {
      instagram: '@lilyyoga',
      youtube: 'lilywhite'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '21:30',
      wakeTime: '05:30',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'owenharris',
    email: 'owenharris@berkeley.edu',
    name: 'Owen Harris',
    avatar: '🎺',
    interests: ['jazz', 'trumpet', 'music performance', 'big band', 'improvisation'],
    socials: {
      instagram: '@owenjazz',
      spotify: 'owenharris'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '00:30',
      wakeTime: '08:30',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'zoemartin',
    email: 'zoemartin@berkeley.edu',
    name: 'Zoe Martin',
    avatar: '✈️',
    interests: ['travel', 'photography', 'languages', 'culture', 'backpacking'],
    socials: {
      instagram: '@zoetravel',
      blog: 'zoewanders.com'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '23:00',
      wakeTime: '07:00',
      gender: 'female',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'ryanclark',
    email: 'ryanclark@berkeley.edu',
    name: 'Ryan Clark',
    avatar: '🏋️',
    interests: ['weightlifting', 'powerlifting', 'gym', 'protein', 'bodybuilding'],
    socials: {
      instagram: '@ryanlifts',
      youtube: 'ryanclark'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '21:00',
      wakeTime: '05:00',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'gracenguyen',
    email: 'gracenguyen@berkeley.edu',
    name: 'Grace Nguyen',
    avatar: '🎤',
    interests: ['singing', 'vocal performance', 'a cappella', 'music', 'karaoke'],
    socials: {
      instagram: '@gracesings',
      youtube: 'gracenguyen'
    },
    roommatePreferences: {
      sleepSchedule: 'flexible',
      bedtime: '23:30',
      wakeTime: '07:30',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'caleblewis',
    email: 'caleblewis@berkeley.edu',
    name: 'Caleb Lewis',
    avatar: '📊',
    interests: ['economics', 'finance', 'investing', 'stock market', 'business'],
    socials: {
      linkedin: 'caleb-lewis',
      twitter: '@caleblewis'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '22:30',
      wakeTime: '06:00',
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'very-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'penelopescott',
    email: 'penelopescott@berkeley.edu',
    name: 'Penelope Scott',
    avatar: '🔬',
    interests: ['biology', 'genetics', 'molecular biology', 'research', 'medicine'],
    socials: {
      linkedin: 'penelope-scott',
      researchgate: 'penelopescott'
    },
    roommatePreferences: {
      sleepSchedule: 'early-riser',
      bedtime: '22:00',
      wakeTime: '06:00',
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      smoking: 'non-smoker',
      pets: 'allergic'
    }
  },
  {
    username: 'elliotyoung',
    email: 'elliotyoung@berkeley.edu',
    name: 'Elliot Young',
    avatar: '🎧',
    interests: ['music production', 'EDM', 'DJing', 'Ableton', 'electronic music'],
    socials: {
      soundcloud: 'elliotyoung',
      instagram: '@elliotdj'
    },
    roommatePreferences: {
      sleepSchedule: 'night-owl',
      bedtime: '03:00',
      wakeTime: '11:00',
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'relaxed',
      socialLevel: 'very-social',
      guests: 'often',
      smoking: 'outside-only',
      pets: 'no-pets'
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

    // REMOVE ALL EXISTING USERS
    const deleteResult = await User.deleteMany({});
    console.log(`🗑️  Removed ${deleteResult.deletedCount} existing users\n`);

    // Create all new users
    console.log('Creating new users...\n');
    let createdCount = 0;

    for (const userData of fakeUsers) {
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        emailVerified: true,
        name: userData.name,
        avatar: userData.avatar,
        privateInterests: userData.interests,
        socials: userData.socials,
        schoolId: school._id,
        roommatePreferences: userData.roommatePreferences
      });

      console.log(`  ✓ Created ${user.name} (@${user.username})`);
      console.log(`    Interests: ${user.privateInterests.join(', ')}`);
      console.log(`    Gender: ${user.roommatePreferences.gender} | Preference: ${user.roommatePreferences.genderPreference}`);
      console.log(`    Sleep: ${user.roommatePreferences.sleepSchedule} (${user.roommatePreferences.bedtime} - ${user.roommatePreferences.wakeTime})`);
      createdCount++;
    }

    console.log(`\n✅ Done! Created ${createdCount} new users with diverse interests and roommate preferences`);

    console.log('\n💡 All test users (login via email verification):');
    fakeUsers.forEach(u => {
      console.log(`  • ${u.email} (@${u.username})`);
    });

    console.log('\n💡 Good matches to test:');
    console.log('  • eddyzhao & alexchen (AI/ML focus, both night owls, both male)');
    console.log('  • sophiamartinez & charlottebrown (both female, early risers, have pets)');
    console.log('  • liamwong & eddyzhao (gaming + web dev, both night owls, male)');
    console.log('  • noahpatel & owenharris (music interests, male)');
    console.log('  • emmajohnson & ameliamiller (fitness/dance, female, social)');
    console.log('  • Gender filtering: eddyzhao (prefers male) should not see users without gender set');

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

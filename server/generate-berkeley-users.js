import mongoose from 'mongoose';
import User from './src/models/User.js';
import School from './src/models/School.js';
import dotenv from 'dotenv';

dotenv.config();

const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'Dakota', 'Rowan', 'River', 'Phoenix', 'Skylar', 'Cameron', 'Drew', 'Finley', 'Harper', 'Indigo', 'Jules'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'White', 'Harris'];

const interests = [
  ['AI', 'machine learning', 'robotics', 'data science'],
  ['web development', 'UI/UX design', 'React', 'Node.js'],
  ['basketball', 'soccer', 'tennis', 'running'],
  ['photography', 'videography', 'film', 'content creation'],
  ['music production', 'guitar', 'piano', 'singing'],
  ['cooking', 'baking', 'food blogging', 'trying new restaurants'],
  ['reading', 'creative writing', 'poetry', 'book clubs'],
  ['gaming', 'esports', 'streaming', 'game development'],
  ['hiking', 'camping', 'rock climbing', 'outdoor adventures'],
  ['yoga', 'meditation', 'mindfulness', 'wellness'],
  ['fashion', 'thrifting', 'sustainable clothing', 'style blogging'],
  ['volunteering', 'community service', 'social justice', 'activism'],
  ['entrepreneurship', 'startups', 'business', 'investing'],
  ['astronomy', 'space exploration', 'physics', 'science'],
  ['art', 'painting', 'drawing', 'graphic design'],
  ['dance', 'hip hop', 'ballet', 'choreography'],
  ['anime', 'manga', 'cosplay', 'Japanese culture'],
  ['podcasting', 'radio', 'audio production', 'storytelling'],
  ['environmental activism', 'sustainability', 'climate change', 'green energy'],
  ['psychology', 'mental health', 'neuroscience', 'therapy']
];

const sleepSchedules = ['early-riser', 'night-owl', 'flexible'];
const cleanlinessLevels = ['very-clean', 'moderately-clean', 'relaxed'];
const socialLevels = ['very-social', 'moderately-social', 'quiet'];
const guestPreferences = ['often', 'sometimes', 'rarely'];
const smokingPreferences = ['non-smoker', 'non-smoker'];
const petPreferences = ['has-pets', 'no-pets', 'allergic'];
const genders = ['male', 'female', 'non-binary'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInterests() {
  const interestSet = getRandomElement(interests);
  const numInterests = 3 + Math.floor(Math.random() * 2); // 3-4 interests
  return interestSet.slice(0, numInterests);
}

async function generateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database\n');

    // Find UC Berkeley
    const berkeley = await School.findOne({ domain: 'berkeley.edu' });
    if (!berkeley) {
      console.error('UC Berkeley not found in database!');
      process.exit(1);
    }

    console.log(`Using school: ${berkeley.name} (${berkeley._id})\n`);

    const users = [];

    for (let i = 0; i < 20; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
      const email = `${username}@berkeley.edu`;
      const name = `${firstName} ${lastName}`;

      const user = new User({
        email: email.toLowerCase(),
        name,
        username: username.toLowerCase(),
        schoolId: berkeley._id,
        privateInterests: getRandomInterests(),
        emailVerified: true,
        roommatePreferences: {
          sleepSchedule: getRandomElement(sleepSchedules),
          cleanliness: getRandomElement(cleanlinessLevels),
          socialLevel: getRandomElement(socialLevels),
          guests: getRandomElement(guestPreferences),
          smoking: getRandomElement(smokingPreferences),
          pets: getRandomElement(petPreferences),
          gender: getRandomElement(genders),
          genderPreference: Math.random() > 0.7 ? getRandomElement(genders) : 'no-preference'
        }
      });

      users.push(user);
      console.log(`${i + 1}. Created ${name} (@${username})`);
    }

    await User.insertMany(users);
    console.log(`\n✅ Successfully created ${users.length} test users at UC Berkeley!`);

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

generateUsers();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import School from './src/models/School.js';

dotenv.config();

const students = [
  {
    username: 'alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Machine Learning', 'Web Development', 'Gaming', 'Anime', 'Boba Tea', 'Hackathons', 'Open Source', 'Startups', 'Music Production', 'Photography'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      sleepSchedule: 'night-owl',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'sarah_martinez',
    name: 'Sarah Martinez',
    email: 'sarah.m@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Medicine', 'Yoga', 'Sustainability', 'Cooking', 'Volunteering', 'Running', 'Meditation', 'Plant-Based Diet', 'Hiking', 'Journaling'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      sleepSchedule: 'early-riser',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'jake_thompson',
    name: 'Jake Thompson',
    email: 'jake.t@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Entrepreneurship', 'Investing', 'Fitness', 'Networking', 'Travel', 'Basketball', 'Parties', 'Real Estate', 'Fashion', 'Podcast Hosting'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      sleepSchedule: 'night-owl',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'maya_patel',
    name: 'Maya Patel',
    email: 'maya.p@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Digital Art', 'UI/UX Design', 'Robotics', 'Gaming', 'Illustration', 'VR/AR', 'Animation', 'Creative Coding', 'Music', 'Film'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      sleepSchedule: 'flexible',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'david_kim',
    name: 'David Kim',
    email: 'david.kim@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Astrophysics', 'Mathematics', 'Chess', 'Science Fiction', 'Stargazing', 'Philosophy', 'Classical Music', 'Reading', 'Puzzles', 'Teaching'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      sleepSchedule: 'early-riser',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'emma_johnson',
    name: 'Emma Johnson',
    email: 'emma.j@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Creative Writing', 'Literature', 'Coffee', 'Poetry', 'Theatre', 'Film Analysis', 'Book Clubs', 'Journalism', 'Blogging', 'Vintage Fashion'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'sometimes',
      sleepSchedule: 'night-owl',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'marcus_williams',
    name: 'Marcus Williams',
    email: 'marcus.w@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Track & Field', 'Sports Analytics', 'Economics', 'Meal Prep', 'Hip Hop', 'Video Games', 'Financial Markets', 'Nutrition', 'Sneaker Culture', 'Podcasts'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      sleepSchedule: 'early-riser',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'lily_zhang',
    name: 'Lily Zhang',
    email: 'lily.z@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Sustainability', 'Rock Climbing', 'Backpacking', 'Climate Activism', 'Photography', 'Camping', 'Marine Biology', 'Gardening', 'Biking', 'Documentary Films'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'sometimes',
      sleepSchedule: 'early-riser',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'ryan_lee',
    name: 'Ryan Lee',
    email: 'ryan.lee@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Robotics', 'Automotive Engineering', '3D Printing', 'Drones', 'Hardware Hacking', 'Racing', 'CAD Design', 'Woodworking', 'Electronics', 'Formula SAE'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      sleepSchedule: 'flexible',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'sofia_garcia',
    name: 'Sofia Garcia',
    email: 'sofia.g@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Mental Health', 'Therapy', 'Social Justice', 'Dogs', 'Painting', 'Self-Care', 'Advocacy', 'True Crime', 'Astrology', 'Thrifting'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      sleepSchedule: 'early-riser',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'tyler_brown',
    name: 'Tyler Brown',
    email: 'tyler.b@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['EDM', 'Music Festivals', 'Data Visualization', 'DJing', 'Python', 'Statistics', 'Raving', 'Concert Photography', 'Cryptocurrency', 'Neural Networks'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'very-social',
      guests: 'often',
      sleepSchedule: 'night-owl',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'nina_shah',
    name: 'Nina Shah',
    email: 'nina.s@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Law', 'Policy', 'Debate', 'Human Rights', 'Public Speaking', 'Campaigning', 'News', 'History', 'Writing', 'Community Organizing'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      sleepSchedule: 'flexible',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'chris_taylor',
    name: 'Chris Taylor',
    email: 'chris.t@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Architecture', 'Urban Design', 'Sketching', 'Model Building', 'Photography', 'Sustainability', 'Art History', 'Travel', 'Museums', 'Coffee Shops'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      sleepSchedule: 'night-owl',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'olivia_nguyen',
    name: 'Olivia Nguyen',
    email: 'olivia.n@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Biomedical Engineering', 'Healthcare', 'Lab Work', 'Prosthetics', 'Biology', 'Chemistry', 'Volunteering', 'Tennis', 'Baking', 'K-Pop'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'very-clean',
      socialLevel: 'quiet',
      guests: 'sometimes',
      sleepSchedule: 'early-riser',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'jason_rodriguez',
    name: 'Jason Rodriguez',
    email: 'jason.r@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Jazz', 'Piano', 'Composition', 'Music Theory', 'Recording', 'Gigging', 'Classical Music', 'Improvisation', 'Teaching', 'Vinyl Collecting'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'often',
      sleepSchedule: 'night-owl',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'rachel_cohen',
    name: 'Rachel Cohen',
    email: 'rachel.c@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Social Justice', 'Activism', 'Research', 'Community Work', 'Feminism', 'Protests', 'Writing', 'Public Health', 'Documentary', 'Mutual Aid'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'sometimes',
      sleepSchedule: 'flexible',
      smoking: 'non-smoker',
      pets: 'has-pets'
    }
  },
  {
    username: 'kevin_park',
    name: 'Kevin Park',
    email: 'kevin.p@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Chemistry', 'Cooking', 'Food Science', 'Restaurants', 'Process Engineering', 'Brewing', 'Fermentation', 'Baking', 'Recipe Development', 'Travel'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'no-preference',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'often',
      sleepSchedule: 'flexible',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'amanda_lopez',
    name: 'Amanda Lopez',
    email: 'amanda.l@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Content Creation', 'Video Editing', 'Social Media', 'Vlogging', 'TikTok', 'Fashion', 'Beauty', 'Marketing', 'Photography', 'Branding'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'often',
      sleepSchedule: 'flexible',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'ethan_davis',
    name: 'Ethan Davis',
    email: 'ethan.d@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Gaming', 'Esports', 'Mathematics', 'League of Legends', 'Chess', 'Competitive Programming', 'Streaming', 'Statistics', 'Probability', 'Game Theory'],
    roommatePreferences: {
      gender: 'male',
      genderPreference: 'male',
      cleanliness: 'moderately-clean',
      socialLevel: 'quiet',
      guests: 'rarely',
      sleepSchedule: 'night-owl',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  },
  {
    username: 'isabelle_white',
    name: 'Isabelle White',
    email: 'isabelle.w@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    privateInterests: ['Dance', 'Ballet', 'Contemporary Dance', 'Choreography', 'Hip Hop', 'Fitness', 'Yoga', 'Performance Art', 'Music', 'Fashion Design'],
    roommatePreferences: {
      gender: 'female',
      genderPreference: 'female',
      cleanliness: 'moderately-clean',
      socialLevel: 'moderately-social',
      guests: 'sometimes',
      sleepSchedule: 'early-riser',
      smoking: 'non-smoker',
      pets: 'no-pets'
    }
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Look up UC Berkeley school ID
    const berkeley = await School.findOne({ name: 'UC Berkeley' });
    if (!berkeley) {
      console.error('❌ UC Berkeley school not found in database!');
      process.exit(1);
    }
    console.log(`Found UC Berkeley: ${berkeley._id}`);

    // Update all students with Berkeley's actual ID
    const studentsWithSchool = students.map(s => ({
      ...s,
      schoolId: berkeley._id
    }));

    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing users`);

    const insertedUsers = await User.insertMany(studentsWithSchool);
    console.log(`Successfully added ${insertedUsers.length} Berkeley students!`);

    console.log('\n🎓 Berkeley Students Added:');
    insertedUsers.forEach(user => {
      console.log(`  - ${user.name} (@${user.username})`);
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('💡 Developer Mode: You can now spy on full interest lists');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

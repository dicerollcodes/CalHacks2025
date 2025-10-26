import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const students = [
  {
    username: 'alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'CS major who loves hackathons and late-night coding sessions. Always down for boba runs!',
    year: 'Junior',
    major: 'Computer Science',
    interests: ['Machine Learning', 'Web Development', 'Gaming', 'Anime', 'Boba Tea', 'Hackathons', 'Open Source', 'Startups', 'Music Production', 'Photography'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Moderate',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Night Owl'
    }
  },
  {
    username: 'sarah_martinez',
    name: 'Sarah Martinez',
    email: 'sarah.m@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Pre-med student balancing orgo and volunteer work. Love yoga and sustainable living!',
    year: 'Sophomore',
    major: 'Molecular & Cell Biology',
    interests: ['Medicine', 'Yoga', 'Sustainability', 'Cooking', 'Volunteering', 'Running', 'Meditation', 'Plant-Based Diet', 'Hiking', 'Journaling'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'Female Only',
      hasPets: false,
      petPreference: 'No Pets',
      cleanliness: 'Very Clean',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Rarely',
      sleepSchedule: 'Early Bird'
    }
  },
  {
    username: 'jake_thompson',
    name: 'Jake Thompson',
    email: 'jake.t@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Business major and frat member. Big on networking and weekend adventures!',
    year: 'Senior',
    major: 'Business Administration',
    interests: ['Entrepreneurship', 'Investing', 'Fitness', 'Networking', 'Travel', 'Basketball', 'Parties', 'Real Estate', 'Fashion', 'Podcast Hosting'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'Male Only',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Moderate',
      noiseLevel: 'Loud',
      guestsFrequency: 'Often',
      sleepSchedule: 'Night Owl'
    }
  },
  {
    username: 'maya_patel',
    name: 'Maya Patel',
    email: 'maya.p@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'EECS and art double major. Creating at the intersection of technology and design.',
    year: 'Junior',
    major: 'EECS & Art Practice',
    interests: ['Digital Art', 'UI/UX Design', 'Robotics', 'Gaming', 'Illustration', 'VR/AR', 'Animation', 'Creative Coding', 'Music', 'Film'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'Prefer Pets',
      cleanliness: 'Moderate',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Flexible'
    }
  },
  {
    username: 'david_kim',
    name: 'David Kim',
    email: 'david.kim@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Physics major obsessed with understanding the universe. Aspiring astrophysicist!',
    year: 'Sophomore',
    major: 'Physics',
    interests: ['Astrophysics', 'Mathematics', 'Chess', 'Science Fiction', 'Stargazing', 'Philosophy', 'Classical Music', 'Reading', 'Puzzles', 'Teaching'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Pets',
      cleanliness: 'Very Clean',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Rarely',
      sleepSchedule: 'Early Bird'
    }
  },
  {
    username: 'emma_johnson',
    name: 'Emma Johnson',
    email: 'emma.j@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'English major and aspiring novelist. Coffee addict and bookworm extraordinaire.',
    year: 'Junior',
    major: 'English',
    interests: ['Creative Writing', 'Literature', 'Coffee', 'Poetry', 'Theatre', 'Film Analysis', 'Book Clubs', 'Journalism', 'Blogging', 'Vintage Fashion'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'Female Only',
      hasPets: true,
      petPreference: 'Prefer Pets',
      cleanliness: 'Moderate',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Night Owl'
    }
  },
  {
    username: 'marcus_williams',
    name: 'Marcus Williams',
    email: 'marcus.w@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Varsity athlete studying economics. Training hard and studying harder!',
    year: 'Freshman',
    major: 'Economics',
    interests: ['Track & Field', 'Sports Analytics', 'Economics', 'Meal Prep', 'Hip Hop', 'Video Games', 'Financial Markets', 'Nutrition', 'Sneaker Culture', 'Podcasts'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'Male Only',
      hasPets: false,
      petPreference: 'No Pets',
      cleanliness: 'Clean',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Early Bird'
    }
  },
  {
    username: 'lily_zhang',
    name: 'Lily Zhang',
    email: 'lily.z@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Environmental science student passionate about climate action and outdoor adventures.',
    year: 'Sophomore',
    major: 'Environmental Science',
    interests: ['Sustainability', 'Rock Climbing', 'Backpacking', 'Climate Activism', 'Photography', 'Camping', 'Marine Biology', 'Gardening', 'Biking', 'Documentary Films'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'Prefer Pets',
      cleanliness: 'Moderate',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Early Bird'
    }
  },
  {
    username: 'ryan_lee',
    name: 'Ryan Lee',
    email: 'ryan.lee@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Mechanical engineering major building the future. Cars, robots, and innovation!',
    year: 'Junior',
    major: 'Mechanical Engineering',
    interests: ['Robotics', 'Automotive Engineering', ' 3D Printing', 'Drones', 'Hardware Hacking', 'Racing', 'CAD Design', 'Woodworking', 'Electronics', 'Formula SAE'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Moderate',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Flexible'
    }
  },
  {
    username: 'sofia_garcia',
    name: 'Sofia Garcia',
    email: 'sofia.g@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Psychology major interested in mental health and social justice. Therapy dog mom!',
    year: 'Senior',
    major: 'Psychology',
    interests: ['Mental Health', 'Therapy', 'Social Justice', 'Dogs', 'Painting', 'Self-Care', 'Advocacy', 'True Crime', 'Astrology', 'Thrifting'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'Female Only',
      hasPets: true,
      petPreference: 'Prefer Pets',
      cleanliness: 'Clean',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Rarely',
      sleepSchedule: 'Early Bird'
    }
  },
  {
    username: 'tyler_brown',
    name: 'Tyler Brown',
    email: 'tyler.b@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Data science major and EDM enthusiast. Living for music festivals and algorithms!',
    year: 'Junior',
    major: 'Data Science',
    interests: ['EDM', 'Music Festivals', 'Data Visualization', 'DJing', 'Python', 'Statistics', 'Raving', 'Concert Photography', 'Cryptocurrency', 'Neural Networks'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Moderate',
      noiseLevel: 'Loud',
      guestsFrequency: 'Often',
      sleepSchedule: 'Night Owl'
    }
  },
  {
    username: 'nina_shah',
    name: 'Nina Shah',
    email: 'nina.s@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Political science major fighting for change. Future lawyer and policy maker!',
    year: 'Senior',
    major: 'Political Science',
    interests: ['Law', 'Policy', 'Debate', 'Human Rights', 'Public Speaking', 'Campaigning', 'News', 'History', 'Writing', 'Community Organizing'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Pets',
      cleanliness: 'Clean',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Flexible'
    }
  },
  {
    username: 'chris_taylor',
    name: 'Chris Taylor',
    email: 'chris.t@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Architecture major designing sustainable cities. Sketching and building models 24/7.',
    year: 'Sophomore',
    major: 'Architecture',
    interests: ['Architecture', 'Urban Design', 'Sketching', 'Model Building', 'Photography', 'Sustainability', 'Art History', 'Travel', 'Museums', 'Coffee Shops'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Moderate',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Rarely',
      sleepSchedule: 'Night Owl'
    }
  },
  {
    username: 'olivia_nguyen',
    name: 'Olivia Nguyen',
    email: 'olivia.n@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Bioengineering major working on medical devices. Science meets compassion!',
    year: 'Junior',
    major: 'Bioengineering',
    interests: ['Biomedical Engineering', 'Healthcare', 'Lab Work', 'Prosthetics', 'Biology', 'Chemistry', 'Volunteering', 'Tennis', 'Baking', 'K-Pop'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'Female Only',
      hasPets: false,
      petPreference: 'No Pets',
      cleanliness: 'Very Clean',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Early Bird'
    }
  },
  {
    username: 'jason_rodriguez',
    name: 'Jason Rodriguez',
    email: 'jason.r@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Music major and jazz pianist. Practicing and performing whenever I can!',
    year: 'Senior',
    major: 'Music',
    interests: ['Jazz', 'Piano', 'Composition', 'Music Theory', 'Recording', 'Gigging', 'Classical Music', 'Improvisation', 'Teaching', 'Vinyl Collecting'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Moderate',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Often',
      sleepSchedule: 'Night Owl'
    }
  },
  {
    username: 'rachel_cohen',
    name: 'Rachel Cohen',
    email: 'rachel.c@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Sociology major studying inequality and social movements. Activist and organizer.',
    year: 'Junior',
    major: 'Sociology',
    interests: ['Social Justice', 'Activism', 'Research', 'Community Work', 'Feminism', 'Protests', 'Writing', 'Public Health', 'Documentary', 'Mutual Aid'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'Female Only',
      hasPets: false,
      petPreference: 'Prefer Pets',
      cleanliness: 'Moderate',
      noiseLevel: 'Quiet',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Flexible'
    }
  },
  {
    username: 'kevin_park',
    name: 'Kevin Park',
    email: 'kevin.p@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Chemical engineering major and foodie. Cooking up solutions in lab and kitchen!',
    year: 'Sophomore',
    major: 'Chemical Engineering',
    interests: ['Chemistry', 'Cooking', 'Food Science', 'Restaurants', 'Process Engineering', 'Brewing', 'Fermentation', 'Baking', 'Recipe Development', 'Travel'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'No Preference',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Clean',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Often',
      sleepSchedule: 'Flexible'
    }
  },
  {
    username: 'amanda_lopez',
    name: 'Amanda Lopez',
    email: 'amanda.l@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Media studies major creating content. Influencer wannabe and video editor!',
    year: 'Freshman',
    major: 'Media Studies',
    interests: ['Content Creation', 'Video Editing', 'Social Media', 'Vlogging', 'TikTok', 'Fashion', 'Beauty', 'Marketing', 'Photography', 'Branding'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'Female Only',
      hasPets: false,
      petPreference: 'No Preference',
      cleanliness: 'Moderate',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Often',
      sleepSchedule: 'Flexible'
    }
  },
  {
    username: 'ethan_davis',
    name: 'Ethan Davis',
    email: 'ethan.d@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Applied math major and competitive gamer. Grinding ranked and problem sets!',
    year: 'Junior',
    major: 'Applied Mathematics',
    interests: ['Gaming', 'Esports', 'Mathematics', 'League of Legends', 'Chess', 'Competitive Programming', 'Streaming', 'Statistics', 'Probability', 'Game Theory'],
    roommatePreferences: {
      gender: 'Male',
      genderPreference: 'Male Only',
      hasPets: false,
      petPreference: 'No Pets',
      cleanliness: 'Moderate',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Rarely',
      sleepSchedule: 'Night Owl'
    }
  },
  {
    username: 'isabelle_white',
    name: 'Isabelle White',
    email: 'isabelle.w@berkeley.edu',
    password: '$2b$10$YourHashedPasswordHere',
    schoolId: '507f1f77bcf86cd799439011',
    bio: 'Dance major expressing myself through movement. Ballet, contemporary, and hip hop!',
    year: 'Sophomore',
    major: 'Dance & Performance Studies',
    interests: ['Dance', 'Ballet', 'Contemporary Dance', 'Choreography', 'Hip Hop', 'Fitness', 'Yoga', 'Performance Art', 'Music', 'Fashion Design'],
    roommatePreferences: {
      gender: 'Female',
      genderPreference: 'Female Only',
      hasPets: false,
      petPreference: 'No Pets',
      cleanliness: 'Clean',
      noiseLevel: 'Moderate',
      guestsFrequency: 'Sometimes',
      sleepSchedule: 'Early Bird'
    }
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing users
    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing users`);

    // Insert new students
    const insertedUsers = await User.insertMany(students);
    console.log(`Successfully added ${insertedUsers.length} Berkeley students!`);

    console.log('\n🎓 Berkeley Students Added:');
    insertedUsers.forEach(user => {
      console.log(`  - ${user.name} (@${user.username}) - ${user.major}`);
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('💡 Developer Mode: You can now spy on full interest lists in the admin panel');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

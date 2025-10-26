import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import School from './src/models/School.js';

const schools = [
  // Top 20 US Universities
  { name: 'Princeton University', domain: 'princeton.edu' },
  { name: 'MIT', domain: 'mit.edu' },
  { name: 'Harvard University', domain: 'harvard.edu' },
  { name: 'Stanford University', domain: 'stanford.edu' },
  { name: 'Yale University', domain: 'yale.edu' },
  { name: 'University of Pennsylvania', domain: 'upenn.edu' },
  { name: 'Caltech', domain: 'caltech.edu' },
  { name: 'Duke University', domain: 'duke.edu' },
  { name: 'Brown University', domain: 'brown.edu' },
  { name: 'Johns Hopkins University', domain: 'jhu.edu' },
  { name: 'Northwestern University', domain: 'northwestern.edu' },
  { name: 'Dartmouth College', domain: 'dartmouth.edu' },
  { name: 'Vanderbilt University', domain: 'vanderbilt.edu' },
  { name: 'Cornell University', domain: 'cornell.edu' },
  { name: 'Rice University', domain: 'rice.edu' },
  { name: 'University of Notre Dame', domain: 'nd.edu' },
  { name: 'UCLA', domain: 'ucla.edu' },
  { name: 'UC Berkeley', domain: 'berkeley.edu' },
  { name: 'Carnegie Mellon University', domain: 'cmu.edu' },
  { name: 'University of Michigan', domain: 'umich.edu' },

  // Additional requested schools
  { name: 'University of Southern California', domain: 'usc.edu' },
  { name: 'Temple University', domain: 'temple.edu' },
  { name: 'Rutgers University', domain: 'rutgers.edu' },

  // Additional top universities
  { name: 'Columbia University', domain: 'columbia.edu' },
  { name: 'University of Chicago', domain: 'uchicago.edu' },
  { name: 'Washington University in St. Louis', domain: 'wustl.edu' },
  { name: 'Georgetown University', domain: 'georgetown.edu' },
  { name: 'UC San Diego', domain: 'ucsd.edu' },
  { name: 'University of Virginia', domain: 'virginia.edu' },
  { name: 'Emory University', domain: 'emory.edu' }
];

async function populateSchools() {
  try {
    console.log('🏫 Populating schools in database...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Clear existing schools
    await School.deleteMany({});
    console.log('✓ Cleared existing schools\n');

    // Insert all schools
    const createdSchools = await School.insertMany(schools);
    console.log(`✓ Added ${createdSchools.length} schools:\n`);

    createdSchools.forEach(school => {
      console.log(`  • ${school.name} (${school.domain})`);
    });

    console.log('\n✅ Schools populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating schools:', error);
    process.exit(1);
  }
}

populateSchools();

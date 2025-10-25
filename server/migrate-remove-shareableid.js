import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

async function removeShareableIdIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('\nCurrent indexes:', indexes.map(i => i.name).join(', '));

    // Drop shareableId index if it exists
    try {
      await usersCollection.dropIndex('shareableId_1');
      console.log('✓ Dropped shareableId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ shareableId_1 index does not exist (already removed)');
      } else {
        throw err;
      }
    }

    // Update all users to remove shareableId field
    const result = await usersCollection.updateMany(
      { shareableId: { $exists: true } },
      { $unset: { shareableId: "" } }
    );
    console.log(`✓ Removed shareableId field from ${result.modifiedCount} users`);

    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  }
}

removeShareableIdIndex();

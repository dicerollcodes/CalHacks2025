import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MatchCache from './src/models/MatchCache.js';

dotenv.config();

async function clearMatchCache() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const result = await MatchCache.deleteMany({});
    console.log(`✓ Cleared ${result.deletedCount} cached matches`);

    console.log('\n✓ All matches will be recalculated with improved algorithm!');
  } catch (error) {
    console.error('Failed to clear cache:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    process.exit(0);
  }
}

clearMatchCache();

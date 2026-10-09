const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/kisanmithra';

async function checkDb() {
  try {
    console.log(`Trying to connect to: ${uri}`);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000 // fail fast
    });
    console.log('✅ Connection successful');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);
    collections.forEach(c => console.log(' - ' + c.name));
    
    if (collections.length > 0) {
      const usersCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`Users count: ${usersCount}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

checkDb();

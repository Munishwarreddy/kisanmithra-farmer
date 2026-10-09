const { MongoMemoryServer } = require('mongodb-memory-server');
const { execSync, spawn } = require('child_process');
const path = require('path');

(async () => {
  try {
    console.log("Starting in-memory MongoDB for local testing...");
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Merge process.env with the new MONGO_URI
    const env = Object.assign({}, process.env, { MONGO_URI: uri });
    
    console.log("MongoDB In-Memory Server is running at:", uri);
    
    console.log("Running seed script to populate data...");
    execSync('node seedDataEnhanced.js', { env: env, stdio: 'inherit', cwd: __dirname });
    
    console.log("Starting backend server...");
    const serverProcess = spawn('npx', ['nodemon', 'server.js'], { env: env, stdio: 'inherit', shell: true, cwd: __dirname });
    
    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      mongoServer.stop();
      process.exit(code);
    });

    // Handle termination to clean up DB
    process.on('SIGINT', async () => {
      console.log('Stopping in-memory database...');
      await mongoServer.stop();
      process.exit(0);
    });
  } catch (err) {
    console.error("Error starting memory server stack:", err);
    process.exit(1);
  }
})();

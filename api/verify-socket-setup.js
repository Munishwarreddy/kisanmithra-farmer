/**
 * Socket.io Setup Verification
 * 
 * This script verifies that Socket.io is properly set up without requiring MongoDB.
 * It checks:
 * 1. Socket.io dependencies are installed
 * 2. Socket service file exists and is valid
 * 3. Server.js is properly configured
 * 4. Message controller is enhanced with Socket.io
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Socket.io Setup');
console.log('='.repeat(60));

let allChecks = true;

// Check 1: Socket.io dependencies
console.log('\n1️⃣  Checking Socket.io dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  if (packageJson.dependencies['socket.io']) {
    console.log('   ✅ socket.io installed:', packageJson.dependencies['socket.io']);
  } else {
    console.log('   ❌ socket.io not found in dependencies');
    allChecks = false;
  }
  
  if (packageJson.devDependencies['socket.io-client']) {
    console.log('   ✅ socket.io-client installed:', packageJson.devDependencies['socket.io-client']);
  } else {
    console.log('   ❌ socket.io-client not found in devDependencies');
    allChecks = false;
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
  allChecks = false;
}

// Check 2: Socket service file
console.log('\n2️⃣  Checking Socket service file...');
try {
  const socketServicePath = path.join(__dirname, 'services', 'socketService.js');
  
  if (fs.existsSync(socketServicePath)) {
    console.log('   ✅ socketService.js exists');
    
    const content = fs.readFileSync(socketServicePath, 'utf8');
    
    // Check for key functions
    const requiredFunctions = [
      'initializeSocketIO',
      'setSocketIO',
      'getSocketIO',
      'isUserOnline',
      'emitToUser',
      'emitToConversation'
    ];
    
    requiredFunctions.forEach(func => {
      if (content.includes(func)) {
        console.log(`   ✅ Function ${func} found`);
      } else {
        console.log(`   ❌ Function ${func} not found`);
        allChecks = false;
      }
    });
    
    // Check for key event handlers
    const requiredEvents = [
      'message:send',
      'message:read',
      'conversation:read',
      'typing:start',
      'typing:stop'
    ];
    
    requiredEvents.forEach(event => {
      if (content.includes(`'${event}'`) || content.includes(`"${event}"`)) {
        console.log(`   ✅ Event handler ${event} found`);
      } else {
        console.log(`   ❌ Event handler ${event} not found`);
        allChecks = false;
      }
    });
    
  } else {
    console.log('   ❌ socketService.js not found');
    allChecks = false;
  }
} catch (error) {
  console.log('   ❌ Error checking socket service:', error.message);
  allChecks = false;
}

// Check 3: Server.js configuration
console.log('\n3️⃣  Checking server.js configuration...');
try {
  const serverPath = path.join(__dirname, 'server.js');
  
  if (fs.existsSync(serverPath)) {
    console.log('   ✅ server.js exists');
    
    const content = fs.readFileSync(serverPath, 'utf8');
    
    // Check for required imports
    if (content.includes("require('http')")) {
      console.log('   ✅ http module imported');
    } else {
      console.log('   ❌ http module not imported');
      allChecks = false;
    }
    
    if (content.includes('initializeSocketIO')) {
      console.log('   ✅ initializeSocketIO imported');
    } else {
      console.log('   ❌ initializeSocketIO not imported');
      allChecks = false;
    }
    
    if (content.includes('setSocketIO')) {
      console.log('   ✅ setSocketIO imported');
    } else {
      console.log('   ❌ setSocketIO not imported');
      allChecks = false;
    }
    
    // Check for HTTP server creation
    if (content.includes('http.createServer')) {
      console.log('   ✅ HTTP server created');
    } else {
      console.log('   ❌ HTTP server not created');
      allChecks = false;
    }
    
    // Check for Socket.io initialization
    if (content.includes('initializeSocketIO(server)')) {
      console.log('   ✅ Socket.io initialized with server');
    } else {
      console.log('   ❌ Socket.io not initialized');
      allChecks = false;
    }
    
    // Check for server.listen instead of app.listen
    if (content.includes('server.listen')) {
      console.log('   ✅ server.listen used (correct)');
    } else if (content.includes('app.listen')) {
      console.log('   ⚠️  app.listen found - should be server.listen');
      allChecks = false;
    }
    
  } else {
    console.log('   ❌ server.js not found');
    allChecks = false;
  }
} catch (error) {
  console.log('   ❌ Error checking server.js:', error.message);
  allChecks = false;
}

// Check 4: Message controller enhancement
console.log('\n4️⃣  Checking message controller enhancements...');
try {
  const controllerPath = path.join(__dirname, 'controllers', 'messageController.js');
  
  if (fs.existsSync(controllerPath)) {
    console.log('   ✅ messageController.js exists');
    
    const content = fs.readFileSync(controllerPath, 'utf8');
    
    // Check for Socket.io imports
    if (content.includes('socketService')) {
      console.log('   ✅ socketService imported');
    } else {
      console.log('   ❌ socketService not imported');
      allChecks = false;
    }
    
    // Check for Socket.io functions
    if (content.includes('emitToUser') || content.includes('isUserOnline')) {
      console.log('   ✅ Socket.io utility functions used');
    } else {
      console.log('   ❌ Socket.io utility functions not used');
      allChecks = false;
    }
    
  } else {
    console.log('   ❌ messageController.js not found');
    allChecks = false;
  }
} catch (error) {
  console.log('   ❌ Error checking message controller:', error.message);
  allChecks = false;
}

// Check 5: Test file
console.log('\n5️⃣  Checking test file...');
try {
  const testPath = path.join(__dirname, 'test-socket.js');
  
  if (fs.existsSync(testPath)) {
    console.log('   ✅ test-socket.js exists');
    
    const content = fs.readFileSync(testPath, 'utf8');
    
    // Check for test functions
    const testFunctions = [
      'testAuthentication',
      'testMessageBroadcasting',
      'testReadReceipts',
      'testTypingIndicators',
      'testBulkReadReceipts'
    ];
    
    testFunctions.forEach(func => {
      if (content.includes(func)) {
        console.log(`   ✅ Test function ${func} found`);
      } else {
        console.log(`   ❌ Test function ${func} not found`);
        allChecks = false;
      }
    });
    
  } else {
    console.log('   ❌ test-socket.js not found');
    allChecks = false;
  }
} catch (error) {
  console.log('   ❌ Error checking test file:', error.message);
  allChecks = false;
}

// Check 6: Documentation
console.log('\n6️⃣  Checking documentation...');
try {
  const docPath = path.join(__dirname, 'docs', 'TASK_5.2_SOCKET_IO.md');
  const summaryPath = path.join(__dirname, 'docs', 'TASK_5.2_SUMMARY.md');
  
  if (fs.existsSync(docPath)) {
    console.log('   ✅ TASK_5.2_SOCKET_IO.md exists');
  } else {
    console.log('   ❌ TASK_5.2_SOCKET_IO.md not found');
    allChecks = false;
  }
  
  if (fs.existsSync(summaryPath)) {
    console.log('   ✅ TASK_5.2_SUMMARY.md exists');
  } else {
    console.log('   ❌ TASK_5.2_SUMMARY.md not found');
    allChecks = false;
  }
} catch (error) {
  console.log('   ❌ Error checking documentation:', error.message);
  allChecks = false;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

if (allChecks) {
  console.log('✅ All checks passed!');
  console.log('\n✨ Socket.io is properly set up and ready to use.');
  console.log('\n📝 Next steps:');
  console.log('   1. Ensure MongoDB is running');
  console.log('   2. Start the server: npm run dev');
  console.log('   3. Run tests: node test-socket.js');
  console.log('   4. Integrate with frontend React application');
  process.exit(0);
} else {
  console.log('❌ Some checks failed!');
  console.log('\n⚠️  Please review the errors above and fix them.');
  process.exit(1);
}

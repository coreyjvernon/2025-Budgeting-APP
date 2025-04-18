const { spawn } = require('child_process');
const path = require('path');

// Define the single Sauce Labs test suite to run
const testSuites = [
  { name: 'SauceLabs Income Flow', path: './test/specs/*.js' }
];

// Run tests in parallel
async function runTests() {
  console.log('Starting test execution on Sauce Labs...');
  
  const processes = testSuites.map(suite => {
    console.log(`Running ${suite.name} from ${suite.path}`);
    
    return new Promise((resolve, reject) => {
      const process = spawn('npx', ['mocha', suite.path, '--timeout', '60000'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          SAUCE_BUILD_ID: `Budget-App-${new Date().toISOString()}`
        }
      });
      
      process.on('close', code => {
        if (code === 0) {
          console.log(`${suite.name} completed successfully!`);
          resolve();
        } else {
          console.error(`${suite.name} failed with exit code ${code}`);
          reject(new Error(`Test suite failed with exit code ${code}`));
        }
      });
    });
  });
  
  try {
    await Promise.all(processes);
    console.log('All test suites completed successfully!');
  } catch (error) {
    console.error('One or more test suites failed:', error.message);
    process.exit(1);
  }
}

runTests();
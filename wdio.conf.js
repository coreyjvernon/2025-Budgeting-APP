require('dotenv').config();

exports.config = {
  // Sauce Labs credentials
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  
  // Sauce Labs region
  region: 'us',
  
  // WebdriverIO configurations
  runner: 'local',
  specs: [
    './test/specs/**/*.js'
  ],
  
  // Maximum number of parallel instances
  maxInstances: 1,
  
  // Browser capabilities
  capabilities: [{
    // Web tests - Chrome browser
    browserName: 'firefox',
    platformName: 'Windows 10',
    browserVersion: 'latest',
    'sauce:options': {
      build: 'Budget App Build ' + new Date().toISOString(),
      screenResolution: '1920x1080'
    }
  }],
  
  // Test framework
  framework: 'mocha',
  reporters: ['spec', 'json'],
  
  // Mocha options
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
  
  // Sauce Labs service
  services: ['sauce'],
  
  // Hooks
  beforeSession: function (config, capabilities, specs) {
    if (process.env.CI) {
      capabilities['sauce:options'].tunnelIdentifier = process.env.SAUCE_TUNNEL_ID;
    }
  }
};
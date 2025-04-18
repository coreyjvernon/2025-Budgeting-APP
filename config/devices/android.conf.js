module.exports = {
    browserName: 'chrome',
    platformName: 'Android',
    'appium:deviceName': 'Samsung Galaxy S20',
    'appium:platformVersion': '11.0',
    'sauce:options': {
      build: process.env.BUILD_TAG || `Budget-App-Android-${new Date().toISOString()}`,
      tunnelIdentifier: process.env.TUNNEL_IDENTIFIER || 'budget-app-tunnel'
    }
  };
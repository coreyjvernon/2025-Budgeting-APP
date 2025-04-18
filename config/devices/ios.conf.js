module.exports = {
    browserName: 'safari',
    platformName: 'iOS',
    'appium:deviceName': 'iPhone 13',
    'appium:platformVersion': '15.0',
    'sauce:options': {
      build: process.env.BUILD_TAG || `Budget-App-iOS-${new Date().toISOString()}`,
      tunnelIdentifier: process.env.TUNNEL_IDENTIFIER || 'budget-app-tunnel'
    }
  };
module.exports = {
    browserName: 'chrome',
    platformName: 'Windows 10',
    browserVersion: 'latest',
    'sauce:options': {
      build: process.env.BUILD_TAG || `Budget-App-Chrome-${new Date().toISOString()}`,
      screenResolution: '1920x1080',
      tunnelIdentifier: process.env.TUNNEL_IDENTIFIER || 'budget-app-tunnel'
    }
  };
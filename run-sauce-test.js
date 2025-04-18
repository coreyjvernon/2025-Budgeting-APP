const { Builder } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load configurations
const chromeConfig = require('./config/browsers/chrome.conf');

async function runTest() {
  if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.error('Sauce Labs credentials missing! Please set SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables.');
    process.exit(1);
  }
  
  console.log('Starting test on Sauce Labs...');
  console.log(`Using Sauce username: ${process.env.SAUCE_USERNAME}`);
  
  let driver;
  
  try {
    // Configure the test name
    chromeConfig['sauce:options'].name = 'Budget App Income Test';
    
    // Initialize the Sauce Labs driver
    driver = await new Builder()
      .usingServer(`https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@ondemand.us-west-1.saucelabs.com/wd/hub`)
      .withCapabilities(chromeConfig)
      .build();
    
    // Run a simple test
    await driver.get('http://localhost:3000');
    const title = await driver.getTitle();
    console.log(`Page title: ${title}`);
    
    // Set test status to passed
    await driver.executeScript('sauce:job-result=passed');
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    
    if (driver) {
      // Set test status to failed
      await driver.executeScript('sauce:job-result=failed');
    }
    
    process.exit(1);
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

runTest();
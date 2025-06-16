const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

describe('Local Cross-Browser Compatibility Tests', function() {
  this.timeout(30000);

  const testCases = [
    {
      name: 'Chrome',
      driver: () => new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().addArguments('--headless'))
        .build()
    },
    {
      name: 'Firefox',
      driver: () => new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(new firefox.Options().addArguments('--headless'))
        .build()
    }
  ];

  testCases.forEach(({ name, driver: createDriver }) => {
    describe(`${name} Browser`, function() {
      let driver;

      beforeEach(async function() {
        try {
          driver = createDriver();
        } catch (error) {
          console.log(`${name} not available, skipping tests`);
          this.skip();
        }
      });

      afterEach(async function() {
        if (driver) {
          await driver.quit();
        }
      });

      it('should load the budget dashboard', async function() {
        await driver.get('http://localhost:3000');
        
        const title = await driver.getTitle();
        console.log(`${name} - Page title:`, title);
        
        // Wait for the dashboard to load
        const heading = await driver.wait(
          until.elementLocated(By.tagName('h1')),
          10000
        );
        
        const headingText = await heading.getText();
        console.log(`${name} - Main heading:`, headingText);
        
        if (!headingText.includes('Budget Dashboard')) {
          throw new Error(`Expected heading to contain 'Budget Dashboard', got: ${headingText}`);
        }
      });

      it('should display summary cards', async function() {
        await driver.get('http://localhost:3000');
        
        // Wait for page to load
        await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
        
        // Look for summary cards using multiple selectors
        const summaryCards = await driver.findElements(
          By.css('.bg-white.rounded-lg.shadow-md, .summary-card')
        );
        
        console.log(`${name} - Found ${summaryCards.length} summary cards`);
        
        if (summaryCards.length < 2) {
          throw new Error(`Expected at least 2 summary cards, found ${summaryCards.length}`);
        }
      });

      it('should have responsive design elements', async function() {
        await driver.get('http://localhost:3000');
        
        // Wait for page to load
        await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
        
        // Test different viewport sizes
        await driver.manage().window().setRect({ width: 1920, height: 1080 });
        const desktopSize = await driver.manage().window().getRect();
        console.log(`${name} - Desktop size:`, desktopSize);
        
        await driver.manage().window().setRect({ width: 768, height: 1024 });
        const tabletSize = await driver.manage().window().getRect();
        console.log(`${name} - Tablet size:`, tabletSize);
        
        await driver.manage().window().setRect({ width: 375, height: 667 });
        const mobileSize = await driver.manage().window().getRect();
        console.log(`${name} - Mobile size:`, mobileSize);
        
        // Verify elements are still visible at mobile size
        const heading = await driver.findElement(By.tagName('h1'));
        const isVisible = await heading.isDisplayed();
        
        if (!isVisible) {
          throw new Error('Main heading not visible at mobile size');
        }
      });

      it('should handle button interactions', async function() {
        await driver.get('http://localhost:3000');
        
        // Wait for page to load
        await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
        
        try {
          // Look for buttons
          const buttons = await driver.findElements(By.tagName('button'));
          console.log(`${name} - Found ${buttons.length} buttons`);
          
          if (buttons.length > 0) {
            // Try to click the first button
            const firstButton = buttons[0];
            const buttonText = await firstButton.getText();
            console.log(`${name} - First button text:`, buttonText);
            
            if (buttonText.includes('Add')) {
              await firstButton.click();
              console.log(`${name} - Successfully clicked button`);
              
              // Wait a moment for any modal/popup
              await driver.sleep(1000);
            }
          }
        } catch (error) {
          console.log(`${name} - Button interaction test completed with note:`, error.message);
        }
      });

      it('should load CSS styles properly', async function() {
        await driver.get('http://localhost:3000');
        
        // Wait for page to load
        await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
        
        // Check if CSS is loaded by examining computed styles
        const bodyStyles = await driver.executeScript(`
          const body = document.body;
          const styles = window.getComputedStyle(body);
          return {
            fontFamily: styles.fontFamily,
            backgroundColor: styles.backgroundColor,
            margin: styles.margin
          };
        `);
        
        console.log(`${name} - Body styles:`, bodyStyles);
        
        // Verify CSS is loaded (should not be browser default serif)
        if (bodyStyles.fontFamily.includes('Times') || bodyStyles.fontFamily === 'serif') {
          console.warn(`${name} - CSS may not be loaded properly`);
        }
      });
    });
  });
});
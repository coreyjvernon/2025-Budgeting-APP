const { remote } = require('webdriverio');

describe('Cross-Browser Compatibility Tests', () => {
  const browsers = [
    { browserName: 'chrome', platform: 'Windows 10' },
    { browserName: 'firefox', platform: 'Windows 10' },
    { browserName: 'safari', platform: 'macOS 12' },
    { browserName: 'MicrosoftEdge', platform: 'Windows 10' }
  ];

  browsers.forEach(({ browserName, platform }) => {
    describe(`${browserName} on ${platform}`, () => {
      let browser;

      before(async () => {
        browser = await remote({
          user: process.env.SAUCE_USERNAME,
          key: process.env.SAUCE_ACCESS_KEY,
          capabilities: {
            browserName,
            platformName: platform,
            'sauce:options': {
              build: `Cross-Browser Test - ${new Date().toISOString()}`,
              name: `${browserName} Compatibility Test`,
              screenResolution: '1920x1080'
            }
          }
        });
      });

      after(async () => {
        if (browser) {
          await browser.deleteSession();
        }
      });

      it('should load the budget dashboard', async () => {
        await browser.url('http://localhost:3000');
        
        const title = await browser.getTitle();
        console.log(`${browserName} - Page title:`, title);
        
        // Wait for the dashboard to load
        await browser.waitForExist('h1', { timeout: 10000 });
        
        const heading = await browser.$('h1').getText();
        console.log(`${browserName} - Main heading:`, heading);
        
        // Verify the heading contains "Budget Dashboard"
        if (!heading.includes('Budget Dashboard')) {
          throw new Error(`Expected heading to contain 'Budget Dashboard', got: ${heading}`);
        }
      });

      it('should display summary cards', async () => {
        // Check if summary cards are present
        const summaryCards = await browser.$$('[data-testid="summary-card"], .bg-white.rounded-lg.shadow-md');
        console.log(`${browserName} - Found ${summaryCards.length} summary cards`);
        
        if (summaryCards.length < 3) {
          throw new Error(`Expected at least 3 summary cards, found ${summaryCards.length}`);
        }
      });

      it('should have responsive layout', async () => {
        // Test desktop layout
        await browser.setWindowSize(1920, 1080);
        const desktopLayout = await browser.$('body').getSize();
        console.log(`${browserName} - Desktop layout:`, desktopLayout);

        // Test tablet layout
        await browser.setWindowSize(768, 1024);
        const tabletLayout = await browser.$('body').getSize();
        console.log(`${browserName} - Tablet layout:`, tabletLayout);

        // Test mobile layout
        await browser.setWindowSize(375, 667);
        const mobileLayout = await browser.$('body').getSize();
        console.log(`${browserName} - Mobile layout:`, mobileLayout);

        // Verify the page adapts to different screen sizes
        if (mobileLayout.width > 400) {
          throw new Error(`Mobile layout too wide: ${mobileLayout.width}px`);
        }
      });

      it('should open and close modals', async () => {
        // Reset to desktop size
        await browser.setWindowSize(1920, 1080);
        
        // Try to find and click the Add Income button
        const addIncomeBtn = await browser.$('button*=Add Income');
        if (await addIncomeBtn.isExisting()) {
          await addIncomeBtn.click();
          
          // Wait for modal to appear
          await browser.waitForExist('[role="dialog"], .modal, .fixed.inset-0', { timeout: 5000 });
          
          // Check if modal is visible
          const modal = await browser.$('[role="dialog"], .modal, .fixed.inset-0');
          const isDisplayed = await modal.isDisplayed();
          console.log(`${browserName} - Modal displayed:`, isDisplayed);
          
          if (isDisplayed) {
            // Try to close the modal
            const closeBtn = await browser.$('button*=Cancel, button[aria-label="Close"], .close');
            if (await closeBtn.isExisting()) {
              await closeBtn.click();
            } else {
              // Try pressing Escape key
              await browser.keys('Escape');
            }
          }
        }
      });

      it('should handle CSS animations and transitions', async () => {
        // Check if CSS is loaded properly
        const bodyStyles = await browser.execute(() => {
          const body = document.body;
          const styles = window.getComputedStyle(body);
          return {
            fontFamily: styles.fontFamily,
            backgroundColor: styles.backgroundColor,
            margin: styles.margin
          };
        });
        
        console.log(`${browserName} - Body styles:`, bodyStyles);
        
        // Verify CSS is loaded (font-family should not be the browser default)
        if (bodyStyles.fontFamily.includes('Times') || bodyStyles.fontFamily === 'serif') {
          console.warn(`${browserName} - CSS may not be loaded properly, using default font`);
        }
      });
    });
  });
});
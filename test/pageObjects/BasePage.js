class BasePage {
    constructor(driver) {
      this.driver = driver;
    }
    
    async navigateTo(url) {
      await this.driver.get(url);
    }
    
    async waitForElement(locator, timeout = 10000) {
      const { until, By } = require('selenium-webdriver');
      
      if (typeof locator === 'string') {
        locator = By.css(locator);
      }
      
      await this.driver.wait(until.elementLocated(locator), timeout);
      return this.driver.findElement(locator);
    }
    
    async getText(locator) {
      const element = await this.waitForElement(locator);
      return element.getText();
    }
    
    async click(locator) {
      const element = await this.waitForElement(locator);
      await element.click();
    }
    
    async sendKeys(locator, text) {
      const element = await this.waitForElement(locator);
      await element.sendKeys(text);
    }
  }
  
  module.exports = BasePage;
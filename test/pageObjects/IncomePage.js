const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class IncomePage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Define selectors for income-related elements
    this.incomeNameInput = By.id('income-name');
    this.incomeAmountInput = By.id('income-amount');
    this.addIncomeButton = By.id('add-income-btn');
    this.incomeList = By.css('.income-list');
    this.incomeItems = By.css('.income-item');
  }
  
  async addIncome(name, amount) {
    await this.sendKeys(this.incomeNameInput, name);
    await this.sendKeys(this.incomeAmountInput, amount);
    await this.click(this.addIncomeButton);
  }
  
  async getIncomeList() {
    const items = await this.driver.findElements(this.incomeItems);
    const incomeData = [];
    
    for (const item of items) {
      const text = await item.getText();
      incomeData.push(text);
    }
    
    return incomeData;
  }
  
  async isIncomeAdded(name, amount) {
    const incomeList = await this.getIncomeList();
    return incomeList.some(item => 
      item.includes(name) && item.includes(amount.toString())
    );
  }
}

module.exports = IncomePage;
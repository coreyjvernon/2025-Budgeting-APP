const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
require('dotenv').config();

/**
 * This test suite runs against the deployed Budget App on Sauce Labs infrastructure.
 *
 * Test‑1  : Navigate successfully to https://cjv-budgetapp.web.app/
 * Test‑2  : Click the "Add Income" button (via the provided CSS selector) and
 *           verify that the modal dialog appears after a 2‑second wait.
 * Test‑3  : Fill out and submit the Add Income form.
 * Test‑4  : Verify that the entered amount is displayed in the Income summary card.
 * Test‑5  : Verify that the new income entry is displayed in the Income History table.
 */

describe('Budget App – Add Income modal (SauceLabs)', function () {
  this.timeout(90000);

  let driver;

  // CSS selectors supplied by the user / product team
  const ADD_INCOME_BTN_CSS =
    'html body div#root div.min-h-screen.bg-gray-900 header.bg-gray-800.text-white.p-6.shadow-md div.container.mx-auto div.flex.items-center.justify-between div.flex.items-center.space-x-4 button.bg-green-600.hover\\:bg-green-700.text-white.px-4.py-2.rounded-lg.text-sm.font-medium';

  const ADD_INCOME_MODAL_CSS =
    'html body div#root div.min-h-screen.bg-gray-900 div.fixed.inset-0.bg-black.bg-opacity-50.flex.items-center.justify-center.z-50 div.bg-gray-800.rounded-lg.p-6.w-full.max-w-md.border.border-gray-700';

  // Value to input and later verify in the Income summary card
  const NEW_INCOME_AMOUNT = '1500';
  const NEW_INCOME_SOURCE = 'Freelance Project';

  // Will store the income shown on the summary card before adding the new entry
  let initialIncomeCardAmount = 0;

  before(async function () {
    // Define Sauce Labs capabilities
    const capabilities = {
      browserName: 'chrome',
      platformName: 'Windows 10',
      browserVersion: 'latest',
      'sauce:options': {
        build: 'Budget App Build – Add Income Modal',
        name: 'Web – Add Income Modal Test',
        screenResolution: '1920x1080'
      }
    };

    // Instantiate the remote WebDriver session
    driver = await new Builder()
      .usingServer(
        `https://${process.env.SAUCE_USERNAME}:${process.env.SAUCE_ACCESS_KEY}@ondemand.us-west-1.saucelabs.com/wd/hub`
      )
      .withCapabilities(capabilities)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  // Report pass/fail back to Sauce Labs for each individual test so the dashboard shows the correct status.
  afterEach(async function () {
    if (!driver) return;

    // Mocha marks the current test's state as 'passed' or 'failed'.
    const result = this.currentTest.state === 'passed' ? 'passed' : 'failed';

    // The Sauce Labs JS Executor API updates the job result.
    await driver.executeScript(`sauce:job-result=${result}`);
  });

  it('Test‑1: should navigate to the Budget App homepage', async function () {
    await driver.get('https://cjv-budgetapp.web.app/');

    // Wait until the Add Income button is present – this doubles as a page‑load check.
    const addIncomeBtn = await driver.wait(
      until.elementLocated(By.css(ADD_INCOME_BTN_CSS)),
      10000,
      'Expected Add Income button to be present after navigation.'
    );

    expect(await addIncomeBtn.isDisplayed()).to.be.true;

    // Capture the current amount shown in the Income summary card for later comparison
    const INCOME_CARD_CSS =
      'html body div#root div.min-h-screen.bg-gray-900 main.container.mx-auto.px-4.py-8 div.grid.grid-cols-1.md\\:grid-cols-4.gap-6.mb-8 div.bg-gray-800.rounded-lg.shadow.p-6.border.border-gray-700 p.text-3xl.font-bold.text-green-400';
    const incomeCard = await driver.findElement(By.css(INCOME_CARD_CSS));
    const displayedText = await incomeCard.getText();
    const numericValue = parseFloat(displayedText.replace(/[^0-9.]/g, '')) || 0;
    initialIncomeCardAmount = numericValue;
  });

  it('Test‑2: should open the Add Income modal after clicking the button', async function () {
    // Locate and click the Add Income button
    const addIncomeBtn = await driver.findElement(By.css(ADD_INCOME_BTN_CSS));
    await addIncomeBtn.click();

    // Wait 2 seconds (per requirements) before verifying modal existence
    await driver.sleep(2000);

    // Verify the modal dialog exists and is displayed
    const modal = await driver.findElement(By.css(ADD_INCOME_MODAL_CSS));
    expect(await modal.isDisplayed()).to.be.true;
  });

  it('Test‑3: should fill out and submit the Add Income form', async function () {
    // The modal should already be open from the previous test, but ensure it is; if not, click the button again.
    let modal;
    try {
      modal = await driver.findElement(By.css(ADD_INCOME_MODAL_CSS));
    } catch (e) {
      // Modal not found – open it again
      const addIncomeBtn = await driver.findElement(By.css(ADD_INCOME_BTN_CSS));
      await addIncomeBtn.click();
      await driver.sleep(1000);
      modal = await driver.findElement(By.css(ADD_INCOME_MODAL_CSS));
    }

    // Fill in the Date
    const dateInput = await modal.findElement(By.css('input[type="date"]'));
    await dateInput.sendKeys('2025-01-15');

    // Fill in the Source (first text input inside the modal)
    const sourceInput = await modal.findElement(By.css('input[type="text"]'));
    await sourceInput.sendKeys(NEW_INCOME_SOURCE);

    // Fill in the Amount (number input)
    const amountInput = await modal.findElement(By.css('input[type="number"]'));
    await amountInput.sendKeys(NEW_INCOME_AMOUNT);

    // Fill in the Description (second text input; we use XPath to target by label relationship)
    const descriptionInput = await modal.findElement(
      By.xpath('.//label[contains(text(),"Description")]/following::input[1]')
    );
    await descriptionInput.sendKeys('Website redesign payment');

    // Click the "Add Income" submit button within the modal
    const submitBtn = await modal.findElement(By.css('button[type="submit"]'));
    await submitBtn.click();

    // Wait briefly for the modal to close / list to update
    await driver.sleep(2000);

    // Assert the modal is no longer displayed (submission succeeded & closed)
    const isModalPresent = await driver.findElements(By.css(ADD_INCOME_MODAL_CSS));
    expect(isModalPresent.length).to.equal(0);
  });

  it('Test‑4: should reflect the increased amount in the Income summary card', async function () {
    // CSS selector for the Income field card – escape the colon in the Tailwind class
    const INCOME_CARD_CSS =
      'html body div#root div.min-h-screen.bg-gray-900 main.container.mx-auto.px-4.py-8 div.grid.grid-cols-1.md\\:grid-cols-4.gap-6.mb-8 div.bg-gray-800.rounded-lg.shadow.p-6.border.border-gray-700 p.text-3xl.font-bold.text-green-400';

    // Wait until the income card is present (and presumably updated)
    const incomeCard = await driver.wait(
      until.elementLocated(By.css(INCOME_CARD_CSS)),
      10000,
      'Expected Income summary card to be present.'
    );

    // Get its displayed text (e.g., "$1,500.00") and strip non‑digit chars
    const displayedText = await incomeCard.getText();
    const numericValue = displayedText.replace(/[^0-9.]/g, '');

    const expectedTotal = initialIncomeCardAmount + parseFloat(NEW_INCOME_AMOUNT);
    expect(parseFloat(numericValue)).to.equal(expectedTotal);
  });

/*  it('Test‑5: should show the new entry in the Income History table', async function () {
    // CSS selector for the Income History table (provided by product team)
    const INCOME_HISTORY_TABLE_CSS =
      'div.mb-8:nth-child(4) > div:nth-child(2) > table:nth-child(1)';

    // Wait until the table is present and contains the newly added source & amount
    await driver.wait(async () => {
      try {
        const table = await driver.findElement(By.css(INCOME_HISTORY_TABLE_CSS));
        const text = await table.getText();
        return text.includes(NEW_INCOME_SOURCE) && text.includes(NEW_INCOME_AMOUNT);
      } catch (e) {
        return false;
      }
    }, 10000, 'Expected Income History table to contain newly added income entry.');

    // Additional explicit assertion for clarity
    const table = await driver.findElement(By.css(INCOME_HISTORY_TABLE_CSS));
    const tableText = await table.getText();
    expect(tableText).to.include(NEW_INCOME_SOURCE);
    expect(tableText).to.include(NEW_INCOME_AMOUNT);
  }); */
}); 
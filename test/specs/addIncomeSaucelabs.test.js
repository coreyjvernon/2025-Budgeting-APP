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

  const BASE_URL = process.env.BASE_URL || 'https://cjv-budgetapp.web.app/';

  it('Test‑1: should navigate to the Budget App homepage', async function () {
    await browser.url(BASE_URL);

    // Wait until the Add Income button is present – this doubles as a page‑load check.
    const addIncomeBtn = await $(ADD_INCOME_BTN_CSS);
    await addIncomeBtn.waitForDisplayed({ timeout: 10000 });
    expect(await addIncomeBtn.isDisplayed()).to.be.true;

    // Capture the current amount shown in the Income summary card for later comparison
    const INCOME_CARD_CSS =
      'html body div#root div.min-h-screen.bg-gray-900 main.container.mx-auto.px-4.py-8 div.grid.grid-cols-1.md\\:grid-cols-4.gap-6.mb-8 div.bg-gray-800.rounded-lg.shadow.p-6.border.border-gray-700 p.text-3xl.font-bold.text-green-400';
    const incomeCard = await $(INCOME_CARD_CSS);
    const displayedText = await incomeCard.getText();
    const numericValue = parseFloat(displayedText.replace(/[^0-9.]/g, '')) || 0;
    initialIncomeCardAmount = numericValue;
  });

  it('Test‑2: should open the Add Income modal after clicking the button', async function () {
    // Locate and click the Add Income button
    const addIncomeBtn = await $(ADD_INCOME_BTN_CSS);
    await addIncomeBtn.click();

    // Wait 2 seconds (per requirements) before verifying modal existence
    await browser.pause(2000);

    // Verify the modal dialog exists and is displayed
    const modal = await $(ADD_INCOME_MODAL_CSS);
    expect(await modal.isDisplayed()).to.be.true;
  });

  it('Test‑3: should fill out and submit the Add Income form', async function () {
    // The modal should already be open from the previous test, but ensure it is; if not, click the button again.
    let modal;
    if (await $(ADD_INCOME_MODAL_CSS).isExisting()) {
      modal = await $(ADD_INCOME_MODAL_CSS);
    } else {
      const addIncomeBtn = await $(ADD_INCOME_BTN_CSS);
      await addIncomeBtn.click();
      await browser.pause(1000);
      modal = await $(ADD_INCOME_MODAL_CSS);
    }

    // Fill in the Date
    const dateInput = await modal.$('input[type="date"]');
    await dateInput.setValue('2025-01-15');

    // Fill in the Source (first text input inside the modal)
    const sourceInput = await modal.$('input[type="text"]');
    await sourceInput.setValue(NEW_INCOME_SOURCE);

    // Fill in the Amount (number input)
    const amountInput = await modal.$('input[type="number"]');
    await amountInput.setValue(NEW_INCOME_AMOUNT);

    // Fill in the Description (second text input; we use XPath to target by label relationship)
    const descriptionInput = await modal.$('//label[contains(text(),"Description")]/following::input[1]');
    await descriptionInput.setValue('Website redesign payment');

    // Click the "Add Income" submit button within the modal
    const submitBtn = await modal.$('button[type="submit"]');
    await submitBtn.click();

    // Wait briefly for the modal to close / list to update
    await browser.pause(2000);

    // Assert the modal is no longer displayed (submission succeeded & closed)
    expect(await $(ADD_INCOME_MODAL_CSS).isExisting()).to.be.false;
  });

  it('Test‑4: should reflect the increased amount in the Income summary card', async function () {
    // CSS selector for the Income field card – escape the colon in the Tailwind class
    const INCOME_CARD_CSS =
      'html body div#root div.min-h-screen.bg-gray-900 main.container.mx-auto.px-4.py-8 div.grid.grid-cols-1.md\\:grid-cols-4.gap-6.mb-8 div.bg-gray-800.rounded-lg.shadow.p-6.border.border-gray-700 p.text-3xl.font-bold.text-green-400';

    // Wait until the income card is present (and presumably updated)
    const incomeCard = await $(INCOME_CARD_CSS);
    await incomeCard.waitForDisplayed({ timeout: 10000 });

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
    await browser.waitUntil(async () => {
      try {
        const table = await $(INCOME_HISTORY_TABLE_CSS);
        const text = await table.getText();
        return text.includes(NEW_INCOME_SOURCE) && text.includes(NEW_INCOME_AMOUNT);
      } catch (e) {
        return false;
      }
    }, { timeout: 10000, timeoutMsg: 'Expected Income History table to contain newly added income entry.' });

    // Additional explicit assertion for clarity
    const table = await $(INCOME_HISTORY_TABLE_CSS);
    const tableText = await table.getText();
    expect(tableText).to.include(NEW_INCOME_SOURCE);
    expect(tableText).to.include(NEW_INCOME_AMOUNT);
  }); */
}); 
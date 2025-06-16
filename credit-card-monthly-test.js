// Credit Card Monthly Spending Test
// This file tests that credit card spending only shows for the current month

// Mock expense transactions data across multiple months
const expenseTransactions = [
  {
    id: '1',
    date: '2025-03-15',
    category: 'Groceries',
    description: 'Walmart shopping',
    amount: 150,
    paymentMethod: 'Capital One (Credit)',
    month: '2025-03'
  },
  {
    id: '2',
    date: '2025-03-20', 
    category: 'Gas',
    description: 'Shell gas station',
    amount: 45,
    paymentMethod: 'Capital One (Credit)',
    month: '2025-03'
  },
  {
    id: '3',
    date: '2025-04-05',
    category: 'Dining',
    description: 'Restaurant dinner',
    amount: 75,
    paymentMethod: 'Capital One (Credit)',
    month: '2025-04'
  },
  {
    id: '4',
    date: '2025-05-10',
    category: 'Shopping',
    description: 'Amazon purchase',
    amount: 200,
    paymentMethod: 'Capital One (Credit)',
    month: '2025-05'
  },
  {
    id: '5',
    date: '2025-06-12',
    category: 'Utilities',
    description: 'Electric bill',
    amount: 125,
    paymentMethod: 'Capital Five (Credit)',
    month: '2025-06'
  }
];

// Mock credit cards
const creditCards = [
  { name: "Capital One", limit: 950, spent: 0, statementDate: 17, dueDate: 11 },
  { name: "Capital Five", limit: 7500, spent: 0, statementDate: 25, dueDate: 19 },
  { name: "Quicksilver One", limit: 300, spent: 0, statementDate: 27, dueDate: 23 },
  { name: "American Express", limit: 300, spent: 0, statementDate: 25, dueDate: 22 }
];

// Test function: Calculate credit card spending for current month only
function calculateCreditCardSpending(selectedMonth, expenseTransactions, creditCards) {
  const spending = {};
  
  // Only include expenses from the current selected month
  const currentMonthExpenses = expenseTransactions.filter(expense => expense.month === selectedMonth);
  
  currentMonthExpenses.forEach(expense => {
    // Skip if paymentMethod is undefined or not a credit card
    if (!expense.paymentMethod || !expense.paymentMethod.includes('Credit')) {
      return;
    }

    // Find the matching credit card
    const card = creditCards.find(card => expense.paymentMethod.startsWith(card.name));
    if (card) {
      spending[card.name] = (spending[card.name] || 0) + expense.amount;
    }
  });

  return spending;
}

// Test Cases
console.log('=== Credit Card Monthly Spending Test Cases ===\\n');

// Test Case 1: March 2025 - should show Capital One spending of $195
console.log('Test 1: March 2025 credit card spending');
const mar2025Spending = calculateCreditCardSpending('2025-03', expenseTransactions, creditCards);
console.log('Expected: Capital One: $195, others: $0');
console.log('Actual:', mar2025Spending);
console.log('PASS:', mar2025Spending['Capital One'] === 195 && !mar2025Spending['Capital Five']);
console.log('');

// Test Case 2: April 2025 - should show Capital One spending of $75
console.log('Test 2: April 2025 credit card spending');
const apr2025Spending = calculateCreditCardSpending('2025-04', expenseTransactions, creditCards);
console.log('Expected: Capital One: $75, others: $0');
console.log('Actual:', apr2025Spending);
console.log('PASS:', apr2025Spending['Capital One'] === 75 && !apr2025Spending['Capital Five']);
console.log('');

// Test Case 3: May 2025 - should show Capital One spending of $200
console.log('Test 3: May 2025 credit card spending');
const may2025Spending = calculateCreditCardSpending('2025-05', expenseTransactions, creditCards);
console.log('Expected: Capital One: $200, others: $0');
console.log('Actual:', may2025Spending);
console.log('PASS:', may2025Spending['Capital One'] === 200 && !may2025Spending['Capital Five']);
console.log('');

// Test Case 4: June 2025 - should show Capital Five spending of $125, Capital One: $0
console.log('Test 4: June 2025 credit card spending');
const jun2025Spending = calculateCreditCardSpending('2025-06', expenseTransactions, creditCards);
console.log('Expected: Capital Five: $125, Capital One: $0');
console.log('Actual:', jun2025Spending);
console.log('PASS:', jun2025Spending['Capital Five'] === 125 && !jun2025Spending['Capital One']);
console.log('');

// Test Case 5: July 2025 (empty month) - should show no spending
console.log('Test 5: July 2025 credit card spending (empty month)');
const jul2025Spending = calculateCreditCardSpending('2025-07', expenseTransactions, creditCards);
console.log('Expected: No spending for any cards');
console.log('Actual:', jul2025Spending);
console.log('PASS:', Object.keys(jul2025Spending).length === 0);
console.log('');

// Test Case 6: Verify no cross-month contamination
console.log('Test 6: Verify no cross-month contamination');
const totalCapitalOneSpending = expenseTransactions
  .filter(expense => expense.paymentMethod === 'Capital One (Credit)')
  .reduce((sum, expense) => sum + expense.amount, 0);

const monthlyCapitalOneSum = [
  mar2025Spending['Capital One'] || 0,
  apr2025Spending['Capital One'] || 0,
  may2025Spending['Capital One'] || 0,
  jun2025Spending['Capital One'] || 0
].reduce((sum, amount) => sum + amount, 0);

console.log('Total Capital One spending across all months:', totalCapitalOneSpending);
console.log('Sum of individual monthly amounts:', monthlyCapitalOneSum);
console.log('PASS:', totalCapitalOneSpending === monthlyCapitalOneSum);
console.log('');

// Test Case 7: Payment method matching logic
console.log('Test 7: Payment method matching logic');
const testExpense = expenseTransactions[0];
console.log('Sample expense payment method:', testExpense.paymentMethod);
console.log('Matches Capital One:', testExpense.paymentMethod.startsWith('Capital One'));
console.log('Includes Credit:', testExpense.paymentMethod.includes('Credit'));
console.log('');

console.log('=== All Credit Card Monthly Tests Complete ===');
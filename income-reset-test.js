// Income Reset Logic Test
// This file tests that income properly resets monthly and shows only current month's income

// Mock income transactions data
const incomeTransactions = [
  {
    id: '1',
    date: '01/15/2025',
    source: 'Salary',
    description: 'Monthly salary',
    amount: 5000,
    month: '2025-01'
  },
  {
    id: '2', 
    date: '01/30/2025',
    source: 'Freelance',
    description: 'Project payment',
    amount: 1500,
    month: '2025-01'
  },
  {
    id: '3',
    date: '02/15/2025', 
    source: 'Salary',
    description: 'Monthly salary',
    amount: 5000,
    month: '2025-02'
  },
  {
    id: '4',
    date: '03/15/2025',
    source: 'Salary', 
    description: 'Monthly salary',
    amount: 5200,
    month: '2025-03'
  },
  {
    id: '5',
    date: '03/25/2025',
    source: 'Bonus',
    description: 'Performance bonus', 
    amount: 2000,
    month: '2025-03'
  }
];

// Test function: Simulate currentMonthIncome filtering
function getCurrentMonthIncome(selectedMonth, incomeTransactions) {
  return incomeTransactions.filter(income => income.month === selectedMonth);
}

// Test function: Calculate total income for current month
function calculateCurrentMonthIncome(selectedMonth, incomeTransactions) {
  const currentMonthIncome = getCurrentMonthIncome(selectedMonth, incomeTransactions);
  return currentMonthIncome.reduce((sum, income) => sum + income.amount, 0);
}

// Test Cases
console.log('=== Income Reset Functionality Test Cases ===\n');

// Test Case 1: January 2025 - should show 2 income items totaling $6500
console.log('Test 1: January 2025 income');
const jan2025Income = getCurrentMonthIncome('2025-01', incomeTransactions);
const jan2025Total = calculateCurrentMonthIncome('2025-01', incomeTransactions);
console.log('Expected: 2 items, total $6500');
console.log('Actual:', jan2025Income.length, 'items, total $' + jan2025Total);
console.log('PASS:', jan2025Income.length === 2 && jan2025Total === 6500);
console.log('');

// Test Case 2: February 2025 - should show 1 income item totaling $5000
console.log('Test 2: February 2025 income');
const feb2025Income = getCurrentMonthIncome('2025-02', incomeTransactions);
const feb2025Total = calculateCurrentMonthIncome('2025-02', incomeTransactions);
console.log('Expected: 1 item, total $5000');
console.log('Actual:', feb2025Income.length, 'items, total $' + feb2025Total);
console.log('PASS:', feb2025Income.length === 1 && feb2025Total === 5000);
console.log('');

// Test Case 3: March 2025 - should show 2 income items totaling $7200
console.log('Test 3: March 2025 income');
const mar2025Income = getCurrentMonthIncome('2025-03', incomeTransactions);
const mar2025Total = calculateCurrentMonthIncome('2025-03', incomeTransactions);
console.log('Expected: 2 items, total $7200');
console.log('Actual:', mar2025Income.length, 'items, total $' + mar2025Total);
console.log('PASS:', mar2025Income.length === 2 && mar2025Total === 7200);
console.log('');

// Test Case 4: April 2025 - should show 0 income items (empty month)
console.log('Test 4: April 2025 income (empty month)');
const apr2025Income = getCurrentMonthIncome('2025-04', incomeTransactions);
const apr2025Total = calculateCurrentMonthIncome('2025-04', incomeTransactions);
console.log('Expected: 0 items, total $0');
console.log('Actual:', apr2025Income.length, 'items, total $' + apr2025Total);
console.log('PASS:', apr2025Income.length === 0 && apr2025Total === 0);
console.log('');

// Test Case 5: Verify no cross-month contamination
console.log('Test 5: Verify no cross-month contamination');
const totalAllMonths = incomeTransactions.reduce((sum, income) => sum + income.amount, 0);
const jan = calculateCurrentMonthIncome('2025-01', incomeTransactions);
const feb = calculateCurrentMonthIncome('2025-02', incomeTransactions);
const mar = calculateCurrentMonthIncome('2025-03', incomeTransactions);
const sum = jan + feb + mar;
console.log('Total all income:', totalAllMonths);
console.log('Sum of monthly totals:', sum);
console.log('PASS:', totalAllMonths === sum);
console.log('');

// Test Case 6: Date format consistency check
console.log('Test 6: Date format consistency');
const sampleIncome = incomeTransactions[0];
console.log('Sample income date format:', sampleIncome.date);
console.log('Sample income month format:', sampleIncome.month);
console.log('Date is MM/DD/YYYY format:', /^\d{2}\/\d{2}\/\d{4}$/.test(sampleIncome.date));
console.log('Month is YYYY-MM format:', /^\d{4}-\d{2}$/.test(sampleIncome.month));
console.log('');

console.log('=== All Income Reset Tests Complete ===');
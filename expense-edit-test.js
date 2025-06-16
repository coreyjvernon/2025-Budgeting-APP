// Expense Edit Functionality Test
// This file tests the expense edit form population logic

// Mock expense data with different date formats
const mockExpenses = [
  {
    id: '1',
    date: '03/15/2025', // MM/DD/YYYY format
    category: 'Groceries',
    description: 'Walmart shopping',
    amount: 150,
    paymentMethod: 'Capital One (Credit)'
  },
  {
    id: '2',
    date: '2025-04-20', // YYYY-MM-DD format
    category: 'Gas',
    description: 'Shell gas station',
    amount: 45,
    paymentMethod: 'Cash'
  }
];

// Test function: Simulate expense edit form population
function populateExpenseForm(expense) {
  // Handle both MM/DD/YYYY and YYYY-MM-DD date formats
  let formattedDate = expense.date;
  if (expense.date.includes('/')) {
    const [month, day, year] = expense.date.split('/');
    formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return {
    date: formattedDate,
    category: expense.category,
    description: expense.description,
    amount: expense.amount.toString(),
    paymentMethod: expense.paymentMethod
  };
}

// Test Cases
console.log('=== Expense Edit Form Population Test Cases ===\\n');

// Test Case 1: MM/DD/YYYY date format
console.log('Test 1: MM/DD/YYYY date format');
const expense1 = mockExpenses[0];
const form1 = populateExpenseForm(expense1);
console.log('Original expense:', expense1);
console.log('Populated form:', form1);
console.log('Expected date format: 2025-03-15');
console.log('Actual date format:', form1.date);
console.log('PASS:', form1.date === '2025-03-15');
console.log('');

// Test Case 2: YYYY-MM-DD date format
console.log('Test 2: YYYY-MM-DD date format');
const expense2 = mockExpenses[1];
const form2 = populateExpenseForm(expense2);
console.log('Original expense:', expense2);
console.log('Populated form:', form2);
console.log('Expected date format: 2025-04-20');
console.log('Actual date format:', form2.date);
console.log('PASS:', form2.date === '2025-04-20');
console.log('');

// Test Case 3: Verify all form fields are populated correctly
console.log('Test 3: Complete form field population');
const form3 = populateExpenseForm(expense1);
console.log('All fields populated correctly:');
console.log('- Date:', form3.date === '2025-03-15');
console.log('- Category:', form3.category === 'Groceries');
console.log('- Description:', form3.description === 'Walmart shopping');
console.log('- Amount:', form3.amount === '150');
console.log('- Payment Method:', form3.paymentMethod === 'Capital One (Credit)');
const allFieldsCorrect = form3.date === '2025-03-15' && 
                        form3.category === 'Groceries' &&
                        form3.description === 'Walmart shopping' &&
                        form3.amount === '150' &&
                        form3.paymentMethod === 'Capital One (Credit)';
console.log('PASS:', allFieldsCorrect);
console.log('');

// Test Case 4: Edge case - single digit month/day
console.log('Test 4: Single digit month/day formatting');
const edgeCaseExpense = {
  id: '3',
  date: '1/5/2025', // Single digit month and day
  category: 'Test',
  description: 'Test expense',
  amount: 100,
  paymentMethod: 'Cash'
};
const formEdge = populateExpenseForm(edgeCaseExpense);
console.log('Original date: 1/5/2025');
console.log('Formatted date:', formEdge.date);
console.log('Expected: 2025-01-05');
console.log('PASS:', formEdge.date === '2025-01-05');
console.log('');

console.log('=== All Expense Edit Tests Complete ===');
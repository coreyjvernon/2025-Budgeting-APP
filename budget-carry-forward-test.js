// Budget Carry-Forward Logic Test
// This file tests the budget carry-forward functionality logic

// Mock data structure
const monthlyBudgets = [
  {
    month: '2024-12',
    totalBudget: 9000.00,
    categoryBudgets: {
      'Rent': 2500,
      'Groceries': 800,
      'Utilities': 200
    }
  },
  {
    month: '2025-01',
    totalBudget: 9200.00,
    categoryBudgets: {
      'Rent': 2600,
      'Groceries': 850,
      'Utilities': 200
    }
  }
];

// Test function: Simulate currentMonthBudget logic
function getCurrentMonthBudget(selectedMonth, monthlyBudgets) {
  // First, check if there's a budget specifically for this month
  const exactBudget = monthlyBudgets.find(budget => budget.month === selectedMonth);
  if (exactBudget) {
    return exactBudget;
  }

  // If no exact budget, find the most recent budget before this month
  const sortedBudgets = monthlyBudgets
    .filter(budget => budget.month <= selectedMonth)
    .sort((a, b) => b.month.localeCompare(a.month)); // Sort descending (most recent first)
  
  if (sortedBudgets.length > 0) {
    // Carry forward the most recent budget to the current month
    return {
      month: selectedMonth,
      totalBudget: sortedBudgets[0].totalBudget,
      categoryBudgets: { ...sortedBudgets[0].categoryBudgets }
    };
  }

  // Default budget if no previous budgets exist
  return {
    month: selectedMonth,
    totalBudget: 9401.00,
    categoryBudgets: {
      'Rent': 2500,
      'Storage': 300,
      'Utilities': 200
    }
  };
}

// Test Cases
console.log('=== Budget Carry-Forward Test Cases ===\n');

// Test Case 1: Exact month exists
console.log('Test 1: Exact month exists (2025-01)');
const result1 = getCurrentMonthBudget('2025-01', monthlyBudgets);
console.log('Expected: Budget for 2025-01 with Rent: 2600');
console.log('Actual:', result1);
console.log('PASS:', result1.month === '2025-01' && result1.categoryBudgets.Rent === 2600);
console.log('');

// Test Case 2: Future month (should carry forward from most recent)
console.log('Test 2: Future month (2025-03) - should carry forward from 2025-01');
const result2 = getCurrentMonthBudget('2025-03', monthlyBudgets);
console.log('Expected: Budget for 2025-03 with carried forward values from 2025-01');
console.log('Actual:', result2);
console.log('PASS:', result2.month === '2025-03' && result2.categoryBudgets.Rent === 2600);
console.log('');

// Test Case 3: Month between existing budgets
console.log('Test 3: Month between existing budgets (2024-12-15) - should carry from 2024-12');
const result3 = getCurrentMonthBudget('2024-12-15', monthlyBudgets);
console.log('Expected: Budget carried forward from 2024-12');
console.log('Actual:', result3);
console.log('PASS:', result3.categoryBudgets.Rent === 2500);
console.log('');

// Test Case 4: Very early month (should use default)
console.log('Test 4: Very early month (2024-01) - should use default budget');
const result4 = getCurrentMonthBudget('2024-01', monthlyBudgets);
console.log('Expected: Default budget with Rent: 2500');
console.log('Actual:', result4);
console.log('PASS:', result4.categoryBudgets.Rent === 2500 && result4.totalBudget === 9401.00);
console.log('');

// Test Case 5: Month comparison edge case
console.log('Test 5: String comparison edge case');
console.log('2025-01 <= 2025-03:', '2025-01' <= '2025-03');
console.log('2025-01 <= 2025-01:', '2025-01' <= '2025-01');
console.log('2025-03 <= 2025-01:', '2025-03' <= '2025-01');
console.log('');

console.log('=== All Tests Complete ===');
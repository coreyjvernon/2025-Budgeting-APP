import React, { useState } from 'react';

interface CreditCard {
  name: string;
  limit: number;
  spent: number;
  statementDate: number;
  dueDate: number;
}

interface Transaction {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
}

interface IncomeTransaction {
  id: number;
  date: string;
  source: string;
  description: string;
  amount: number;
}

interface Alert {
  id: number;
  type: 'danger' | 'warning';
  category: string;
  message: string;
}

interface BudgetSummary {
  income: number;
  regularBudget: number;
  regularSpent: number;
  spendingPercentage: number;
}

const BudgetDashboard: React.FC = () => {
  // State for modals
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showIncomeModal, setShowIncomeModal] = useState<boolean>(false);
  
  // Budget summary data based on accurate spreadsheet analysis
  const budgetSummary: BudgetSummary = {
    income: 4084.16,
    regularBudget: 9401.00,
    regularSpent: 4297.05,
    spendingPercentage: 45.7
  };
  
  // Calculate remaining budget
  const regularRemaining = budgetSummary.regularBudget - budgetSummary.regularSpent;
  
  // Credit card information with accurate spending
  const creditCards: CreditCard[] = [
    { name: "Capital One", limit: 950, spent: 700.15, statementDate: 17, dueDate: 11 },
    { name: "Capital Five", limit: 7500, spent: 2511.30, statementDate: 25, dueDate: 19 },
    { name: "Quicksilver One", limit: 300, spent: 122.01, statementDate: 27, dueDate: 23 },
    { name: "American Express", limit: 300, spent: 0, statementDate: 25, dueDate: 22 }
  ];

  // Expense transactions with correct date format and reorganized payment methods
  const expenseTransactions: Transaction[] = [
    { id: 1, date: "03/01/2025", category: "Rent", amount: 2232.53, description: "Rent", paymentMethod: "Capital Five (Credit)" },
    { id: 2, date: "03/01/2025", category: "Wellness", amount: 79.48, description: "Rappi - pharmacy", paymentMethod: "Capital One (Credit)" },
    { id: 3, date: "03/01/2025", category: "Groceries", amount: 6.61, description: "Food Lion", paymentMethod: "Capital One (Credit)" },
    { id: 4, date: "03/02/2025", category: "Storage", amount: 278.77, description: "StorQuest", paymentMethod: "Capital Five (Credit)" },
    { id: 5, date: "03/02/2025", category: "Groceries", amount: 79.48, description: "Rappi", paymentMethod: "Capital One (Credit)" },
    { id: 6, date: "03/03/2025", category: "Rent", amount: 14.00, description: "iPostal1", paymentMethod: "Quicksilver One (Credit)" },
    { id: 7, date: "03/03/2025", category: "Subscriptions", amount: 12.99, description: "Proton", paymentMethod: "Quicksilver One (Credit)" },
    { id: 8, date: "03/03/2025", category: "Business", amount: 50.00, description: "Harvard Business", paymentMethod: "Quicksilver One (Credit)" },
    { id: 9, date: "03/03/2025", category: "Transportation", amount: 10.30, description: "Uber", paymentMethod: "Capital One (Credit)" },
    { id: 10, date: "03/04/2025", category: "Subscriptions", amount: 20.00, description: "Claude AI", paymentMethod: "Quicksilver One (Credit)" },
    { id: 11, date: "03/04/2025", category: "Eating Out", amount: 61.24, description: "Rappi", paymentMethod: "Capital One (Credit)" },
    { id: 12, date: "03/05/2025", category: "Transportation", amount: 27.22, description: "Uber", paymentMethod: "Capital One (Credit)" },
    { id: 13, date: "03/05/2025", category: "Transportation", amount: 20.00, description: "Gas", paymentMethod: "Capital One (Credit)" },
    { id: 14, date: "03/06/2025", category: "Mel", amount: 189.71, description: "Western Union", paymentMethod: "Capital One (Credit)" },
    { id: 15, date: "03/06/2025", category: "Business", amount: 14.60, description: "USPS - stamps", paymentMethod: "Capital One (Credit)" },
    { id: 16, date: "03/06/2025", category: "Transportation", amount: 20.37, description: "Uber", paymentMethod: "Capital One (Credit)" },
    { id: 17, date: "03/06/2025", category: "Mel", amount: 53.99, description: "Western Union", paymentMethod: "Capital One (Credit)" },
    { id: 18, date: "03/06/2025", category: "Entertainment", amount: 20.36, description: "Netflix", paymentMethod: "PayPal (Check)" },
    { id: 19, date: "03/07/2025", category: "Eating Out", amount: 113.17, description: "Rappi", paymentMethod: "Capital One (Credit)" },
    { id: 20, date: "03/07/2025", category: "Entertainment", amount: 19.23, description: "Spotify", paymentMethod: "PayPal (Check)" },
    { id: 21, date: "03/07/2025", category: "Wardrobe", amount: 38.50, description: "Amiri", paymentMethod: "PayPal (Check)" },
    { id: 22, date: "03/07/2025", category: "Mom", amount: 795.00, description: "Mom", paymentMethod: "360 (Debit)" },
    { id: 23, date: "03/08/2025", category: "Entertainment", amount: 16.99, description: "Max", paymentMethod: "Capital One (Credit)" },
    { id: 24, date: "03/08/2025", category: "Subscriptions", amount: 6.99, description: "1Password", paymentMethod: "Capital One (Credit)" },
    { id: 25, date: "03/08/2025", category: "Wardrobe", amount: 40.50, description: "Under Armor", paymentMethod: "PayPal (Check)" },
    { id: 26, date: "03/08/2025", category: "Eating Out", amount: 25.02, description: "Rappi", paymentMethod: "Quicksilver One (Credit)" },
    { id: 27, date: "03/08/2025", category: "Entertainment", amount: 19.99, description: "HBO Max", paymentMethod: "Capital One (Credit)" },
    { id: 28, date: "03/13/2025", category: "Savings", amount: 50.00, description: "Goldman Sachs", paymentMethod: "360 (Debit)" }
  ];

  // Updated income transactions to include Tricentis income
  const incomeTransactions: IncomeTransaction[] = [
    { id: 1, date: "03/01/2025", source: "Tricentis", description: "Salary", amount: 4084.16 }
  ];

  // Budget alerts based on accurate spreadsheet analysis
  const alerts: Alert[] = [
    { id: 1, type: 'danger', category: "Mom", message: "You've exceeded your Mom budget by $195.00." },
    { id: 2, type: 'warning', category: "Eating Out", message: "You've used 99.7% of your Eating Out budget." },
    { id: 3, type: 'warning', category: "Storage", message: "You've used 97.1% of your Storage budget." },
    { id: 4, type: 'warning', category: "Entertainment", message: "You've used 94.3% of your Entertainment budget." },
    { id: 5, type: 'warning', category: "Capital One", message: "You've used 73.7% of your Capital One credit limit." }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Corey's Budget Dashboard</h1>
          <p className="mt-1">March 2025</p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Income Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Income</h2>
            <p className="text-3xl font-bold text-gray-800">
              {budgetSummary.income > 0 ? `$${budgetSummary.income.toLocaleString()}` : "$0.00"}
            </p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {budgetSummary.income > 0 ? "Monthly total" : "No income added yet"}
              </span>
              <button 
                onClick={() => setShowIncomeModal(true)}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-200"
              >
                Add Income
              </button>
            </div>
          </div>
          
          {/* Budget Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Budget</h2>
            <p className="text-3xl font-bold text-gray-800">${budgetSummary.regularBudget.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-4">Total allocated for March</p>
          </div>
          
          {/* Spent Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Spent</h2>
            <p className="text-3xl font-bold text-gray-800">${budgetSummary.regularSpent.toLocaleString()}</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${budgetSummary.spendingPercentage > 90 ? 'bg-red-500' : budgetSummary.spendingPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min(budgetSummary.spendingPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{budgetSummary.spendingPercentage.toFixed(1)}% of budget</p>
            </div>
          </div>
          
          {/* Remaining Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Remaining</h2>
            <p className={`text-3xl font-bold ${regularRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(regularRemaining).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              {regularRemaining >= 0 ? 'Available to spend' : 'Over budget'}
            </p>
          </div>
        </div>
        
        {/* Credit Card Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Credit Card Tracking</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Limit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statement Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creditCards.map((card, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{card.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">${card.limit.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">${card.spent.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">${(card.limit - card.spent).toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{card.statementDate}<sup>th</sup></td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">{card.dueDate}<sup>th</sup></td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-medium">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">Total</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                    ${creditCards.reduce((sum, card) => sum + card.limit, 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">
                    ${creditCards.reduce((sum, card) => sum + card.spent, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">
                    ${creditCards.reduce((sum, card) => sum + (card.limit - card.spent), 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions and Alerts Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expenses Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-700">Recent Expenses</h2>
                <button 
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2"
                >
                  Add Expense
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenseTransactions.map(expense => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.paymentMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">-${expense.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Income Table - Updated to show Tricentis income */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-700">Income History</h2>
                <button 
                  onClick={() => setShowIncomeModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
                >
                  Add Income
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incomeTransactions.length > 0 ? (
                      incomeTransactions.map(income => (
                        <tr key={income.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.source}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{income.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">+${income.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No income recorded for March yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Alerts */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Budget Alerts</h2>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg ${alert.type === 'danger' ? 'bg-red-50' : 'bg-yellow-50'}`}
                  >
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${alert.type === 'danger' ? 'text-red-800' : 'text-yellow-800'}`}>
                          {alert.category}
                        </h3>
                        <div className={`text-sm ${alert.type === 'danger' ? 'text-red-700' : 'text-yellow-700'}`}>
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">You're on track with all your budget categories!</p>
              </div>
            )}
            
            {/* Month-to-Date Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-700 mb-4">March Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total spent:</span>
                  <span className="text-sm font-medium">${budgetSummary.regularSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget remaining:</span>
                  <span className={`text-sm font-medium ${regularRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(regularRemaining).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget used:</span>
                  <span className="text-sm font-medium">{budgetSummary.spendingPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Credit card available:</span>
                  <span className="text-sm font-medium">
                    ${creditCards.reduce((sum, card) => sum + (card.limit - card.spent), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Income needed:</span>
                  <span className="text-sm font-medium">${(budgetSummary.regularSpent - budgetSummary.income > 0 ? budgetSummary.regularSpent - budgetSummary.income : 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Modal Placeholders */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Expense</h3>
            <p className="text-sm text-gray-500 mb-4">
              This would include a form for adding an expense to your budget.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Income</h3>
            <p className="text-sm text-gray-500 mb-4">
              This would include a form for recording your income sources.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowIncomeModal(false)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;

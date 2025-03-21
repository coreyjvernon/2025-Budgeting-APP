import React, { useState, useEffect, useMemo } from 'react';
import { TrashIcon, PencilIcon, ChevronUpIcon, ChevronDownIcon, FunnelIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Scale,
  CoreScaleOptions,
  Tick
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  month: string;
}

interface IncomeTransaction {
  id: number;
  date: string;
  source: string;
  description: string;
  amount: number;
  month: string;
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

interface ExpenseFormData {
  date: string;
  category: string;
  amount: string;
  description: string;
  paymentMethod: string;
}

interface IncomeFormData {
  date: string;
  source: string;
  description: string;
  amount: string;
}

interface DeleteConfirmation {
  show: boolean;
  type: 'expense' | 'income';
  id: number | null;
}

interface SortConfig {
  key: 'date' | 'category' | 'amount' | 'description' | 'paymentMethod' | 'source';
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  category: string;
  paymentMethod: string;
}

interface MonthlyBudget {
  month: string;
  totalBudget: number;
  categoryBudgets: {
    [category: string]: number;
  };
}

const BudgetDashboard: React.FC = () => {
  // State for modals
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showIncomeModal, setShowIncomeModal] = useState<boolean>(false);
  
  // State for chart controls
  const [chartView, setChartView] = useState<'bar' | 'line' | 'stacked'>('bar');
  const [compareMonth, setCompareMonth] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // State for form data
  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>({
    date: '',
    category: '',
    amount: '',
    description: '',
    paymentMethod: ''
  });

  const [incomeFormData, setIncomeFormData] = useState<IncomeFormData>({
    date: '',
    source: '',
    description: '',
    amount: ''
  });

  // State for transactions
  const [expenseTransactions, setExpenseTransactions] = useState<Transaction[]>([
    { id: 1, date: "03/01/2025", category: "Rent", amount: 2232.53, description: "Rent", paymentMethod: "Capital Five (Credit)", month: "2025-03" },
    { id: 2, date: "03/01/2025", category: "Wellness", amount: 79.48, description: "Rappi - pharmacy", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 3, date: "03/01/2025", category: "Groceries", amount: 6.61, description: "Food Lion", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 4, date: "03/02/2025", category: "Storage", amount: 278.77, description: "StorQuest", paymentMethod: "Capital Five (Credit)", month: "2025-03" },
    { id: 5, date: "03/02/2025", category: "Groceries", amount: 79.48, description: "Rappi", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 6, date: "03/03/2025", category: "Rent", amount: 14.00, description: "iPostal1", paymentMethod: "Quicksilver One (Credit)", month: "2025-03" },
    { id: 7, date: "03/03/2025", category: "Subscriptions", amount: 12.99, description: "Proton", paymentMethod: "Quicksilver One (Credit)", month: "2025-03" },
    { id: 8, date: "03/03/2025", category: "Business", amount: 50.00, description: "Harvard Business", paymentMethod: "Quicksilver One (Credit)", month: "2025-03" },
    { id: 9, date: "03/03/2025", category: "Transportation", amount: 10.30, description: "Uber", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 10, date: "03/04/2025", category: "Subscriptions", amount: 20.00, description: "Claude AI", paymentMethod: "Quicksilver One (Credit)", month: "2025-03" },
    { id: 11, date: "03/04/2025", category: "Eating Out", amount: 61.24, description: "Rappi", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 12, date: "03/05/2025", category: "Transportation", amount: 27.22, description: "Uber", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 13, date: "03/05/2025", category: "Transportation", amount: 20.00, description: "Gas", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 14, date: "03/06/2025", category: "Melany", amount: 189.71, description: "Western Union", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 15, date: "03/06/2025", category: "Business", amount: 14.60, description: "USPS - stamps", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 16, date: "03/06/2025", category: "Transportation", amount: 20.37, description: "Uber", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 17, date: "03/06/2025", category: "Melany", amount: 53.99, description: "Western Union", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 18, date: "03/06/2025", category: "Entertainment", amount: 20.36, description: "Netflix", paymentMethod: "PayPal (Check)", month: "2025-03" },
    { id: 19, date: "03/07/2025", category: "Eating Out", amount: 113.17, description: "Rappi", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 20, date: "03/07/2025", category: "Entertainment", amount: 19.23, description: "Spotify", paymentMethod: "PayPal (Check)", month: "2025-03" },
    { id: 21, date: "03/07/2025", category: "Wardrobe", amount: 38.50, description: "Amiri", paymentMethod: "PayPal (Check)", month: "2025-03" },
    { id: 22, date: "03/07/2025", category: "Mom", amount: 795.00, description: "Mom", paymentMethod: "360 (Debit)", month: "2025-03" },
    { id: 23, date: "03/08/2025", category: "Entertainment", amount: 16.99, description: "Max", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 24, date: "03/08/2025", category: "Subscriptions", amount: 6.99, description: "1Password", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 25, date: "03/08/2025", category: "Wardrobe", amount: 40.50, description: "Under Armor", paymentMethod: "PayPal (Check)", month: "2025-03" },
    { id: 26, date: "03/08/2025", category: "Eating Out", amount: 25.02, description: "Rappi", paymentMethod: "Quicksilver One (Credit)", month: "2025-03" },
    { id: 27, date: "03/08/2025", category: "Entertainment", amount: 19.99, description: "HBO Max", paymentMethod: "Capital One (Credit)", month: "2025-03" },
    { id: 28, date: "03/13/2025", category: "Savings", amount: 50.00, description: "Goldman Sachs", paymentMethod: "360 (Debit)", month: "2025-03" }
  ]);

  const [incomeTransactions, setIncomeTransactions] = useState<IncomeTransaction[]>([
    { id: 1, date: "03/01/2025", source: "Tricentis", description: "Salary", amount: 4084.16, month: "2025-03" }
  ]);
  
  // Budget summary state
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    income: 0,
    regularBudget: 9401.00,
    regularSpent: 0,
    spendingPercentage: 0
  });

  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    show: false,
    type: 'expense',
    id: null
  });

  // State for editing
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeTransaction | null>(null);

  // Sorting and filtering state
  const [expenseSortConfig, setExpenseSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [incomeSortConfig, setIncomeSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [expenseFilters, setExpenseFilters] = useState<FilterConfig>({ category: '', paymentMethod: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Add month selection state
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-03');

  // Add pagination state after other state declarations
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // Generate list of months for 2025
  const months = useMemo(() => {
    const monthsList = [];
    const year = 2025;
    
    // Generate all months for 2025
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const monthStr = date.toISOString().slice(0, 7); // Format: YYYY-MM
      monthsList.push(monthStr);
    }
    
    return monthsList;
  }, []);

  // Format month for display
  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Filter transactions by selected month
  const currentMonthExpenses = useMemo(() => {
    return expenseTransactions.filter(expense => expense.month === selectedMonth);
  }, [expenseTransactions, selectedMonth]);

  const currentMonthIncome = useMemo(() => {
    return incomeTransactions.filter(income => income.month === selectedMonth);
  }, [incomeTransactions, selectedMonth]);

  // Get unique categories for the dropdown
  const categories = useMemo(() => {
    const defaultCategories = [
      'Rent',
      'Storage',
      'Utilities',
      'Cell Phone',
      'Wellness',
      'Credit Cards',
      'Investments',
      'Transportation',
      'Groceries',
      'Entertainment',
      'Subscriptions',
      'Savings',
      'Business',
      'Wardrobe',
      'Eating Out',
      'Melany',
      'Mom',
      'Other'
    ];
    
    const transactionCategories = Array.from(new Set(expenseTransactions.map(expense => expense.category)));
    const allCategories = [...defaultCategories, ...transactionCategories];
    return Array.from(new Set(allCategories)).sort();
  }, [expenseTransactions]);

  // Get unique payment methods for filtering
  const uniquePaymentMethods = useMemo(() => {
    return Array.from(new Set(expenseTransactions.map(expense => expense.paymentMethod))).sort();
  }, [expenseTransactions]);

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...currentMonthExpenses];
    
    // Apply filters
    if (expenseFilters.category) {
      filtered = filtered.filter(expense => expense.category === expenseFilters.category);
    }
    if (expenseFilters.paymentMethod) {
      filtered = filtered.filter(expense => expense.paymentMethod === expenseFilters.paymentMethod);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const direction = expenseSortConfig.direction === 'asc' ? 1 : -1;
      
      switch (expenseSortConfig.key) {
        case 'date':
          return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'category':
          return direction * a.category.localeCompare(b.category);
        case 'description':
          return direction * a.description.localeCompare(b.description);
        case 'paymentMethod':
          return direction * a.paymentMethod.localeCompare(b.paymentMethod);
        case 'amount':
          return direction * (a.amount - b.amount);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [currentMonthExpenses, expenseFilters, expenseSortConfig]);

  // Add pagination logic after filteredAndSortedExpenses
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return filteredAndSortedExpenses.slice(startIndex, endIndex);
  }, [filteredAndSortedExpenses, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedExpenses.length / transactionsPerPage);

  // Sort income
  const sortedIncome = useMemo(() => {
    const sorted = [...currentMonthIncome];
    sorted.sort((a, b) => {
      const direction = incomeSortConfig.direction === 'asc' ? 1 : -1;
      
      switch (incomeSortConfig.key) {
        case 'date':
          return direction * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'source':
          return direction * a.source.localeCompare(b.source);
        case 'description':
          return direction * a.description.localeCompare(b.description);
        case 'amount':
          return direction * (a.amount - b.amount);
        default:
          return 0;
      }
    });
    return sorted;
  }, [currentMonthIncome, incomeSortConfig]);

  // Toggle sort direction and key
  const toggleSort = (type: 'expense' | 'income', key: SortConfig['key']) => {
    if (type === 'expense') {
      setExpenseSortConfig(prev => ({
        key,
        direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
      }));
    } else {
      setIncomeSortConfig(prev => ({
        key,
        direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'desc'
      }));
    }
  };

  // Reset filters
  const resetFilters = () => {
    setExpenseFilters({ category: '', paymentMethod: '' });
  };

  // Add state for monthly budgets
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([
    {
      month: '2025-03',
      totalBudget: 9401.00,
      categoryBudgets: {
        'Rent': 2500,
        'Storage': 300,
        'Utilities': 200,
        'Cell Phone': 100,
        'Wellness': 200,
        'Credit Cards': 500,
        'Investments': 1000,
        'Transportation': 400,
        'Groceries': 800,
        'Entertainment': 300,
        'Subscriptions': 100,
        'Savings': 1000,
        'Business': 500,
        'Wardrobe': 300,
        'Eating Out': 400,
        'Melany': 300,
        'Mom': 800,
        'Other': 200
      }
    }
  ]);

  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Get current month's budget
  const currentMonthBudget = useMemo(() => {
    return monthlyBudgets.find(budget => budget.month === selectedMonth) || {
      month: selectedMonth,
      totalBudget: 9401.00,
      categoryBudgets: {}
    };
  }, [monthlyBudgets, selectedMonth]);

  // Calculate total category budget
  const totalCategoryBudget = useMemo(() => {
    return Object.values(currentMonthBudget.categoryBudgets).reduce((sum, budget) => sum + budget, 0);
  }, [currentMonthBudget.categoryBudgets]);

  // Calculate category spending
  const categorySpending = useMemo(() => {
    const spending: { [category: string]: number } = {};
    categories.forEach(category => {
      spending[category] = currentMonthExpenses
        .filter(expense => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
    });
    return spending;
  }, [currentMonthExpenses, categories]);

  // Calculate budget summary whenever transactions change
  useEffect(() => {
    const totalIncome = currentMonthIncome.reduce((sum, income) => sum + income.amount, 0);
    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = Object.values(currentMonthBudget.categoryBudgets).reduce((sum, budget) => sum + budget, 0);
    const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    setBudgetSummary({
      income: totalIncome,
      regularBudget: totalBudget,
      regularSpent: totalSpent,
      spendingPercentage: spendingPercentage
    });
  }, [currentMonthIncome, currentMonthExpenses, currentMonthBudget]);

  // Calculate remaining budget
  const regularRemaining = budgetSummary.regularBudget - budgetSummary.regularSpent;
  
  // Credit card information with accurate spending
  const creditCards: CreditCard[] = useMemo(() => [
    { name: "Capital One", limit: 950, spent: 0, statementDate: 17, dueDate: 11 },
    { name: "Capital Five", limit: 7500, spent: 0, statementDate: 25, dueDate: 19 },
    { name: "Quicksilver One", limit: 300, spent: 0, statementDate: 27, dueDate: 23 },
    { name: "American Express", limit: 300, spent: 0, statementDate: 25, dueDate: 22 }
  ], []);

  // Calculate credit card spending for the selected month
  const creditCardSpending = useMemo(() => {
    const spending: { [key: string]: number } = {};
    
    // Initialize spending for each card to 0
    creditCards.forEach(card => {
      spending[card.name] = 0;
    });
    
    // Sum up spending for each card in the selected month
    currentMonthExpenses.forEach(expense => {
      // Extract card name from payment method (e.g., "Capital One (Credit)" -> "Capital One")
      const cardName = expense.paymentMethod.split(' (')[0];
      if (cardName === "Capital One" || cardName === "Capital Five" || 
          cardName === "Quicksilver One" || cardName === "American Express") {
        spending[cardName] = (spending[cardName] || 0) + expense.amount;
      }
    });
    
    return spending;
  }, [currentMonthExpenses, creditCards]);

  // Replace the static alerts with a dynamic calculation
  const alerts = useMemo(() => {
    const newAlerts: Alert[] = [];
    
    // Check each category's spending against its budget
    categories.forEach(category => {
      const spent = categorySpending[category] || 0;
      const budget = currentMonthBudget.categoryBudgets[category] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      
      if (percentage >= 95) {
        newAlerts.push({
          id: newAlerts.length + 1,
          type: percentage > 100 ? 'danger' : 'warning',
          category: category,
          message: percentage > 100 
            ? `You've exceeded your ${category} budget by $${(spent - budget).toFixed(2)}.`
            : `You've used ${percentage.toFixed(1)}% of your ${category} budget.`
        });
      }
    });

    // Check credit card utilization
    creditCards.forEach(card => {
      const monthlySpent = creditCardSpending[card.name] || 0;
      const utilizationPercentage = (monthlySpent / card.limit) * 100;
      
      if (utilizationPercentage >= 95) {
        newAlerts.push({
          id: newAlerts.length + 1,
          type: utilizationPercentage > 100 ? 'danger' : 'warning',
          category: card.name,
          message: utilizationPercentage > 100
            ? `You've exceeded your ${card.name} credit limit by $${(monthlySpent - card.limit).toFixed(2)}.`
            : `You've used ${utilizationPercentage.toFixed(1)}% of your ${card.name} credit limit.`
        });
      }
    });

    return newAlerts;
  }, [categories, categorySpending, currentMonthBudget.categoryBudgets, creditCards, creditCardSpending]);

  // Budget management functions
  const handleBudgetUpdate = (newBudget: MonthlyBudget) => {
    setMonthlyBudgets(prev => {
      const existing = prev.findIndex(b => b.month === newBudget.month);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newBudget;
        return updated;
      }
      return [...prev, newBudget];
    });
    setShowBudgetModal(false);
  };

  // Form handlers
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = expenseFormData.date.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    
    const newExpense: Transaction = {
      id: expenseTransactions.length + 1,
      date: formattedDate,
      category: expenseFormData.category,
      amount: Number(expenseFormData.amount),
      description: expenseFormData.description,
      paymentMethod: expenseFormData.paymentMethod,
      month: `${year}-${month}`
    };
    setExpenseTransactions([...expenseTransactions, newExpense]);
    setExpenseFormData({
      date: '',
      category: '',
      amount: '',
      description: '',
      paymentMethod: ''
    });
    setShowExpenseModal(false);
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = incomeFormData.date.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    
    const newIncome: IncomeTransaction = {
      id: incomeTransactions.length + 1,
      date: formattedDate,
      source: incomeFormData.source,
      description: incomeFormData.description,
      amount: Number(incomeFormData.amount),
      month: `${year}-${month}`
    };
    setIncomeTransactions([...incomeTransactions, newIncome]);
    setIncomeFormData({
      date: '',
      source: '',
      description: '',
      amount: ''
    });
    setShowIncomeModal(false);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteConfirmation.id === null) return;
    
    if (deleteConfirmation.type === 'expense') {
      setExpenseTransactions(expenseTransactions.filter(expense => expense.id !== deleteConfirmation.id));
    } else {
      setIncomeTransactions(incomeTransactions.filter(income => income.id !== deleteConfirmation.id));
    }
    
    setDeleteConfirmation({ show: false, type: 'expense', id: null });
  };

  // Function to handle edit submission
  const handleExpenseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const [year, month, day] = expenseFormData.date.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    
    const updatedExpense: Transaction = {
      ...editingExpense,
      date: formattedDate,
      category: expenseFormData.category,
      amount: Number(expenseFormData.amount),
      description: expenseFormData.description,
      paymentMethod: expenseFormData.paymentMethod,
      month: `${year}-${month}`
    };

    setExpenseTransactions(expenseTransactions.map(expense => 
      expense.id === editingExpense.id ? updatedExpense : expense
    ));

    setEditingExpense(null);
    setExpenseFormData({
      date: '',
      category: '',
      amount: '',
      description: '',
      paymentMethod: ''
    });
    setShowExpenseModal(false);
  };

  const handleIncomeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;

    const [year, month, day] = incomeFormData.date.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    
    const updatedIncome: IncomeTransaction = {
      ...editingIncome,
      date: formattedDate,
      source: incomeFormData.source,
      description: incomeFormData.description,
      amount: Number(incomeFormData.amount),
      month: `${year}-${month}`
    };

    setIncomeTransactions(incomeTransactions.map(income => 
      income.id === editingIncome.id ? updatedIncome : income
    ));

    setEditingIncome(null);
    setIncomeFormData({
      date: '',
      source: '',
      description: '',
      amount: ''
    });
    setShowIncomeModal(false);
  };

  // Function to start editing
  const startEditing = (type: 'expense' | 'income', item: Transaction | IncomeTransaction) => {
    if (type === 'expense') {
      const expense = item as Transaction;
      const [month, day, year] = expense.date.split('/');
      setExpenseFormData({
        date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        category: expense.category,
        amount: expense.amount.toString(),
        description: expense.description,
        paymentMethod: expense.paymentMethod
      });
      setEditingExpense(expense);
      setShowExpenseModal(true);
    } else {
      const income = item as IncomeTransaction;
      const [month, day, year] = income.date.split('/');
      setIncomeFormData({
        date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        source: income.source,
        description: income.description,
        amount: income.amount.toString()
      });
      setEditingIncome(income);
      setShowIncomeModal(true);
    }
  };

  // Update the expense table actions column
  const renderExpenseActions = (expense: Transaction) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
      <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => startEditing('expense', expense)}
          className="text-blue-400 hover:text-blue-300"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setDeleteConfirmation({ show: true, type: 'expense', id: expense.id })}
          className="text-red-400 hover:text-red-300"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </td>
  );

  // Update the income table actions column
  const renderIncomeActions = (income: IncomeTransaction) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
      <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => startEditing('income', income)}
          className="text-blue-400 hover:text-blue-300"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setDeleteConfirmation({ show: true, type: 'income', id: income.id })}
          className="text-red-400 hover:text-red-300"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </td>
  );

  // Helper function to render sort button
  const renderSortButton = (type: 'expense' | 'income', label: string, key: SortConfig['key']) => {
    const config = type === 'expense' ? expenseSortConfig : incomeSortConfig;
    const isActive = config.key === key;
    
    return (
      <button
        onClick={() => toggleSort(type, key)}
        className="flex items-center space-x-1 w-full"
      >
        <span className={isActive ? 'font-medium' : ''}>{label}</span>
        {isActive && (
          config.direction === 'asc' ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )
        )}
      </button>
    );
  };

  // Add state for editing budgets
  const [isEditingMonthlyBudget, setIsEditingMonthlyBudget] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempBudgetValue, setTempBudgetValue] = useState<string>('');

  // Function to handle monthly budget update
  const handleMonthlyBudgetUpdate = (newValue: number) => {
    const newBudget = {
      ...currentMonthBudget,
      totalBudget: newValue
    };
    handleBudgetUpdate(newBudget);
    setIsEditingMonthlyBudget(false);
  };

  // Function to handle category budget update
  const handleCategoryBudgetUpdate = (category: string, newValue: number) => {
    const newBudget = {
      ...currentMonthBudget,
      categoryBudgets: {
        ...currentMonthBudget.categoryBudgets,
        [category]: newValue
      }
    };
    handleBudgetUpdate(newBudget);
    setEditingCategoryId(null);
  };

  // Add category icons mapping
  const categoryIcons: { [key: string]: string } = {
    'Rent': '🏠',
    'Storage': '📦',
    'Utilities': '⚡',
    'Cell Phone': '📱',
    'Wellness': '💊',
    'Credit Cards': '💳',
    'Investments': '📈',
    'Transportation': '🚗',
    'Groceries': '🛒',
    'Entertainment': '🎮',
    'Subscriptions': '📺',
    'Savings': '💰',
    'Business': '💼',
    'Wardrobe': '👕',
    'Eating Out': '🍽️',
    'Melany': '👩',
    'Mom': '👨‍👩‍👧‍👦',
    'Other': '📌'
  };

  // Update the chart data configuration
  const chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      borderRadius: number;
    }[];
  } = {
    labels: categories,
    datasets: [
      {
        label: 'Budget',
        data: categories.map(category => currentMonthBudget.categoryBudgets[category] || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 0.8)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Actual',
        data: categories.map(category => categorySpending[category] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgba(239, 68, 68, 0.8)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Update the chart options to ensure proper display
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)',
          color: '#9CA3AF',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9CA3AF',
          callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
            return `$${Number(tickValue).toLocaleString()}`;
          }
        }
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          color: '#9CA3AF',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9CA3AF',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `Category Spending for ${formatMonthDisplay(selectedMonth)}`,
        color: '#E5E7EB',
        font: {
          size: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const category = context.label;
            const budget = currentMonthBudget.categoryBudgets[category] || 0;
            const percentage = budget > 0 ? ((value / budget) * 100).toFixed(1) : '0';
            return `${label}: $${value.toLocaleString()} (${percentage}% of budget)`;
          }
        }
      }
    }
  };

  // Add pagination controls component
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-300">
            Showing <span className="font-medium">{((currentPage - 1) * transactionsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * transactionsPerPage, filteredAndSortedExpenses.length)}
            </span> of{' '}
            <span className="font-medium">{filteredAndSortedExpenses.length}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-blue-500 border-blue-500 text-blue-200'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  // Add this function to calculate trend
  const calculateTrend = (category: string) => {
    const currentMonthSpent = categorySpending[category] || 0;
    const previousMonth = new Date(selectedMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthStr = previousMonth.toISOString().slice(0, 7);
    const previousMonthExpenses = expenseTransactions.filter(expense => 
      expense.month === previousMonthStr && expense.category === category
    );
    const previousMonthSpent = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (previousMonthSpent === 0) return 0;
    return ((currentMonthSpent - previousMonthSpent) / previousMonthSpent) * 100;
  };

  // Add these new chart configurations after the existing chartOptions
  const trendChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        display: false
      },
      x: {
        display: false
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    }
  };

  // Add trend chart data calculation
  const trendChartData = useMemo(() => {
    const last6Months = months.slice(-6);
    return {
      labels: last6Months.map(month => formatMonthDisplay(month).split(' ')[0]),
      datasets: [
        {
          label: 'Total Spending',
          data: last6Months.map(month => {
            const expenses = expenseTransactions.filter(e => e.month === month);
            return expenses.reduce((sum, e) => sum + e.amount, 0);
          }),
          borderColor: 'rgba(239, 68, 68, 0.8)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }, [months, expenseTransactions]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 text-white p-6 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{"Corey's Budget Dashboard"}</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowIncomeModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add Income
              </button>
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add Expense
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 border border-gray-600"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthDisplay(month)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Income Card */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-gray-200 mb-2">Income</h2>
            <p className="text-3xl font-bold text-green-400">
              {budgetSummary.income > 0 ? `$${budgetSummary.income.toLocaleString()}` : "$0.00"}
            </p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-400">
                {budgetSummary.income > 0 ? "Monthly total" : "No income added yet"}
              </span>
            </div>
          </div>

          {/* Budget Card */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-gray-200 mb-2">Budget</h2>
            <p className="text-3xl font-bold text-blue-400">${totalCategoryBudget.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-4">Total allocated for {formatMonthDisplay(selectedMonth).split(' ')[0]}</p>
          </div>

          {/* Spent Card */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-gray-200 mb-2">Spent</h2>
            <p className="text-3xl font-bold text-red-400">${budgetSummary.regularSpent.toLocaleString()}</p>
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className={`${
                    budgetSummary.spendingPercentage > 100 ? 'bg-red-600' :
                    budgetSummary.spendingPercentage > 80 ? 'bg-yellow-600' :
                    'bg-green-600'
                  } h-2.5 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(budgetSummary.spendingPercentage, 100)}%` }}
                />
                <div className="text-sm text-gray-400 mt-1">
                  {budgetSummary.spendingPercentage === 0 ? '0% of budget spent' : `${budgetSummary.spendingPercentage.toFixed(1)}% of budget spent`}
                </div>
              </div>
            </div>
          </div>

          {/* Remaining Card */}
          <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-gray-200 mb-2">Remaining</h2>
            <p className={`text-3xl font-bold ${regularRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(regularRemaining).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-4">
              {regularRemaining >= 0 ? 'Available to spend' : 'Over budget'}
            </p>
          </div>
        </div>
        
        {/* Budget vs Actual Chart */}
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-8 border border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-200">Budget vs. Actual Spending</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-300">Budget</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-300">Actual</span>
                </div>
              </div>
            </div>
            
            {/* Main Chart */}
            <div className="h-96">
              <Bar 
                data={chartData} 
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Credit Card Section */}
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-200">Credit Card Tracking</h2>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm text-gray-400">Total Available Credit</span>
                <p className="text-lg font-semibold text-green-400">
                  ${(creditCards.reduce((sum, card) => sum + card.limit, 0) - 
                     Object.values(creditCardSpending).reduce((sum, spent) => sum + spent, 0)).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-400">Total Credit Card Debt</span>
                <p className="text-lg font-semibold text-red-400">
                  ${Object.values(creditCardSpending).reduce((sum, spent) => sum + spent, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Card</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Limit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Available</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Statement Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {creditCards.map((card, index) => {
                  const monthlySpent = creditCardSpending[card.name] || 0;
                  const available = card.limit - monthlySpent;
                  const utilizationPercentage = (monthlySpent / card.limit) * 100;
                  const today = new Date();
                  const currentDay = today.getDate();
                  const daysUntilStatement = card.statementDate - currentDay;
                  const daysUntilDue = card.dueDate - currentDay;
                  
                  const getStatusColor = (percentage: number) => {
                    if (percentage > 100) return 'bg-red-600';
                    if (percentage > 80) return 'bg-yellow-600';
                    return 'bg-green-600';
                  };

                  const getDateStatusColor = (days: number) => {
                    if (days <= 0) return 'text-red-400';
                    if (days <= 3) return 'text-yellow-400';
                    return 'text-green-400';
                  };
                  
                  return (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{card.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-300">${card.limit.toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                        <div className="flex flex-col items-end">
                          <span className={`${utilizationPercentage > 80 ? 'text-red-400' : 'text-gray-300'}`}>
                            ${monthlySpent.toLocaleString()}
                          </span>
                          <div className="w-24 h-1.5 bg-gray-700 rounded-full mt-1">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getStatusColor(utilizationPercentage)}`}
                              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 mt-1">
                            {utilizationPercentage.toFixed(1)}% utilized
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${available < 100 ? 'text-red-400' : 'text-green-400'}`}>
                        ${available.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <span className={getDateStatusColor(daysUntilStatement)}>
                          {card.statementDate}<sup>th</sup>
                          <span className="text-xs ml-1">
                            ({daysUntilStatement > 0 ? `${daysUntilStatement}d` : 'Past'})
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <span className={getDateStatusColor(daysUntilDue)}>
                          {card.dueDate}<sup>th</sup>
                          <span className="text-xs ml-1">
                            ({daysUntilDue > 0 ? `${daysUntilDue}d` : 'Past'})
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-700 font-medium">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">Total</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-200">
                    ${creditCards.reduce((sum, card) => sum + card.limit, 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-400">
                    ${Object.values(creditCardSpending).reduce((sum, spent) => sum + spent, 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-400">
                    ${(creditCards.reduce((sum, card) => sum + card.limit, 0) - 
                       Object.values(creditCardSpending).reduce((sum, spent) => sum + spent, 0)).toLocaleString()}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Income Table */}
        <div className="bg-gray-800 rounded-lg shadow mb-8 border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-medium text-gray-200">Income History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    {renderSortButton('income', 'Date', 'date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    {renderSortButton('income', 'Source', 'source')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    {renderSortButton('income', 'Description', 'description')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    {renderSortButton('income', 'Amount', 'amount')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedIncome.map(income => (
                  <tr key={income.id} className="group hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{income.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{income.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{income.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-400">+${income.amount.toFixed(2)}</td>
                    {renderIncomeActions(income)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map(category => {
            const spent = categorySpending[category] || 0;
            const budget = currentMonthBudget.categoryBudgets[category] || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            const remaining = budget - spent;
            const isEditing = editingCategoryId === category;
            const trend = calculateTrend(category);
            
            const getStatusColor = (percentage: number) => {
              if (percentage > 100) return 'bg-red-600';
              if (percentage > 80) return 'bg-yellow-600';
              return 'bg-green-600';
            };

            const getTrendColor = (trend: number) => {
              if (trend > 10) return 'text-red-400';
              if (trend > 0) return 'text-yellow-400';
              return 'text-green-400';
            };
            
            return (
              <div key={category} className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-700 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{categoryIcons[category] || '📌'}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-200">{category}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${getStatusColor(percentage)}`}>
                          {percentage.toFixed(0)}% of budget
                        </span>
                        {trend !== 0 && (
                          <span className={`text-sm ${getTrendColor(trend)} flex items-center`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingCategoryId(category);
                        setTempBudgetValue(budget.toString());
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-500 ${getStatusColor(percentage)}`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Spent</span>
                      <p className="font-medium text-gray-200">${spent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400">Budget</span>
                      {isEditing ? (
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-gray-400">$</span>
                          <input
                            type="number"
                            value={tempBudgetValue}
                            onChange={(e) => setTempBudgetValue(e.target.value)}
                            className="w-24 text-right bg-gray-700 border-b border-gray-600 focus:border-blue-500 focus:ring-0 p-0 text-sm text-gray-200"
                            autoFocus
                            onFocus={(e) => e.target.select()}
                          />
                        </div>
                      ) : (
                        <p className="font-medium text-gray-200">${budget.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400">Remaining</span>
                      <p className={`font-medium ${remaining < 0 ? 'text-red-400' : 'text-gray-200'}`}>
                        ${remaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </p>
                    </div>
                    {isEditing && (
                      <div className="text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleCategoryBudgetUpdate(category, Number(tempBudgetValue))}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transactions and Alerts Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expenses Table */}
          <div className="lg:col-span-2">
            {/* Filter Section */}
            {showFilters && (
              <div className="p-4 border-b border-gray-700 bg-gray-800">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-200 mb-1">Category</label>
                    <select
                      value={expenseFilters.category}
                      onChange={(e) => setExpenseFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-200 mb-1">Payment Method</label>
                    <select
                      value={expenseFilters.paymentMethod}
                      onChange={(e) => setExpenseFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">All Payment Methods</option>
                      {uniquePaymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg shadow mb-6 border border-gray-700">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-medium text-gray-200">Recent Expenses</h2>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-gray-300"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    <span className="text-sm">Filters</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'Date', 'date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'Category', 'category')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'Description', 'description')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'Payment Method', 'paymentMethod')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'Amount', 'amount')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {paginatedExpenses.map(expense => (
                      <tr key={expense.id} className="group hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{expense.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{expense.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{expense.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{expense.paymentMethod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-400">-${expense.amount.toFixed(2)}</td>
                        {renderExpenseActions(expense)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls />
            </div>
          </div>
          
          {/* Alerts */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-gray-200 mb-4">Budget Alerts</h2>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg ${alert.type === 'danger' ? 'bg-red-900/50' : 'bg-yellow-900/50'}`}
                  >
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${alert.type === 'danger' ? 'text-red-200' : 'text-yellow-200'}`}>
                          {alert.category}
                        </h3>
                        <div className={`text-sm ${alert.type === 'danger' ? 'text-red-300' : 'text-yellow-300'}`}>
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">{"You're on track with all your budget categories!"}</p>
              </div>
            )}
            
            {/* Month-to-Date Summary */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-lg font-medium text-gray-200 mb-4">March Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total spent:</span>
                  <span className="text-sm font-medium text-gray-200">${budgetSummary.regularSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Budget remaining:</span>
                  <span className={`text-sm font-medium ${regularRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Math.abs(regularRemaining).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Budget used:</span>
                  <span className="text-sm font-medium text-gray-200">{budgetSummary.spendingPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Credit card available:</span>
                  <span className="text-sm font-medium text-gray-200">
                    ${(creditCards.reduce((sum, card) => sum + card.limit, 0) - 
                       Object.values(creditCardSpending).reduce((sum, spent) => sum + spent, 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Income needed:</span>
                  <span className="text-sm font-medium text-gray-200">${(budgetSummary.regularSpent - budgetSummary.income > 0 ? budgetSummary.regularSpent - budgetSummary.income : 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 mb-4">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={editingExpense ? handleExpenseEdit : handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Date</label>
                <input
                  type="date"
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Category</label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    className="pl-7 mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <input
                  type="text"
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Payment Method</label>
                <select
                  value={expenseFormData.paymentMethod}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentMethod: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a payment method</option>
                  <option value="Capital One (Credit)">Capital One</option>
                  <option value="Capital Five (Credit)">Capital Five</option>
                  <option value="Quicksilver One (Credit)">Quicksilver One</option>
                  <option value="American Express (Credit)">American Express</option>
                  <option value="360 (Debit)">360</option>
                  <option value="PayPal (Check)">PayPal</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                    setExpenseFormData({
                      date: '',
                      category: '',
                      amount: '',
                      description: '',
                      paymentMethod: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 mb-4">{editingIncome ? 'Edit Income' : 'Add New Income'}</h3>
            <form onSubmit={editingIncome ? handleIncomeEdit : handleIncomeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Date</label>
                <input
                  type="date"
                  value={incomeFormData.date}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Source</label>
                <input
                  type="text"
                  value={incomeFormData.source}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, source: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={incomeFormData.amount}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                    className="pl-7 mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <input
                  type="text"
                  value={incomeFormData.description}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowIncomeModal(false);
                    setEditingIncome(null);
                    setIncomeFormData({
                      date: '',
                      source: '',
                      description: '',
                      amount: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  {editingIncome ? 'Update Income' : 'Add Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm border border-gray-700">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteConfirmation.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, type: 'expense', id: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;

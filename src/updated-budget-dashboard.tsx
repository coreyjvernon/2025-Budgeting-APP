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
import { budgetService, Expense, Budget, Income } from './services/budgetService';

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
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  isCredit: boolean;
  paymentMethod: string;
  month: string;
}

interface IncomeTransaction {
  id: string;
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
  totalIncome: number;
  creditBudget: number;
  creditSpent: number;
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
  id: string | null;
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
  const [expenseTransactions, setExpenseTransactions] = useState<Transaction[]>([]);
  const [incomeTransactions, setIncomeTransactions] = useState<IncomeTransaction[]>([]);

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load expenses
        const expenses = await budgetService.getExpenses();
        setExpenseTransactions(expenses.map(expense => ({
          id: expense.id || '',
          date: expense.date,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          isCredit: expense.paymentMethod?.includes('Credit') || false,
          paymentMethod: expense.paymentMethod,
          month: expense.date.substring(0, 7)
        })));

        // Load income
        const income = await budgetService.getIncome();
        const formattedIncome = income.map(item => ({
          id: item.id || '',
          date: item.date,
          source: item.source,
          description: item.description,
          amount: item.amount,
          month: item.date.substring(0, 7)
        }));
        setIncomeTransactions(formattedIncome);

        // Initialize credit card spent amounts
        const creditCardExpenses = expenses.filter(expense => expense.paymentMethod?.includes('Credit'));
        setCreditCards(prev => prev.map(card => {
          const cardExpenses = creditCardExpenses.filter(expense => 
            expense.paymentMethod?.startsWith(card.name)
          );
          const totalSpent = cardExpenses.reduce((sum: number, expense) => sum + expense.amount, 0);
          return { ...card, spent: totalSpent };
        }));

        // Update budget summary
        const totalSpent = expenses.reduce((sum: number, expense) => sum + expense.amount, 0);
        const totalIncome = income.reduce((sum: number, item) => sum + item.amount, 0);
        setBudgetSummary(prev => ({
          ...prev,
          regularSpent: totalSpent,
          spendingPercentage: (totalSpent / prev.regularBudget) * 100,
          income: totalIncome,
          totalIncome
        }));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Budget summary state
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    income: 0,
    regularBudget: 9401.00,
    regularSpent: 0,
    spendingPercentage: 0,
    totalIncome: 0,
    creditBudget: 0,
    creditSpent: 0
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
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [tempBudgetValue, setTempBudgetValue] = useState<string>('');

  // Sorting and filtering state
  const [expenseSortConfig, setExpenseSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [incomeSortConfig, setIncomeSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [expenseFilters, setExpenseFilters] = useState<FilterConfig>({ category: '', paymentMethod: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Add month selection state
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-03');

  // Add pagination state after other state declarations
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5; // Changed from 10 to 5 to match the UI

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
  }, [filteredAndSortedExpenses, currentPage, transactionsPerPage]);

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

    setBudgetSummary(prev => ({
      ...prev,
      regularSpent: totalSpent,
      spendingPercentage: spendingPercentage
    }));
  }, [currentMonthIncome, currentMonthExpenses, currentMonthBudget]);

  // Calculate remaining budget
  const regularRemaining = totalCategoryBudget - budgetSummary.regularSpent;
  
  // Add credit cards state
  const [creditCards, setCreditCards] = useState<CreditCard[]>([
    { name: "Capital One", limit: 950, spent: 0, statementDate: 17, dueDate: 11 },
    { name: "Capital Five", limit: 7500, spent: 0, statementDate: 25, dueDate: 19 },
    { name: "Quicksilver One", limit: 300, spent: 0, statementDate: 27, dueDate: 23 },
    { name: "American Express", limit: 300, spent: 0, statementDate: 25, dueDate: 22 }
  ]);

  // Calculate credit card spending
  const creditCardSpending = useMemo(() => {
    const spending: { [key: string]: number } = {};
    
    expenseTransactions.forEach(expense => {
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
  }, [expenseTransactions, creditCards]);

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

  const handleCategoryBudgetUpdate = (category: string, newValue: number) => {
    setMonthlyBudgets(prev => {
      const existing = prev.findIndex(b => b.month === selectedMonth);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          categoryBudgets: {
            ...updated[existing].categoryBudgets,
            [category]: newValue
          }
        };
        return updated;
      }
      return prev;
    });
    setEditingCategoryId(null);
    setTempBudgetValue('');
  };

  // Form handlers
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newExpense = {
        date: expenseFormData.date,
        category: expenseFormData.category,
        description: expenseFormData.description,
        amount: parseFloat(expenseFormData.amount),
        paymentMethod: expenseFormData.paymentMethod || 'Cash',
        isCredit: expenseFormData.paymentMethod?.includes('Credit') || false
      };

      const expenseId = await budgetService.addExpense(newExpense);
      const formattedExpense: Transaction = {
        id: expenseId,
        ...newExpense,
        month: newExpense.date.substring(0, 7)
      };

      setExpenseTransactions(prev => [...prev, formattedExpense]);
      setBudgetSummary(prev => {
        const newRegularSpent = prev.regularSpent + newExpense.amount;
        const newCreditSpent = newExpense.isCredit ? prev.creditSpent + newExpense.amount : prev.creditSpent;
        const newTotalSpent = newRegularSpent + newCreditSpent;
        
        return {
          ...prev,
          regularSpent: newRegularSpent,
          creditSpent: newCreditSpent,
          totalSpent: newTotalSpent,
          spendingPercentage: (newTotalSpent / prev.regularBudget) * 100
        };
      });
      setExpenseFormData({
        date: '',
        category: '',
        description: '',
        amount: '',
        paymentMethod: 'Cash'
      });
      setShowExpenseModal(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const [year, month, day] = incomeFormData.date.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    
    try {
      const newIncome: Omit<Income, 'id'> = {
        date: formattedDate,
        source: incomeFormData.source,
        description: incomeFormData.description,
        amount: parseFloat(incomeFormData.amount)
      };

      const incomeId = await budgetService.addIncome(newIncome);
      
      // Update local state with the new income
      const newIncomeTransaction = {
        id: incomeId,
        date: formattedDate,
        source: incomeFormData.source,
        description: incomeFormData.description,
        amount: parseFloat(incomeFormData.amount),
        month: `${year}-${month.padStart(2, '0')}`
      };

      setIncomeTransactions(prev => [...prev, newIncomeTransaction]);

      // Update budget summary
      const totalIncome = incomeTransactions.reduce((sum, item) => sum + item.amount, 0) + parseFloat(incomeFormData.amount);
      setBudgetSummary(prev => ({
        ...prev,
        income: totalIncome,
        totalIncome
      }));

      setShowIncomeModal(false);
      setIncomeFormData({
        date: '',
        source: '',
        description: '',
        amount: ''
      });
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleIncomeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;

    try {
      const [year, month, day] = incomeFormData.date.split('-');
      const formattedDate = `${month}/${day}/${year}`;

      await budgetService.updateIncome(editingIncome.id, {
        date: formattedDate,
        source: incomeFormData.source,
        description: incomeFormData.description,
        amount: parseFloat(incomeFormData.amount)
      });

      // Refresh income
      const income = await budgetService.getIncome();
      setIncomeTransactions(income.map(item => ({
        id: item.id || '',
        date: item.date,
        source: item.source,
        description: item.description,
        amount: item.amount,
        month: item.date.substring(0, 7)
      })));

      // Update budget summary
      const totalIncome = income.reduce((sum: number, item) => sum + item.amount, 0);
      setBudgetSummary(prev => ({
        ...prev,
        income: totalIncome,
        totalIncome
      }));

      setShowIncomeModal(false);
      setEditingIncome(null);
      setIncomeFormData({
        date: '',
        source: '',
        description: '',
        amount: ''
      });
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.id) return;

    try {
      if (deleteConfirmation.type === 'expense') {
        await handleDeleteExpense(deleteConfirmation.id);
      } else {
        await handleDeleteIncome(deleteConfirmation.id);
      }
      setDeleteConfirmation({ show: false, type: 'expense', id: null });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Function to handle edit submission
  const handleExpenseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      // Update the expense in Firestore
      await budgetService.updateExpense(editingExpense.id, {
        date: expenseFormData.date,
        category: expenseFormData.category,
        amount: parseFloat(expenseFormData.amount),
        description: expenseFormData.description,
        paymentMethod: expenseFormData.paymentMethod || 'Cash'
      });

      // Refresh expenses from Firestore
      const expenses = await budgetService.getExpenses();
      setExpenseTransactions(expenses.map(expense => ({
        id: expense.id || '',
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        isCredit: expense.paymentMethod?.includes('Credit') || false,
        paymentMethod: expense.paymentMethod,
        month: expense.date.substring(0, 7)
      })));

      // Update budget summary
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      setBudgetSummary(prev => ({
        ...prev,
        regularSpent: totalSpent,
        spendingPercentage: (totalSpent / prev.regularBudget) * 100
      }));

      // Update credit card tracking
      const creditCardExpenses = expenses.filter(expense => expense.paymentMethod?.includes('Credit'));
      setCreditCards(prev => prev.map(card => {
        const cardExpenses = creditCardExpenses.filter(expense => 
          expense.paymentMethod?.startsWith(card.name)
        );
        const totalSpent = cardExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        return { ...card, spent: totalSpent };
      }));

      // Close the modal and reset form
      setShowExpenseModal(false);
      setEditingExpense(null);
      setExpenseFormData({
        date: '',
        category: '',
        amount: '',
        description: '',
        paymentMethod: ''
      });
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Update the date formatting in the Recent Expenses section
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Update the delete and edit handlers
  const handleDeleteClick = (id: string, type: 'expense' | 'income') => {
    console.log('Delete clicked:', { id, type });
    setDeleteConfirmation({ show: true, type, id });
  };

  const handleEditClick = (expense: Transaction) => {
    setEditingExpense(expense);
    setExpenseFormData({
      date: expense.date,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      paymentMethod: expense.paymentMethod
    });
    setShowExpenseModal(true);
  };

  // Chart data
  const chartData = useMemo(() => {
    const labels = categories;
    const spentData = categories.map(category => categorySpending[category] || 0);
    const budgetData = categories.map(category => currentMonthBudget.categoryBudgets[category] || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Spent',
          data: spentData,
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1
        },
        {
          label: 'Budget',
          data: budgetData,
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }
      ]
    };
  }, [categories, categorySpending, currentMonthBudget.categoryBudgets]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Category Spending vs Budget'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`
        }
      }
    }
  };

  // Render sort button
  const renderSortButton = (type: 'expense' | 'income', key: SortConfig['key'], label: string) => (
    <button
      onClick={() => toggleSort(type, key)}
      className="flex items-center space-x-1 text-gray-400 hover:text-gray-200"
    >
      <span>{label}</span>
      {type === 'expense' ? (
        expenseSortConfig.key === key && (
          expenseSortConfig.direction === 'asc' ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )
        )
      ) : (
        incomeSortConfig.key === key && (
          incomeSortConfig.direction === 'asc' ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )
        )
      )}
    </button>
  );

  // Render income actions
  const renderIncomeActions = (income: IncomeTransaction) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            setEditingIncome(income);
            setIncomeFormData({
              date: income.date.split('/').reverse().join('-'),
              source: income.source,
              description: income.description,
              amount: income.amount.toString()
            });
            setShowIncomeModal(true);
          }}
          className="text-blue-400 hover:text-blue-300"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDeleteClick(income.id, 'income')}
          className="text-red-400 hover:text-red-300"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </td>
  );

  // Calculate trend
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Category icons
  const categoryIcons: { [key: string]: string } = {
    'Rent': '🏠',
    'Storage': '📦',
    'Utilities': '⚡',
    'Cell Phone': '📱',
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
    'Mom': '👩‍🦰',
    'Other': '📌'
  };

  // Render expense actions
  const renderExpenseActions = (expense: Transaction) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            setEditingExpense(expense);
            setExpenseFormData({
              date: expense.date.split('/').reverse().join('-'),
              category: expense.category,
              description: expense.description,
              amount: expense.amount.toString(),
              paymentMethod: expense.paymentMethod
            });
            setShowExpenseModal(true);
          }}
          className="text-blue-400 hover:text-blue-300"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleDeleteClick(expense.id, 'expense')}
          className="text-red-400 hover:text-red-300"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </td>
  );

  // Pagination controls component
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-t border-gray-700 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-300">
            Showing <span className="font-medium">{(currentPage - 1) * transactionsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * transactionsPerPage, filteredAndSortedExpenses.length)}
            </span>{' '}
            of <span className="font-medium">{filteredAndSortedExpenses.length}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  const BudgetSummary = () => {
    const totalSpent = budgetSummary.regularSpent + budgetSummary.creditSpent;
    const totalBudget = Object.values(currentMonthBudget.categoryBudgets).reduce((sum, budget) => sum + budget, 0);
    const remaining = totalBudget - totalSpent;
    const totalIncome = budgetSummary.income;
    const totalAvailable = totalBudget - totalSpent;
    const spendingPercentage = (totalSpent / totalBudget) * 100;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Budget Card */}
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-200">Budget</h3>
            <div className="text-gray-400">
              <span className="text-sm">Regular: ${totalBudget.toLocaleString()}</span>
              <br />
              <span className="text-sm">Credit: ${budgetSummary.creditBudget.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            ${totalBudget.toLocaleString()}
          </div>
        </div>

        {/* Remaining Card */}
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-200">Remaining</h3>
            <div className="text-gray-400">
              <span className="text-sm">Regular: ${remaining.toLocaleString()}</span>
              <br />
              <span className="text-sm">Credit: ${budgetSummary.creditBudget.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400">
            ${totalAvailable.toLocaleString()}
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-200">Income</h3>
            <div className="text-gray-400">
              <span className="text-sm">Regular: ${totalIncome.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-green-400">
            ${totalIncome.toLocaleString()}
          </div>
        </div>

        {/* Spending Card */}
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-200">Spending</h3>
            <div className="text-gray-400">
              <span className="text-sm">Regular: ${budgetSummary.regularSpent.toLocaleString()}</span>
              <br />
              <span className="text-sm">Credit: ${budgetSummary.creditSpent.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-400">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {spendingPercentage.toFixed(1)}% of budget spent
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await budgetService.deleteExpense(expenseId);
      setExpenseTransactions(prevExpenses => prevExpenses.filter(expense => expense.id !== expenseId));
      
      // Update budget summary
      const deletedExpense = expenseTransactions.find(expense => expense.id === expenseId);
      if (deletedExpense) {
        setBudgetSummary(prev => {
          const newRegularSpent = prev.regularSpent - deletedExpense.amount;
          const newCreditSpent = deletedExpense.isCredit ? prev.creditSpent - deletedExpense.amount : prev.creditSpent;
          const newTotalSpent = newRegularSpent + newCreditSpent;
          
          return {
            ...prev,
            regularSpent: newRegularSpent,
            creditSpent: newCreditSpent,
            totalSpent: newTotalSpent,
            spendingPercentage: (newTotalSpent / prev.regularBudget) * 100
          };
        });
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleDeleteExpenseClick = (expenseId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleDeleteExpense(expenseId);
  };

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      await budgetService.deleteIncome(incomeId);
      setIncomeTransactions(prevIncome => prevIncome.filter(income => income.id !== incomeId));
      
      // Update budget summary
      const deletedIncome = incomeTransactions.find(income => income.id === incomeId);
      if (deletedIncome) {
        setBudgetSummary(prev => ({
          ...prev,
          income: prev.income - deletedIncome.amount,
          totalIncome: prev.totalIncome - deletedIncome.amount
        }));
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Failed to delete income. Please try again.');
    }
  };

  const handleDeleteIncomeClick = (incomeId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleDeleteIncome(incomeId);
  };

  const sortTransactions = (transactions: Transaction[], field: keyof Transaction, direction: number) => {
    return [...transactions].sort((a, b) => {
      switch (field) {
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
  };

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
            <div className="w-full h-[400px]">
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
                    {renderSortButton('income', 'date', 'Date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    {renderSortButton('income', 'source', 'Source')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    {renderSortButton('income', 'description', 'Description')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    {renderSortButton('income', 'amount', 'Amount')}
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
            const trend = calculateTrend(spent, budget);
            
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
                        {renderSortButton('expense', 'date', 'Date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'category', 'Category')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'description', 'Description')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'paymentMethod', 'Payment Method')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        {renderSortButton('expense', 'amount', 'Amount')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {paginatedExpenses.map(expense => (
                      <tr key={expense.id} className="group hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(expense.date)}
                        </td>
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
                  <option value="Cash">Cash</option>
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
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-300 mb-4">
              Are you sure you want to delete this {deleteConfirmation.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmation({ show: false, type: 'expense', id: null })}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
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

import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Expense {
  id?: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
}

export interface Budget {
  id?: string;
  category: string;
  amount: number;
  spent: number;
}

export interface Income {
  id?: string;
  date: string;
  source: string;
  description: string;
  amount: number;
}

export const budgetService = {
  // Add a new expense
  async addExpense(expense: Omit<Expense, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'expenses'), expense);
    return docRef.id;
  },

  // Get all expenses
  async getExpenses(): Promise<Expense[]> {
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[];
  },

  // Get expenses by category
  async getExpensesByCategory(category: string): Promise<Expense[]> {
    const q = query(collection(db, 'expenses'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[];
  },

  // Update an expense
  async updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
    const expenseRef = doc(db, 'expenses', id);
    await updateDoc(expenseRef, expense);
  },

  // Delete an expense
  async deleteExpense(id: string): Promise<void> {
    const expenseRef = doc(db, 'expenses', id);
    await deleteDoc(expenseRef);
  },

  // Add or update a budget category
  async setBudget(budget: Omit<Budget, 'id'>): Promise<string> {
    const q = query(collection(db, 'budgets'), where('category', '==', budget.category));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      const docRef = await addDoc(collection(db, 'budgets'), budget);
      return docRef.id;
    } else {
      const docRef = querySnapshot.docs[0];
      await updateDoc(doc(db, 'budgets', docRef.id), budget);
      return docRef.id;
    }
  },

  // Get all budgets
  async getBudgets(): Promise<Budget[]> {
    const querySnapshot = await getDocs(collection(db, 'budgets'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Budget[];
  },

  // Get all income
  async getIncome(): Promise<Income[]> {
    const querySnapshot = await getDocs(collection(db, 'income'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Income[];
  },

  // Add a new income
  async addIncome(income: Omit<Income, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'income'), income);
    return docRef.id;
  },

  // Update an income
  async updateIncome(id: string, income: Partial<Income>): Promise<void> {
    const incomeRef = doc(db, 'income', id);
    await updateDoc(incomeRef, income);
  },

  // Delete an income
  async deleteIncome(id: string): Promise<void> {
    const incomeRef = doc(db, 'income', id);
    await deleteDoc(incomeRef);
  }
}; 
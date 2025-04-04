import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly STORAGE_KEY = 'expenses';
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  expenses$ = this.expensesSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadExpenses();
    }
  }

  private loadExpenses(): void {
    if (this.isBrowser) {
      const storedExpenses = localStorage.getItem(this.STORAGE_KEY);
      if (storedExpenses) {
        this.expensesSubject.next(JSON.parse(storedExpenses));
      }
    }
  }

  private saveExpenses(expenses: Expense[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses));
    }
    this.expensesSubject.next(expenses);
  }

  getExpenses(): Observable<Expense[]> {
    return this.expenses$;
  }

  addExpense(expense: Expense): void {
    const currentExpenses = this.expensesSubject.value;
    const newExpense = {
      ...expense,
      id: Date.now().toString() // Usando timestamp como ID
    };
    this.saveExpenses([...currentExpenses, newExpense]);
  }

  updateExpense(expense: Expense): void {
    const currentExpenses = this.expensesSubject.value;
    const index = currentExpenses.findIndex(e => e.id === expense.id);
    if (index !== -1) {
      const updatedExpenses = [...currentExpenses];
      updatedExpenses[index] = expense;
      this.saveExpenses(updatedExpenses);
    }
  }

  deleteExpense(id: string): void {
    const currentExpenses = this.expensesSubject.value;
    this.saveExpenses(currentExpenses.filter(expense => expense.id !== id));
  }

  getCategories(): string[] {
    return ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Outros'];
  }
}

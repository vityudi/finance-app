import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly STORAGE_KEY = 'expenses';
  private expensesSubject: BehaviorSubject<Expense[]>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.expensesSubject = new BehaviorSubject<Expense[]>(this.loadExpenses());
  }

  get expenses$(): Observable<Expense[]> {
    return this.expensesSubject.asObservable();
  }

  private loadExpenses(): Expense[] {
    if (isPlatformBrowser(this.platformId)) {
      const storedExpenses = localStorage.getItem(this.STORAGE_KEY);
      if (storedExpenses) {
        const expenses = JSON.parse(storedExpenses);
        // Converter strings de data de volta para objetos Date
        return expenses.map((expense: any) => ({
          ...expense,
          date: new Date(expense.date)
        }));
      }
    }
    return [];
  }

  private saveExpenses(expenses: Expense[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(expenses));
      this.expensesSubject.next(expenses);
    }
  }

  getExpenses(): Observable<Expense[]> {
    return this.expenses$;
  }

  addExpense(expense: Expense): void {
    const expenses = this.expensesSubject.value;
    expenses.push(expense);
    this.saveExpenses(expenses);
  }

  updateExpense(updatedExpense: Expense): void {
    const expenses = this.expensesSubject.value;
    const index = expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
      expenses[index] = updatedExpense;
      this.saveExpenses(expenses);
    }
  }

  deleteExpense(id: string): void {
    const expenses = this.expensesSubject.value;
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    this.saveExpenses(filteredExpenses);
  }

  getCategories(): string[] {
    return ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Outros'];
  }
}

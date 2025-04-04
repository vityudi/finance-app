import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Expense } from '../models/expense.model';
import * as XLSX from 'xlsx';
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

  // Exportar despesas para Excel
  exportToExcel(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const expenses = this.expensesSubject.value;
      
      // Converter para formato Excel
      const worksheet = XLSX.utils.json_to_sheet(expenses.map(expense => ({
        ...expense,
        date: expense.date.toISOString()
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas');
      
      // Fazer o download do arquivo
      XLSX.writeFile(workbook, 'despesas.xlsx');
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
    }
  }

  // Importar despesas de um arquivo Excel
  importFromExcel(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        reject('Importação não suportada no servidor');
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          const expenses = jsonData.map((row: any) => ({
            id: row.id || crypto.randomUUID(),
            description: row.description,
            amount: Number(row.amount),
            date: new Date(row.date),
            category: row.category,
            notes: row.notes
          }));
          
          this.saveExpenses(expenses);
          resolve();
        } catch (error) {
          console.error('Erro ao importar de Excel:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Erro ao ler arquivo:', error);
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
}

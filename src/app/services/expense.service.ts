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

  // Formatar data para o formato DD/MM/YYYY
  private formatDateForExcel(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Converter string de data do formato DD/MM/YYYY para objeto Date
  private parseDateFromExcel(dateStr: any): Date {
    // Se for um número (formato serial do Excel)
    if (typeof dateStr === 'number') {
      // Converter número serial do Excel para data JavaScript
      // O Excel usa 1 de janeiro de 1900 como data base (número 1)
      // JavaScript usa 1 de janeiro de 1970 como data base
      const excelDate = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
      return excelDate;
    }

    // Se for uma string
    if (typeof dateStr === 'string') {
      // Verificar se a data já está no formato ISO
      if (dateStr.includes('T') || dateStr.includes('-')) {
        return new Date(dateStr);
      }
      
      // Tentar converter do formato DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexed em JavaScript
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    
    // Se for um objeto Date
    if (dateStr instanceof Date) {
      return dateStr;
    }
    
    // Fallback para o formato padrão
    return new Date(dateStr);
  }

  // Formatar valor monetário para o formato brasileiro
  private formatCurrencyForExcel(value: number): string {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  }

  // Exportar despesas para Excel
  exportToExcel(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const expenses = this.expensesSubject.value;
      
      // Converter para formato Excel com datas formatadas
      const worksheet = XLSX.utils.json_to_sheet(expenses.map(expense => ({
        id: expense.id,
        descrição: expense.description,
        valor: this.formatCurrencyForExcel(expense.amount),
        data: this.formatDateForExcel(expense.date),
        categoria: expense.category,
        observações: expense.notes || ''
      })));
      
      // Definir largura das colunas
      const columnWidths = [
        { wch: 36 }, // id
        { wch: 30 }, // descrição
        { wch: 15 }, // valor
        { wch: 15 }, // data
        { wch: 20 }, // categoria
        { wch: 30 }  // observações
      ];
      worksheet['!cols'] = columnWidths;
      
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
          
          const expenses = jsonData.map((row: any) => {
            // Extrair o valor numérico da string formatada (R$ X,XX)
            let amount = 0;
            if (typeof row.valor === 'string') {
              // Remover R$ e substituir vírgula por ponto
              const numericValue = row.valor.replace('R$ ', '').replace(',', '.');
              amount = parseFloat(numericValue);
            } else if (typeof row.valor === 'number') {
              amount = row.valor;
            } else if (row.amount) {
              // Fallback para o campo original
              amount = Number(row.amount);
            }
            
            return {
              id: row.id || crypto.randomUUID(),
              description: row.descrição || row.description || '',
              amount: amount,
              date: this.parseDateFromExcel(row.data || row.date),
              category: row.categoria || row.category || '',
              notes: row.observações || row.notes || ''
            };
          });
          
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

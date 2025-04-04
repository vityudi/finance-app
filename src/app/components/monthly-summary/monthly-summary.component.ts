import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';

interface MonthlyTotal {
  monthNumber: number;
  monthName: string;
  total: number;
  count: number;
}

@Component({
  selector: 'app-monthly-summary',
  templateUrl: './monthly-summary.component.html',
  styleUrls: ['./monthly-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, ExpenseModalComponent]
})
export class MonthlySummaryComponent implements OnInit {
  monthlyTotals: MonthlyTotal[] = [];
  currentYear: number = new Date().getFullYear();
  
  // Propriedades para o modal
  isModalOpen = false;
  selectedMonthName = '';
  selectedMonthExpenses: Expense[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadMonthlyTotals();
  }

  loadMonthlyTotals(): void {
    // Inicializa o array com todos os meses
    this.monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      monthNumber: i + 1,
      monthName: this.getMonthName(i),
      total: 0,
      count: 0
    }));

    // Carrega as despesas e calcula os totais
    this.expenseService.getExpenses().subscribe(expenses => {
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getFullYear() === this.currentYear) {
          const monthIndex = expenseDate.getMonth();
          this.monthlyTotals[monthIndex].total += expense.amount;
          this.monthlyTotals[monthIndex].count += 1;
        }
      });
    });
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthIndex];
  }

  isCurrentMonth(monthNumber: number): boolean {
    return monthNumber === new Date().getMonth() + 1;
  }
  
  openMonthModal(month: MonthlyTotal): void {
    this.selectedMonthName = month.monthName;
    this.selectedMonthExpenses = [];
    
    // Filtra as despesas do mês selecionado
    this.expenseService.getExpenses().subscribe(expenses => {
      this.selectedMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === this.currentYear && 
               expenseDate.getMonth() === month.monthNumber - 1;
      });
      
      // Ordena as despesas por data (mais recentes primeiro)
      this.selectedMonthExpenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      this.isModalOpen = true;
    });
  }
  
  closeModal(): void {
    this.isModalOpen = false;
  }
} 
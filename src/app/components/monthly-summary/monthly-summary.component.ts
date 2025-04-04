import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';
import { Subscription } from 'rxjs';

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
export class MonthlySummaryComponent implements OnInit, OnDestroy {
  monthlyTotals: MonthlyTotal[] = [];
  currentYear = new Date().getFullYear();
  private subscription: Subscription;
  
  // Propriedades para o modal
  isModalOpen = false;
  selectedMonthName = '';
  selectedMonthExpenses: Expense[] = [];

  constructor(private expenseService: ExpenseService) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    // Inscrever-se nas mudanças do serviço de despesas
    this.subscription.add(
      this.expenseService.expenses$.subscribe(expenses => {
        this.loadMonthlyTotals(expenses);
      })
    );
  }

  ngOnDestroy(): void {
    // Limpar a inscrição quando o componente for destruído
    this.subscription.unsubscribe();
  }

  private loadMonthlyTotals(expenses: Expense[]): void {
    // Inicializar array com todos os meses
    this.monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      monthNumber: i + 1,
      monthName: this.getMonthName(i),
      total: 0,
      count: 0
    }));

    // Calcular totais para o ano atual
    const currentYearExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === this.currentYear;
    });

    currentYearExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthIndex = expenseDate.getMonth();
      this.monthlyTotals[monthIndex].total += expense.amount;
      this.monthlyTotals[monthIndex].count += 1;
    });
  }

  private getMonthName(monthIndex: number): string {
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
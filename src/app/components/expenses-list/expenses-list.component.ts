import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ExpenseFormComponent]
})
export class ExpensesListComponent implements OnInit {
  expenses: Expense[] = [];
  editingExpense?: Expense;
  showForm = false;

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      this.expenses = expenses.sort((a, b) => b.date.getTime() - a.date.getTime());
    });
  }

  onAddExpense(): void {
    this.editingExpense = undefined;
    this.showForm = true;
  }

  onEditExpense(expense: Expense): void {
    this.editingExpense = expense;
    this.showForm = true;
  }

  async onDeleteExpense(id: string): Promise<void> {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      await this.expenseService.deleteExpense(id);
    }
  }

  async onSubmitExpense(expense: Partial<Expense>): Promise<void> {
    if (this.editingExpense) {
      await this.expenseService.updateExpense(this.editingExpense.id!, expense);
    } else {
      await this.expenseService.addExpense(expense as Omit<Expense, 'id'>);
    }
    this.showForm = false;
    this.editingExpense = undefined;
  }
}

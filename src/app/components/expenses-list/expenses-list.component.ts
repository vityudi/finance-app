import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { ExpenseFormComponent } from '../expense-form/expense-form.component';
import { MonthlySummaryComponent } from '../monthly-summary/monthly-summary.component';
import { ExpenseEditModalComponent } from '../expense-edit-modal/expense-edit-modal.component';

@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ExpenseFormComponent, MonthlySummaryComponent, ExpenseEditModalComponent]
})
export class ExpensesListComponent implements OnInit {
  expenses: Expense[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  totalAmount: number = 0;
  
  // Propriedades para o modal de edição
  isEditModalOpen = false;
  editingExpense: Expense | null = null;

  constructor(private expenseService: ExpenseService) {
    this.categories = this.expenseService.getCategories();
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe(expenses => {
      this.expenses = expenses;
      this.calculateTotal();
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.calculateTotal();
  }

  calculateTotal(): void {
    const filteredExpenses = this.selectedCategory
      ? this.expenses.filter(expense => expense.category === this.selectedCategory)
      : this.expenses;
    
    this.totalAmount = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }

  onEditExpense(expense: Expense): void {
    this.editingExpense = expense;
    this.isEditModalOpen = true;
  }

  deleteExpense(id: string): void {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      this.expenseService.deleteExpense(id);
    }
  }

  onExpenseSaved(): void {
    this.loadExpenses();
  }
  
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingExpense = null;
  }
  
  saveEditedExpense(updatedExpense: Expense): void {
    this.expenseService.updateExpense(updatedExpense);
    this.closeEditModal();
    this.loadExpenses();
  }
}

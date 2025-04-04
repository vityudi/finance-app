import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-modal.component.html',
  styleUrls: ['./expense-modal.component.scss']
})
export class ExpenseModalComponent {
  @Input() isOpen = false;
  @Input() monthName = '';
  @Input() expenses: Expense[] = [];
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }

  getTotalAmount(): number {
    return this.expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
} 
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ExpenseFormComponent implements OnInit {
  @Output() expenseSaved = new EventEmitter<void>();

  expenseForm: FormGroup;
  categories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService
  ) {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      date: ['', Validators.required],
      category: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.categories = this.expenseService.getCategories();
    
    // Definir data padrão como hoje
    this.expenseForm.patchValue({
      date: new Date().toISOString().split('T')[0]
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      
      // Adicionar nova despesa
      this.expenseService.addExpense(formValue);
      
      this.expenseForm.reset();
      this.expenseForm.patchValue({
        date: new Date().toISOString().split('T')[0]
      });
      this.expenseSaved.emit();
    }
  }
}

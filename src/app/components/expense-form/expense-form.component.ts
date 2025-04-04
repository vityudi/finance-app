import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense } from '../../models/expense.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ExpenseFormComponent implements OnInit {
  @Input() expense?: Expense;
  @Output() submitForm = new EventEmitter<Partial<Expense>>();

  expenseForm: FormGroup;
  categories = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Outros'];

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      category: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.expense) {
      this.expenseForm.patchValue({
        ...this.expense,
        date: this.expense.date.toISOString().split('T')[0]
      });
    }
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      this.submitForm.emit({
        ...formValue,
        date: new Date(formValue.date),
        amount: Number(formValue.amount)
      });
      if (!this.expense) {
        this.expenseForm.reset();
      }
    }
  }
}

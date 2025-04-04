import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-expense-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-edit-modal.component.html',
  styleUrls: ['./expense-edit-modal.component.scss']
})
export class ExpenseEditModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() expense: Expense | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveExpense = new EventEmitter<Expense>();
  
  @ViewChild('descriptionInput') descriptionInput!: ElementRef;

  expenseForm: FormGroup;
  categories = [
    'Alimentação', 'Moradia', 'Transporte', 'Saúde', 
    'Educação', 'Lazer', 'Outros'
  ];

  constructor(private fb: FormBuilder) {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      date: ['', Validators.required],
      category: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Inicialização básica do formulário
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Quando a propriedade expense muda ou o modal é aberto
    if ((changes['expense'] && changes['expense'].currentValue) || 
        (changes['isOpen'] && changes['isOpen'].currentValue && this.expense)) {
      this.updateFormWithExpenseData();
      
      // Focar no campo de descrição após o modal ser aberto
      if (changes['isOpen'] && changes['isOpen'].currentValue) {
        setTimeout(() => {
          if (this.descriptionInput) {
            this.descriptionInput.nativeElement.focus();
          }
        }, 100);
      }
    }
  }

  updateFormWithExpenseData(): void {
    if (this.expense) {
      this.expenseForm.patchValue({
        description: this.expense.description,
        amount: this.expense.amount,
        date: this.formatDateForInput(this.expense.date),
        category: this.expense.category,
        notes: this.expense.notes
      });
    }
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.expenseForm.valid && this.expense) {
      const formValue = this.expenseForm.value;
      const updatedExpense: Expense = {
        ...this.expense,
        description: formValue.description,
        amount: formValue.amount,
        date: new Date(formValue.date),
        category: formValue.category,
        notes: formValue.notes
      };
      this.saveExpense.emit(updatedExpense);
    }
  }

  close(): void {
    this.closeModal.emit();
  }
} 
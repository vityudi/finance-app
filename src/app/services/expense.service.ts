import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expensesCollection = 'expenses';

  constructor(private firestore: Firestore) {}

  getExpenses(): Observable<Expense[]> {
    const expensesRef = collection(this.firestore, this.expensesCollection);
    return collectionData(expensesRef, { idField: 'id' }) as Observable<Expense[]>;
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<string> {
    const expensesRef = collection(this.firestore, this.expensesCollection);
    const docRef = await addDoc(expensesRef, {
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<void> {
    const expenseRef = doc(this.firestore, this.expensesCollection, id);
    await updateDoc(expenseRef, {
      ...expense,
      updatedAt: new Date()
    });
  }

  async deleteExpense(id: string): Promise<void> {
    const expenseRef = doc(this.firestore, this.expensesCollection, id);
    await deleteDoc(expenseRef);
  }
}

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  notes?: string;
} 
export interface Invoice {
  id: number;
  customer: string;
  service: string;
  amount: number | string;
  status: string;
  due_date?: string;
  created_at?: string;
}

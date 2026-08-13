import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Expense, ExpenseType } from '@/types/expenses';

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    expenseNumber: row.expense_number as string,
    type: row.type as ExpenseType,
    title: row.title as string,
    description: row.description as string | undefined,
    amount: Number(row.amount) || 0,
    vatAmount: Number(row.vat_amount) || 0,
    total: Number(row.total) || 0,
    paymentMethod: row.payment_method as Expense['paymentMethod'],
    accountName: row.account_name as string | undefined,
    date: row.date as string,
    attachmentUrl: row.attachment_url as string | undefined,
    notes: row.notes as string | undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getExpenses(): Promise<Expense[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });
  if (error) {
    console.error('[Expenses] Fetch error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapExpense);
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('[Expenses] Fetch by ID error:', error.message);
    return null;
  }
  return data ? mapExpense(data) : null;
}

export async function addExpense(data: {
  type: ExpenseType;
  title: string;
  description?: string;
  date: string;
  amount: number;
  vatAmount: number;
  total: number;
  paymentMethod: Expense['paymentMethod'];
  accountName?: string;
  attachmentUrl?: string;
  notes?: string;
  createdBy: string;
}): Promise<Expense | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: row, error } = await client
    .from('expenses')
    .insert({
      type: data.type,
      title: data.title,
      description: data.description || null,
      date: data.date,
      amount: data.amount,
      vat_amount: data.vatAmount,
      total: data.total,
      payment_method: data.paymentMethod,
      account_name: data.accountName || null,
      attachment_url: data.attachmentUrl || null,
      notes: data.notes || null,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) {
    console.error('[Expenses] Insert error:', error.message);
    return null;
  }
  return row ? mapExpense(row) : null;
}

export async function updateExpense(
  id: string,
  updates: Partial<{
    type: ExpenseType;
    title: string;
    description: string | undefined;
    date: string;
    amount: number;
    vatAmount: number;
    total: number;
    paymentMethod: Expense['paymentMethod'];
    accountName: string | undefined;
    notes: string | undefined;
  }>
): Promise<Expense | null> {
  const client = getSupabase();
  if (!client) return null;
  const dbData: Record<string, unknown> = {};
  if (updates.type !== undefined) dbData.type = updates.type;
  if (updates.title !== undefined) dbData.title = updates.title;
  if (updates.description !== undefined) dbData.description = updates.description || null;
  if (updates.date !== undefined) dbData.date = updates.date;
  if (updates.amount !== undefined) dbData.amount = updates.amount;
  if (updates.vatAmount !== undefined) dbData.vat_amount = updates.vatAmount;
  if (updates.total !== undefined) dbData.total = updates.total;
  if (updates.paymentMethod !== undefined) dbData.payment_method = updates.paymentMethod;
  if (updates.accountName !== undefined) dbData.account_name = updates.accountName || null;
  if (updates.notes !== undefined) dbData.notes = updates.notes || null;
  const { data: row, error } = await client
    .from('expenses')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[Expenses] Update error:', error.message);
    return null;
  }
  return row ? mapExpense(row) : null;
}

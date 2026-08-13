import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { UtilityBill, UtilityBillType, UtilityBillStatus, PaymentMethod } from '@/types/utility-bills';

function mapUtilityBill(row: Record<string, unknown>): UtilityBill {
  return {
    id: row.id as string,
    billNumber: row.bill_number as string,
    type: row.type as UtilityBillType,
    provider: row.provider as string,
    providerAccountNumber: row.provider_account_number as string | undefined,
    issueDate: row.issue_date as string,
    dueDate: row.due_date as string,
    amount: Number(row.amount) || 0,
    vatAmount: Number(row.vat_amount) || 0,
    total: Number(row.total) || 0,
    status: row.status as UtilityBillStatus,
    paymentMethod: row.payment_method as PaymentMethod | undefined,
    paidAt: row.paid_at as string | undefined,
    attachmentUrl: row.attachment_url as string | undefined,
    notes: row.notes as string | undefined,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getUtilityBills(): Promise<UtilityBill[]> {
  const client = getSupabase();
  if (!client) return [];
  const { data, error } = await client
    .from('utility_bills')
    .select('*')
    .order('due_date', { ascending: false });
  if (error) {
    console.error('[UtilityBills] Fetch error:', error.message);
    throw new Error(error.message);
  }
  return (data || []).map(mapUtilityBill);
}

export async function getUtilityBillById(id: string): Promise<UtilityBill | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from('utility_bills')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('[UtilityBills] Fetch by ID error:', error.message);
    return null;
  }
  return data ? mapUtilityBill(data) : null;
}

export async function addUtilityBill(data: {
  type: UtilityBillType;
  provider: string;
  providerAccountNumber?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  vatAmount: number;
  total: number;
  status: UtilityBillStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  attachmentUrl?: string;
  notes?: string;
  createdBy: string;
}): Promise<UtilityBill | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: row, error } = await client
    .from('utility_bills')
    .insert({
      type: data.type,
      provider: data.provider,
      provider_account_number: data.providerAccountNumber || null,
      issue_date: data.issueDate,
      due_date: data.dueDate,
      amount: data.amount,
      vat_amount: data.vatAmount,
      total: data.total,
      status: data.status,
      payment_method: data.paymentMethod || null,
      paid_at: data.paidAt || null,
      attachment_url: data.attachmentUrl || null,
      notes: data.notes || null,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) {
    console.error('[UtilityBills] Insert error:', error.message);
    return null;
  }
  return row ? mapUtilityBill(row) : null;
}

export async function updateUtilityBill(
  id: string,
  updates: Partial<{
    type: UtilityBillType;
    provider: string;
    providerAccountNumber: string | undefined;
    issueDate: string;
    dueDate: string;
    amount: number;
    vatAmount: number;
    total: number;
    status: UtilityBillStatus;
    paymentMethod: PaymentMethod | undefined;
    paidAt: string | undefined;
    notes: string | undefined;
  }>
): Promise<UtilityBill | null> {
  const client = getSupabase();
  if (!client) return null;
  const dbData: Record<string, unknown> = {};
  if (updates.type !== undefined) dbData.type = updates.type;
  if (updates.provider !== undefined) dbData.provider = updates.provider;
  if (updates.providerAccountNumber !== undefined) dbData.provider_account_number = updates.providerAccountNumber || null;
  if (updates.issueDate !== undefined) dbData.issue_date = updates.issueDate;
  if (updates.dueDate !== undefined) dbData.due_date = updates.dueDate;
  if (updates.amount !== undefined) dbData.amount = updates.amount;
  if (updates.vatAmount !== undefined) dbData.vat_amount = updates.vatAmount;
  if (updates.total !== undefined) dbData.total = updates.total;
  if (updates.status !== undefined) dbData.status = updates.status;
  if (updates.paymentMethod !== undefined) dbData.payment_method = updates.paymentMethod || null;
  if (updates.paidAt !== undefined) dbData.paid_at = updates.paidAt || null;
  if (updates.notes !== undefined) dbData.notes = updates.notes || null;
  const { data: row, error } = await client
    .from('utility_bills')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[UtilityBills] Update error:', error.message);
    return null;
  }
  return row ? mapUtilityBill(row) : null;
}

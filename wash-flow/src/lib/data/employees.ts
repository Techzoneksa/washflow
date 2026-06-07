import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Employee } from '@/types/employees';

function mapRowToEmployee(row: Record<string, unknown>): Employee {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    nationalId: row.national_id as string,
    nationality: row.nationality as string,
    birthDate: row.birth_date as string,
    joinDate: row.join_date as string,
    jobTitle: row.job_title as string,
    monthlySalary: Number(row.monthly_salary),
    phone: row.phone as string,
    status: row.status as 'active' | 'inactive',
    notes: (row.notes as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getEmployees(): Promise<Employee[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Employees] Fetch error:', error.message);
    return [];
  }

  return (data || []).map(mapRowToEmployee);
}

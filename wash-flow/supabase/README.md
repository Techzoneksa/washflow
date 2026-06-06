# Supabase Database - Wash Flow

## Migration Instructions

### 1. Create Supabase Project
1. Go to https://app.supabase.com
2. Create new project
3. Wait for database to be ready
4. Get your Project URL and anon/public key from Settings → API

### 2. Run Migration
Use Supabase Dashboard → SQL Editor → run the migration file:
```
supabase/migrations/001_initial_schema.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 3. Configure Environment Variables
Create `.env.local` in project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Test Connection
- Build the project: `npm run build`
- If build succeeds, connection is working

## Tables Overview

| Table | Description | Access |
|-------|-------------|--------|
| profiles | User accounts linked to auth.users | All authenticated |
| company_settings | Business configuration | Owner, Manager |
| customers | Car wash customers | All roles |
| services | Wash services offered | All roles (read), Owner/Manager (write) |
| orders | Customer orders | Owner, Manager, Cashier |
| order_items | Items in each order | Owner, Manager, Cashier |
| invoices | Tax invoices | Owner, Manager, Accountant, Cashier |
| suppliers | Supplier/vendors | Owner, Manager, Accountant |
| purchases | Purchase orders | Owner, Manager, Accountant |
| purchase_items | Items in purchases | Owner, Manager, Accountant |
| expenses | Business expenses | Owner, Manager, Accountant |
| utility_bills | Utilities (electricity, water, etc) | Owner, Manager, Accountant |
| employees | Staff records | Owner, Manager |
| employee_advances | Staff advance payments | Owner, Manager, Accountant |
| salary_payments | Salary disbursements | Owner, Accountant |
| inventory_items | Stock/materials | Owner, Manager, Accountant |
| stock_movements | Inventory changes log | Owner, Manager, Accountant |
| audit_logs | System change tracking | Owner, Manager |

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (owner, manager, accountant, cashier)
- No Service Role Key exposed to frontend
- Only NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY used in browser

## Role Permissions Summary

| Feature | Owner | Manager | Accountant | Cashier |
|---------|-------|---------|------------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| POS | ✅ | ✅ | ❌ | ✅ |
| Orders | ✅ | ✅ | ❌ | ✅ |
| Invoices | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ | ✅ |
| Services | ✅ | ✅ | ❌ | ❌ |
| Expenses | ✅ | ✅ | ✅ | ❌ |
| Suppliers | ✅ | ✅ | ✅ | ❌ |
| Purchases | ✅ | ✅ | ✅ | ❌ |
| Inventory | ✅ | ✅ | ✅ | ❌ |
| Employees | ✅ | ✅ | ❌ | ❌ |
| Salaries | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

## Functions

- `get_next_order_number()` - Returns ORD-000001 format
- `get_next_invoice_number(prefix)` - Returns prefixed invoice number
- `update_customer_order_stats()` - Auto-updates customer stats on new order
- `get_user_role()` - Helper to get current user role from profiles

## Triggers

- Auto-update `updated_at` on all tables with `updated_at` column
- Auto-update customer stats when new order is inserted

## Sequences

- `order_number_seq` - For order numbers
- `invoice_number_seq` - For invoice numbers
- `purchase_number_seq` - For purchase numbers
- `expense_number_seq` - For expense numbers
- `utility_bill_number_seq` - For utility bill numbers

## No Seed Data

This migration does NOT include seed data. The database starts empty.
Real data should be entered through the application after deployment.
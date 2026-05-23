'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import InvoicesSummaryCards from './SummaryCards';
import InvoicesFilters from './InvoicesFilters';
import InvoiceDetailsDrawer from './InvoiceDetailsDrawer';
import InvoicePreviewModal from '@/components/pos/InvoicePreviewModal';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { mockInvoices, getInvoicesSummary, filterInvoices, paginateInvoices } from '@/lib/mock-invoices';
import type { PosOrder } from '@/types/pos';
import type { Column } from '@/components/ui/Table';
import { FileText, Eye } from 'lucide-react';

const PAGE_SIZE = 10;

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return <Badge variant="success">مدفوعة</Badge>;
    case 'refunded': return <Badge variant="warning">مستردة</Badge>;
    default: return <Badge variant="neutral">{status}</Badge>;
  }
}

function getPaymentMethodLabelSafe(method: string): string {
  const labels: Record<string, string> = {
    cash: 'نقدي', mada: 'شبكة / مدى', card: 'بطاقة', transfer: 'تحويل', mixed: 'دفع مختلط',
  };
  return labels[method] || method;
}

export default function InvoicesPageShell() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [page, setPage] = useState(1);

  const [selectedInvoice, setSelectedInvoice] = useState<PosOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const filtered = useMemo(
    () => filterInvoices(mockInvoices, { search, status, paymentMethod }),
    [search, status, paymentMethod],
  );

  const paginated = useMemo(
    () => paginateInvoices(filtered, page, PAGE_SIZE),
    [filtered, page],
  );

  const summary = useMemo(() => getInvoicesSummary(filtered), [filtered]);

  const handleRowClick = useCallback((invoice: PosOrder) => {
    setSelectedInvoice(invoice);
    setDrawerOpen(true);
  }, []);

  const handlePreview = useCallback((invoice: PosOrder) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  }, []);

  const handlePrint = useCallback(() => {
    toast('success', 'تم إرسال أمر الطباعة تجريبيًا');
  }, [toast]);

  const columns: Column<PosOrder>[] = [
    {
      key: 'invoiceNumber',
      header: 'رقم الفاتورة',
      render: (inv) => <span className="font-semibold tabular-nums">{inv.invoiceNumber}</span>,
    },
    {
      key: 'orderNumber',
      header: 'رقم الطلب',
      hideOnMobile: true,
      render: (inv) => <span className="tabular-nums">{inv.orderNumber}</span>,
    },
    {
      key: 'items',
      header: 'الخدمات',
      hideOnMobile: true,
      render: (inv) => (
        <span className="text-text-secondary truncate max-w-[120px] block">
          {inv.items.map((i) => i.nameAr).join('، ')}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'الإجمالي',
      render: (inv) => <span className="font-semibold tabular-nums">{formatCurrency(inv.total)}</span>,
      className: 'text-left',
    },
    {
      key: 'vatAmount',
      header: 'ضريبة',
      hideOnMobile: true,
      render: (inv) => <span className="text-text-secondary tabular-nums">{formatCurrency(inv.vatAmount)}</span>,
      className: 'text-left',
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (inv) => getStatusBadge(inv.status),
    },
    {
      key: 'date',
      header: 'التاريخ',
      hideOnMobile: true,
      render: (inv) => <span>{formatDate(inv.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      className: 'text-left',
      render: (inv) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleRowClick(inv)}
            className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlePreview(inv)}
            className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors"
            title="معاينة الفاتورة"
          >
            <FileText className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="الفواتير" description="عرض وإدارة جميع الفواتير" />

      <InvoicesSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <InvoicesFilters
            search={search}
            status={status}
            paymentMethod={paymentMethod}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            onStatusChange={(v) => { setStatus(v); setPage(1); }}
            onPaymentMethodChange={(v) => { setPaymentMethod(v); setPage(1); }}
          />
        </div>

        {paginated.items.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-16 w-16" />}
            title="لا توجد فواتير"
            description="لا توجد فواتير تطابق معايير البحث"
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={paginated.items}
              keyExtractor={(inv) => inv.id}
              onRowClick={handleRowClick}
              mobileCard={(inv) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold tabular-nums">{inv.invoiceNumber}</span>
                    {getStatusBadge(inv.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary truncate max-w-[160px]">
                      {inv.items.map((i) => i.nameAr).join('، ')}
                    </span>
                    <span className="font-bold tabular-nums">{formatCurrency(inv.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{getPaymentMethodLabelSafe(inv.paymentMethod)}</span>
                    <span>{formatDate(inv.createdAt)}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" icon={<Eye className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); handleRowClick(inv); }}>
                      تفاصيل
                    </Button>
                    <Button size="sm" variant="primary" icon={<FileText className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); handlePreview(inv); }}>
                      معاينة
                    </Button>
                  </div>
                </div>
              )}
            />
            <div className="px-4 pb-4">
              <Pagination
                currentPage={page}
                totalPages={paginated.totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <InvoiceDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        invoice={selectedInvoice}
      />

      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setSelectedInvoice(null); }}
        order={selectedInvoice}
        onPrint={handlePrint}
      />
    </>
  );
}

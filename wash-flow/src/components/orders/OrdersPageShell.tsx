'use client';
import { useState, useMemo, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import OrdersSummaryCards from './SummaryCards';
import OrdersFilters from './OrdersFilters';
import OrderDetailsDrawer from './OrderDetailsDrawer';
import CancelOrderModal from './CancelOrderModal';
import RefundOrderModal from './RefundOrderModal';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { mockOrderHistory, getOrdersSummary, filterOrders, paginateOrders } from '@/lib/mock-orders';
import type { OrderHistoryItem } from '@/types/orders';
import type { UserRole } from '@/types';
import type { Column } from '@/components/ui/Table';
import { ClipboardList, Eye, XCircle, RotateCcw } from 'lucide-react';

interface OrdersPageShellProps {
  userRole?: UserRole;
}

const PAGE_SIZE = 10;

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed': return <Badge variant="success">مكتمل</Badge>;
    case 'cancelled': return <Badge variant="danger">ملغي</Badge>;
    case 'refunded': return <Badge variant="warning">مسترد</Badge>;
    default: return <Badge variant="neutral">{status}</Badge>;
  }
}

function getPaymentMethodLabelSafe(method: string): string {
  const labels: Record<string, string> = {
    cash: 'نقدي', mada: 'شبكة / مدى', card: 'بطاقة', transfer: 'تحويل', mixed: 'دفع مختلط',
  };
  return labels[method] || method;
}

export default function OrdersPageShell({ userRole }: OrdersPageShellProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderHistoryItem[]>(mockOrderHistory);

  // Drawer / Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<OrderHistoryItem | null>(null);
  const [refundTarget, setRefundTarget] = useState<OrderHistoryItem | null>(null);

  const canAct = userRole === 'owner' || userRole === 'manager';

  const filtered = useMemo(
    () => filterOrders(orders, { search, status, paymentMethod }),
    [orders, search, status, paymentMethod],
  );

  const paginated = useMemo(
    () => paginateOrders(filtered, page, PAGE_SIZE),
    [filtered, page],
  );

  const summary = useMemo(() => getOrdersSummary(filtered), [filtered]);

  const handleRowClick = useCallback((order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  }, []);

  const handleCancelClick = useCallback((order: OrderHistoryItem) => {
    setCancelTarget(order);
    setCancelModalOpen(true);
  }, []);

  const handleRefundClick = useCallback((order: OrderHistoryItem) => {
    setRefundTarget(order);
    setRefundModalOpen(true);
  }, []);

  const handleConfirmCancel = useCallback((orderId: string, reason: string) => {
    const session = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('wf_session') || 'null') : null;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled' as const,
              cancelledData: {
                reason,
                cancelledBy: session?.user?.name || 'مالك النظام',
                cancelledAt: new Date().toISOString(),
              },
            }
          : o,
      ),
    );
    setCancelModalOpen(false);
    setCancelTarget(null);
    setDrawerOpen(false);
    toast('success', 'تم إلغاء الطلب بنجاح');
  }, [toast]);

  const handleConfirmRefund = useCallback((orderId: string, reason: string, amount: number) => {
    const session = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('wf_session') || 'null') : null;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'refunded' as const,
              refundedData: {
                reason,
                refundAmount: amount,
                refundedBy: session?.user?.name || 'مالك النظام',
                refundedAt: new Date().toISOString(),
              },
            }
          : o,
      ),
    );
    setRefundModalOpen(false);
    setRefundTarget(null);
    setDrawerOpen(false);
    toast('success', 'تم استرداد الطلب بنجاح');
  }, [toast]);

  const columns: Column<OrderHistoryItem>[] = [
    {
      key: 'orderNumber',
      header: 'رقم الطلب',
      render: (order) => <span className="font-semibold tabular-nums">{order.orderNumber}</span>,
    },
    {
      key: 'items',
      header: 'الخدمات',
      hideOnMobile: true,
      render: (order) => (
        <span className="text-text-secondary truncate max-w-[120px] block">
          {order.items.map((i) => i.nameAr).join('، ')}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'الإجمالي',
      render: (order) => <span className="font-semibold tabular-nums">{formatCurrency(order.total)}</span>,
      className: 'text-left',
    },
    {
      key: 'paymentMethod',
      header: 'طريقة الدفع',
      hideOnMobile: true,
      render: (order) => <span className="text-text-secondary">{getPaymentMethodLabelSafe(order.paymentMethod)}</span>,
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (order) => getStatusBadge(order.status),
    },
    {
      key: 'date',
      header: 'التاريخ',
      hideOnMobile: true,
      render: (order) => (
        <div className="text-xs">
          <p className="text-text-primary">{formatDate(order.createdAt)}</p>
          <p className="text-text-secondary">{formatTime(order.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'الإجراءات',
      className: 'text-left',
      render: (order) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleRowClick(order)}
            className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-primary-600 transition-colors"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canAct && order.status === 'completed' && (
            <>
              <button
                onClick={() => handleCancelClick(order)}
                className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-danger-600 transition-colors"
                title="إلغاء"
              >
                <XCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRefundClick(order)}
                className="p-1.5 rounded-md hover:bg-bg-hover text-text-secondary hover:text-warning-600 transition-colors"
                title="استرداد"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="الطلبات" description="إدارة ومتابعة جميع الطلبات" />

      <OrdersSummaryCards data={summary} />

      <div className="bg-bg-surface border border-border-default rounded-card">
        <div className="p-4 pb-0">
          <OrdersFilters
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
            icon={<ClipboardList className="h-16 w-16" />}
            title="لا توجد طلبات"
            description="لا توجد طلبات تطابق معايير البحث"
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={paginated.items}
              keyExtractor={(o) => o.id}
              onRowClick={handleRowClick}
              mobileCard={(order) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold tabular-nums">{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary truncate max-w-[160px]">
                      {order.items.map((i) => i.nameAr).join('، ')}
                    </span>
                    <span className="font-bold tabular-nums">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{getPaymentMethodLabelSafe(order.paymentMethod)}</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  {canAct && order.status === 'completed' && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="danger" icon={<XCircle className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); handleCancelClick(order); }}>
                        إلغاء
                      </Button>
                      <Button size="sm" variant="outline" icon={<RotateCcw className="h-3 w-3" />} onClick={(e) => { e.stopPropagation(); handleRefundClick(order); }}>
                        استرداد
                      </Button>
                    </div>
                  )}
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

      <OrderDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
        userRole={userRole}
        onCancel={(order) => { setDrawerOpen(false); handleCancelClick(order); }}
        onRefund={(order) => { setDrawerOpen(false); handleRefundClick(order); }}
      />

      <CancelOrderModal
        open={cancelModalOpen}
        onClose={() => { setCancelModalOpen(false); setCancelTarget(null); }}
        order={cancelTarget}
        onConfirm={handleConfirmCancel}
      />

      <RefundOrderModal
        open={refundModalOpen}
        onClose={() => { setRefundModalOpen(false); setRefundTarget(null); }}
        order={refundTarget}
        onConfirm={handleConfirmRefund}
      />
    </>
  );
}

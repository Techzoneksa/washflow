'use client';
import { useState, useCallback, useMemo } from 'react';
import OrderSuccessModal from './OrderSuccessModal';
import InvoicePreviewModal from './InvoicePreviewModal';
import BottomSheet from '@/components/ui/BottomSheet';
import { useToast } from '@/components/ui/Toast';
import {
  addToCart, updateCartQuantity, removeFromCart,
  createMockOrder, calculateCartTotals,
  serviceCategories,
  getServiceIcon,
} from '@/lib/mock-pos';
import { getPOSWashServices } from '@/lib/mock-services';
import { formatCurrency } from '@/lib/utils';
import type {
  WashService, CartItem as CartItemType,
  PosCustomerInfo, PaymentMethod, MixedPayment, PosOrder,
} from '@/types/pos';
import {
  ShoppingCart, Search, X, Clock, Check,
  Minus, Plus, Trash2,
} from 'lucide-react';

export default function PosShell() {
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [customerInfo, setCustomerInfo] = useState<PosCustomerInfo>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [mixedPayment, setMixedPayment] = useState<MixedPayment>({ cash: 0, card: 0, transfer: 0 });

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PosOrder | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const [showCartSheet, setShowCartSheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const cartServiceIds = new Set(cartItems.map(i => i.serviceId));
  const cartTotals = calculateCartTotals(cartItems);

  const filteredServices = useMemo(() => {
    let result = getPOSWashServices();
    if (activeCategory !== 'الكل') {
      result = result.filter(s => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s => s.nameAr.includes(q) || s.category.includes(q));
    }
    return result;
  }, [activeCategory, searchQuery]);

  const handleAddService = useCallback((service: WashService) => {
    setCartItems(prev => addToCart(prev, service));
  }, []);

  const handleUpdateQuantity = useCallback((serviceId: string, quantity: number) => {
    setCartItems(prev => updateCartQuantity(prev, serviceId, quantity));
  }, []);

  const handleRemoveItem = useCallback((serviceId: string) => {
    setCartItems(prev => removeFromCart(prev, serviceId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCustomerInfo({});
    setPaymentMethod(null);
    setMixedPayment({ cash: 0, card: 0, transfer: 0 });
  }, []);

  const handleCompleteOrder = useCallback(() => {
    if (cartItems.length === 0) return;
    if (!paymentMethod) return;

    const isMixedValid = paymentMethod !== 'mixed' ||
      Math.abs((mixedPayment.cash || 0) + (mixedPayment.card || 0) + (mixedPayment.transfer || 0) - cartTotals.total) < 0.01;
    if (!isMixedValid) return;

    setSubmitting(true);

    setTimeout(() => {
      const order = createMockOrder(cartItems, paymentMethod, customerInfo, mixedPayment);
      setCompletedOrder(order);
      setSubmitting(false);
      setShowSuccess(true);
      setShowCartSheet(false);
    }, 800);
  }, [cartItems, paymentMethod, mixedPayment, customerInfo, cartTotals.total]);

  const handleNewOrder = useCallback(() => {
    setShowSuccess(false);
    setShowInvoice(false);
    setCompletedOrder(null);
    setCartItems([]);
    setCustomerInfo({});
    setPaymentMethod(null);
    setMixedPayment({ cash: 0, card: 0, transfer: 0 });
  }, []);

  const handlePrint = useCallback(() => {
    toast('success', 'تم إرسال أمر الطباعة تجريبيًا');
  }, [toast]);

  const handleViewInvoice = useCallback(() => {
    setShowInvoice(true);
  }, []);

  // cartPanelProps removed — using inline JSX

  return (
    <div dir="rtl" className="flex h-screen bg-[#F8F9FA] overflow-hidden">

      {/* ===== LEFT PANEL: Services (60% tablet, 65% desktop) ===== */}
      <div className="flex flex-col h-full flex-1 min-w-0 lg:flex-[13]">

        {/* Category Tabs */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {serviceCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                    : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1A1A2E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="shrink-0 px-4 pb-3">
          <div className="relative">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7280]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <input
              type="text"
              placeholder="بحث عن خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EEEEEE] bg-white text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-[#1A1A2E]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-5xl mb-3">🔍</span>
              <p className="text-sm text-[#6B7280]">لا توجد خدمات مطابقة</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((service) => {
                const isAdded = cartServiceIds.has(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => handleAddService(service)}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-white transition-all active:scale-95 ${
                      isAdded
                        ? 'border-[#1A1A2E] shadow-md'
                        : 'border-[#EEEEEE] hover:border-[#1A1A2E] hover:scale-[1.02]'
                    }`}
                  >
                    <span className="text-4xl">{getServiceIcon(service.icon)}</span>
                    <span className="text-sm font-medium text-[#111827] text-center leading-tight">{service.nameAr}</span>
                    <span className="text-base font-bold text-[#111827]">{formatCurrency(service.price)}</span>
                    <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <Clock className="h-3 w-3" />
                      {service.duration}
                    </span>
                    {isAdded && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT PANEL: Order (40% tablet, 35% desktop) ===== */}
      <div className="h-full w-[340px] lg:w-[380px] xl:w-[420px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col">

        {/* Order Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#2563EB]" />
            <span className="text-base font-semibold text-[#111827]">سلة الطلب</span>
            <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">{cartItems.length}</span>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs text-[#EF4444] hover:text-[#DC2626] transition-colors"
            >
              تفريغ
            </button>
          )}
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart className="h-12 w-12 text-[#D1D5DB] mb-3" />
              <p className="text-sm text-[#6B7280]">السلة فارغة</p>
              <p className="text-xs text-[#9CA3AF] mt-1">أضف خدمة للبدء</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.serviceId} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                  <button
                    onClick={() => handleUpdateQuantity(item.serviceId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#1A1A2E] hover:text-[#111827] transition-colors shrink-0"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold text-[#111827] w-6 text-center tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.serviceId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#1A1A2E] hover:text-[#111827] transition-colors shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-[#111827] truncate">{item.nameAr}</p>
                    <p className="text-xs text-[#6B7280]">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-sm font-bold text-[#111827] tabular-nums">{formatCurrency(item.total)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.serviceId)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#EF4444] hover:bg-[#FEF2F2] transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        {cartItems.length > 0 && (
          <div className="shrink-0 px-5 py-4 border-t border-[#E5E7EB] space-y-2">
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>المجموع</span>
              <span className="tabular-nums">{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#6B7280]">
              <span>ضريبة 15%</span>
              <span className="tabular-nums">{formatCurrency(cartTotals.vatAmount)}</span>
            </div>
            <div className="border-t border-[#E5E7EB] pt-2 flex justify-between">
              <span className="text-base font-semibold text-[#111827]">الإجمالي</span>
              <span className="text-lg font-bold text-[#111827] tabular-nums">{formatCurrency(cartTotals.total)}</span>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {cartItems.length > 0 && (
          <div className="shrink-0 px-5 pb-3">
            <div className="flex gap-2">
              {(['cash', 'card', 'transfer'] as const).map((method) => {
                const labels = { cash: 'نقداً', card: 'بطاقة', transfer: 'STC Pay' };
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#1A1A2E]'
                    }`}
                  >
                    {labels[method]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Complete Order Button */}
        <div className="shrink-0 px-5 pb-5">
          <button
            onClick={handleCompleteOrder}
            disabled={cartItems.length === 0 || !paymentMethod || submitting}
            className={`w-full h-[52px] rounded-xl text-base font-bold transition-all ${
              cartItems.length > 0 && paymentMethod && !submitting
                ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:scale-[0.98]'
                : 'bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
            }`}
          >
            {submitting ? 'جاري...' : 'إتمام الطلب'}
          </button>
        </div>
      </div>

      {/* ===== MOBILE: Cart FAB + Bottom Sheet ===== */}
      <div className="md:hidden">
        {cartItems.length > 0 && (
          <>
            <button
              onClick={() => setShowCartSheet(true)}
              className="fixed bottom-20 left-4 right-4 z-40 h-14 bg-[#2563EB] text-white rounded-xl shadow-lg flex items-center justify-between px-5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[#2563EB] text-xs font-bold flex items-center justify-center">
                    {cartItems.length}
                  </span>
                </div>
                <span className="font-semibold text-sm">عرض السلة</span>
              </div>
              <span className="font-bold tabular-nums">{formatCurrency(cartTotals.total)}</span>
            </button>
          </>
        )}

        <BottomSheet open={showCartSheet} onClose={() => setShowCartSheet(false)} height="full" title="سلة الطلب">
          <div className="flex flex-col h-full -mx-4 -mb-4">
            {/* Mobile Order Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cartItems.map((item) => (
                <div key={item.serviceId} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                  <button
                    onClick={() => handleUpdateQuantity(item.serviceId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] shrink-0"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-[#111827] w-8 text-center tabular-nums">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.serviceId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-[#111827] truncate">{item.nameAr}</p>
                    <p className="text-xs text-[#6B7280]">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-sm font-bold text-[#111827] tabular-nums">{formatCurrency(item.total)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.serviceId)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#EF4444] shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mobile Price Breakdown */}
            {cartItems.length > 0 && (
              <div className="shrink-0 px-4 py-4 border-t border-[#E5E7EB] space-y-2">
                <div className="flex justify-between text-sm text-[#6B7280]">
                  <span>المجموع</span>
                  <span className="tabular-nums">{formatCurrency(cartTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#6B7280]">
                  <span>ضريبة 15%</span>
                  <span className="tabular-nums">{formatCurrency(cartTotals.vatAmount)}</span>
                </div>
                <div className="border-t border-[#E5E7EB] pt-2 flex justify-between">
                  <span className="text-base font-semibold text-[#111827]">الإجمالي</span>
                  <span className="text-lg font-bold text-[#111827] tabular-nums">{formatCurrency(cartTotals.total)}</span>
                </div>
              </div>
            )}

            {/* Mobile Payment Method */}
            {cartItems.length > 0 && (
              <div className="shrink-0 px-4 pb-3">
                <div className="flex gap-2">
                  {(['cash', 'card', 'transfer'] as const).map((method) => {
                    const labels = { cash: 'نقداً', card: 'بطاقة', transfer: 'STC Pay' };
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-white text-[#6B7280] border-[#E5E7EB]'
                        }`}
                      >
                        {labels[method]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile Complete Button */}
            <div className="shrink-0 px-4 pb-4">
              <button
                onClick={handleCompleteOrder}
                disabled={cartItems.length === 0 || !paymentMethod || submitting}
                className={`w-full h-[52px] rounded-xl text-base font-bold transition-all ${
                  cartItems.length > 0 && paymentMethod && !submitting
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                {submitting ? 'جاري...' : 'إتمام الطلب'}
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>

      {/* ===== Modals ===== */}
      <OrderSuccessModal
        open={showSuccess}
        order={completedOrder}
        onPrint={handlePrint}
        onViewInvoice={handleViewInvoice}
        onNewOrder={handleNewOrder}
      />

      <InvoicePreviewModal
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        order={completedOrder}
        onPrint={handlePrint}
      />
    </div>
  );
}
'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import OrderSuccessModal from './OrderSuccessModal';
import InvoicePreviewModal from './InvoicePreviewModal';
import MixedPaymentForm from './MixedPaymentForm';
import BottomSheet from '@/components/ui/BottomSheet';
import { useToast } from '@/components/ui/Toast';
import {
  addToCart, updateCartQuantity, removeFromCart,
  calculateCartTotals,
  serviceCategories,
  getServiceIcon,
} from '@/lib/mock-pos';
import { createPOSOrder } from '@/lib/data/orders';
import { getPOSWashServices } from '@/lib/data/services';
import { Money } from '@/lib/format';
import {
  getCustomerByPhone as getCustomerByPhoneReal,
} from '@/lib/data/customers';
import type { Customer } from '@/types/customers';
import type {
  WashService, CartItem as CartItemType,
  PosCustomerInfo, PaymentMethod, MixedPayment, PosOrder,
} from '@/types/pos';
import {
  ShoppingCart, Search, X, Clock, Check,
  Minus, Plus, Trash2, UserRound, Phone,
} from 'lucide-react';

export default function PosShell() {
  const { toast } = useToast();

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [customerInfo, setCustomerInfo] = useState<PosCustomerInfo>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [mixedPayment, setMixedPayment] = useState<MixedPayment>({ cash: 0, network: 0 });

  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PosOrder | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const [showCartSheet, setShowCartSheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const [customerSearchPhone, setCustomerSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const cartServiceIds = new Set(cartItems.map(i => i.serviceId));
  const cartTotals = calculateCartTotals(cartItems);
  const isMixedValid = paymentMethod !== 'mixed' ||
    Math.abs((mixedPayment.cash || 0) + (mixedPayment.network || 0) - cartTotals.total) < 0.01;

  const [allServices, setAllServices] = useState<WashService[]>([]);

  useEffect(() => {
    getPOSWashServices().then((data) => {
      setAllServices(data);
    });
  }, []);

  const filteredServices = useMemo(() => {
    let result = allServices;
    if (activeCategory !== 'الكل') {
      result = result.filter(s => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s => s.nameAr.includes(q) || s.category.includes(q));
    }
    return result;
  }, [allServices, activeCategory, searchQuery]);

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
    setMixedPayment({ cash: 0, network: 0 });
    setSelectedCustomer(null);
    setCustomerSearchPhone('');
  }, []);

  const handleCompleteOrder = useCallback(async () => {
    if (cartItems.length === 0) return;
    if (!paymentMethod) return;

    const isMixedValid = paymentMethod !== 'mixed' ||
      Math.abs((mixedPayment.cash || 0) + (mixedPayment.network || 0) - cartTotals.total) < 0.01;
    if (!isMixedValid) return;

    setSubmitting(true);

    const cashAmount = paymentMethod === 'cash' ? cartTotals.total : (paymentMethod === 'mixed' ? (mixedPayment.cash || 0) : 0);
    const networkAmount = paymentMethod === 'network' ? cartTotals.total : (paymentMethod === 'mixed' ? (mixedPayment.network || 0) : 0);

    const result = await createPOSOrder(
      cartItems,
      selectedCustomer?.id || null,
      selectedCustomer?.name || customerInfo.name || null,
      selectedCustomer?.phone || customerInfo.phone || null,
      paymentMethod,
      cashAmount,
      networkAmount,
      cartTotals.total,
      cartTotals.subtotal,
    );

    if (!result) {
      toast('error', 'فشل حفظ الطلب. تحقق من اتصال قاعدة البيانات');
      setSubmitting(false);
      return;
    }

    const order: PosOrder = {
      id: result.orderId,
      orderNumber: result.orderNumber,
      invoiceNumber: result.invoiceNumber,
      items: cartItems.map(i => ({ ...i })),
      customer: selectedCustomer
        ? { customerId: selectedCustomer.id, name: selectedCustomer.name, phone: selectedCustomer.phone }
        : customerInfo.name ? { ...customerInfo } : undefined,
      subtotal: cartTotals.subtotal,
      vatAmount: cartTotals.vatAmount,
      vatRate: cartTotals.vatRate,
      total: cartTotals.total,
      paymentMethod,
      mixedPayment: paymentMethod === 'mixed' ? { ...mixedPayment } : undefined,
      cashAmount,
      networkAmount,
      status: 'completed',
      cashierName: result.cashierName,
      cashierRole: result.cashierRole,
      createdAt: new Date().toISOString(),
    };
    setCompletedOrder(order);

    setSubmitting(false);
    setShowSuccess(true);
    setShowCartSheet(false);
  }, [cartItems, paymentMethod, mixedPayment, customerInfo, cartTotals, selectedCustomer, toast]);

  const handleNewOrder = useCallback(() => {
    setShowSuccess(false);
    setShowInvoice(false);
    setCompletedOrder(null);
    setCartItems([]);
    setCustomerInfo({});
    setPaymentMethod(null);
    setMixedPayment({ cash: 0, network: 0 });
    setSelectedCustomer(null);
    setCustomerSearchPhone('');
  }, []);

  const handlePrint = useCallback(() => {
    toast('success', 'تم إرسال أمر الطباعة تجريبيًا');
  }, [toast]);

  const handleViewInvoice = useCallback(() => {
    setShowInvoice(true);
  }, []);

  const handleSearchCustomer = useCallback((phone: string) => {
    setCustomerSearchPhone(phone);
    if (!phone.trim()) {
      setSelectedCustomer(null);
      return;
    }
    getCustomerByPhoneReal(phone).then((found) => {
      setSelectedCustomer(found || null);
    });
  }, []);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    setCustomerSearchPhone('');
  }, []);

  // cartPanelProps removed — using inline JSX

  return (
    <>
      {/* ===== MOBILE LAYOUT (< 640px): Full width services + FAB + Bottom Sheet ===== */}
      <div className="sm:hidden flex flex-col h-full bg-bg-main">

        {/* Category Tabs */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {serviceCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#111827] text-white border-[#111827]'
                    : 'bg-white text-[#6B7280] border-[#E5E7EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="shrink-0 px-4 pb-3">
          <div className="relative">
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7280]">
                <X className="h-4 w-4" />
              </button>
            )}
            <input
              type="text"
              placeholder="بحث عن خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EEEEEE] bg-white text-sm text-[#111827] placeholder:text-[#6B7280]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
          </div>
        </div>

        {/* Service Grid - full width, scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="grid grid-cols-2 gap-3">
            {filteredServices.map((service) => {
              const isAdded = cartServiceIds.has(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => handleAddService(service)}
                  className={`relative flex flex-col items-center justify-center gap-1 p-4 rounded-xl border bg-white transition-all active:scale-95 ${
                    isAdded ? 'border-[#111827] shadow-md' : 'border-[#EEEEEE]'
                  }`}
                >
                  <span className="text-3xl">{getServiceIcon(service.icon)}</span>
                  <span className="text-xs font-medium text-[#111827] text-center leading-tight">{service.nameAr}</span>
                  <span className="text-sm font-bold text-[#111827]"><Money value={service.price} /></span>
                  <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Clock className="h-3 w-3" />
                    {service.duration}
                  </span>
                  {isAdded && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary-500 text-white flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cart FAB */}
        {cartItems.length > 0 && (
          <button
            onClick={() => setShowCartSheet(true)}
            className="fixed bottom-20 left-4 right-4 z-40 h-14 bg-primary-500 text-white rounded-xl shadow-lg flex items-center justify-between px-5"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-primary-500 text-xs font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              </div>
              <span className="font-semibold text-sm">عرض السلة</span>
            </div>
            <span className="font-bold tabular-nums"><Money value={cartTotals.total} /></span>
          </button>
        )}

        {/* Bottom Sheet */}
        <BottomSheet open={showCartSheet} onClose={() => setShowCartSheet(false)} height="full" title="سلة الطلب">
          <div className="flex max-h-[85dvh] min-h-0 flex-col overflow-hidden">
            <div className="shrink-0 px-4 py-3 border-b border-[#E5E7EB]">
              {selectedCustomer ? (
                <div className="flex items-center gap-2 p-2 bg-success-50 rounded-lg">
                  <UserRound className="h-4 w-4 text-success-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-success-700 truncate">
                      {selectedCustomer.name || 'عميل'}
                    </p>
                    {selectedCustomer.phone && (
                      <p className="text-xs text-success-600">{selectedCustomer.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={handleClearCustomer}
                    className="p-1 text-success-500 hover:text-success-700 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="رقم جوال العميل (اختياري)"
                    value={customerSearchPhone}
                    onChange={(e) => handleSearchCustomer(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#EEEEEE] bg-[#F9FAFB] text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
              {cartItems.map((item) => (
                <div key={item.serviceId} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                  <button onClick={() => handleUpdateQuantity(item.serviceId, item.quantity - 1)} className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] shrink-0">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-semibold text-[#111827] w-8 text-center tabular-nums">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.serviceId, item.quantity + 1)} className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] shrink-0">
                    <Plus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-[#111827] truncate">{item.nameAr}</p>
                    <p className="text-xs text-[#6B7280]"><Money value={item.price} /></p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-sm font-bold text-[#111827] tabular-nums"><Money value={item.total} /></p>
                  </div>
                  <button onClick={() => handleRemoveItem(item.serviceId)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#EF4444] shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-[#E5E7EB] bg-white">
              {cartItems.length > 0 && (
                <>
                  <div className="px-4 py-4 space-y-2">
                    <div className="flex justify-between text-sm text-[#6B7280]">
                      <span>المجموع</span>
<span className="tabular-nums"><Money value={cartTotals.subtotal} /></span>
                    </div>
                    
                    <div className="border-t border-[#E5E7EB] pt-2 flex justify-between">
                      <span className="text-base font-semibold text-[#111827]">الإجمالي</span>
<span className="text-lg font-bold text-[#111827] tabular-nums"><Money value={cartTotals.total} /></span>
                    </div>
                  </div>
                  <div className="px-4 pb-3">
                    <div className="flex gap-2">
                      {(['cash', 'network', 'mixed'] as const).map((method) => {
                        const labels = { cash: 'كاش', network: 'شبكة', mixed: 'تخصيص' };
                        return (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                              paymentMethod === method ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-[#6B7280] border-[#E5E7EB]'
                            }`}
                          >
                            {labels[method]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {paymentMethod === 'mixed' && (
                    <div className="px-4 pb-2">
                      <MixedPaymentForm
                        total={cartTotals.total}
                        value={mixedPayment}
                        onChange={setMixedPayment}
                      />
                    </div>
                  )}
                  {paymentMethod === 'mixed' && !isMixedValid && (
                    <div className="px-4 pb-2">
                      <p className="text-xs text-danger-600 text-center">
                        مجموع الكاش والشبكة يجب أن يساوي إجمالي الطلب
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="px-4 pb-4">
                <button
                  onClick={handleCompleteOrder}
                  disabled={cartItems.length === 0 || !paymentMethod || submitting}
                  className={`w-full h-[52px] rounded-xl text-base font-bold ${
                    cartItems.length > 0 && paymentMethod && !submitting ? 'bg-primary-500 text-white' : 'bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'جاري...' : 'إتمام الطلب'}
                </button>
              </div>
            </div>
          </div>
        </BottomSheet>
      </div>

      {/* ===== TABLET+ LAYOUT (>= 640px): Split view ===== */}
      <div className="hidden sm:flex h-full bg-bg-main">

        {/* LEFT: Services */}
        <div className="flex flex-col h-full flex-1 min-w-0 lg:flex-[13]">
          <div className="shrink-0 px-4 pt-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {serviceCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                    activeCategory === cat ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111827]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="shrink-0 px-4 pb-3">
            <div className="relative">
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7280]">
                  <X className="h-4 w-4" />
                </button>
              )}
              <input
                type="text"
                placeholder="بحث عن خدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EEEEEE] bg-white text-sm text-[#111827] placeholder:text-[#6B7280]"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((service) => {
                const isAdded = cartServiceIds.has(service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => handleAddService(service)}
                    className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border bg-white transition-all active:scale-95 ${
                      isAdded ? 'border-[#111827] shadow-md' : 'border-[#EEEEEE] hover:border-[#111827] hover:scale-[1.02]'
                    }`}
                  >
                    <span className="text-4xl">{getServiceIcon(service.icon)}</span>
                    <span className="text-sm font-medium text-[#111827] text-center leading-tight">{service.nameAr}</span>
                    <span className="text-base font-bold text-[#111827]"><Money value={service.price} /></span>
                    <span className="flex items-center gap-1 text-xs text-[#6B7280]">
                      <Clock className="h-3 w-3" />
                      {service.duration}
                    </span>
                    {isAdded && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center shadow">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Order Panel */}
        <div className="h-full min-h-0 w-[340px] lg:w-[380px] xl:w-[420px] shrink-0 overflow-hidden">
          <div className="h-full min-h-0 flex flex-col overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary-500" />
              <span className="text-base font-semibold text-[#111827]">سلة الطلب</span>
              <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full">{cartItems.length}</span>
            </div>
            {cartItems.length > 0 && (
              <button onClick={handleClearCart} className="text-xs text-[#EF4444] hover:text-[#DC2626] transition-colors">تفريغ</button>
            )}
          </div>
          <div className="shrink-0 px-5 py-3 border-b border-[#E5E7EB]">
            {selectedCustomer ? (
              <div className="flex items-center gap-2 p-2 bg-success-50 rounded-lg">
                <UserRound className="h-4 w-4 text-success-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-success-700 truncate">
                    {selectedCustomer.name || 'عميل'}
                  </p>
                  {selectedCustomer.phone && (
                    <p className="text-xs text-success-600">{selectedCustomer.phone}</p>
                  )}
                </div>
                <button
                  onClick={handleClearCustomer}
                  className="p-1 text-success-500 hover:text-success-700 shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
                <input
                  type="tel"
                  placeholder="رقم جوال العميل (اختياري)"
                  value={customerSearchPhone}
                  onChange={(e) => handleSearchCustomer(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#EEEEEE] bg-[#F9FAFB] text-sm text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:border-primary-500"
                />
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-3">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <ShoppingCart className="h-12 w-12 text-[#D1D5DB] mb-3" />
                <p className="text-sm text-[#6B7280]">السلة فارغة</p>
                <p className="text-xs text-[#9CA3AF] mt-1">أضف خدمة للبدء</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.serviceId} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl">
                    <button onClick={() => handleUpdateQuantity(item.serviceId, item.quantity - 1)} className="w-7 h-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#111827] transition-colors shrink-0">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold text-[#111827] w-6 text-center tabular-nums">{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.serviceId, item.quantity + 1)} className="w-7 h-7 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#111827] transition-colors shrink-0">
                      <Plus className="h-3 w-3" />
                    </button>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-medium text-[#111827] truncate">{item.nameAr}</p>
<p className="text-xs text-[#6B7280]"><Money value={item.price} /></p>
                    </div>
                    <div className="text-left shrink-0">
<p className="text-sm font-bold text-[#111827] tabular-nums"><Money value={item.total} /></p>
                    </div>
                    <button onClick={() => handleRemoveItem(item.serviceId)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#EF4444] hover:bg-[#FEF2F2] transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white">
            {cartItems.length > 0 && (
              <>
                <div className="px-5 py-4 space-y-2">
                  <div className="flex justify-between text-sm text-[#6B7280]">
                    <span>المجموع</span>
                    <span className="tabular-nums"><Money value={cartTotals.subtotal} /></span>
                  </div>
<div className="border-t border-[#E5E7EB] pt-2 flex justify-between">
                    <span className="text-base font-semibold text-[#111827]">الإجمالي</span>
                    <span className="text-lg font-bold text-[#111827] tabular-nums"><Money value={cartTotals.total} /></span>
                  </div>
                </div>
                <div className="px-5 pb-3">
                  <div className="flex gap-2">
                    {(['cash', 'network', 'mixed'] as const).map((method) => {
                      const labels = { cash: 'كاش', network: 'شبكة', mixed: 'تخصيص' };
                      return (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                            paymentMethod === method ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111827]'
                          }`}
                        >
                          {labels[method]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {paymentMethod === 'mixed' && !isMixedValid && (
                  <div className="px-5 pb-2">
                    <p className="text-xs text-danger-600 text-center">
                      مجموع الكاش والشبكة يجب أن يساوي إجمالي الطلب
                    </p>
                  </div>
                )}
              </>
            )}
            <div className="px-5 pb-5">
              <button
                onClick={handleCompleteOrder}
                disabled={cartItems.length === 0 || !paymentMethod || submitting}
                className={`w-full h-[52px] rounded-xl text-base font-bold transition-all ${
                  cartItems.length > 0 && paymentMethod && !submitting ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]' : 'bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                {submitting ? 'جاري...' : 'إتمام الطلب'}
              </button>
            </div>
          </div>
        </div>
        </div>
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
    </>
  );
}
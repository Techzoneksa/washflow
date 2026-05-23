'use client';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState, { CardSkeleton } from '@/components/ui/LoadingState';
import { InlineAlert } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';

export default function StatusPreview() {
  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-6">حالات النظام</h2>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">حالات (Badges)</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">مكتمل</Badge>
          <Badge variant="primary">جديد</Badge>
          <Badge variant="info">قيد التنفيذ</Badge>
          <Badge variant="danger">ملغي</Badge>
          <Badge variant="warning">مسترد</Badge>
          <Badge variant="success">مدفوع</Badge>
          <Badge variant="danger">غير مدفوع</Badge>
          <Badge variant="warning">مدفوع جزئيًا</Badge>
          <Badge variant="warning">متأخر</Badge>
          <Badge variant="success">نشط</Badge>
          <Badge variant="neutral">غير نشط</Badge>
          <Badge variant="neutral" dot>زاتكا غير مفعلة</Badge>
        </div>
      </div>

      {/* Empty States */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">حالات عدم وجود بيانات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <EmptyState
              title="لا توجد طلبات اليوم"
              description="لم يتم تسجيل أي طلبات حتى الآن"
            />
          </Card>
          <Card>
            <EmptyState
              title="لا توجد مصاريف"
              description="لم يتم تسجيل أي مصاريف في هذه الفترة"
            />
          </Card>
          <Card>
            <EmptyState
              title="لا توجد مشتريات"
              description="لا توجد مشتريات مسجلة حاليًا"
            />
          </Card>
        </div>
      </div>

      {/* Loading States */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">حالات التحميل</h3>
        <div className="space-y-4">
          <LoadingState message="جاري تحميل البيانات..." />
          <div className="grid grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>

      {/* Inline Alerts */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">التنبيهات المضمنة</h3>
        <div className="space-y-3">
          <InlineAlert type="success" title="تم الحفظ بنجاح" description="تم حفظ التغييرات بنجاح" />
          <InlineAlert type="error" title="حدث خطأ" description="لم يتم حفظ التغييرات، حاول مرة أخرى" />
          <InlineAlert type="warning" title="تنبيه" description="أنت على وشك حذف هذا العنصر" />
          <InlineAlert type="info" title="معلومات" description="سيتم تطبيق التغييرات بعد الحفظ" />
        </div>
      </div>
    </div>
  );
}

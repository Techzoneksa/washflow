'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import type { Employee } from '@/types/employees';
import { JOB_TITLES, NATIONALITIES } from '@/lib/mock-employees';

export interface EmployeeFormData {
  fullName: string;
  nationalId: string;
  nationality: string;
  birthDate: string;
  joinDate: string;
  jobTitle: string;
  monthlySalary: number;
  phone: string;
  status: 'active' | 'inactive';
  notes: string;
}

interface EmployeeFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => void;
  employee: Employee | null;
  existingNationalIds: string[];
}

export default function EmployeeFormDrawer({
  open,
  onClose,
  onSave,
  employee,
  existingNationalIds,
}: EmployeeFormDrawerProps) {
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [nationality, setNationality] = useState('سعودي');
  const [birthDate, setBirthDate] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [jobTitle, setJobTitle] = useState('عامل غسيل');
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName);
      setNationalId(employee.nationalId);
      setNationality(employee.nationality);
      setBirthDate(employee.birthDate);
      setJoinDate(employee.joinDate);
      setJobTitle(employee.jobTitle);
      setMonthlySalary(employee.monthlySalary);
      setPhone(employee.phone);
      setStatus(employee.status);
      setNotes(employee.notes);
    } else {
      setFullName('');
      setNationalId('');
      setNationality('سعودي');
      setBirthDate('');
      setJoinDate('');
      setJobTitle('عامل غسيل');
      setMonthlySalary(0);
      setPhone('');
      setStatus('active');
      setNotes('');
    }
    setErrors({});
  }, [employee, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'الاسم مطلوب';
    if (!nationalId.trim()) newErrors.nationalId = 'رقم الهوية مطلوب';
    if (!employee && existingNationalIds.includes(nationalId)) {
      newErrors.nationalId = 'رقم الهوية موجود مسبقًا';
    }
    if (!nationality) newErrors.nationality = 'الجنسية مطلوبة';
    if (!birthDate) newErrors.birthDate = 'تاريخ الميلاد مطلوب';
    if (!joinDate) newErrors.joinDate = 'تاريخ الانضمام مطلوب';
    if (!jobTitle) newErrors.jobTitle = 'المسمى الوظيفي مطلوب';
    if (monthlySalary <= 0) newErrors.monthlySalary = 'الراتب يجب أن يكون أكبر من صفر';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      fullName: fullName.trim(),
      nationalId: nationalId.trim(),
      nationality,
      birthDate,
      joinDate,
      jobTitle,
      monthlySalary,
      phone: phone.trim(),
      status,
      notes: notes.trim(),
    });
  };

  const nationalityOptions = NATIONALITIES.map(n => ({ value: n, label: n }));
  const jobTitleOptions = JOB_TITLES.map(j => ({ value: j, label: j }));
  const statusOptions = [
    { value: 'active', label: 'على رأس العمل' },
    { value: 'inactive', label: 'متوقف' },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={employee ? 'تعديل العامل' : 'إضافة عامل جديد'}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">الاسم الكامل *</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثال: أحمد محمد علي"
            error={errors.fullName}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">رقم الهوية *</label>
            <Input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="رقم الهوية / الإقامة"
              error={errors.nationalId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">الجنسية *</label>
            <Select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              options={nationalityOptions}
              error={errors.nationality}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">تاريخ الميلاد *</label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              error={errors.birthDate}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">تاريخ الانضمام *</label>
            <Input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              error={errors.joinDate}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">المسمى الوظيفي *</label>
            <Select
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              options={jobTitleOptions}
              error={errors.jobTitle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">الراتب الشهري (ر.س) *</label>
            <Input
              type="number"
              min={0}
              value={monthlySalary.toString()}
              onChange={(e) => setMonthlySalary(Number(e.target.value) || 0)}
              error={errors.monthlySalary}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">رقم الجوال</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xxxxxxxx"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">الحالة</label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            options={statusOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">ملاحظات</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ملاحظات إضافية..."
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" onClick={handleSubmit}>
            {employee ? 'تحديث' : 'إضافة'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

'use client';
import Button from './Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        icon={<ChevronRight className="h-4 w-4" />}
      >
        السابق
      </Button>
      <span className="px-3 py-1 text-sm text-text-secondary">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        icon={<ChevronLeft className="h-4 w-4" />}
      >
        التالي
      </Button>
    </div>
  );
}
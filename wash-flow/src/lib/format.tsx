export function toLatinDigits(value: string | number): string {
  return String(value)
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}

export function formatNumber(value: number): string {
  return toLatinDigits(
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value)
  );
}

export function formatMoneyAmount(value: number): string {
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
  return toLatinDigits(amount);
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  return `${formatNumber(minutes)} دقيقة`;
}

type MoneyProps = {
  value: number;
  className?: string;
  iconClassName?: string;
};

export function Money({ value, className, iconClassName }: MoneyProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <span>{formatMoneyAmount(value)}</span>
      <img
        src="/SAR.svg"
        alt="SAR"
        className={`inline-block h-3.5 w-3.5 ${iconClassName ?? ""}`}
      />
    </span>
  );
}

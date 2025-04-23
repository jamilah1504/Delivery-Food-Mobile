export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function safeParseInteger(value: any): number {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

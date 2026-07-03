export function formatPrice(amount: number, currency: string): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

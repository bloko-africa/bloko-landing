import "server-only";

export type LedgerRow = {
  orderReference: string;
  orderDate: string;
  productName: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  orderTotal: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryStatus: string;
  agencyName: string;
  trackingCode: string;
};

const HEADERS: { key: keyof LedgerRow; label: string }[] = [
  { key: "orderReference", label: "Référence commande" },
  { key: "orderDate", label: "Date" },
  { key: "productName", label: "Produit" },
  { key: "variant", label: "Variante" },
  { key: "quantity", label: "Quantité" },
  { key: "unitPrice", label: "Prix unitaire" },
  { key: "orderTotal", label: "Total commande" },
  { key: "currency", label: "Devise" },
  { key: "paymentStatus", label: "Statut paiement" },
  { key: "paymentMethod", label: "Méthode paiement" },
  { key: "deliveryStatus", label: "Statut livraison" },
  { key: "agencyName", label: "Agence" },
  { key: "trackingCode", label: "Code de suivi" },
];

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Writer CSV minimal — le besoin (une ligne par article, colonnes plates)
 * est trop simple pour justifier une dépendance externe.
 */
export function buildLedgerCsv(rows: LedgerRow[]): string {
  const headerLine = HEADERS.map((h) => escapeCsvValue(h.label)).join(",");
  const dataLines = rows.map((row) =>
    HEADERS.map((h) => escapeCsvValue(row[h.key])).join(","),
  );
  return [headerLine, ...dataLines].join("\n");
}

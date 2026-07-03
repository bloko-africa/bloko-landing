"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { cn } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format-price";
import { notifyPromise } from "@/lib/notify-promise";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";

type VariantOption = {
  id: string;
  label: string;
  unitPrice: number;
};

type ItemRow = { productVariantId: string; quantity: number };

const selectClassName =
  "w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white";

function LabeledSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("space-y-3", className)}>
      <label
        htmlFor={id}
        className="block text-body-sm font-medium text-dark dark:text-white"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClassName}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function OrderForm({
  variants,
  currency,
}: {
  variants: VariantOption[];
  currency: string;
}) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [country, setCountry] = useState<"CI" | "BJ">("CI");
  const [items, setItems] = useState<ItemRow[]>([
    { productVariantId: "", quantity: 1 },
  ]);
  const [loading, setLoading] = useState(false);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addRow() {
    setItems((prev) => [...prev, { productVariantId: "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const total = items.reduce((sum, item) => {
    const variant = variants.find((v) => v.id === item.productVariantId);
    return sum + (variant ? variant.unitPrice * item.quantity : 0);
  }, 0);

  async function handleSubmit() {
    const validItems = items.filter((i) => i.productVariantId);
    if (!customerName || !customerPhone || validItems.length === 0) {
      toast.error("Nom, téléphone et au moins un article sont requis.");
      return;
    }

    setLoading(true);
    try {
      const id = await notifyPromise(
        createOrder({
          customerName,
          customerPhone,
          customerEmail,
          country,
          items: validItems,
        }),
        {
          loading: "Création de la commande...",
          success: "Commande créée",
          error: (err) => (err instanceof Error ? err.message : "Échec"),
        },
      );
      router.push(`/admin/orders/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShowcaseSection title="Nouvelle commande" className="space-y-5.5 p-6.5!">
      <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-3">
        <InputGroup
          label="Nom du client"
          type="text"
          placeholder="Ex: Awa Traoré"
          value={customerName}
          handleChange={(e) => setCustomerName(e.target.value)}
        />
        <InputGroup
          label="Téléphone"
          type="tel"
          placeholder="Ex: +2250700000000"
          value={customerPhone}
          handleChange={(e) => setCustomerPhone(e.target.value)}
        />
        <InputGroup
          label="Email (optionnel)"
          type="email"
          placeholder="client@email.com"
          value={customerEmail}
          handleChange={(e) => setCustomerEmail(e.target.value)}
        />
      </div>

      <LabeledSelect
        label="Pays du client (méthodes de paiement disponibles)"
        value={country}
        onChange={(v) => setCountry(v as "CI" | "BJ")}
        options={[
          { value: "CI", label: "Côte d'Ivoire" },
          { value: "BJ", label: "Bénin" },
        ]}
        className="max-w-xs"
      />

      <div className="space-y-4 border-t border-stroke pt-5.5 dark:border-dark-3">
        <span className="block text-body-sm font-medium text-dark dark:text-white">
          Articles
        </span>

        {items.map((item, index) => (
          <div key={index} className="flex items-end gap-3">
            <LabeledSelect
              label={`Article ${index + 1}`}
              value={item.productVariantId}
              onChange={(v) => updateItem(index, { productVariantId: v })}
              options={variants.map((v) => ({ value: v.id, label: v.label }))}
              placeholder="Choisir une variante"
              className="flex-1"
            />

            <InputGroup
              label="Qté"
              type="number"
              placeholder="1"
              value={String(item.quantity)}
              handleChange={(e) =>
                updateItem(index, { quantity: Number(e.target.value) || 1 })
              }
              className="w-24"
            />

            <button
              type="button"
              onClick={() => removeRow(index)}
              className="mb-1 text-body-sm text-red hover:underline"
            >
              Retirer
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="text-body-sm font-medium text-primary hover:underline"
        >
          + Ajouter un article
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-stroke pt-5.5 dark:border-dark-3">
        <span className="text-lg font-semibold text-dark dark:text-white">
          Total : {formatPrice(total, currency)}
        </span>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
        >
          Créer la commande
        </button>
      </div>
    </ShowcaseSection>
  );
}

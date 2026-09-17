/**
 * "Taille"/"Couleur" ne veut rien dire pour une marchande de plats cuisinés
 * ou d'électronique — ces deux champs (stockés tels quels en base, voir
 * ProductVariant.size/color) restent génériques, seul le LABEL affiché
 * change selon la catégorie du produit. Basé sur la catégorie du PRODUIT
 * (pas de la boutique — Boutique n'a pas de categoryId, et une vendeuse qui
 * ne vend qu'un type de produit obtient le même résultat pratique).
 */
export type VariantLabelSet = {
  field1: string;
  field2: string;
  placeholder1: string;
  placeholder2: string;
};

const FASHION: VariantLabelSet = {
  field1: "Taille",
  field2: "Couleur",
  placeholder1: "M",
  placeholder2: "Noir",
};

const FOOD: VariantLabelSet = {
  field1: "Format",
  field2: "Saveur",
  placeholder1: "Grand",
  placeholder2: "Nature",
};

const DEFAULT: VariantLabelSet = {
  field1: "Option 1",
  field2: "Option 2",
  placeholder1: "",
  placeholder2: "",
};

const CATEGORY_SLUG_LABELS: Record<string, VariantLabelSet> = {
  robes: FASHION,
  hauts: FASHION,
  pantalons: FASHION,
  accessoires: FASHION,
  "plats-cuisines": FOOD,
  "patisseries-desserts": FOOD,
  boissons: { field1: "Contenance", field2: "Saveur", placeholder1: "50cl", placeholder2: "Nature" },
  "snacks-grignotage": FOOD,
  "beaute-cosmetiques": { field1: "Contenance", field2: "Teinte", placeholder1: "50ml", placeholder2: "Beige" },
  "maison-deco": { field1: "Dimension", field2: "Couleur", placeholder1: "40x60cm", placeholder2: "Blanc" },
  "electronique-accessoires-tech": { field1: "Modèle", field2: "Couleur", placeholder1: "128Go", placeholder2: "Noir" },
};

export function getVariantLabels(categorySlug: string | null | undefined): VariantLabelSet {
  if (!categorySlug) return DEFAULT;
  return CATEGORY_SLUG_LABELS[categorySlug] ?? DEFAULT;
}

/** Texte brut à partir de HTML (rich text produit/boutique) — pour les meta description, jamais du HTML dans une balise <meta>. */
export function stripHtml(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

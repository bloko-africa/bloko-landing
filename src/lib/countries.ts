import countries from "i18n-iso-countries";
import fr from "i18n-iso-countries/langs/fr.json";

countries.registerLocale(fr);

export type CountryOption = { code: string; name: string };

let cachedList: CountryOption[] | null = null;

export function getCountryList(): CountryOption[] {
  if (cachedList) return cachedList;

  const names = countries.getNames("fr", { select: "official" });
  cachedList = Object.entries(names)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return cachedList;
}

export function getCountryName(code: string): string {
  return countries.getName(code, "fr", { select: "official" }) ?? code;
}

/** Emoji drapeau depuis un code ISO 3166-1 alpha-2 (ex: "CI" -> 🇨🇮). */
export function getFlagEmoji(code: string): string {
  if (!/^[A-Z]{2}$/i.test(code)) return "🏳️";
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0)),
    );
}

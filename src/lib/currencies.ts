export const SUPPORTED_CURRENCIES = [
  "XOF",
  "XAF",
  "CDF",
  "USD",
  "KES",
  "RWF",
  "SLE",
  "UGX",
  "ZMW",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

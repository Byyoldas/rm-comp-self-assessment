import type { Lang } from "../../../shared/types";

const LABEL_TR: Record<string, string> = {
  "0-2 years": "0-2 yıl",
  "3-5 years": "3-5 yıl",
  "6-10 years": "6-10 yıl",
  "10+ years": "10+ yıl",
};

/** The underlying value stays a canonical English band string (used as a lookup key server-side); only display swaps. */
export function experienceBandLabel(band: string, lang: Lang): string {
  return lang === "tr" ? LABEL_TR[band] ?? band : band;
}

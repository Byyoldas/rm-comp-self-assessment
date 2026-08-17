// Language-aware text analysis helpers used by the heuristic evidence evaluator.
// Turkish is agglutinative (suffixes stack onto stems), so outcome-verb and vague-
// language detection use stem substring checks against the raw lowercased text
// rather than exact tokenized-word matches, which would miss most inflected forms.
import type { Lang, Level } from "../../../shared/types.js";

const STOPWORDS_EN = new Set(
  ("the a an of and or to in on for with by from as is are was were be being been " +
    "this that these those it its their there here at which who whom whose i you we they " +
    "he she my our your his her them us not no yes also into within across about " +
    "into onto over under between among during before after while when where how what " +
    "will would can could should shall may might must do does did done have has had " +
    "including etc other such than then so if but because")
    .split(/\s+/)
);

const STOPWORDS_TR = new Set(
  ("ve veya ile bir bu şu o da de ki mi mı mu mü için gibi çok daha en olan olarak " +
    "olur oldu olması göre kadar ise ancak fakat ama hem ya yani çünkü eğer her hiç " +
    "bazı tüm bütün kendi kendisi biz siz onlar ben sen ona ondan onun bana sana buna " +
    "bunun şunu bunları beni seni bizi sizi onu benim senin bizim sizin kendim kendin " +
    "değil değildir vardır yoktur şey nasıl neden niçin hangi kadar sonra önce artık " +
    "hala henüz zaten belki mutlaka elbette tabii ayrıca yine üzere dolayı rağmen karşı")
    .split(/\s+/)
);

const OUTCOME_STEMS_EN = [
  "result", "reduc", "increas", "improv", "deliver", "secur", "achiev",
  "implement", "launch", "sav", "negotiat", "led", "led", "built", "design", "establish",
  "influenc", "mitigat", "resolv", "prevent", "streamlin", "restructur", "scal",
];

const OUTCOME_STEMS_TR = [
  "azalt", "artır", "artt", "geliştir", "sağla", "elde et", "başar", "uygula", "başlat",
  "kur", "müzakere et", "yönet", "önle", "düzelt", "çöz", "yeniden yapılandır",
  "ölçeklendir", "liderlik et", "tasarla", "iyileştir", "geliştirdi", "yürüt",
];

const VAGUE_PATTERNS_EN = [
  /\bi\s*('m| am)\s*(an?\s*)?expert\b/i,
  /\bi\s*('m| am)\s*(very|highly)\s*experienced\b/i,
  /\bi\s*('m| am)\s*(very\s*)?(good|great|skilled|proficient)\s*at\b/i,
  /\bi\s*('m| am)\s*confident\b/i,
  /\byears of experience\b/i,
  /\bsenior\s*(role|position|manager)?\b/i,
];

const VAGUE_PATTERNS_TR = [
  /\buzman(ım|ıyım|dır|dir)?\b/i,
  /\b(çok|son derece|oldukça)\s*deneyimli(yim)?\b/i,
  /\b(çok|gayet|oldukça)\s*iyiyim\b/i,
  /\bkendime\s*güveniyorum\b/i,
  /\byıllardır\b/i,
  /\bkıdemli(yim)?\b/i,
];

const SELF_CLAIM_PATTERNS_EN: { pattern: RegExp; level: Level }[] = [
  { pattern: /\bexpert\b/i, level: "Expert" },
  { pattern: /\b(advanced|highly experienced|very experienced)\b/i, level: "Advanced" },
  { pattern: /\b(intermediate|competent|solid experience)\b/i, level: "Intermediate" },
  { pattern: /\b(beginner|foundational|new to|just starting)\b/i, level: "Foundational" },
];

const SELF_CLAIM_PATTERNS_TR: { pattern: RegExp; level: Level }[] = [
  { pattern: /\buzman\b/i, level: "Expert" },
  { pattern: /\b(ileri düzey|çok deneyimli|son derece deneyimli)\b/i, level: "Advanced" },
  { pattern: /\b(orta düzey|yetkin|belirli bir deneyim)\b/i, level: "Intermediate" },
  { pattern: /\b(başlangıç|yeni başladım|temel düzey|acemi)\b/i, level: "Foundational" },
];

function stopwords(lang: Lang) {
  return lang === "tr" ? STOPWORDS_TR : STOPWORDS_EN;
}

export function tokenize(text: string, lang: Lang = "en"): string[] {
  const lowered = lang === "tr" ? text.toLocaleLowerCase("tr") : text.toLowerCase();
  const cleaned = lowered.replace(/[^a-z0-9çğıöşü\s]/g, " ");
  const sw = stopwords(lang);
  return cleaned.split(/\s+/).filter((t) => t.length >= 4 && !sw.has(t));
}

export function computeSpecificity(text: string, lang: Lang = "en"): number {
  if (!text || text.trim().length === 0) return 0;
  const wordCount = text.trim().split(/\s+/).length;
  let score = 0;

  score += Math.min(0.3, (wordCount / 60) * 0.3);

  const numberMatches = text.match(/\d+/g);
  if (numberMatches) score += Math.min(0.2, numberMatches.length * 0.07);

  const lower = lang === "tr" ? text.toLocaleLowerCase("tr") : text.toLowerCase();
  const stems = lang === "tr" ? OUTCOME_STEMS_TR : OUTCOME_STEMS_EN;
  const verbHits = stems.filter((stem) => lower.includes(stem)).length;
  score += Math.min(0.25, verbHits * 0.08);

  const words = text.split(/\s+/);
  let capHits = 0;
  for (let i = 1; i < words.length; i++) {
    const w = words[i].replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "");
    if (w.length > 2 && /^[A-ZÇĞİÖŞÜ][a-zçğıöşü]/.test(w)) capHits++;
  }
  score += Math.min(0.15, capHits * 0.03);

  const vaguePatterns = lang === "tr" ? VAGUE_PATTERNS_TR : VAGUE_PATTERNS_EN;
  const vagueHits = vaguePatterns.filter((p) => p.test(text)).length;
  score -= vagueHits * 0.15;

  return Math.max(0, Math.min(1, score));
}

export function detectSelfClaimLevel(text: string, lang: Lang = "en"): Level | null {
  const patterns = lang === "tr" ? SELF_CLAIM_PATTERNS_TR : SELF_CLAIM_PATTERNS_EN;
  for (const { pattern, level } of patterns) {
    if (pattern.test(text)) return level;
  }
  return null;
}

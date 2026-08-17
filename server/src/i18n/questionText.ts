// Localized phrase templates for the generated (non-flagship) question bank.
// These control *how* a descriptor is asked about; the descriptor content itself
// always comes from the already-localized Competency object passed in by the caller.
import type { Level, QuestionOption } from "../../../shared/types.js";

export const AUTONOMY_OPTIONS_EN: QuestionOption[] = [
  {
    value: "observed",
    label: "I mostly observed or assisted someone else doing this — I did not carry it out independently.",
    levelSignal: { Foundational: 0.9, Intermediate: 0.15 },
  },
  {
    value: "supervised",
    label: "I carried this out myself, but with guidance, review, or supervision from someone else.",
    levelSignal: { Foundational: 0.35, Intermediate: 0.9, Advanced: 0.1 },
  },
  {
    value: "independent",
    label: "I did this independently, including on non-routine or complex cases, without needing supervision.",
    levelSignal: { Intermediate: 0.3, Advanced: 0.9, Expert: 0.15 },
  },
  {
    value: "leading",
    label: "I led this or set the approach — others followed my direction, at team, organisational, or higher level.",
    levelSignal: { Advanced: 0.4, Expert: 0.95 },
  },
];

export const AUTONOMY_OPTIONS_TR: QuestionOption[] = [
  {
    value: "observed",
    label: "Çoğunlukla başka birinin bunu yapmasını izledim veya ona yardımcı oldum — bunu bağımsız biçimde yürütmedim.",
    levelSignal: { Foundational: 0.9, Intermediate: 0.15 },
  },
  {
    value: "supervised",
    label: "Bunu kendim yürüttüm, ancak başka birinin yönlendirmesi, incelemesi veya gözetimiyle.",
    levelSignal: { Foundational: 0.35, Intermediate: 0.9, Advanced: 0.1 },
  },
  {
    value: "independent",
    label: "Bunu, rutin olmayan veya karmaşık durumlar dahil, gözetime ihtiyaç duymadan bağımsız biçimde yaptım.",
    levelSignal: { Intermediate: 0.3, Advanced: 0.9, Expert: 0.15 },
  },
  {
    value: "leading",
    label: "Buna liderlik ettim veya yaklaşımı ben belirledim — başkaları ekip, kurum veya daha üst düzeyde benim yönlendirmemi takip etti.",
    levelSignal: { Advanced: 0.4, Expert: 0.95 },
  },
];

export const FREQUENCY_OPTIONS_EN: QuestionOption[] = [
  {
    value: "single-instance",
    label: "This happened once, as a single instance.",
    levelSignal: { Foundational: 0.5, Intermediate: 0.25 },
  },
  {
    value: "occasional",
    label: "This happens occasionally, when the situation arises.",
    levelSignal: { Intermediate: 0.5, Advanced: 0.2 },
  },
  {
    value: "regular",
    label: "This is a regular, recurring part of my role.",
    levelSignal: { Intermediate: 0.25, Advanced: 0.6, Expert: 0.2 },
  },
  {
    value: "consistent-multi-context",
    label: "I do this consistently and have refined my approach across multiple different contexts.",
    levelSignal: { Advanced: 0.35, Expert: 0.75 },
  },
];

export const FREQUENCY_OPTIONS_TR: QuestionOption[] = [
  {
    value: "single-instance",
    label: "Bu yalnızca bir kez oldu.",
    levelSignal: { Foundational: 0.5, Intermediate: 0.25 },
  },
  {
    value: "occasional",
    label: "Durum ortaya çıktıkça ara sıra oluyor.",
    levelSignal: { Intermediate: 0.5, Advanced: 0.2 },
  },
  {
    value: "regular",
    label: "Bu, işimin düzenli ve tekrar eden bir parçası.",
    levelSignal: { Intermediate: 0.25, Advanced: 0.6, Expert: 0.2 },
  },
  {
    value: "consistent-multi-context",
    label: "Bunu tutarlı biçimde yapıyorum ve yaklaşımımı birçok farklı durumda geliştirip inceltmişimdir.",
    levelSignal: { Advanced: 0.35, Expert: 0.75 },
  },
];

export interface QuestionTextPack {
  autonomyOptions: QuestionOption[];
  frequencyOptions: QuestionOption[];
  behavioralPrompt: (competencyName: string, higherLevel: Level, quote: string) => string;
  behavioralGuidance: string;
  behavioralWhy: (higherLevel: Level, competencyName: string) => string;
  autonomyPrompt: (quote: string) => string;
  autonomyWhy: (lower: Level | null, higher: Level, competencyName: string) => string;
  frequencyPrompt: string;
  frequencyWhy: (higherLevel: Level, competencyName: string) => string;
  outcomePrompt: string;
  outcomeWhy: string;
  openingPrompt: (description: string) => string;
  openingGuidance: string;
  openingWhy: (competencyName: string) => string;
}

const LEVEL_LABEL_TR: Record<Level, string> = { Foundational: "temel", Intermediate: "orta", Advanced: "ileri", Expert: "uzman" };

export const QUESTION_TEXT: Record<"en" | "tr", QuestionTextPack> = {
  en: {
    autonomyOptions: AUTONOMY_OPTIONS_EN,
    frequencyOptions: FREQUENCY_OPTIONS_EN,
    behavioralPrompt: (competencyName, higherLevel, quote) =>
      `For "${competencyName}", the ${higherLevel.toLowerCase()}-level behaviour we're checking for is: ${quote} Describe a specific, real example from your own work that shows whether — and how — you have done something like this.`,
    behavioralGuidance: "Focus on one concrete situation rather than a general description of your job. Say what YOU personally did, not what your team or organisation did.",
    behavioralWhy: (higherLevel, competencyName) => `This checks for direct evidence of the ${higherLevel} descriptor(s) above for ${competencyName}, rather than relying on a self-rating.`,
    autonomyPrompt: (quote) => `Thinking about that same kind of work (${quote}) — which best describes your typical level of autonomy?`,
    autonomyWhy: (lower, higher, competencyName) => `Autonomy is one of the factors that distinguishes ${lower ?? "earlier levels"} from ${higher} in the RM Comp descriptors for ${competencyName}.`,
    frequencyPrompt: "How often does this apply in your current work?",
    frequencyWhy: (higherLevel, competencyName) => `Distinguishes an isolated example from consistently demonstrated competence, which the ${higherLevel} descriptor implies for ${competencyName}.`,
    outcomePrompt: "What changed, improved, or was delivered as a result? What evidence do you have (a document, an outcome, feedback, a metric) that it was effective?",
    outcomeWhy: "Outcome and evidence strength are used to separate confident claims from demonstrated impact.",
    openingPrompt: (description) => `In your own words, describe what you actually do in relation to: "${description}"`,
    openingGuidance: "Describe real, recent work rather than a general philosophy or job description.",
    openingWhy: (competencyName) => `Establishes a baseline understanding of your day-to-day involvement with ${competencyName} before more targeted questions are asked.`,
  },
  tr: {
    autonomyOptions: AUTONOMY_OPTIONS_TR,
    frequencyOptions: FREQUENCY_OPTIONS_TR,
    behavioralPrompt: (competencyName, higherLevel, quote) =>
      `"${competencyName}" için aradığımız ${LEVEL_LABEL_TR[higherLevel]} düzey davranış şu: ${quote} Buna benzer bir şeyi yapıp yapmadığınızı ve nasıl yaptığınızı gösteren, kendi işinizden somut ve gerçek bir örnek anlatın.`,
    behavioralGuidance: "İşinizi genel hatlarıyla anlatmak yerine tek bir somut duruma odaklanın. Ekibinizin veya kurumunuzun değil, kişisel olarak SİZİN ne yaptığınızı yazın.",
    behavioralWhy: (higherLevel, competencyName) => `Bu soru, bir öz-değerlendirmeye güvenmek yerine, ${competencyName} için yukarıdaki ${LEVEL_LABEL_TR[higherLevel]} düzey tanımına dair doğrudan kanıt arıyor.`,
    autonomyPrompt: (quote) => `Aynı türde bir işi düşünün (${quote}). Aşağıdakilerden hangisi sizin tipik özerklik düzeyinizi en iyi anlatıyor?`,
    autonomyWhy: (lower, higher, competencyName) => `Özerklik, ${competencyName} için RM Comp tanımlarında ${lower ? LEVEL_LABEL_TR[lower] : "önceki düzeyleri"} ile ${LEVEL_LABEL_TR[higher]} düzeyi birbirinden ayıran unsurlardan biri.`,
    frequencyPrompt: "Bu durum, güncel işinizde ne sıklıkla karşınıza çıkıyor?",
    frequencyWhy: (higherLevel, competencyName) => `${competencyName} için ${LEVEL_LABEL_TR[higherLevel]} düzeyin gerektirdiği, tek seferlik bir örnek değil tutarlı biçimde gösterilen bir yetkinlik olup olmadığını ayırt eder.`,
    outcomePrompt: "Sonuçta ne değişti, ne gelişti ya da ne teslim edildi? Bunun işe yaradığına dair elinizde ne var — bir belge, somut bir sonuç, bir geri bildirim, bir ölçüt?",
    outcomeWhy: "Sonuç ve kanıt gücü, kendinden emin bir iddiayı gerçekten kanıtlanmış bir etkiden ayırt etmek için kullanılıyor.",
    openingPrompt: (description) => `Kendi cümlelerinizle, şu konuda gerçekte ne yaptığınızı anlatın: "${description}"`,
    openingGuidance: "Genel bir iş tanımı ya da felsefe değil, yakın zamanda yaptığınız gerçek bir işi anlatın.",
    openingWhy: (competencyName) => `Daha hedefli sorulara geçmeden önce, ${competencyName} ile günlük ilişkinize dair bir başlangıç noktası oluşturuyor.`,
  },
};

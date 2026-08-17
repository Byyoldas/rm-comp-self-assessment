// Localized phrase templates for gap analysis and final-report copy.
import type { DomainId, Lang, Level } from "../../../shared/types.js";

const LEVEL_LABEL_TR: Record<Level, string> = { Foundational: "Temel", Intermediate: "Orta", Advanced: "İleri", Expert: "Uzman" };
export function levelLabel(level: Level, lang: Lang): string {
  return lang === "tr" ? LEVEL_LABEL_TR[level] : level;
}

const EVIDENCE_SUGGESTIONS_BY_DOMAIN_EN: Partial<Record<DomainId, string[]>> = {
  COG: ["A brief written reflection on a challenging decision you made and why", "Feedback from a peer or manager on a specific situation"],
  TECH: ["A work sample (redacted if needed) showing the technique applied", "A record of a tool, script, or analysis you produced"],
  RPO: ["A project plan, risk log, or status report you authored", "A retrospective or lessons-learned note from a completed project"],
  STK: ["An email thread or meeting note showing how you managed a stakeholder relationship", "A partnership agreement or MoU you helped negotiate"],
  LMT: ["360-degree or team feedback", "A development plan you created for a team member"],
  COM: ["A published report, communication plan, or media piece you produced", "Analytics or reach data from a communication activity"],
  SME: ["A funding proposal, contract, or compliance document you led", "A policy or process document you authored or revised"],
};

const EVIDENCE_SUGGESTIONS_BY_DOMAIN_TR: Partial<Record<DomainId, string[]>> = {
  COG: ["Aldığınız zorlu bir karar ve nedeni hakkında kısa bir yazılı yansıma", "Belirli bir durum hakkında bir meslektaşınızdan veya yöneticinizden geri bildirim"],
  TECH: ["Tekniğin uygulandığını gösteren bir iş örneği (gerekirse gizlenmiş)", "Ürettiğiniz bir araç, betik veya analiz kaydı"],
  RPO: ["Hazırladığınız bir proje planı, risk kaydı veya durum raporu", "Tamamlanmış bir projeden alınan bir geriye dönük değerlendirme veya öğrenilen dersler notu"],
  STK: ["Bir paydaş ilişkisini nasıl yönettiğinizi gösteren bir e-posta yazışması veya toplantı notu", "Müzakere etmenize yardımcı olduğunuz bir ortaklık anlaşması veya mutabakat zaptı"],
  LMT: ["360 derece veya ekip geri bildirimi", "Bir ekip üyesi için oluşturduğunuz bir gelişim planı"],
  COM: ["Ürettiğiniz yayımlanmış bir rapor, iletişim planı veya medya içeriği", "Bir iletişim faaliyetinden elde edilen analitik veya erişim verileri"],
  SME: ["Liderlik ettiğiniz bir fonlama başvurusu, sözleşme veya uyumluluk belgesi", "Hazırladığınız veya revize ettiğiniz bir politika veya süreç belgesi"],
};

const DEVELOPMENT_ACTIVITIES_EN = [
  "a stretch assignment that puts you in direct contact with this behaviour",
  "shadowing or mentoring from someone operating at the target level",
  "a structured reflective-practice log kept over your next few relevant situations",
  "targeted formal training aligned to the specific gap identified",
  "peer learning or a community of practice focused on this competency",
];

const DEVELOPMENT_ACTIVITIES_TR = [
  "sizi bu davranışla doğrudan temasa geçiren bir gelişim görevi (stretch assignment)",
  "hedef düzeyde çalışan birinden gölgeleme (shadowing) veya mentorluk",
  "sonraki birkaç ilgili durumunuz boyunca tutulan yapılandırılmış bir yansıtıcı uygulama günlüğü",
  "belirlenen özel açığa yönelik hedeflenmiş resmi eğitim",
  "bu yetkinliğe odaklanan akran öğrenimi veya bir uygulama topluluğu",
];

export interface ReportTextPack {
  evidenceSuggestionsByDomain: Partial<Record<DomainId, string[]>>;
  developmentActivities: string[];
  specificExampleSuggestion: (competencyNameLower: string) => string;
  buildEvidenceOf: (behaviour: string, activity: string) => string;
  insufficientEvidenceWhy: string;
  insufficientEvidenceDevelopmentFocus: string;
  behaviourNotYetDemonstrated: (level: string) => string;
  gapWhyHighPriority: (currentLevel: string, targetLevel: string) => string;
  gapWhyDefault: (currentLevel: string, targetLevel: string) => string;
  insufficientEvidenceLabel: string;
  strengthWithLevel: (name: string, level: string) => string;
  gapEntry: (name: string, current: string, target: string) => string;
  topStrengthEntry: (name: string, level: string, confidence: string, evidence: string) => string;
  uncertaintyInsufficient: (name: string) => string;
  uncertaintyLowConfidence: (name: string, level: string) => string;
  defaultContradictionNote: (selfClaim: string, evidence: string) => string;
  executiveSummary: (p: { count: number; demonstratedCount: number; topStrengthNames: string[]; highPriorityCount: number }) => string;
}

export const REPORT_TEXT: Record<Lang, ReportTextPack> = {
  en: {
    evidenceSuggestionsByDomain: EVIDENCE_SUGGESTIONS_BY_DOMAIN_EN,
    developmentActivities: DEVELOPMENT_ACTIVITIES_EN,
    specificExampleSuggestion: (name) => `A specific, recent example of ${name} in practice, including your personal role and the outcome`,
    buildEvidenceOf: (behaviour, activity) => `Build evidence of: "${behaviour}" — consider ${activity}.`,
    insufficientEvidenceWhy: "Not enough evidence has been gathered yet to determine the current level for this competency, so the gap cannot be confidently sized.",
    insufficientEvidenceDevelopmentFocus: "Provide one or two concrete, specific examples of recent work in this area to establish a baseline.",
    behaviourNotYetDemonstrated: (level) => `Evidence of ${level}-level behaviour has not yet been demonstrated.`,
    gapWhyHighPriority: (current, target) => `This competency is highly relevant to the target role, and current evidence supports ${current} against a target of ${target}.`,
    gapWhyDefault: (current, target) => `Current evidence supports ${current} against a target of ${target} for this competency.`,
    insufficientEvidenceLabel: "insufficient evidence",
    strengthWithLevel: (name, level) => `${name} (${level})`,
    gapEntry: (name, current, target) => `${name}: ${current} → ${target}`,
    topStrengthEntry: (name, level, confidence, evidence) => `${name} — ${level} (confidence: ${confidence}, evidence: ${evidence})`,
    uncertaintyInsufficient: (name) => `${name}: insufficient evidence was gathered to confidently determine a level. Additional concrete examples would help.`,
    uncertaintyLowConfidence: (name, level) => `${name}: a level of ${level} is indicated, but confidence is low — more evidence would strengthen this conclusion.`,
    defaultContradictionNote: (selfClaim, evidence) =>
      `Self-described level (${selfClaim}) is notably higher than the level supported by concrete evidence so far (${evidence}). More specific, concrete examples would help confirm the higher level.`,
    executiveSummary: ({ count, demonstratedCount, topStrengthNames, highPriorityCount }) =>
      `This assessment considered ${count} competenc${count === 1 ? "y" : "ies"} from the RM Comp framework, based on the responses and evidence provided. ` +
      `A defensible current level was established for ${demonstratedCount} of these. ` +
      (topStrengthNames.length > 0 ? `The strongest evidenced areas include ${topStrengthNames.slice(0, 3).join(", ")}. ` : "") +
      (highPriorityCount > 0
        ? `${highPriorityCount} competenc${highPriorityCount === 1 ? "y is" : "ies are"} flagged as a high development priority relative to the stated target role. `
        : "No high-priority gaps were identified relative to the stated target role. ") +
      `Levels are reported as evidence-supported categories (Foundational/Intermediate/Advanced/Expert) with an accompanying confidence and evidence-strength rating, not as a numeric score.`,
  },
  tr: {
    evidenceSuggestionsByDomain: EVIDENCE_SUGGESTIONS_BY_DOMAIN_TR,
    developmentActivities: DEVELOPMENT_ACTIVITIES_TR,
    specificExampleSuggestion: (name) => `Kişisel rolünüz ve sonucu dahil olmak üzere, pratikte ${name} konusunda somut, yakın zamanlı bir örnek`,
    buildEvidenceOf: (behaviour, activity) => `Şu konuda kanıt oluşturun: "${behaviour}" — şunu düşünün: ${activity}.`,
    insufficientEvidenceWhy: "Bu yetkinlik için mevcut düzeyi belirlemek üzere henüz yeterli kanıt toplanmadı, bu nedenle açık güvenilir biçimde ölçülemiyor.",
    insufficientEvidenceDevelopmentFocus: "Bir başlangıç noktası oluşturmak için bu alandaki yakın zamanlı çalışmanıza dair bir veya iki somut, özel örnek sağlayın.",
    behaviourNotYetDemonstrated: (level) => `${level} düzey davranışa ilişkin kanıt henüz gösterilmedi.`,
    gapWhyHighPriority: (current, target) => `Bu yetkinlik hedef rol için son derece ilgilidir ve mevcut kanıt, ${target} hedefine karşı ${current} düzeyini destekliyor.`,
    gapWhyDefault: (current, target) => `Bu yetkinlik için mevcut kanıt, ${target} hedefine karşı ${current} düzeyini destekliyor.`,
    insufficientEvidenceLabel: "yetersiz kanıt",
    strengthWithLevel: (name, level) => `${name} (${level})`,
    gapEntry: (name, current, target) => `${name}: ${current} → ${target}`,
    topStrengthEntry: (name, level, confidence, evidence) => `${name} — ${level} (güven: ${confidence}, kanıt: ${evidence})`,
    uncertaintyInsufficient: (name) => `${name}: bir düzeyi güvenle belirlemek için yeterli kanıt toplanmadı. Ek somut örnekler yardımcı olacaktır.`,
    uncertaintyLowConfidence: (name, level) => `${name}: ${level} düzeyi işaret ediliyor, ancak güven düşük — daha fazla kanıt bu sonucu güçlendirecektir.`,
    defaultContradictionNote: (selfClaim, evidence) =>
      `Kendi kendine tanımlanan düzey (${selfClaim}), şu ana kadar somut kanıtlarla desteklenen düzeyden (${evidence}) belirgin biçimde daha yüksek. Daha spesifik, somut örnekler daha yüksek düzeyi doğrulamaya yardımcı olacaktır.`,
    executiveSummary: ({ count, demonstratedCount, topStrengthNames, highPriorityCount }) =>
      `Bu değerlendirme, sağlanan yanıtlara ve kanıtlara dayanarak RM Comp çerçevesinden ${count} yetkinliği ele aldı. ` +
      `Bunlardan ${demonstratedCount} tanesi için güvenilir bir mevcut düzey belirlendi. ` +
      (topStrengthNames.length > 0 ? `En güçlü kanıtlanmış alanlar arasında ${topStrengthNames.slice(0, 3).join(", ")} bulunuyor. ` : "") +
      (highPriorityCount > 0
        ? `Belirtilen hedef role göre ${highPriorityCount} yetkinlik yüksek öncelikli gelişim alanı olarak işaretlendi. `
        : "Belirtilen hedef role göre yüksek öncelikli bir açık belirlenmedi. ") +
      `Düzeyler, sayısal bir puan olarak değil, bir güven ve kanıt gücü derecesiyle birlikte kanıta dayalı kategoriler (Temel/Orta/İleri/Uzman) olarak raporlanır.`,
  },
};

// Shared data model for the RM Comp Self-Assessment Tool.
// Used by both server (source of truth for scoring) and client (rendering only).

export type Level = "Foundational" | "Intermediate" | "Advanced" | "Expert";
export const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

// Internal identifiers (Level, DomainId, competency id, EvidenceDimension, QuestionType, etc.)
// always stay in this canonical English form, everywhere — engine logic, comparisons, storage.
// Only *display* text (names, descriptions, descriptor bullets, question prompts, report copy,
// UI chrome) is localized. This keeps scoring/adaptive logic language-agnostic.
export type Lang = "en" | "tr";
export const LANGS: Lang[] = ["en", "tr"];

export type DomainId = "COG" | "TECH" | "RPO" | "STK" | "LMT" | "COM" | "SME";

export interface Domain {
  id: DomainId;
  name: string;
}

export interface Competency {
  id: string;
  domain: DomainId;
  name: string;
  page: number;
  description: string;
  levels: Record<Level, string[]>;
  _note?: string;
}

export interface Framework {
  meta: {
    name: string;
    source: string;
    publisher: string;
    copyright: string;
    levels: Level[];
    extractionNote: string;
    domains: Domain[];
  };
  competencies: Competency[];
}

export type Relevance = "High" | "Medium" | "Low";

export interface RoleProfileDefinition {
  id: string;
  name: string;
  description: string;
  domainDefaults: Record<DomainId, Relevance>;
  overrides: Record<string, Relevance>;
  targetLevelByExperience: Record<string, Level>;
}

export interface RoleProfilesFile {
  meta: { label: string; disclaimer: string; relevanceLevels: Relevance[]; targetLevelGuidanceNote: string };
  profiles: RoleProfileDefinition[];
}

// ---------------- Evidence & questions ----------------

export type EvidenceDimension =
  | "Knowledge"
  | "Application"
  | "Autonomy"
  | "Complexity"
  | "Scope"
  | "Responsibility"
  | "Leadership"
  | "StrategicInfluence"
  | "StakeholderInfluence"
  | "Innovation"
  | "Consistency"
  | "Impact"
  | "OrganisationalInfluence";

export type QuestionType =
  | "behavioral"
  | "scenario"
  | "experience"
  | "scope"
  | "responsibility"
  | "outcome"
  | "evidence"
  | "reflective"
  | "scale"
  | "frequency"
  | "confidence"
  | "factual"
  | "evidence-selection";

export type ResponseFormat = "free-text" | "single-select" | "multi-select" | "scale-1-5" | "frequency-select";

export interface QuestionOption {
  value: string;
  label: string;
  /** Signal strength (0-1) this option contributes toward each level, used only by scale/select questions. */
  levelSignal?: Partial<Record<Level, number>>;
}

export interface SourceDescriptorRef {
  competencyId: string;
  level: Level;
  descriptorIndex: number;
  text: string;
}

export interface Question {
  id: string;
  competencyId: string;
  /** The two (or more) levels this question is designed to discriminate between. */
  targetLevels: Level[];
  dimension: EvidenceDimension;
  type: QuestionType;
  prompt: string;
  guidance?: string;
  why: string;
  responseFormat: ResponseFormat;
  options?: QuestionOption[];
  sourceDescriptors: SourceDescriptorRef[];
  /** Flagship = hand-crafted; generated = template-produced from descriptor text. */
  origin: "flagship" | "generated";
}

export type EvidenceSourceType = "self-reported" | "documentary" | "scenario-performance" | "inferred";

export interface Evidence {
  id: string;
  competencyId: string;
  questionId?: string;
  sourceType: EvidenceSourceType;
  dimension: EvidenceDimension;
  rawResponse: string;
  /** Per-level support signal (0-1) this piece of evidence contributes, before aggregation. */
  levelSignal: Partial<Record<Level, number>>;
  specificityScore: number; // 0-1: concreteness/detail heuristic
  documentRef?: string;
  createdAt: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  extractedText: string;
  uploadedAt: string;
}

// ---------------- Role / target profiling ----------------

export type AssessmentTargetMode = "current" | "future" | "both";

export interface UserRoleAnswers {
  jobTitle: string;
  organisationType: string;
  responsibilitiesFreeText: string;
  yearsExperienceBand: "0-2 years" | "3-5 years" | "6-10 years" | "10+ years";
  seniority: string;
  teamManagement: boolean;
  strategicResponsibilities: boolean;
  fundingProgrammeExperience: boolean;
  projectManagementExperience: boolean;
  stakeholderResponsibilities: boolean;
  internationalResponsibilities: boolean;
  selectedProfileIds: string[];
  targetMode: AssessmentTargetMode;
  currentRoleRequirementNotes?: string;
  futureRoleDescription?: string;
  futureRoleTargetLevelOverride?: Level;
}

// ---------------- Assessment state ----------------

export type AssessmentMode = "quick" | "standard" | "full" | "targeted";
export type Confidence = "Low" | "Moderate" | "High";
export type EvidenceStrength = "Very Low" | "Low" | "Moderate" | "Strong" | "Very Strong";
export type ConclusionStatus = "not-demonstrated" | "not-relevant" | "insufficient-evidence" | "demonstrated";

export interface CompetencyAssessmentState {
  competencyId: string;
  relevanceCurrent: Relevance;
  relevanceTarget: Relevance;
  levelProbabilities: Record<Level, number>;
  askedQuestionIds: string[];
  evidence: Evidence[];
  status: "not-started" | "in-progress" | "sufficient" | "skipped-low-relevance";
  currentLevelEstimate: Level | null;
  confidence: Confidence;
  evidenceStrength: EvidenceStrength;
  conclusionStatus: ConclusionStatus;
  selfReportedLevel?: Level;
  contradictionFlag: boolean;
  contradictionNote?: string;
  targetLevelCurrentRole?: Level;
  targetLevelFutureRole?: Level;
}

export interface AssessmentSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  step: number;
  lang: Lang;
  mode: AssessmentMode;
  targetedCompetencyIds?: string[];
  roleAnswers?: UserRoleAnswers;
  documents: UploadedDocument[];
  competencyStates: Record<string, CompetencyAssessmentState>;
  currentQuestionQueueHint?: string[];
  completed: boolean;
}

// ---------------- Gap analysis & report ----------------

export type Priority = "High" | "Medium" | "Low" | "N/A";

export interface DevelopmentGap {
  competencyId: string;
  currentLevel: Level | null;
  targetLevel: Level;
  gapSize: number;
  priority: Priority;
  why: string;
  missingBehaviours: string[];
  developmentFocus: string[];
  suggestedEvidence: string[];
}

export interface CompetencyReportRow {
  competencyId: string;
  competencyName: string;
  domain: DomainId;
  relevanceCurrent: Relevance;
  relevanceTarget: Relevance;
  currentLevel: Level | null;
  targetLevelCurrentRole?: Level;
  targetLevelFutureRole?: Level;
  confidence: Confidence;
  evidenceStrength: EvidenceStrength;
  conclusionStatus: ConclusionStatus;
  contradictionFlag: boolean;
  demonstratedBehaviours: string[];
  notYetDemonstratedBehaviours: string[];
}

export interface AssessmentReport {
  generatedAt: string;
  sessionId: string;
  lang: Lang;
  mode: AssessmentMode;
  roleAnswers?: UserRoleAnswers;
  rows: CompetencyReportRow[];
  domainSummaries: Record<DomainId, { strengths: string[]; gaps: string[] }>;
  topStrengths: string[];
  topDevelopmentPriorities: DevelopmentGap[];
  uncertaintyNotes: string[];
  executiveSummary: string;
}

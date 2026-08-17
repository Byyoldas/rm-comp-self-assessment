import { useState } from "react";
import type { AssessmentSession, AssessmentTargetMode, Lang, Level, RoleProfilesFile, UserRoleAnswers } from "../../../shared/types";
import { STRINGS } from "../i18n/strings";
import { levelLabel } from "../lib/levelColors";
import { experienceBandLabel } from "../lib/experienceBand";

const EXPERIENCE_BANDS = ["0-2 years", "3-5 years", "6-10 years", "10+ years"] as const;
const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

const CHECKBOX_KEYS: (keyof UserRoleAnswers)[] = [
  "teamManagement",
  "strategicResponsibilities",
  "fundingProgrammeExperience",
  "projectManagementExperience",
  "stakeholderResponsibilities",
  "internationalResponsibilities",
];

export default function RoleProfile({
  lang,
  session,
  roleProfiles,
  onNext,
  onBack,
}: {
  lang: Lang;
  session: AssessmentSession;
  roleProfiles: RoleProfilesFile;
  onNext: (answers: Partial<UserRoleAnswers>) => void;
  onBack: () => void;
}) {
  const s = STRINGS[lang].role;
  const existing = session.roleAnswers;
  const [jobTitle, setJobTitle] = useState(existing?.jobTitle ?? "");
  const [organisationType, setOrganisationType] = useState(existing?.organisationType ?? "");
  const [responsibilitiesFreeText, setResponsibilitiesFreeText] = useState(existing?.responsibilitiesFreeText ?? "");
  const [yearsExperienceBand, setYearsExperienceBand] = useState<(typeof EXPERIENCE_BANDS)[number]>(existing?.yearsExperienceBand ?? "3-5 years");
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const base: Record<string, boolean> = {};
    for (const key of CHECKBOX_KEYS) base[key as string] = Boolean(existing?.[key]);
    return base;
  });
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>(existing?.selectedProfileIds ?? []);
  const [targetMode, setTargetMode] = useState<AssessmentTargetMode>(existing?.targetMode ?? "current");
  const [currentRoleRequirementNotes, setCurrentRoleRequirementNotes] = useState(existing?.currentRoleRequirementNotes ?? "");
  const [futureRoleDescription, setFutureRoleDescription] = useState(existing?.futureRoleDescription ?? "");
  const [futureRoleTargetLevelOverride, setFutureRoleTargetLevelOverride] = useState<Level | "">(existing?.futureRoleTargetLevelOverride ?? "");

  const toggleProfile = (id: string) => {
    setSelectedProfileIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const canSubmit = jobTitle.trim().length > 0 && responsibilitiesFreeText.trim().length > 10 && selectedProfileIds.length > 0;

  const submit = () => {
    const answers: Partial<UserRoleAnswers> = {
      jobTitle,
      organisationType,
      responsibilitiesFreeText,
      yearsExperienceBand,
      seniority: yearsExperienceBand,
      teamManagement: flags.teamManagement,
      strategicResponsibilities: flags.strategicResponsibilities,
      fundingProgrammeExperience: flags.fundingProgrammeExperience,
      projectManagementExperience: flags.projectManagementExperience,
      stakeholderResponsibilities: flags.stakeholderResponsibilities,
      internationalResponsibilities: flags.internationalResponsibilities,
      selectedProfileIds,
      targetMode,
      currentRoleRequirementNotes: currentRoleRequirementNotes || undefined,
      futureRoleDescription: futureRoleDescription || undefined,
      futureRoleTargetLevelOverride: futureRoleTargetLevelOverride || undefined,
    };
    onNext(answers);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{s.heading}</h1>
        <p className="text-slate-500">{s.subtitle}</p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">{s.jobTitleLabel}</label>
            <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={s.jobTitlePlaceholder} />
          </div>
          <div>
            <label className="label">{s.orgTypeLabel}</label>
            <input className="input" value={organisationType} onChange={(e) => setOrganisationType(e.target.value)} placeholder={s.orgTypePlaceholder} />
          </div>
        </div>
        <div>
          <label className="label">{s.responsibilitiesLabel}</label>
          <textarea
            className="input min-h-[100px]"
            value={responsibilitiesFreeText}
            onChange={(e) => setResponsibilitiesFreeText(e.target.value)}
            placeholder={s.responsibilitiesPlaceholder}
          />
        </div>
        <div>
          <label className="label">{s.experienceLabel}</label>
          <select className="input max-w-xs" value={yearsExperienceBand} onChange={(e) => setYearsExperienceBand(e.target.value as (typeof EXPERIENCE_BANDS)[number])}>
            {EXPERIENCE_BANDS.map((b) => (
              <option key={b} value={b}>
                {experienceBandLabel(b, lang)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-3">{s.checkboxesHeading}</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {CHECKBOX_KEYS.map((key, i) => (
            <label key={key as string} className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={flags[key as string] ?? false}
                onChange={(e) => setFlags((prev) => ({ ...prev, [key as string]: e.target.checked }))}
              />
              {s.checkboxes[i]}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 mb-1">{s.profilesHeading}</h3>
        <p className="text-xs text-slate-400 mb-3">{s.profilesSubtitle}</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {roleProfiles.profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleProfile(p.id)}
              className={"text-left p-3 rounded-lg border text-sm transition-colors " + (selectedProfileIds.includes(p.id) ? "bg-brand-50 border-brand-400" : "border-slate-200 hover:border-slate-300")}
            >
              <div className="font-medium text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="font-semibold text-slate-800">{s.targetHeading}</h3>
        <div className="flex flex-wrap gap-3">
          {s.targetOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTargetMode(opt.id)}
              className={"pill border cursor-pointer px-3 py-1.5 " + (targetMode === opt.id ? "bg-brand-600 text-white border-brand-600" : "bg-white text-slate-600 border-slate-300")}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {(targetMode === "current" || targetMode === "both") && (
          <div>
            <label className="label">{s.currentNotesLabel}</label>
            <textarea className="input" value={currentRoleRequirementNotes} onChange={(e) => setCurrentRoleRequirementNotes(e.target.value)} placeholder={s.currentNotesPlaceholder} />
          </div>
        )}

        {(targetMode === "future" || targetMode === "both") && (
          <div className="space-y-3">
            <div>
              <label className="label">{s.futureDescLabel}</label>
              <textarea className="input" value={futureRoleDescription} onChange={(e) => setFutureRoleDescription(e.target.value)} placeholder={s.futureDescPlaceholder} />
            </div>
            <div>
              <label className="label">{s.futureLevelLabel}</label>
              <select className="input max-w-xs" value={futureRoleTargetLevelOverride} onChange={(e) => setFutureRoleTargetLevelOverride((e.target.value || "") as Level | "")}>
                <option value="">{s.futureLevelAuto}</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {levelLabel(l, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          {s.back}
        </button>
        <button className="btn-primary px-6" disabled={!canSubmit} onClick={submit}>
          {s.continue}
        </button>
      </div>
    </div>
  );
}

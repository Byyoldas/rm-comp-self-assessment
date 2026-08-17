import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Competency, Domain, Framework, Lang, Level, RoleProfileDefinition, RoleProfilesFile } from "../../../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedDir = path.resolve(__dirname, "../../../shared");

function loadJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(sharedDir, filename), "utf-8"));
}

export const framework: Framework = loadJson("framework.json");
export const roleProfilesFile: RoleProfilesFile = loadJson("roleProfiles.json");

interface FrameworkTranslation {
  meta: { name: string; publisher: string; copyright: string; extractionNote: string; domains: { id: string; name: string }[] };
  competencies: { id: string; name: string; description: string; levels: Partial<Record<Level, string[]>> }[];
}
interface RoleProfilesTranslation {
  meta: { label: string; disclaimer: string; targetLevelGuidanceNote: string };
  profiles: { id: string; name: string; description: string }[];
}

const frameworkTr: FrameworkTranslation = loadJson("framework.tr.json");
const roleProfilesTr: RoleProfilesTranslation = loadJson("roleProfiles.tr.json");

export const LEVELS: Level[] = ["Foundational", "Intermediate", "Advanced", "Expert"];

export function getCompetency(id: string): Competency {
  const c = framework.competencies.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown competency id: ${id}`);
  return c;
}

export function allCompetencies(): Competency[] {
  return framework.competencies;
}

export function competenciesByDomain(domain: string): Competency[] {
  return framework.competencies.filter((c) => c.domain === domain);
}

// ---------------- Localization ----------------
// English (framework.json) is always the canonical structural + fidelity source.
// Turkish (framework.tr.json) is a display-text overlay keyed by the same
// competency ids. If a translation is ever missing or malformed for a given
// level, this falls back to the English text for that level rather than
// leaving a gap — the fidelity checker separately flags any such fallback.

const localizedFrameworkCache = new Map<Lang, Framework>();
const localizedRoleProfilesCache = new Map<Lang, RoleProfilesFile>();

export function localizeFramework(lang: Lang): Framework {
  if (lang === "en") return framework;
  const cached = localizedFrameworkCache.get(lang);
  if (cached) return cached;

  const trCompetencyById = new Map(frameworkTr.competencies.map((c) => [c.id, c]));
  const trDomainNameById = new Map(frameworkTr.meta.domains.map((d) => [d.id, d.name]));

  const localized: Framework = {
    meta: {
      ...framework.meta,
      name: frameworkTr.meta.name,
      publisher: frameworkTr.meta.publisher,
      copyright: frameworkTr.meta.copyright,
      extractionNote: frameworkTr.meta.extractionNote,
      domains: framework.meta.domains.map((d): Domain => ({ id: d.id, name: trDomainNameById.get(d.id) ?? d.name })),
    },
    competencies: framework.competencies.map((c): Competency => {
      const tr = trCompetencyById.get(c.id);
      if (!tr) return c; // defensive fallback: untranslated competency stays in English
      const levels = { ...c.levels };
      for (const level of LEVELS) {
        const trBullets = tr.levels[level];
        if (trBullets && trBullets.length === (c.levels[level]?.length ?? 0)) {
          levels[level] = trBullets;
        }
        // mismatched or missing bullet counts silently fall back to English —
        // the fidelity checker (npm run fidelity) surfaces these as issues.
      }
      return { ...c, name: tr.name, description: tr.description, levels };
    }),
  };

  localizedFrameworkCache.set(lang, localized);
  return localized;
}

export function getLocalizedCompetency(id: string, lang: Lang): Competency {
  const c = localizeFramework(lang).competencies.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown competency id: ${id}`);
  return c;
}

export function localizeRoleProfiles(lang: Lang): RoleProfilesFile {
  if (lang === "en") return roleProfilesFile;
  const cached = localizedRoleProfilesCache.get(lang);
  if (cached) return cached;

  const trById = new Map(roleProfilesTr.profiles.map((p) => [p.id, p]));
  const localized: RoleProfilesFile = {
    meta: { ...roleProfilesFile.meta, label: roleProfilesTr.meta.label, disclaimer: roleProfilesTr.meta.disclaimer, targetLevelGuidanceNote: roleProfilesTr.meta.targetLevelGuidanceNote },
    profiles: roleProfilesFile.profiles.map((p): RoleProfileDefinition => {
      const tr = trById.get(p.id);
      if (!tr) return p;
      return { ...p, name: tr.name, description: tr.description };
    }),
  };
  localizedRoleProfilesCache.set(lang, localized);
  return localized;
}

export function domainNameLocalized(domainId: string, lang: Lang): string {
  return localizeFramework(lang).meta.domains.find((d) => d.id === domainId)?.name ?? domainId;
}

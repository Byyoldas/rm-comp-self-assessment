# RM Comp Self-Assessment Tool

An adaptive, evidence-based self-assessment tool for research managers and research-management
professionals, built against the **European Competence Framework for Research Managers (RM Comp)**
(European Commission, Research and Innovation, 2025 — `RM_Comp_Assesment.pdf`).

The tool asks what you actually do, not how you'd rate yourself. It infers a defensible
Foundational/Intermediate/Advanced/Expert level per competency from concrete evidence, compares it
to what your role requires, and produces a specific, descriptor-grounded development plan.

Available in **English and Turkish**, chosen via the toggle on the welcome screen (locked once an
assessment starts, so a session never mixes languages).

## Running it

Two processes, no database, nothing to provision.

```bash
cd server && npm install && npm run dev   # http://localhost:4000
cd client && npm install && npm run dev   # http://localhost:5173
```

Open `http://localhost:5173`. That's the whole app.

Optional: copy `server/.env.example` to `server/.env` and set `ANTHROPIC_API_KEY` to enable
LLM-assisted evidence evaluation (see [LLM use](#llm-use) below). Everything works correctly
without it.

**Tests & framework validation:**
```bash
cd server && npm test        # vitest: engine unit tests + automated fidelity check
cd server && npm run fidelity  # standalone framework coverage report (also at GET /api/fidelity)
```

## What was built

| Deliverable | Where |
|---|---|
| Structured RM Comp dataset (50 competencies, 7 domains, verbatim descriptors) | `shared/framework.json` |
| Role-profile relevance layer (application-layer, not RM Comp) | `shared/roleProfiles.json` |
| Question generation engine (descriptor-traceable) | `server/src/engine/questionBank.ts`, `flagshipQuestions.ts` |
| Evidence evaluator (heuristic, always-available) | `server/src/engine/evidenceEvaluator.ts` |
| Optional LLM evidence evaluator | `server/src/engine/llmService.ts` |
| Adaptive assessment engine | `server/src/engine/adaptiveEngine.ts` |
| Scoring / gap-analysis / report engine | `server/src/engine/scoringEngine.ts` |
| Evidence upload (CV/JD/etc.) | `server/src/lib/documentExtract.ts`, `engine/documentaryEvidence.ts` |
| Session persistence (pause/resume) | `server/src/store/sessionStore.ts` |
| REST API | `server/src/routes/*.ts` |
| Framework fidelity validator | `server/src/lib/fidelityCheck.ts` |
| Test suite | `server/src/**/__tests__/*.test.ts` |
| Full 8-step UI (mode → role → evidence → adaptive Q&A → dashboard → gaps → report) | `client/src/pages/*.tsx` |
| Dashboard (heatmap, current-vs-target, priority board) | `client/src/components/*.tsx` |
| Report (view + PDF print + JSON/CSV export) | `client/src/pages/Report.tsx` |
| Turkish translation (framework + role profiles) | `shared/framework.tr.json`, `shared/roleProfiles.tr.json` |
| Bilingual question/report text + Turkish-aware evidence heuristics | `server/src/i18n/*.ts` |
| Language toggle + full client i18n dictionary | `client/src/i18n/strings.ts`, `components/Layout.tsx` |

## Architecture

```
rm-comp-assessment/
  shared/            # framework.json, roleProfiles.json, types.ts — used by both sides
  server/            # Express + TypeScript. Owns ALL scoring logic — the client never scores itself.
    src/
      lib/           # framework loader, document text extraction, fidelity checker
      engine/        # question generation, evidence evaluation, adaptive engine, scoring
      routes/        # REST endpoints
      store/         # JSON-file session persistence (server/data/sessions/<id>.json)
  client/            # React + Vite + TypeScript + Tailwind. Rendering only.
```

**No database.** Framework data is static JSON; assessment sessions are one JSON file per
session under `server/data/sessions/`, keyed by a UUID the browser keeps in `localStorage`. That's
what makes "pause and continue" work with zero infrastructure. If this needs to scale to many
concurrent users later, swapping the file store for a real DB behind `sessionStore.ts`'s
`load/save` interface is a contained change.

**Scoring lives entirely server-side.** The client never computes a level, confidence, or gap —
it only renders what `/api/sessions/:id/report` returns. This is deliberate: it's what makes the
"don't reveal scoring in a gameable way" requirement possible while still being fully transparent
about the *result* (every conclusion traces back through evidence → descriptor text).

## How the RM Comp framework is represented

`shared/framework.json` is a direct, verbatim transcription of the 29-page source PDF: 7 domains,
50 competencies, each with up to 4 levels (Foundational/Intermediate/Advanced/Expert) and their
descriptor bullets exactly as written. One competency (*Managing the Grant/Research Support
Office*) has no Foundational descriptors in the source PDF — that gap is preserved and explicitly
flagged (`_note` field, and the fidelity checker treats it as a known/expected gap rather than
silently filling it in or silently failing).

`shared/roleProfiles.json` is a **separate, clearly-labelled application layer** — 12 role
profiles (Research Support, Grant/Proposal Management, Post-Award Management, etc.) used only to
weight which competencies get more questions and to suggest (never impose) a starting target
level. Every place this appears in the UI says explicitly that it isn't part of RM Comp.

## Internationalization (English / Turkish)

**Design principle: internal identifiers stay canonical English everywhere; only display text is
localized.** `Level` values (`"Foundational"`, `"Advanced"`, …), competency/domain ids, dimension
and question-type enums are never translated — all comparison, sorting, and scoring logic in
`adaptiveEngine.ts` / `scoringEngine.ts` is completely language-agnostic. Only the *text shown to
the user* is swapped, via a display-only `levelLabel(level, lang)` helper on both sides.

- `shared/framework.tr.json` / `shared/roleProfiles.tr.json` — Turkish translation overlays, keyed
  by the same competency/profile ids as the English source. `server/src/lib/framework.ts`'s
  `localizeFramework(lang)` merges English structure with Turkish text, **falling back to English
  per-level if a translation is missing or has a mismatched bullet count** rather than silently
  showing nothing — and the fidelity checker (`translationParity` in its report) treats any such
  fallback as a failure, so a translation gap can't ship unnoticed.
- The question bank (`questionBank.ts`, `flagshipQuestions.ts`), evidence heuristics
  (`i18n/textAnalysis.ts` — Turkish-aware tokenization, stopwords, and outcome-verb/vague-language
  detection using stem matching since Turkish is agglutinative), and all report/gap-analysis prose
  (`i18n/reportText.ts`) are fully bilingual, generated per-session from `session.lang`.
- A session's language is fixed at creation (`POST /api/sessions` takes `{ lang }`) and never
  changes — the toggle in the header is disabled once a session exists, so a session can't end up
  with mixed-language questions and answers.
- Optional LLM-assisted evaluation (see below) needs no special handling for Turkish: the
  localized competency object (already in Turkish) is simply what gets passed into the prompt.

## How adaptive questioning works

1. **Question generation** (`questionBank.ts`): for every competency, and for every level boundary
   that has descriptors on both sides (F↔I, I↔A, A↔E), the engine generates 4 questions — one
   behavioural free-text prompt, one autonomy/scope structured question, one
   frequency/consistency question, and one outcome/evidence question — each one quoting the actual
   descriptor bullet(s) it's testing. A handful of competencies (Research Project Management,
   Pre-Award, Post-Award, People Management, Strategic Planning, Key Stakeholder Engagement) also
   have hand-crafted scenario questions with graded multiple-choice options. This produces 853
   traceable questions from the 50-competency framework — verified by the fidelity checker, which
   fails the build if any question can't be traced back to real descriptor text.

2. **Evidence evaluation** (`evidenceEvaluator.ts`): each answer is scored per targeted level.
   Structured answers (autonomy/frequency selects) map directly via pre-authored level weights.
   Free-text answers are scored by a *specificity-gated* heuristic — the response earns credit
   proportional to how concrete and on-topic it is (numbers, named outcomes, action verbs, length,
   relevant vocabulary), not from reusing the descriptor's exact wording. Generic confidence
   language ("I'm very experienced", "I'm an expert at this") is actively penalised, not rewarded.

3. **Adaptive engine** (`adaptiveEngine.ts`): each competency holds a probability distribution
   over the 4 levels, starting with a prior deliberately weighted toward the lower levels (a
   higher level must be earned). Each answer updates the distribution. The engine then:
   - picks the next competency to ask about — breadth-first across not-yet-started competencies
     (weighted by role relevance), then depth-first on whichever in-progress competency is most
     ambiguous (smallest margin between its top two candidate levels);
   - picks the next question for that competency — preferring one that discriminates the current
     top two candidate levels;
   - stops a competency once its top level has a clear margin over the second-place level (after a
     minimum of 2 questions) or a mode-dependent question cap is hit.

4. **Conservative award rule**: a level is only assigned if (a) the cumulative posterior mass at
   or above that level clears 50%, **and** (b) at least one piece of evidence directly touched
   that level with signal ≥ 0.35. This is enforced twice — once implicitly through evaluator
   scoring, and again independently at the point evidence is recorded
   (`gateBySpecificity` in `adaptiveEngine.ts`), so a future evaluator (e.g. a different LLM
   integration) can't accidentally bypass it by reporting high signal for a low-specificity
   answer. This was caught by the test suite during development — see `__tests__/adaptiveEngine.test.ts`.

## Current vs. target competence

Every competency tracks two independent things: the evidence-supported **current level**, and a
**target level** — which is *never* auto-set to "Expert" or inferred purely from years of
experience or job title. The target comes from what the user says their current role requires
and/or their described future role, with a role-profile-based suggestion offered as a starting
point the user can freely override. Users choose whether to assess against their current role,
a future role, or both (`RoleProfile.tsx`).

## Evidence handling

- **Self-reported** (free-text / structured answers to direct questions) — the primary evidence
  source, scored as above.
- **Documentary** (uploaded CV/JD/etc.) — extracted via `pdf-parse` / `mammoth`, then matched
  against descriptor vocabulary in `documentaryEvidence.ts`. This is *deliberately capped low*
  (max signal 0.3, specificity fixed at 0.3): a keyword appearing in a document is never treated
  as proof of competence on its own. It nudges the posterior; it can't single-handedly produce a
  level.
- **Scenario-performance** — graded multiple-choice scenario responses.
- Documents are processed locally by this app's own server and are not sent anywhere else unless
  LLM-assisted evaluation is explicitly enabled via `ANTHROPIC_API_KEY`.

## LLM use

Entirely optional, isolated behind `server/src/engine/llmService.ts`, and never the sole source of
truth. When `ANTHROPIC_API_KEY` is set, free-text answers are also evaluated by an LLM prompted to
map the response strictly against that competency's own descriptor text (never inventing new
descriptors), and the result is blended with — not substituted for — the heuristic score, still
gated by the same specificity dampener. Without a key, the tool runs fully offline on the
heuristic evaluator alone.

## Known limitations

- The offline heuristic evaluator uses keyword/topicality overlap plus a specificity heuristic —
  it's a reasonable, conservative, always-available approximation, not true semantic understanding.
  Enabling LLM-assisted evaluation improves this considerably.
- Only ~15 competencies (Grant/Proposal Management persona, Full mode aside) get hand-crafted
  scenario questions; the rest rely on the template-generated question set. All are descriptor-
  traceable, but the hand-crafted ones read more naturally.
- Document extraction supports `.txt`, `.md`, `.pdf`, `.docx`. No OCR for scanned/image-only PDFs.
- Session storage is flat JSON files — fine for individual/small-team local use, not designed for
  concurrent multi-tenant production load.
- The Turkish translation is a full professional translation of all 50 competencies and every UI
  string, but — like any single-pass human/AI translation — hasn't been reviewed by a second
  native-speaker linguist; structural completeness (every competency, every level, matching bullet
  counts) is enforced by the fidelity checker, but nuance/register wasn't independently audited.
- Role-profile relevance weighting (`roleProfiles.json`) is a reasonable first-pass design, built
  for this tool, not validated against real RM Comp usage data.

## Framework fidelity

`server/src/lib/fidelityCheck.ts` (also `GET /api/fidelity`, also run automatically in
`npm test`) checks: all 50 competencies and 7 domains are present; every level's descriptors match
the source verbatim; every generated question (in **both** English and Turkish) traces to real
descriptor text or the competency's own description; any gap in level coverage (like the one
documented gap above) is an expected, labelled one rather than a silent omission; and the Turkish
translation overlay has full structural parity with English (same competencies present, same
levels populated, same bullet count per level) — a mismatch here is exactly the kind of thing that
would otherwise silently fall back to English, so it's treated as a hard failure, not a warning.

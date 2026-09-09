import { AssessmentModule, RiskLevel } from '../types';

export const SUPPORTED_MVP_MODULES = [AssessmentModule.ARCHITECTURE, AssessmentModule.VULNERABILITY] as const;
export type SupportedMvpModule = (typeof SUPPORTED_MVP_MODULES)[number];

export interface EvidenceFindingDraft { module: AssessmentModule; title: string; riskLevel: RiskLevel; observation: string; evidenceReference: string; evidenceExcerpt: string; impact: string; recommendation: string; }
export interface EvidenceFinding extends EvidenceFindingDraft { id: string; }
export interface AssessmentStatus { code: 'NOT_ASSESSED' | 'EVIDENCE_INTAKE_INCOMPLETE' | 'EVIDENCE_RECORDED_REQUIRES_REVIEW'; label: string; detail: string; coveredModules: AssessmentModule[]; missingModules: AssessmentModule[]; }

const REQUIRED_FIELDS: Array<[keyof EvidenceFindingDraft, string]> = [
  ['title', 'Finding title is required.'], ['observation', 'Assessor observation is required.'],
  ['evidenceReference', 'Evidence reference is required.'], ['evidenceExcerpt', 'Evidence excerpt or locator is required.'],
  ['impact', 'Impact statement is required.'], ['recommendation', 'Recommendation is required.'],
];

export const isSupportedModule = (module: AssessmentModule): module is SupportedMvpModule => SUPPORTED_MVP_MODULES.includes(module as SupportedMvpModule);
export const validateEvidenceFindingDraft = (draft: EvidenceFindingDraft) => {
  const errors = REQUIRED_FIELDS.filter(([field]) => typeof draft[field] !== 'string' || !draft[field].trim()).map(([, message]) => message);
  if (!isSupportedModule(draft.module)) errors.unshift(`${draft.module} is not supported for evidence intake in this MVP.`);
  if (!Object.values(RiskLevel).includes(draft.riskLevel)) errors.push('Assessor severity is invalid.');
  return { valid: errors.length === 0, errors };
};
export const isEligibleEvidenceFinding = (finding: EvidenceFindingDraft): boolean => validateEvidenceFindingDraft(finding).valid;

export const deriveAssessmentStatus = (findings: EvidenceFinding[]): AssessmentStatus => {
  const coveredModules = SUPPORTED_MVP_MODULES.filter(module => findings.some(finding => finding.module === module));
  const missingModules = SUPPORTED_MVP_MODULES.filter(module => !coveredModules.includes(module));
  if (coveredModules.length === 0) return { code: 'NOT_ASSESSED', label: 'Not assessed', detail: 'No evidence-backed human findings have been recorded for the supported MVP modules.', coveredModules, missingModules };
  if (missingModules.length > 0) return { code: 'EVIDENCE_INTAKE_INCOMPLETE', label: 'Evidence intake incomplete', detail: 'Evidence is recorded for part of the MVP boundary. No assurance outcome is available.', coveredModules, missingModules };
  return { code: 'EVIDENCE_RECORDED_REQUIRES_REVIEW', label: 'Evidence recorded — human review required', detail: 'Evidence has been recorded for each supported MVP module. This is not an assurance conclusion, control validation, or compliance attestation.', coveredModules, missingModules };
};

export interface MaturityComponentInput { rating?: number; eligibleEvidenceCount: number; }
export interface MaturityComponent { module: SupportedMvpModule; rating: number; eligibleEvidenceCount: number; weight: number; contribution: number; }
export const MATURITY_MODEL_VERSION = 'maturity-v1';
export const MATURITY_FORMULA = 'Σ(component rating × fixed module weight)';
export const MATURITY_PROVENANCE = 'assessor-entered ratings and human-recorded evidence only.';
export const MATURITY_ROUNDING = 'rounded to 2 decimal places after weighted sum';
export interface MaturityScore { valid: boolean; score: number | null; components: MaturityComponent[]; modelVersion: string; formula: string; provenance: string; rounding: string; reason?: string; }

/**
 * Provisional maturity model: score = Σ(component rating × fixed module weight).
 * Ratings are assessor-entered on a 0–5 ordinal scale; both MVP modules weigh 50%.
 * A score is valid only when every module has an integer rating in range and at least
 * one eligible evidence record (valid reference + excerpt). Missing/unknown is invalid,
 * never treated as zero. Evidence counts document coverage but do not inflate scores.
 */
const scoreMetadata = { modelVersion: MATURITY_MODEL_VERSION, formula: MATURITY_FORMULA, provenance: MATURITY_PROVENANCE, rounding: MATURITY_ROUNDING };
const invalidScore = (components: MaturityComponent[], reason: string): MaturityScore => ({ valid: false, score: null, components, reason, ...scoreMetadata });

export const calculateMaturityScore = (inputs: unknown): MaturityScore => {
  const weight = 1 / SUPPORTED_MVP_MODULES.length;
  const components: MaturityComponent[] = [];
  if (inputs === null || typeof inputs !== 'object' || Array.isArray(inputs)) return invalidScore(components, 'Maturity score inputs must be an object.');
  for (const module of SUPPORTED_MVP_MODULES) {
    const input = (inputs as Partial<Record<SupportedMvpModule, MaturityComponentInput>>)[module];
    if (!input || input.rating === undefined || !Number.isFinite(input.rating) || !Number.isInteger(input.rating) || input.rating < 0 || input.rating > 5) return invalidScore(components, `${module} maturity rating is missing or must be an integer from 0 to 5.`);
    if (!Number.isInteger(input.eligibleEvidenceCount) || input.eligibleEvidenceCount < 1) return invalidScore(components, `${module} requires at least one eligible evidence record before scoring.`);
    components.push({ module, rating: input.rating, eligibleEvidenceCount: input.eligibleEvidenceCount, weight, contribution: input.rating * weight });
  }
  return { valid: true, score: Number(components.reduce((sum, component) => sum + component.contribution, 0).toFixed(2)), components, ...scoreMetadata };
};

export type LocalEvidenceFormat = 'text' | 'config' | 'log' | 'report' | 'unknown';
export interface LocalEvidenceExcerpt { source: string; lineStart: number; lineEnd: number; text: string; }
export interface LocalEvidenceParseResult { source: { filename: string; format: LocalEvidenceFormat }; format: LocalEvidenceFormat; excerpts: LocalEvidenceExcerpt[]; error?: string; warnings?: string[]; }
export const DEFAULT_EVIDENCE_MAX_BYTES = 1_000_000;
export const DEFAULT_EVIDENCE_MAX_LINES = 2_000;
const FORMAT_BY_EXTENSION: Record<string, LocalEvidenceFormat> = {
  txt: 'text', text: 'text', md: 'report', csv: 'report', json: 'config', log: 'log', report: 'report',
};

/** Parse only caller-provided local text; this function performs no I/O, execution, inference, or network access. */
export const parseLocalEvidence = (content: string, filename: string, options: { maxBytes?: number; maxLines?: number } = {}): LocalEvidenceParseResult => {
  const extension = filename.toLowerCase().split('.').pop() || '';
  const format = FORMAT_BY_EXTENSION[extension] || 'unknown';
  const source = { filename, format };
  if (format === 'unknown') return { source, format, excerpts: [], error: 'Unsupported evidence format. Use a text, config, log, or report file.' };
  const maxBytes = options.maxBytes ?? DEFAULT_EVIDENCE_MAX_BYTES;
  const maxLines = options.maxLines ?? DEFAULT_EVIDENCE_MAX_LINES;
  const bytes = new TextEncoder().encode(content).byteLength;
  if (bytes > maxBytes) return { source, format, excerpts: [], error: `Evidence exceeds the ${maxBytes}-byte size safety limit.` };
  if (/\uFFFD/.test(content) || [...content].some(character => {
    const code = character.codePointAt(0) ?? 0;
    return (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) || (code >= 0x7f && code <= 0x9f);
  })) return { source, format, excerpts: [], error: 'binary or undecodable evidence is not supported.' };
  if (extension === 'json') { try { JSON.parse(content); } catch { return { source, format, excerpts: [], error: 'malformed JSON evidence was rejected safely.' }; } }
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > maxLines) return { source, format, excerpts: [], error: `Evidence exceeds the ${maxLines}-line safety limit.` };
  const excerpts = lines.map((line, index) => ({ line: line.trim(), number: index + 1 })).filter(item => item.line).map(item => ({ source: filename, lineStart: item.number, lineEnd: item.number, text: item.line }));
  return { source, format, excerpts, warnings: excerpts.length === 0 ? ['No non-empty text lines were found.'] : ['Lexical parsing only; no findings, severity, controls, or conclusions are inferred.'] };
};

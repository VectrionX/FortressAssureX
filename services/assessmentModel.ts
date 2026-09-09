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
export interface MaturityScore { valid: boolean; score: number | null; components: MaturityComponent[]; reason?: string; }

/**
 * Provisional maturity model: score = Σ(component rating × fixed module weight).
 * Ratings are assessor-entered on a 0–5 ordinal scale; both MVP modules weigh 50%.
 * A score is valid only when every module has an integer rating in range and at least
 * one eligible evidence record (valid reference + excerpt). Missing/unknown is invalid,
 * never treated as zero. Evidence counts document coverage but do not inflate scores.
 */
export const calculateMaturityScore = (inputs: Partial<Record<SupportedMvpModule, MaturityComponentInput>>): MaturityScore => {
  const weight = 1 / SUPPORTED_MVP_MODULES.length;
  const components: MaturityComponent[] = [];
  for (const module of SUPPORTED_MVP_MODULES) {
    const input = inputs[module];
    if (!input || input.rating === undefined || !Number.isInteger(input.rating) || input.rating < 0 || input.rating > 5) return { valid: false, score: null, components, reason: `${module} maturity rating is missing or must be an integer from 0 to 5.` };
    if (!Number.isInteger(input.eligibleEvidenceCount) || input.eligibleEvidenceCount < 1) return { valid: false, score: null, components, reason: `${module} requires at least one eligible evidence record before scoring.` };
    components.push({ module, rating: input.rating, eligibleEvidenceCount: input.eligibleEvidenceCount, weight, contribution: input.rating * weight });
  }
  return { valid: true, score: Number(components.reduce((sum, component) => sum + component.contribution, 0).toFixed(2)), components };
};

export type LocalEvidenceFormat = 'text' | 'config' | 'log' | 'report' | 'unknown';
export interface LocalEvidenceExcerpt { lineStart: number; lineEnd: number; text: string; }
export interface LocalEvidenceParseResult { format: LocalEvidenceFormat; excerpts: LocalEvidenceExcerpt[]; error?: string; warnings?: string[]; }
const FORMAT_BY_EXTENSION: Record<string, LocalEvidenceFormat> = {
  txt: 'text', text: 'text', md: 'report', csv: 'report', json: 'config', yaml: 'config', yml: 'config',
  ini: 'config', conf: 'config', cfg: 'config', xml: 'config', log: 'log', report: 'report', html: 'report',
};

/** Parse only caller-provided local text; this function performs no I/O or network access. */
export const parseLocalEvidence = (content: string, filename: string, options: { maxBytes?: number; maxLines?: number } = {}): LocalEvidenceParseResult => {
  const extension = filename.toLowerCase().split('.').pop() || '';
  const format = FORMAT_BY_EXTENSION[extension] || 'unknown';
  if (format === 'unknown') return { format, excerpts: [], error: 'Unsupported evidence format. Use a text, config, log, or report file.' };
  const maxBytes = options.maxBytes ?? 1_000_000;
  const maxLines = options.maxLines ?? 2_000;
  const bytes = new TextEncoder().encode(content).byteLength;
  if (bytes > maxBytes) return { format, excerpts: [], error: `Evidence exceeds the ${maxBytes}-byte size safety limit.` };
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > maxLines) return { format, excerpts: [], error: `Evidence exceeds the ${maxLines}-line safety limit.` };
  const excerpts = lines.map((line, index) => ({ line: line.trim(), number: index + 1 })).filter(item => item.line).map(item => ({ lineStart: item.number, lineEnd: item.number, text: item.line }));
  return { format, excerpts, warnings: excerpts.length === 0 ? ['No non-empty text lines were found.'] : ['Parsing is lexical only; no findings, controls, or conclusions are inferred.'] };
};

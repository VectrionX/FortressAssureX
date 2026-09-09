import { describe, expect, it } from 'vitest';
import { AssessmentModule, RiskLevel } from '../types';
import { createSampleAssessment } from './sampleAssessment';
import { deriveAssessmentStatus, calculateMaturityScore, isSupportedModule, parseLocalEvidence, validateEvidenceFindingDraft, type EvidenceFindingDraft } from './assessmentModel';

const validDraft: EvidenceFindingDraft = { module: AssessmentModule.ARCHITECTURE, title: 'Broad firewall rule observed', riskLevel: RiskLevel.HIGH, observation: 'The assessor observed a broad allow rule in the supplied export.', evidenceReference: 'FW-EDGE-01 running-config, line 184', evidenceExcerpt: 'permit ip any any', impact: 'The rule may permit unnecessary network paths.', recommendation: 'Review and constrain the rule to documented flows.' };

describe('supported assessment boundary', () => {
  it('supports only the two evidence-intake MVP modules', () => { expect(isSupportedModule(AssessmentModule.ARCHITECTURE)).toBe(true); expect(isSupportedModule(AssessmentModule.VULNERABILITY)).toBe(true); expect(isSupportedModule(AssessmentModule.IDENTITY)).toBe(false); });
  it('rejects a human finding without an evidence reference and excerpt', () => { const result = validateEvidenceFindingDraft({ ...validDraft, evidenceReference: '', evidenceExcerpt: '' }); expect(result.valid).toBe(false); expect(result.errors).toContain('Evidence reference is required.'); expect(result.errors).toContain('Evidence excerpt or locator is required.'); });
  it('rejects a finding for a module outside the MVP boundary', () => { const result = validateEvidenceFindingDraft({ ...validDraft, module: AssessmentModule.IDENTITY }); expect(result.valid).toBe(false); expect(result.errors).toContain('Identity & Access is not supported for evidence intake in this MVP.'); });
  it('rejects an invalid runtime severity instead of recording an unbounded value', () => { const result = validateEvidenceFindingDraft({ ...validDraft, riskLevel: 'SEVERE' as RiskLevel }); expect(result.valid).toBe(false); expect(result.errors).toContain('Assessor severity is invalid.'); });
});

describe('assessment status', () => {
  it('is not assessed when no evidence-backed human findings exist', () => { expect(deriveAssessmentStatus([])).toMatchObject({ code: 'NOT_ASSESSED', label: 'Not assessed', coveredModules: [], missingModules: [AssessmentModule.ARCHITECTURE, AssessmentModule.VULNERABILITY] }); });
  it('stays incomplete until both supported modules have evidence', () => { expect(deriveAssessmentStatus([{ ...validDraft, id: 'finding-1' }])).toMatchObject({ code: 'EVIDENCE_INTAKE_INCOMPLETE', coveredModules: [AssessmentModule.ARCHITECTURE], missingModules: [AssessmentModule.VULNERABILITY] }); });
  it('does not issue assurance after evidence exists for every supported module', () => { expect(deriveAssessmentStatus([{ ...validDraft, id: 'finding-1' }, { ...validDraft, id: 'finding-2', module: AssessmentModule.VULNERABILITY }])).toMatchObject({ code: 'EVIDENCE_RECORDED_REQUIRES_REVIEW', coveredModules: [AssessmentModule.ARCHITECTURE, AssessmentModule.VULNERABILITY], missingModules: [] }); });
});

describe('synthetic sample assessment', () => {
  it('creates a deterministic, read-only synthetic demonstration state', () => {
    expect(createSampleAssessment()).toEqual(createSampleAssessment());
    expect(createSampleAssessment()).toMatchObject({ mode: 'sample', isInitialized: true, projectName: 'Sample Payments Gateway', systemOwner: 'Synthetic Example Team' });
  });
  it('uses only supported modules and clearly synthetic evidence records', () => {
    const sample = createSampleAssessment();
    expect(sample.findings.length).toBeGreaterThan(0);
    for (const finding of sample.findings) {
      expect(isSupportedModule(finding.module)).toBe(true);
      expect(finding.id).toMatch(/^sample-/);
      expect(finding.evidenceReference).toContain('SAMPLE-');
      expect(finding.evidenceExcerpt).toContain('Synthetic');
    }
  });
});

describe('maturity scoring', () => {
  it('calculates weighted component scores and exposes formula metadata', () => {
    const result = calculateMaturityScore({ [AssessmentModule.ARCHITECTURE]: { rating: 4, eligibleEvidenceCount: 2 }, [AssessmentModule.VULNERABILITY]: { rating: 2, eligibleEvidenceCount: 1 } });
    expect(result.valid).toBe(true); expect(result.score).toBe(3); expect(result.modelVersion).toBe('maturity-v1'); expect(result.provenance).toContain('assessor-entered'); expect(result.rounding).toBe('rounded to 2 decimal places after weighted sum'); expect(result.formula).toBe('Σ(component rating × fixed module weight)');
    expect(result.components).toEqual([expect.objectContaining({ module: AssessmentModule.ARCHITECTURE, rating: 4, weight: 0.5, contribution: 2 }), expect.objectContaining({ module: AssessmentModule.VULNERABILITY, rating: 2, weight: 0.5, contribution: 1 })]);
  });
  it('does not score when required evidence or rating is missing', () => { expect(calculateMaturityScore({ [AssessmentModule.ARCHITECTURE]: { rating: 5, eligibleEvidenceCount: 1 } })).toMatchObject({ valid: false, score: null, reason: expect.stringContaining('Vulnerability') }); expect(calculateMaturityScore({ [AssessmentModule.ARCHITECTURE]: { rating: 5, eligibleEvidenceCount: 0 }, [AssessmentModule.VULNERABILITY]: { rating: 5, eligibleEvidenceCount: 1 } })).toMatchObject({ valid: false, score: null, reason: expect.stringContaining('eligible evidence') }); });
  it('invalidates non-finite and non-integer ratings without producing a number', () => { expect(calculateMaturityScore({ [AssessmentModule.ARCHITECTURE]: { rating: NaN, eligibleEvidenceCount: 1 }, [AssessmentModule.VULNERABILITY]: { rating: 4, eligibleEvidenceCount: 1 } })).toMatchObject({ valid: false, score: null }); });
  it.each([undefined, null, 'not an object', 42, []])('rejects arbitrary runtime input %p without throwing', input => { expect(calculateMaturityScore(input)).toMatchObject({ valid: false, score: null }); });
});

describe('bounded local evidence parsing', () => {
  it('parses safe text-like formats into line-addressable excerpts without findings', () => { const result = parseLocalEvidence('allow tcp any any\nERROR: login failed', 'gateway.log'); expect(result.format).toBe('log'); expect(result.excerpts).toEqual([expect.objectContaining({ lineStart: 1, text: 'allow tcp any any' }), expect.objectContaining({ lineStart: 2, text: 'ERROR: login failed' })]); expect(result).not.toHaveProperty('findings'); });
  it('rejects unsupported or oversized local evidence with clear errors', () => { expect(parseLocalEvidence('secret', 'evidence.exe').error).toContain('Unsupported'); expect(parseLocalEvidence('x'.repeat(100), 'notes.txt', { maxBytes: 10 }).error).toContain('size'); });
  it('returns source provenance and rejects binary or malformed JSON safely', () => { expect(parseLocalEvidence('{"ok":true}', 'gateway.json')).toMatchObject({ source: { filename: 'gateway.json' }, excerpts: [expect.objectContaining({ source: 'gateway.json', lineStart: 1 })] }); expect(parseLocalEvidence('plain\u0000binary', 'gateway.txt').error).toContain('binary'); expect(parseLocalEvidence('{"broken":', 'gateway.json').error).toContain('malformed'); });
  it('allows ordinary line controls but rejects other control-byte content', () => { expect(parseLocalEvidence('first\r\nsecond\tcolumn', 'gateway.txt').error).toBeUndefined(); expect(parseLocalEvidence('binary\u000Bcontent', 'gateway.txt').error).toContain('binary'); expect(parseLocalEvidence('binary\u007Fcontent', 'gateway.txt').error).toContain('binary'); });
  it('accepts only documented lexical formats and JSON validation', () => { expect(parseLocalEvidence('<html></html>', 'gateway.html').error).toContain('Unsupported'); expect(parseLocalEvidence('key: value', 'gateway.yaml').error).toContain('Unsupported'); });
});

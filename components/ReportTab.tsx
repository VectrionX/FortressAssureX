import React from 'react';
import { AssessmentState } from '../types';
import { AssessmentStatus, calculateMaturityScore, isEligibleEvidenceFinding, MATURITY_FORMULA, MATURITY_MODEL_VERSION, MATURITY_PROVENANCE, MATURITY_ROUNDING, SUPPORTED_MVP_MODULES, type SupportedMvpModule } from '../services/assessmentModel';
import { RiskBadge } from './RiskBadge';

interface ReportTabProps {
  state: AssessmentState;
  status: AssessmentStatus;
  maturityRatings: Partial<Record<SupportedMvpModule, number>>;
}

export const ReportTab: React.FC<ReportTabProps> = ({ state, status, maturityRatings }) => {
  const maturity = calculateMaturityScore(Object.fromEntries(SUPPORTED_MVP_MODULES.map(module => [module, { rating: maturityRatings[module], eligibleEvidenceCount: state.findings.filter(finding => finding.module === module && isEligibleEvidenceFinding(finding)).length }])) as Partial<Record<SupportedMvpModule, { rating?: number; eligibleEvidenceCount: number }>>);
  return (
  <div className="space-y-6 pb-10">
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{state.mode === 'sample' ? 'Sample evidence ledger — synthetic data' : 'Evidence ledger'}</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{state.mode === 'sample' ? 'Illustrative findings register' : 'Human findings register'}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{state.mode === 'sample' ? 'These are synthetic demonstration records only. No assessment, evidence collection, control validation, or assurance was performed.' : 'This is not an assurance report. It is a local, browser-session record of human-entered observations and their stated evidence. It is not a control validation or compliance attestation.'}</p>
    </section>

    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><p className="text-xs font-black uppercase tracking-[0.16em]">{state.mode === 'sample' ? 'Sample notice' : 'Current status'}</p><h2 className="mt-1 text-xl font-bold">{state.mode === 'sample' ? 'Not an assessment result' : status.label}</h2><p className="mt-2 text-sm leading-6">{state.mode === 'sample' ? 'The records below are illustrative and must not be treated as results for a real customer, system, or environment.' : status.detail}</p><p className="mt-3 text-xs font-semibold">Supported boundary: {SUPPORTED_MVP_MODULES.join(' · ')}</p></section>

    <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-cyan-950"><h2 className="text-lg font-bold">Maturity indicator method record</h2><dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="font-bold">Version</dt><dd>{MATURITY_MODEL_VERSION}</dd></div><div><dt className="font-bold">Formula</dt><dd>{MATURITY_FORMULA}</dd></div><div><dt className="font-bold">Provenance</dt><dd>{MATURITY_PROVENANCE}</dd></div><div><dt className="font-bold">Rounding</dt><dd>{MATURITY_ROUNDING}</dd></div></dl><p className="mt-3 text-xs leading-5">Numeric output is invalidated when either supported module lacks an eligible human evidence record or an integer rating from 0–5. Missing and unknown values are never treated as zero.</p></section>

    <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-cyan-950"><h2 className="text-lg font-bold">Calculated indicator for this ledger</h2><p className="mt-2 text-sm">{maturity.valid ? `${maturity.score} / 5` : 'No numeric score — eligibility or ratings incomplete.'}</p>{maturity.valid && <p className="mt-2 text-xs">{maturity.components.map(component => `${component.module}: ${component.rating} × ${(component.weight * 100).toFixed(0)}% = ${component.contribution.toFixed(2)}`).join(' · ')}</p>}<p className="mt-2 text-xs">{maturity.valid ? 'Calculation uses the displayed ratings and eligible evidence counts for this browser session.' : maturity.reason}</p></section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5 sm:p-6"><h2 className="text-lg font-bold text-slate-900">Evidence-linked findings</h2><p className="mt-1 text-sm text-slate-600">{state.findings.length} record{state.findings.length === 1 ? '' : 's'} in this browser session.</p></div>
      {state.findings.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No evidence-backed human findings have been recorded. The assessment remains not assessed.</div> : <div className="divide-y divide-slate-100">{state.findings.map(finding => <article key={finding.id} className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{finding.module}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{finding.title}</h3></div><RiskBadge level={finding.riskLevel} /></div><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-slate-700">Assessor observation</dt><dd className="mt-1 leading-6 text-slate-600">{finding.observation}</dd></div><div><dt className="font-bold text-slate-700">Evidence reference</dt><dd className="mt-1 break-words font-mono text-xs leading-6 text-slate-600">{finding.evidenceReference}</dd></div><div><dt className="font-bold text-slate-700">Evidence excerpt or locator</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-slate-600">{finding.evidenceExcerpt}</dd></div><div><dt className="font-bold text-slate-700">Impact and recommendation</dt><dd className="mt-1 leading-6 text-slate-600">{finding.impact}<br /><span className="font-semibold text-slate-800">Recommended action:</span> {finding.recommendation}</dd></div></dl><p className="mt-5 text-xs text-slate-500">Status: {finding.status} · Recorded {new Date(finding.recordedAt).toLocaleString()}</p></article>)}</div>}
    </section>
  </div>
);
};

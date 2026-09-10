import React, { useMemo, useState } from 'react';
import { AssessmentModule, AssessmentState, Finding, RiskLevel } from './types';
import { AssessmentSetup } from './components/AssessmentSetup';
import { Dashboard } from './components/Dashboard';
import { DocumentationTab } from './components/DocumentationTab';
import { ReportTab } from './components/ReportTab';
import { RiskBadge } from './components/RiskBadge';
import { LocalEvidenceParser } from './components/LocalEvidenceParser';
import { createSampleAssessment } from './services/sampleAssessment';
import {
  deriveAssessmentStatus,
  isSupportedModule,
  SUPPORTED_MVP_MODULES,
  validateEvidenceFindingDraft,
  type EvidenceFindingDraft,
} from './services/assessmentModel';

type Tab = 'overview' | 'evidence' | 'ledger' | 'documentation';

const emptyState: AssessmentState = {
  mode: 'live',
  projectName: '',
  systemOwner: '',
  assetCriticality: 'MEDIUM' as AssessmentState['assetCriticality'],
  businessCriticality: 'MEDIUM' as AssessmentState['businessCriticality'],
  systemCategory: 'Banking System' as AssessmentState['systemCategory'],
  assessmentType: 'Banking system or application' as AssessmentState['assessmentType'],
  startDate: '',
  systemScope: [],
  findings: [],
  isInitialized: false,
};

const emptyDraft = (module: AssessmentModule): EvidenceFindingDraft => ({
  module,
  title: '',
  riskLevel: RiskLevel.MEDIUM,
  observation: '',
  evidenceReference: '',
  evidenceExcerpt: '',
  impact: '',
  recommendation: '',
});

const App: React.FC = () => {
  const [state, setState] = useState<AssessmentState>(emptyState);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedModule, setSelectedModule] = useState<AssessmentModule>(AssessmentModule.ARCHITECTURE);
  const [draft, setDraft] = useState<EvidenceFindingDraft>(emptyDraft(AssessmentModule.ARCHITECTURE));
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [maturityRatings, setMaturityRatings] = useState<Partial<Record<import('./services/assessmentModel').SupportedMvpModule, number>>>({});

  const status = useMemo(() => deriveAssessmentStatus(state.findings), [state.findings]);

  const initialize = (data: Omit<AssessmentState, 'findings' | 'isInitialized' | 'mode'>) => {
    setState({ ...data, mode: 'live', findings: [], isInitialized: true });
  };

  const loadSample = () => {
    setState(createSampleAssessment());
    setActiveTab('overview');
    setSelectedModule(AssessmentModule.ARCHITECTURE);
    setDraft(emptyDraft(AssessmentModule.ARCHITECTURE));
    setFormErrors([]);
    setMaturityRatings({});
  };

  const startRealAssessment = () => {
    setState(emptyState);
    setActiveTab('overview');
    setSelectedModule(AssessmentModule.ARCHITECTURE);
    setDraft(emptyDraft(AssessmentModule.ARCHITECTURE));
    setFormErrors([]);
    setMaturityRatings({});
  };

  const selectModule = (module: AssessmentModule) => {
    setSelectedModule(module);
    if (isSupportedModule(module)) {
      setDraft(emptyDraft(module));
      setFormErrors([]);
    }
  };

  const submitFinding = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateEvidenceFindingDraft(draft);
    setFormErrors(validation.errors);
    if (!validation.valid) return;

    const finding: Finding = {
      ...draft,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `finding-${Date.now()}`,
      status: 'Recorded — human review required',
      recordedAt: new Date().toISOString(),
    };
    if (state.mode === 'sample') return;
    setState(current => ({ ...current, findings: [...current.findings, finding] }));
    setDraft(emptyDraft(draft.module));
    setFormErrors([]);
  };

  if (!state.isInitialized) return <AssessmentSetup onInitialize={initialize} onLoadSample={loadSample} />;

  const tabs: Array<[Tab, string]> = [
    ['overview', 'Overview'],
    ['evidence', 'Evidence intake'],
    ['ledger', 'Evidence ledger'],
    ['documentation', 'Method & limits'],
  ];
  const selectedSupported = isSupportedModule(selectedModule);
  const visibleFindings = state.findings.filter(finding => finding.module === selectedModule);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-cyan-300 shadow-lg">⌁</div><div className="min-w-0"><h1 className="truncate text-lg font-bold">FortressAssureX</h1><p className="truncate text-xs text-slate-500">Evidence-led MVP · {state.projectName}</p></div></div>
          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:pb-0" aria-label="Primary navigation">{tabs.map(([tab, label]) => <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>)}</nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        {state.mode === 'sample' && <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em]">Sample assessment — synthetic data — read only</p><p className="mt-1 text-sm">No assessment, scan, control validation, or evidence collection was performed.</p></div><button onClick={startRealAssessment} className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">Start a real assessment</button></div>}
        {activeTab === 'overview' && <Dashboard data={state} status={status} onOpenEvidence={() => setActiveTab('evidence')} maturityRatings={maturityRatings} onMaturityRatingChange={(module, rating) => setMaturityRatings(current => ({ ...current, [module]: rating }))} />}
        {activeTab === 'ledger' && <ReportTab state={state} status={status} maturityRatings={maturityRatings} />}
        {activeTab === 'documentation' && <DocumentationTab />}
        {activeTab === 'evidence' && <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><p className="px-3 pb-2 pt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Module boundary</p><div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{Object.values(AssessmentModule).map(module => { const supported = isSupportedModule(module); return <button key={module} onClick={() => selectModule(module)} className={`rounded-xl p-3 text-left transition ${selectedModule === module ? 'bg-slate-900 text-white' : supported ? 'hover:bg-cyan-50' : 'cursor-default opacity-70'}`}><span className="block text-sm font-semibold">{module}</span><span className={`mt-1 block text-xs ${selectedModule === module ? 'text-slate-300' : supported ? 'text-cyan-800' : 'text-slate-500'}`}>{supported ? 'Evidence-backed human intake' : 'Not supported in MVP'}</span></button>; })}</div></aside>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {state.mode === 'sample' ? <div className="rounded-2xl border border-amber-300 bg-amber-50 p-8"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-800">Read-only demonstration</p><h2 className="mt-2 text-2xl font-bold text-amber-950">Sample evidence cannot be changed</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-amber-900">The sample assessment is synthetic and exists only to demonstrate the interface. Start a real assessment to record human findings from supplied evidence.</p><button onClick={startRealAssessment} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700">Start a real assessment</button></div> : selectedSupported ? <>
              <div className="border-b border-slate-200 pb-5"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Supported evidence intake</p><h2 className="mt-1 text-2xl font-bold">{selectedModule}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Record a human finding tied to a specific evidence reference and excerpt. Severity is assessor-entered; FortressAssureX does not infer it or validate the underlying control.</p></div>
              <form onSubmit={submitFinding} className="mt-6 space-y-5" noValidate>
                {formErrors.length > 0 && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p className="font-bold">This record cannot be saved yet.</p><ul className="mt-2 list-disc pl-5">{formErrors.map(error => <li key={error}>{error}</li>)}</ul></div>}
                <div className="grid gap-5 md:grid-cols-[1fr_180px]"><label className="block text-sm font-semibold text-slate-700">Finding title<input required value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" placeholder="Describe the observed condition" /></label><label className="block text-sm font-semibold text-slate-700">Assessor severity<select value={draft.riskLevel} onChange={event => setDraft({ ...draft, riskLevel: event.target.value as RiskLevel })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">{Object.values(RiskLevel).map(level => <option key={level} value={level}>{level}</option>)}</select></label></div>
                <label className="block text-sm font-semibold text-slate-700">Assessor observation<textarea required value={draft.observation} onChange={event => setDraft({ ...draft, observation: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3" placeholder="What did you observe? State the observation without claiming automated validation." /></label>
                <div className="grid gap-5 md:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Evidence reference<textarea required value={draft.evidenceReference} onChange={event => setDraft({ ...draft, evidenceReference: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 font-mono text-xs" placeholder="Document name, report ID, URL, path, page or line" /></label><label className="block text-sm font-semibold text-slate-700">Evidence excerpt or locator<textarea required value={draft.evidenceExcerpt} onChange={event => setDraft({ ...draft, evidenceExcerpt: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 font-mono text-xs" placeholder="Short quoted excerpt, page/row, or precise locator" /></label></div>
                <div className="grid gap-5 md:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Stated impact<textarea required value={draft.impact} onChange={event => setDraft({ ...draft, impact: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3" /></label><label className="block text-sm font-semibold text-slate-700">Recommended action<textarea required value={draft.recommendation} onChange={event => setDraft({ ...draft, recommendation: event.target.value })} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3" /></label></div>
                <button type="submit" className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-800">Record evidence-backed human finding</button>
              </form>
              <LocalEvidenceParser onUseExcerpt={(reference, excerpt) => setDraft(current => ({ ...current, evidenceReference: reference, evidenceExcerpt: excerpt }))} />
              <div className="mt-8 border-t border-slate-200 pt-6"><h3 className="font-bold">Recorded for {selectedModule}</h3>{visibleFindings.length === 0 ? <p className="mt-2 text-sm text-slate-500">No human findings recorded for this module. It is not assessed.</p> : <div className="mt-4 space-y-3">{visibleFindings.map(finding => <div key={finding.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold">{finding.title}</p><RiskBadge level={finding.riskLevel} /></div><p className="mt-2 text-sm text-slate-600">Evidence: <span className="font-mono text-xs">{finding.evidenceReference}</span></p></div>)}</div>}</div>
            </> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Not supported in MVP</p><h2 className="mt-2 text-2xl font-bold">{selectedModule}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">This domain does not accept evidence, generate findings, or yield an assessment outcome in the current MVP. It is intentionally not assessed.</p></div>}
          </section>
        </div>}
      </main>
    </div>
  );
};

export default App;

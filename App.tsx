import React, { useState } from 'react';
import { AssessmentModule, RiskLevel, Finding, AssessmentState, Criticality, SystemCategory, AssessmentType } from './types';
import { AssessmentSetup } from './components/AssessmentSetup';
import { SUPPORTED_MODULES } from './components/AssessmentSetup';

const INITIAL_MODULE_SCORES = Object.values(AssessmentModule).reduce((acc, module) => {
  acc[module] = 0;
  return acc;
}, {} as Record<AssessmentModule, number>);

const emptyState = (): AssessmentState => ({
  projectName: '', systemOwner: '', assetCriticality: Criticality.MEDIUM,
  businessCriticality: Criticality.MEDIUM, systemCategory: SystemCategory.BANKING,
  assessmentType: AssessmentType.BANKING, startDate: new Date().toISOString().slice(0, 10),
  systemScope: [], findings: [], moduleScores: INITIAL_MODULE_SCORES,
  enabledModules: SUPPORTED_MODULES, isInitialized: false
});

const App: React.FC = () => {
  const [state, setState] = useState<AssessmentState>(emptyState);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'register' | 'method'>('overview');
  const [form, setForm] = useState({ module: AssessmentModule.ARCHITECTURE, title: '', observation: '', evidence: '', impact: '', recommendation: '', riskLevel: RiskLevel.INFORMATIONAL, owner: '' });

  const handleInitialize = (initData: any) => setState(prev => ({ ...prev, ...initData, enabledModules: initData.enabledModules.filter((module: AssessmentModule) => SUPPORTED_MODULES.includes(module)), isInitialized: true }));
  const handleLoadSample = () => setState({ ...emptyState(), projectName: 'Synthetic evidence workspace', systemOwner: 'User-supplied example', isInitialized: true });
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const addFinding = (event: React.FormEvent) => {
    event.preventDefault();
    if (!SUPPORTED_MODULES.includes(form.module) || !form.title.trim() || !form.evidence.trim()) return;
    const finding: Finding = { id: `evidence-${Date.now()}`, module: form.module, title: form.title.trim(), observation: form.observation.trim() || undefined, evidence: form.evidence.trim(), impact: form.impact.trim() || 'Impact not assessed; record the consequence supplied by the assessor.', recommendation: form.recommendation.trim() || 'Record the owner-supplied next action.', riskLevel: form.riskLevel, owner: form.owner.trim() || undefined, status: 'Open' };
    setState(prev => ({ ...prev, findings: [...prev.findings, finding] }));
    setForm(prev => ({ ...prev, title: '', observation: '', evidence: '', impact: '', recommendation: '', owner: '' }));
    setActiveTab('register');
  };

  if (!state.isInitialized) {
    if (window.location.pathname !== '/') return <NotFound />;
    return <AssessmentSetup onInitialize={handleInitialize} onLoadSample={handleLoadSample} />;
  }
  const counts = Object.values(RiskLevel).reduce((acc, level) => ({ ...acc, [level]: state.findings.filter(f => f.riskLevel === level).length }), {} as Record<RiskLevel, number>);
  const tabs = [['overview', 'Overview'], ['evidence', 'Add evidence'], ['register', 'Evidence ledger'], ['method', 'Method & limits']] as const;

  if (window.location.pathname !== '/') return <NotFound />;
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-700">FortressAssureX</p><h1 className="text-lg font-bold">Evidence register</h1><p className="text-xs text-slate-500">{state.projectName} · user-supplied evidence only</p></div>
      <nav aria-label="Primary navigation" className="flex flex-wrap gap-1">{tabs.map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${activeTab === id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>{label}</button>)}</nav>
    </div></header>
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      {activeTab === 'overview' && <><section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Bounded MVP</p><h2 className="mt-2 text-2xl font-bold">Record findings linked to supplied evidence.</h2><p className="mt-3 max-w-2xl text-slate-300">This workspace does not scan, validate controls, calculate posture, store evidence, or issue assurance, attestation, or certification claims.</p><button onClick={() => setActiveTab('evidence')} className="mt-5 rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">Add a finding</button></section>
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">{Object.values(RiskLevel).map(level => <div key={level} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">{level}</p><p className="mt-2 text-2xl font-bold">{counts[level]}</p></div>)}</section>
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Scope boundary:</strong> severity, impact, ownership, and next actions are transcribed from assessor input. No score, risk rating, maturity value, or compliance conclusion is derived by this app.</section></>}
      {activeTab === 'evidence' && <form onSubmit={addFinding} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Add a user-supplied finding</h2><p className="mt-1 text-sm text-slate-600">Evidence is held in memory for this browser session only and is never sent anywhere.</p><div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="field">Domain<select value={form.module} onChange={e => updateForm('module', e.target.value)}>{Object.values(AssessmentModule).map(m => <option key={m}>{m}</option>)}</select></label>
        <label className="field">Severity supplied by assessor<select value={form.riskLevel} onChange={e => updateForm('riskLevel', e.target.value)}>{Object.values(RiskLevel).map(l => <option key={l}>{l}</option>)}</select></label>
        <label className="field md:col-span-2">Finding title<input required value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="Describe the finding" /></label>
        <label className="field md:col-span-2">Evidence reference or excerpt<textarea required value={form.evidence} onChange={e => updateForm('evidence', e.target.value)} placeholder="Reference the supplied document, ticket, or observation" /></label>
        <label className="field">Observation<textarea value={form.observation} onChange={e => updateForm('observation', e.target.value)} /></label><label className="field">Impact supplied by assessor<textarea value={form.impact} onChange={e => updateForm('impact', e.target.value)} /></label>
        <label className="field">Next action supplied by assessor<textarea value={form.recommendation} onChange={e => updateForm('recommendation', e.target.value)} /></label><label className="field">Owner<input value={form.owner} onChange={e => updateForm('owner', e.target.value)} /></label>
      </div><button type="submit" className="mt-5 rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700">Save to session ledger</button></form>}
      {activeTab === 'register' && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Evidence ledger</h2><p className="mt-1 text-sm text-slate-600">{state.findings.length} finding(s), entered by the assessor.</p><div className="mt-5 space-y-4">{state.findings.length === 0 ? <p className="rounded-lg bg-slate-50 p-6 text-center text-slate-500">No findings recorded yet.</p> : state.findings.map(f => <article key={f.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-indigo-700">{f.module}</p><h3 className="mt-1 font-bold">{f.title}</h3></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{f.riskLevel}</span></div><p className="mt-3 text-sm text-slate-700"><strong>Evidence:</strong> {f.evidence}</p>{f.observation && <p className="mt-2 text-sm text-slate-600"><strong>Observation:</strong> {f.observation}</p>}<p className="mt-2 text-sm text-slate-600"><strong>Next action:</strong> {f.recommendation}</p></article>)}</div></section>}
      {activeTab === 'method' && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Method and limits</h2><div className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><p>FortressAssureX records human-entered findings and links them to evidence references. It does not perform heuristic audits, parse uploaded files, call external services, access network targets, or persist data.</p><p>Unavailable domains remain unavailable rather than being inferred. The ledger is not an audit report, control validation, risk calculation, posture score, assurance rating, attestation, certification, or compliance determination.</p><p>Before relying on any entry, the responsible assessor must independently verify the source evidence, context, severity, impact, ownership, and remediation decision.</p></div></section>}
    </main>
  </div>;
};
const NotFound: React.FC = () => <main className="grid min-h-screen place-items-center bg-slate-900 px-6 text-center text-white"><div><p className="text-sm font-bold uppercase tracking-widest text-emerald-300">FortressAssureX</p><h1 className="mt-3 text-3xl font-bold">Page not found</h1><p className="mt-3 text-slate-300">The evidence register is available at the canonical root page.</p><a className="mt-6 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300" href="/">Return to FortressAssureX</a></div></main>;
export default App;

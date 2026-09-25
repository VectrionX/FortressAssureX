import React, { useMemo, useState } from 'react';
import { AssessmentModule, AssessmentType, AssetType, Criticality, SolutionCategory, SystemAsset } from '../types';

interface AssessmentSetupData {
  projectName: string;
  systemOwner: string;
  assetCriticality: Criticality;
  businessCriticality: Criticality;
  systemCategory: 'Banking System' | 'Security Solution';
  assessmentType: AssessmentType;
  solutionCategory?: SolutionCategory;
  startDate: string;
  systemScope: SystemAsset[];
  enabledModules: AssessmentModule[];
}

interface AssessmentSetupProps {
  onInitialize: (data: AssessmentSetupData) => void;
  onLoadSample?: () => void;
}

type SetupStep = 0 | 1 | 2;

const steps = [
  { name: 'Identity', description: 'Who and what is being assessed' },
  { name: 'Criticality', description: 'Business and data context' },
  { name: 'Scope & evidence', description: 'Supplied assets and domains' },
] as const;

const supportedModules = [
  AssessmentModule.ARCHITECTURE,
  AssessmentModule.IDENTITY,
  AssessmentModule.VULNERABILITY,
  AssessmentModule.APPLICATION,
  AssessmentModule.DATA,
  AssessmentModule.LOGGING,
  AssessmentModule.INCIDENT,
  AssessmentModule.HARDENING,
  AssessmentModule.THIRD_PARTY,
  AssessmentModule.GOVERNANCE,
  AssessmentModule.OTHER,
];

const unsupportedModules = [
  { name: AssessmentModule.CLOUD_SECURITY, reason: 'Cloud evidence adapter is not enabled in this release.' },
  { name: AssessmentModule.ENDPOINT_SECURITY, reason: 'Endpoint evidence adapter is not enabled in this release.' },
  { name: AssessmentModule.EMAIL_SECURITY, reason: 'Email evidence adapter is not enabled in this release.' },
  { name: AssessmentModule.SECURITY_OPERATIONS, reason: 'SOC evidence adapter is not enabled in this release.' },
  { name: AssessmentModule.BUSINESS_CONTINUITY, reason: 'Continuity evidence adapter is not enabled in this release.' },
];

const parseScope = (raw: string): SystemAsset[] => raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
  const [ip, hostname, type, environment] = line.split(',').map(value => value.trim());
  return {
    ip: ip || undefined,
    hostname: hostname || 'Unknown',
    type: (type as AssetType) || AssetType.SERVER,
    environment: environment || 'Production',
  };
});

export const AssessmentSetup: React.FC<AssessmentSetupProps> = ({ onInitialize, onLoadSample }) => {
  const [step, setStep] = useState<SetupStep>(0);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(AssessmentType.BANKING);
  const [solutionCategory, setSolutionCategory] = useState<SolutionCategory>(SolutionCategory.SIEM);
  const [scopeRaw, setScopeRaw] = useState('');
  const [scopeInfo, setScopeInfo] = useState<{ count: number; fileName: string } | null>(null);
  const [selectedModules, setSelectedModules] = useState<AssessmentModule[]>(supportedModules);
  const [projectName, setProjectName] = useState('');
  const [systemOwner, setSystemOwner] = useState('');
  const [businessCriticality, setBusinessCriticality] = useState<Criticality>(Criticality.MEDIUM);
  const [assetCriticality, setAssetCriticality] = useState<Criticality>(Criticality.MEDIUM);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState('');

  const scopeCount = useMemo(() => parseScope(scopeRaw).length, [scopeRaw]);

  const setModule = (module: AssessmentModule, enabled: boolean) => {
    setSelectedModules(current => enabled ? [...current, module] : current.filter(item => item !== module));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // File.text() is a local browser operation; no file or content leaves this page.
    const text = await file.text();
    setScopeRaw(text);
    setScopeInfo({ count: parseScope(text).length, fileName: file.name });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step !== steps.length - 1) {
      setStep(current => (current + 1) as SetupStep);
      return;
    }

    const trimmedProjectName = projectName.trim();
    const trimmedSystemOwner = systemOwner.trim();
    if (!trimmedProjectName || !trimmedSystemOwner) {
      setFormError('Project name and owner are required before launch.');
      return;
    }
    if (selectedModules.length === 0) {
      setFormError('Select at least one supported assessment domain.');
      return;
    }

    setFormError('');
    onInitialize({
      projectName: trimmedProjectName,
      systemOwner: trimmedSystemOwner,
      assetCriticality,
      businessCriticality,
      systemCategory: assessmentType === AssessmentType.BANKING ? 'Banking System' : 'Security Solution',
      assessmentType,
      solutionCategory: assessmentType === AssessmentType.SECURITY_SOLUTION ? solutionCategory : undefined,
      startDate,
      systemScope: parseScope(scopeRaw),
      enabledModules: selectedModules,
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-6 font-inter sm:px-6 lg:py-10" aria-labelledby="setup-title">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="bg-slate-800 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">FortressAssure / supplied-context assessment</p>
              <h1 id="setup-title" className="mt-2 text-2xl font-bold sm:text-3xl">Set up an assessment</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Define the assessment boundary first. FortressAssure only uses the context and evidence you provide; it does not scan systems or connect to providers from this setup.</p>
            </div>
            {onLoadSample && <button type="button" onClick={onLoadSample} className="min-h-11 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-left text-xs font-bold text-emerald-300 hover:bg-emerald-400/20 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-800">Load local core banking sample<span className="mt-1 block font-normal text-emerald-200/80">Synthetic data only</span></button>}
          </div>
          <nav aria-label="Assessment setup progress" className="mt-8">
            <ol className="grid grid-cols-3 gap-2 sm:gap-4">
              {steps.map((item, index) => <li key={item.name} className="min-w-0">
                <button type="button" onClick={() => index <= step && setStep(index as SetupStep)} aria-current={step === index ? 'step' : undefined} className={`w-full border-t-2 pt-3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-300 ${index <= step ? 'border-emerald-400 text-white' : 'border-slate-600 text-slate-500'}`}>
                  <span className="block text-[10px] font-black uppercase tracking-widest sm:text-xs">{index + 1}. {item.name}</span>
                  <span className="mt-1 hidden text-xs text-slate-400 sm:block">{item.description}</span>
                </button>
              </li>)}
            </ol>
          </nav>
        </header>

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="min-w-0" aria-live="polite">
            {step === 0 && <fieldset className="space-y-6">
              <legend className="text-xl font-bold text-slate-900">Assessment identity</legend>
              <p className="text-sm text-slate-500">Name the system or solution and identify the accountable owner.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-700">Project or solution name<input name="projectName" value={projectName} onChange={event => setProjectName(event.target.value)} required autoFocus className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-normal outline-none focus:ring-2 focus:ring-slate-800" placeholder="e.g. Swift Gateway v2" /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-700">System or solution owner<input name="systemOwner" value={systemOwner} onChange={event => setSystemOwner(event.target.value)} required className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-normal outline-none focus:ring-2 focus:ring-slate-800" placeholder="Department / accountable manager" /></label>
              </div>
              <fieldset className="space-y-3"><legend className="text-sm font-semibold text-slate-700">Assessment context</legend><div className="grid gap-3 sm:grid-cols-2">
                {[AssessmentType.BANKING, AssessmentType.SECURITY_SOLUTION].map(type => <button key={type} type="button" aria-pressed={assessmentType === type} onClick={() => setAssessmentType(type)} className={`min-h-24 rounded-2xl border-2 p-4 text-left text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-800 ${assessmentType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>{type}<span className="mt-1 block text-xs font-normal opacity-75">{type === AssessmentType.BANKING ? 'A banking system, application, or service' : 'A security product or control solution'}</span></button>)}
              </div></fieldset>
              {assessmentType === AssessmentType.SECURITY_SOLUTION && <label className="block space-y-2 text-sm font-semibold text-slate-700">Solution category<select value={solutionCategory} onChange={event => setSolutionCategory(event.target.value as SolutionCategory)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-blue-500">{Object.values(SolutionCategory).map(category => <option key={category}>{category}</option>)}</select></label>}
            </fieldset>}

            {step === 1 && <fieldset className="space-y-6">
              <legend className="text-xl font-bold text-slate-900">Criticality and timing</legend>
              <p className="text-sm text-slate-500">Record the supplied business context. These selections do not claim an independent risk or compliance determination.</p>
              <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-semibold text-slate-700">Business criticality<select name="businessCriticality" value={businessCriticality} onChange={event => setBusinessCriticality(event.target.value as Criticality)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-slate-800">{Object.values(Criticality).map(value => <option key={value}>{value}</option>)}</select></label><label className="space-y-2 text-sm font-semibold text-slate-700">Data / asset criticality<select name="assetCriticality" value={assetCriticality} onChange={event => setAssetCriticality(event.target.value as Criticality)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-slate-800">{Object.values(Criticality).map(value => <option key={value}>{value}</option>)}</select></label></div>
              <label className="block space-y-2 text-sm font-semibold text-slate-700">Assessment start date<input type="date" name="startDate" value={startDate} onChange={event => setStartDate(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none focus:ring-2 focus:ring-slate-800" /></label>
              <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Boundary note:</strong> Criticality is recorded as supplied context. It is not a calculated posture, certification, attestation, or external validation.</aside>
            </fieldset>}

            {step === 2 && <fieldset className="space-y-6">
              <legend className="text-xl font-bold text-slate-900">Scope and evidence boundary</legend>
              <p className="text-sm text-slate-500">Provide an optional local inventory. CSV rows are interpreted as IP, Hostname, Type, Environment and remain in memory until launch.</p>
              <label className="block space-y-2 text-sm font-semibold text-slate-700">Asset inventory (CSV or plain text)<textarea value={scopeRaw} onChange={event => { setScopeRaw(event.target.value); setScopeInfo(null); }} rows={5} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-slate-800" placeholder="10.0.0.10, core-api, Application, Production" /><span className="block text-xs font-normal text-slate-500">{scopeCount} supplied row{scopeCount === 1 ? '' : 's'} · no network lookup or scan is performed</span></label>
              <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm font-semibold text-slate-700 hover:border-emerald-400 focus-within:ring-2 focus-within:ring-slate-800">{scopeInfo ? <span className="text-emerald-700">Loaded locally: {scopeInfo.fileName} ({scopeInfo.count} rows)</span> : <span>Choose a local CSV / TXT file (optional)</span>}<input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={handleFileChange} className="sr-only" /></label>
              <fieldset className="space-y-3"><legend className="text-sm font-semibold text-slate-700">Assessment domains</legend><div className="grid gap-2 sm:grid-cols-2">{supportedModules.map(module => <label key={module} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50"><input type="checkbox" checked={selectedModules.includes(module)} onChange={event => setModule(module, event.target.checked)} className="h-4 w-4 accent-emerald-600" />{module}</label>)}</div></fieldset>
              <fieldset className="space-y-3"><legend className="text-sm font-semibold text-slate-700">Unavailable domains</legend><div className="grid gap-2 sm:grid-cols-2">{unsupportedModules.map(({ name, reason }) => <button key={name} type="button" disabled title={reason} aria-disabled="true" className="min-h-11 cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 text-left text-sm text-slate-400"><span className="block line-through">{name}</span><span className="block text-[10px]">Unavailable in this release</span></button>)}</div></fieldset>
            </fieldset>}
            {formError && <p role="alert" className="mt-5 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{formError}</p>}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between"><button type="button" disabled={step === 0} onClick={() => setStep(current => (current - 1) as SetupStep)} className="min-h-12 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-slate-800">Back</button><button type="submit" className="min-h-12 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">{step === 2 ? 'Create local assessment' : 'Continue'}</button></div>
          </section>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:sticky lg:top-6" aria-label="Assessment summary"><h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Setup summary</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-xs text-slate-500">Context</dt><dd className="font-semibold text-slate-800">{assessmentType === AssessmentType.BANKING ? 'Banking system' : 'Security solution'}</dd></div>{assessmentType === AssessmentType.SECURITY_SOLUTION && <div><dt className="text-xs text-slate-500">Category</dt><dd className="font-semibold text-slate-800">{solutionCategory}</dd></div>}<div><dt className="text-xs text-slate-500">Supplied assets</dt><dd className="font-semibold text-slate-800">{scopeCount}</dd></div><div><dt className="text-xs text-slate-500">Enabled domains</dt><dd className="font-semibold text-slate-800">{selectedModules.length}</dd></div></dl><p className="mt-6 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">No persistence, scanning, provider calls, or data egress is performed by this flow.</p></aside>
        </div>
      </form>
    </main>
  );
};

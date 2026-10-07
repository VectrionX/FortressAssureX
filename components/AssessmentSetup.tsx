import React, { useState } from 'react';
import { AssessmentType, AssetType, Criticality, SystemAsset, SystemCategory } from '../types';

interface AssessmentSetupProps {
  onInitialize: (data: Omit<import('../types').AssessmentState, 'findings' | 'isInitialized' | 'mode'>) => void;
  onLoadSample: () => void;
}

type SetupStep = 0 | 1 | 2;

const steps = [
  { name: 'Identity', description: 'Who and what is being assessed' },
  { name: 'Criticality', description: 'Business and data context' },
  { name: 'Scope & evidence', description: 'Supplied assets and domains' },
] as const;

export const SUPPORTED_MODULES = [
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
  const [scopeRaw, setScopeRaw] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const systemScope: SystemAsset[] = scopeRaw
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [ip, hostname, type, environment] = line.split(',').map(value => value.trim());
        return {
          ip: ip || undefined,
          hostname: hostname || 'Unspecified asset',
          type: (Object.values(AssetType).includes(type as AssetType) ? type : AssetType.SERVER) as AssetType,
          environment: environment || 'Unspecified',
        };
      });

  const setModule = (module: AssessmentModule, enabled: boolean) => {
    if (!SUPPORTED_MODULES.includes(module)) return;
    setSelectedModules(current => enabled ? [...new Set([...current, module])] : current.filter(item => item !== module));
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
    const enabledModules = selectedModules.filter(module => SUPPORTED_MODULES.includes(module));
    if (enabledModules.length === 0) {
      setFormError('Select at least one supported assessment domain.');
      return;
    }

    setFormError('');
    onInitialize({
      projectName: String(formData.get('projectName') || ''),
      systemOwner: String(formData.get('systemOwner') || ''),
      assetCriticality: formData.get('assetCriticality') as Criticality,
      businessCriticality: formData.get('businessCriticality') as Criticality,
      assessmentType: formData.get('assessmentType') as AssessmentType,
      systemCategory: formData.get('assessmentType') === AssessmentType.SECURITY_SOLUTION
        ? SystemCategory.SECURITY
        : SystemCategory.BANKING,
      startDate: String(formData.get('startDate') || ''),
      systemScope,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex items-center justify-center font-sans">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700 bg-white shadow-2xl">
        <div className="bg-slate-900 px-6 py-7 sm:px-10 sm:py-9 text-white">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Evidence-led MVP</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Start an evidence register</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">FortressAssureX records human findings linked to supplied evidence. It does not validate controls, calculate posture, or provide a compliance attestation.</p>
        </div>

        <div className="space-y-6 p-6 sm:p-10">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <strong>Current boundary:</strong> evidence intake is available only for Architecture &amp; Network and Vulnerability &amp; Exposure. Other domains are shown as not supported in this MVP.
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">Project name
              <input name="projectName" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" placeholder="e.g. Payments gateway review" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">System owner
              <input name="systemOwner" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" placeholder="Team or accountable owner" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold text-slate-700">Assessment context
              <select name="assessmentType" defaultValue={AssessmentType.BANKING} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                {Object.values(AssessmentType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Business criticality
              <select name="businessCriticality" defaultValue={Criticality.MEDIUM} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                {Object.values(Criticality).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">Data criticality
              <select name="assetCriticality" defaultValue={Criticality.MEDIUM} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                {Object.values(Criticality).map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">Start date
            <input name="startDate" type="date" required className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
          </label>

          <label className="block text-sm font-semibold text-slate-700">Optional asset inventory
            <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">Paste one asset per line as <code>IP, hostname, asset type, environment</code>. This is scope context only; it is not scanned or verified.</span>
            <textarea value={scopeRaw} onChange={event => setScopeRaw(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-mono text-xs outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" placeholder="10.0.0.10, edge-fw-01, Network Device, Production" />
          </label>

          <button type="submit" className="w-full rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">Create evidence register</button>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center"><p className="text-sm font-semibold text-slate-800">Want to explore the workspace first?</p><p className="mt-1 text-sm text-slate-600">Load a read-only synthetic demonstration. No assessment is performed and no evidence is collected.</p><button type="button" onClick={onLoadSample} className="mt-3 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 hover:border-cyan-700 hover:text-cyan-800">Load sample assessment</button></div>
        </div>
      </form>
    </main>
  );
};

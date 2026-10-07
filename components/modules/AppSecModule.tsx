
import React, { useState, useEffect } from 'react';
import { AssessmentModule, Finding } from '../../types';
import { ModuleFindingsList, ManualFindingForm } from './SharedModuleComponents';

interface AppSecModuleProps {
  onAnalyze: (module: AssessmentModule, data: any) => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
}

type AppStatus = 'yes' | 'no' | 'partial';

const APP_DETAILS: Record<string, { req: string; risk: string }> = {
  secureConfig: { 
    req: "Application server/runtime configuration hardening, mandatory headers (HSTS, CSP, XFO), and removal of all default passwords/accounts.", 
    risk: "Vulnerability to protocol downgrades, clickjacking, and unauthorized access via unsecured server interfaces." 
  },
  authSession: { 
    req: "Session timeout configuration, token security (JWT/Cookies hardening), and mandatory account lockout policies at the application layer.", 
    risk: "Brute-force success and session hijacking due to long-lived or unhardened credentials." 
  },
  inputValidation: { 
    req: "Application-level input validation independent of firewall/WAF and context-aware output encoding to prevent client-side injection.", 
    risk: "Injection attacks (SQLi, XSS) bypassing peripheral controls to manipulate application logic or data." 
  },
  errorHandling: { 
    req: "Suppression of sensitive internal data in error messages and generation of generic masking responses for production users.", 
    risk: "Verbose error leaks providing attackers with internal system maps, database versions, or stack traces." 
  },
  securityLogging: { 
    req: "Logging of application-level security events (high-value actions, auth changes) not captured by infrastructure-level SIEM modules.", 
    risk: "Blind spots in forensic investigations; inability to detect business logic tampering or fraud." 
  },
  featureSecurity: { 
    req: "Authorization checks on all sensitive features, admin modules, API endpoints, and optional features like file uploads.", 
    risk: "Privilege escalation (BOLA/IDOR) allowing lower-tier users or guests to access restricted bank functions." 
  },
  policyImplementation: {
    req: "Enforcement of app-specific security policies and application of developer best practices (secure config templates/hardening).",
    risk: "Inconsistent security posture across modules leading to 'shadow' vulnerabilities in unmanaged code."
  }
};

export const AppSecModule: React.FC<AppSecModuleProps> = ({
  onAnalyze, isProcessing, findings, showManualForm, onToggleManualForm, onAddManual
}) => {
  const [threatModel, setThreatModel] = useState({ internetFacing: false, processesPII: false, financialTransactions: false });
  const [wizardComplete, setWizardComplete] = useState(false);

  const [data, setData] = useState({
    secureConfig: 'no' as AppStatus,
    authSession: 'no' as AppStatus,
    inputValidation: 'no' as AppStatus,
    errorHandling: 'no' as AppStatus,
    securityLogging: 'no' as AppStatus,
    featureSecurity: 'no' as AppStatus,
    policyImplementation: 'no' as AppStatus,
    configScanFile: null as { name: string; content: string } | null,
    appLogFile: null as { name: string; content: string } | null,
    comments: ''
  });

  const update = (key: keyof typeof data, val: any) => setData(prev => ({ ...prev, [key]: val }));

  // Auto-flag requirements based on Threat Model
  useEffect(() => {
    if (wizardComplete) {
       let notes = "";
       if (threatModel.internetFacing) notes += "[THREAT-MODEL]: Internet Facing asset -> WAF & Headers Mandatory.\n";
       if (threatModel.processesPII) notes += "[THREAT-MODEL]: PII Detected -> Input Validation & Encryption Mandatory.\n";
       if (threatModel.financialTransactions) notes += "[THREAT-MODEL]: Transactions Detected -> Feature Security Critical.\n";
       update('comments', notes + data.comments);
    }
  }, [wizardComplete]);

  const handleFileUpload = async (key: 'configScanFile' | 'appLogFile', file: File | null) => {
    if (file) {
      const text = await file.text();
      setData(prev => ({ ...prev, [key]: { name: file.name, content: text } }));
    }
  };

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2 mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );

  const Row = ({ label, field, value, onChange }: any) => (
    <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-3 py-2 px-2 hover:bg-slate-50/80 rounded-xl transition-all">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        {/* Threat Model indicators */}
        {wizardComplete && field === 'secureConfig' && threatModel.internetFacing && <span className="text-[8px] bg-rose-100 text-rose-600 px-1 rounded font-bold">REQUIRED</span>}
        {wizardComplete && field === 'inputValidation' && threatModel.processesPII && <span className="text-[8px] bg-rose-100 text-rose-600 px-1 rounded font-bold">REQUIRED</span>}
        {wizardComplete && field === 'featureSecurity' && threatModel.financialTransactions && <span className="text-[8px] bg-rose-100 text-rose-600 px-1 rounded font-bold">REQUIRED</span>}

        <div className="text-slate-300 group-hover:text-amber-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="invisible group-hover:visible absolute left-0 md:left-auto md:right-0 bottom-full mb-2 z-[100] w-72 p-4 bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 slide-in-from-bottom-2 border border-white/10">
        <div className="space-y-3">
          <div>
            <p className="font-black uppercase text-amber-400 tracking-tighter mb-1">Audit Requirement</p>
            <p className="text-slate-200 leading-relaxed font-medium">{APP_DETAILS[field]?.req}</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <p className="font-black uppercase text-rose-400 tracking-tighter mb-1">Impact Risk</p>
            <p className="text-slate-300 leading-relaxed italic">{APP_DETAILS[field]?.risk}</p>
          </div>
        </div>
        <div className="absolute -bottom-1 right-6 md:right-8 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
        {(['yes', 'no', 'partial'] as AppStatus[]).map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${
              value === opt 
                ? opt === 'yes' ? 'bg-emerald-600 text-white shadow-md' : opt === 'no' ? 'bg-slate-800 text-white shadow-md' : 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl border-b-4 border-amber-500/30">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-amber-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          Application Security Objective
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          Assess application-specific controls including secure configuration, session lifecycle, input/output defenses, and specialized feature authorization.
        </p>
      </div>

      {/* 4.1 Threat Modeling Wizard */}
      <div className={`p-6 rounded-2xl border transition-all ${wizardComplete ? 'bg-white border-slate-100' : 'bg-amber-50 border-amber-200'}`}>
         <div className="flex justify-between items-center mb-4">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Phase 0: Threat Modeling</h3>
           {wizardComplete && <button onClick={() => setWizardComplete(false)} className="text-[9px] font-bold text-slate-400 underline">Edit Model</button>}
         </div>
         
         {!wizardComplete ? (
           <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">Configure the application context to dynamically identify mandatory controls.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${threatModel.internetFacing ? 'border-amber-500 bg-amber-100' : 'border-slate-200 bg-white'}`}>
                    <input type="checkbox" className="hidden" checked={threatModel.internetFacing} onChange={() => setThreatModel(p => ({...p, internetFacing: !p.internetFacing}))} />
                    <span className="block text-[10px] font-bold uppercase mb-1">Public Exposure</span>
                    <span className="text-xs font-bold text-slate-800">Internet Facing?</span>
                 </label>
                 <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${threatModel.processesPII ? 'border-amber-500 bg-amber-100' : 'border-slate-200 bg-white'}`}>
                    <input type="checkbox" className="hidden" checked={threatModel.processesPII} onChange={() => setThreatModel(p => ({...p, processesPII: !p.processesPII}))} />
                    <span className="block text-[10px] font-bold uppercase mb-1">Data Sensitivity</span>
                    <span className="text-xs font-bold text-slate-800">Processes PII?</span>
                 </label>
                 <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${threatModel.financialTransactions ? 'border-amber-500 bg-amber-100' : 'border-slate-200 bg-white'}`}>
                    <input type="checkbox" className="hidden" checked={threatModel.financialTransactions} onChange={() => setThreatModel(p => ({...p, financialTransactions: !p.financialTransactions}))} />
                    <span className="block text-[10px] font-bold uppercase mb-1">Functionality</span>
                    <span className="text-xs font-bold text-slate-800">Move Money?</span>
                 </label>
              </div>
              <button onClick={() => setWizardComplete(true)} className="w-full py-2 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-900 transition-colors">
                Apply Threat Model & Generate Requirements
              </button>
           </div>
         ) : (
           <div className="flex gap-2">
             {threatModel.internetFacing && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">Internet Facing</span>}
             {threatModel.processesPII && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">PII Data</span>}
             {threatModel.financialTransactions && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">Financial</span>}
             {(!threatModel.internetFacing && !threatModel.processesPII && !threatModel.financialTransactions) && <span className="text-[10px] text-slate-400 italic">No elevated threat context selected.</span>}
           </div>
         )}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">AppSec Control Verification</h3>
        <button onClick={onToggleManualForm} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl border border-slate-200 transition-all">
          {showManualForm ? 'CANCEL MANUAL' : '+ MANUAL FINDING'}
        </button>
      </div>

      {showManualForm && <ManualFindingForm onSubmit={onAddManual} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="1. Config & Auth">
          <Row label="Secure Configuration & Defaults" field="secureConfig" value={data.secureConfig} onChange={(v:any) => update('secureConfig', v)} />
          <Row label="Authentication & Session Management" field="authSession" value={data.authSession} onChange={(v:any) => update('authSession', v)} />
        </Section>
        <Section title="2. Defensive Coding">
          <Row label="Input Validation & Encoding" field="inputValidation" value={data.inputValidation} onChange={(v:any) => update('inputValidation', v)} />
          <Row label="Error Handling & Logging" field="errorHandling" value={data.errorHandling} onChange={(v:any) => update('errorHandling', v)} />
        </Section>
        <Section title="3. Features & Policy">
          <Row label="Feature / Module Security" field="featureSecurity" value={data.featureSecurity} onChange={(v:any) => update('featureSecurity', v)} />
          <Row label="Security Policy Implementation" field="policyImplementation" value={data.policyImplementation} onChange={(v:any) => update('policyImplementation', v)} />
          <Row label="Specialized Security Logging" field="securityLogging" value={data.securityLogging} onChange={(v:any) => update('securityLogging', v)} />
        </Section>
        
        <Section title="4. Evidence Support">
          <div className="space-y-3 p-1">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">App Server Config Scan (CSV)</label>
              <input type="file" onChange={(e) => handleFileUpload('configScanFile', e.target.files?.[0] || null)} className="block w-full text-[9px] file:mr-2 file:py-1 file:px-3 file:rounded-full file:bg-slate-900 file:text-white" />
              {data.configScanFile && <p className="text-[8px] text-emerald-600 font-bold uppercase truncate">✓ {data.configScanFile.name}</p>}
            </div>
            <div className="space-y-1 pt-2 border-t border-slate-50">
              <label className="text-[9px] font-black text-slate-400 uppercase">Application Events / Logs</label>
              <input type="file" onChange={(e) => handleFileUpload('appLogFile', e.target.files?.[0] || null)} className="block w-full text-[9px] file:mr-2 file:py-1 file:px-3 file:rounded-full file:bg-slate-900 file:text-white" />
              {data.appLogFile && <p className="text-[8px] text-emerald-600 font-bold uppercase truncate">✓ {data.appLogFile.name}</p>}
            </div>
          </div>
        </Section>
      </div>

      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observations & GRC Context</label>
        <textarea 
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:ring-1 focus:ring-amber-400 outline-none resize-none h-24 transition-all"
          placeholder="Document application specific policies, session policies, or data retention rules at the application layer..."
          value={data.comments}
          onChange={(e) => update('comments', e.target.value)}
        />
      </div>

      <div className="flex flex-col items-center py-6">
        <button 
          onClick={() => onAnalyze(AssessmentModule.APPLICATION, data)}
          disabled={isProcessing}
          className="bg-slate-900 text-white px-16 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing ? 'CALCULATING APPSEC MATURITY...' : 'AUDIT APPLICATION SECURITY'}
        </button>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">Weighted Deterministic Engine Scoring</p>
      </div>

      <ModuleFindingsList findings={findings} />
    </div>
  );
};

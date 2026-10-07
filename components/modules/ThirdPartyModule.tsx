
import React, { useState } from 'react';
import { AssessmentModule, Finding } from '../../types';
import { ModuleFindingsList, ManualFindingForm } from './SharedModuleComponents';

interface ThirdPartyModuleProps {
  onAnalyze: (module: AssessmentModule, data: any) => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
}

type TPStatus = 'yes' | 'no' | 'partial';

const TP_DETAILS: Record<string, { req: string; risk: string }> = {
  vendorIdent: { 
    req: "Mandatory identification of Third-party/Cloud/Managed provider, specific systems supported, and formal Point of Contact (POC).", 
    risk: "Engagement with unknown or sanctioned entities; lack of accountability during critical outages." 
  },
  contractSla: { 
    req: "Security clauses in contract, SLA adherence monitoring, and explicit data handling/confidentiality obligations.", 
    risk: "Legal inability to enforce security standards or obtain compensation for performance failures." 
  },
  ctrlAssessment: { 
    req: "Verification of implementation for Access Control, Logging/Monitoring, Encryption, and Patch Management as per bank policy.", 
    risk: "Vendor-side breaches becoming bank-side breaches due to unverified technical control gaps." 
  },
  complianceAlignment: { 
    req: "Active compliance with PCI DSS, ISO 27001, and GDPR. Mandatory evidence of recent third-party audits/certifications.", 
    risk: "Regulatory fines and license revocation due to non-compliant data residency or handling." 
  },
  riskTracking: { 
    req: "Active tracking of open security issues, historical incidents involving the vendor, and documented remediation progress.", 
    risk: "Repeated failures indicating systemic lack of security investment at the vendor level." 
  },
  dependencyImpact: { 
    req: "Business Impact Analysis (BIA) for vendor services. Identification of Single Points of Failure (SPOF) and compromise exposure.", 
    risk: "Total business shutdown if a single critical 'hidden' dependency fails." 
  },
  exitStrategy: {
    req: "Documented plan for disengagement (Data Portability, Knowledge Transfer). Verified formats for data extraction.",
    risk: "Vendor Lock-in. Inability to switch providers during massive price hikes or service degradation."
  }
};

export const ThirdPartyModule: React.FC<ThirdPartyModuleProps> = ({
  onAnalyze, isProcessing, findings, showManualForm, onToggleManualForm, onAddManual
}) => {
  const [data, setData] = useState({
    vendorName: '',
    vendorPoc: '',
    vendorIdent: 'no' as TPStatus,
    contractSla: 'no' as TPStatus,
    ctrlAssessment: 'no' as TPStatus,
    complianceAlignment: 'no' as TPStatus,
    riskTracking: 'no' as TPStatus,
    dependencyFailure: 'no' as TPStatus,
    exitStrategy: 'no' as TPStatus,
    comments: ''
  });

  const update = (key: keyof typeof data, val: any) => setData(prev => ({ ...prev, [key]: val }));

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
        <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="invisible group-hover:visible absolute left-0 md:left-auto md:right-0 bottom-full mb-2 z-[100] w-72 p-4 bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 slide-in-from-bottom-2 border border-white/10">
        <div className="space-y-3">
          <div>
            <p className="font-black uppercase text-indigo-400 tracking-tighter mb-1">Audit Requirement</p>
            <p className="text-slate-200 leading-relaxed font-medium">{TP_DETAILS[field]?.req}</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <p className="font-black uppercase text-rose-400 tracking-tighter mb-1">Business Risk</p>
            <p className="text-slate-300 leading-relaxed italic">{TP_DETAILS[field]?.risk}</p>
          </div>
        </div>
        <div className="absolute -bottom-1 right-6 md:right-8 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
        {(['yes', 'no', 'partial'] as TPStatus[]).map((opt) => (
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
      <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl border-b-4 border-indigo-400/30">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-indigo-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Third-Party Risk Assessment Objective
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          Evaluate institutional exposure to vendors, cloud providers, and managed services. Reconcile contractual obligations against actual technical security implementations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">Vendor / Service Name</label>
          <input className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none" placeholder="e.g. AWS, Microsoft" value={data.vendorName} onChange={(e) => update('vendorName', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase">Point of Contact (POC)</label>
          <input className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-1 focus:ring-indigo-400 outline-none" placeholder="Primary Liaison" value={data.vendorPoc} onChange={(e) => update('vendorPoc', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="1. Governance & SLA">
          <Row label="Vendor Identification & POC" field="vendorIdent" value={data.vendorIdent} onChange={(v:any) => update('vendorIdent', v)} />
          <Row label="Contract & SLA Review" field="contractSla" value={data.contractSla} onChange={(v:any) => update('contractSla', v)} />
          {/* 9.2 Exit Strategy */}
          <Row label="Exit Strategy & Portability" field="exitStrategy" value={data.exitStrategy} onChange={(v:any) => update('exitStrategy', v)} />
        </Section>
        <Section title="2. Technical Controls">
          <Row label="Security Control Assessment" field="ctrlAssessment" value={data.ctrlAssessment} onChange={(v:any) => update('ctrlAssessment', v)} />
          <Row label="Compliance & Reg Alignment" field="complianceAlignment" value={data.complianceAlignment} onChange={(v:any) => update('complianceAlignment', v)} />
        </Section>
        <Section title="3. Risk & Impact">
          <Row label="Risk & Issue Tracking" field="riskTracking" value={data.riskTracking} onChange={(v:any) => update('riskTracking', v)} />
          <Row label="Dependency & SPOF Impact" field="dependencyFailure" value={data.dependencyFailure} onChange={(v:any) => update('dependencyFailure', v)} />
        </Section>
      </div>

      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Third-Party Security Observations</label>
        <textarea 
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:ring-1 focus:ring-indigo-400 outline-none resize-none h-24 transition-all"
          placeholder="Document specific vendor services supported, remediation progress, or historical incident details..."
          value={data.comments}
          onChange={(e) => update('comments', e.target.value)}
        />
      </div>

      <div className="flex flex-col items-center py-6">
        <button 
          onClick={() => onAnalyze(AssessmentModule.THIRD_PARTY, data)}
          disabled={isProcessing || !data.vendorName}
          className="bg-slate-900 text-white px-16 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing ? 'CALCULATING TPRM RISK...' : 'AUDIT THIRD-PARTY CONTROLS'}
        </button>
      </div>

      <ModuleFindingsList findings={findings} />
    </div>
  );
};

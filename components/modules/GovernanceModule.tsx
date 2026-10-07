
import React, { useState } from 'react';
import { AssessmentModule, Finding } from '../../types';
import { ModuleFindingsList, ManualFindingForm } from './SharedModuleComponents';

interface GovernanceModuleProps {
  onAnalyze: (module: AssessmentModule, data: any) => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
}

type GovStatus = 'exists' | 'missing' | 'na';

const GOV_DETAILS: Record<string, { req: string; risk: string }> = {
  businessOwner: { 
    req: "Formal appointment of a Senior Executive accountable for the asset.", 
    risk: "Lack of accountability leads to unauthorized risk acceptance." 
  },
  techOwner: { 
    req: "IT Lead responsible for maintenance and lifecycle.", 
    risk: "Patches and EOL issues go unmanaged." 
  },
  securityCustodian: { 
    req: "Lead for day-to-day security config.", 
    risk: "Inconsistent hardening and delayed config response." 
  },
  polCompliance: {
    req: "Verification that documented procedures for hardening, access, and incident handling are followed in practice.",
    risk: "Operational drift leading to 'paper compliance' without real protection."
  },
  riskAssessment: { 
    req: "Annual SRA/DPIA signed off by Risk Committee. Check for exceptions/compensating controls.", 
    risk: "Operating with unquantified risk and unapproved changes." 
  },
  regCompliance: { 
    req: "Mapping to Central Bank circulars, PCI DSS, ISO 27001, and tested internal controls (ITGCs).", 
    risk: "Fines and license revocation due to non-compliance." 
  },
  changeAudit: { 
    req: "Documented, approved, and auditable trail for all configuration and access changes.", 
    risk: "Unauthorized changes cannot be traced, hindering forensics." 
  },
  vendorGov: {
    req: "Assessment and management of outsourced system components as per the Bank's vendor risk policy.",
    risk: "Blind spots in outsourced operations leading to supply chain compromise."
  }
};

export const GovernanceModule: React.FC<GovernanceModuleProps> = ({
  onAnalyze, isProcessing, findings, showManualForm, onToggleManualForm, onAddManual
}) => {
  const [data, setData] = useState({
    businessOwner: 'missing' as GovStatus,
    techOwner: 'missing' as GovStatus,
    securityCustodian: 'missing' as GovStatus,
    polCompliance: 'missing' as GovStatus,
    riskAssessment: 'missing' as GovStatus,
    regCompliance: 'missing' as GovStatus,
    changeAudit: 'missing' as GovStatus,
    vendorGov: 'missing' as GovStatus,
    comments: ''
  });

  const update = (key: keyof typeof data, val: GovStatus | string) => setData(prev => ({ ...prev, [key]: val }));

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
        <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="invisible group-hover:visible absolute left-0 md:left-auto md:right-0 bottom-full mb-2 z-[100] w-72 p-4 bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 slide-in-from-bottom-2 border border-white/10">
        <div className="space-y-3">
          <div>
            <p className="font-black uppercase text-blue-400 tracking-tighter mb-1">Audit Requirement</p>
            <p className="text-slate-200 leading-relaxed font-medium">{GOV_DETAILS[field]?.req}</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <p className="font-black uppercase text-rose-400 tracking-tighter mb-1">Business Risk</p>
            <p className="text-slate-300 leading-relaxed italic">{GOV_DETAILS[field]?.risk}</p>
          </div>
        </div>
        <div className="absolute -bottom-1 right-6 md:right-8 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
        {(['exists', 'missing', 'na'] as GovStatus[]).map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${
              value === opt ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            {opt === 'na' ? 'N/A' : opt === 'exists' ? 'Verified' : 'Missing'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl border-b-4 border-blue-500/30">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-3 text-blue-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          Governance & GRC Objective
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          Audit system accountability, procedure compliance, and regulatory alignment. Ensure all changes are auditable and third-party risks are formally managed.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">GRC Control Checklist</h3>
        <button onClick={onToggleManualForm} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl border border-slate-200 transition-all">
          {showManualForm ? 'CANCEL MANUAL' : '+ MANUAL FINDING'}
        </button>
      </div>

      {showManualForm && <ManualFindingForm onSubmit={onAddManual} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="1. Ownership & Roles">
          <Row label="Business System Owner" field="businessOwner" value={data.businessOwner} onChange={(v:any) => update('businessOwner', v)} />
          <Row label="IT / Technical Owner" field="techOwner" value={data.techOwner} onChange={(v:any) => update('techOwner', v)} />
          <Row label="Security Custodian" field="securityCustodian" value={data.securityCustodian} onChange={(v:any) => update('securityCustodian', v)} />
        </Section>
        <Section title="2. Compliance & Procedure">
          <Row label="Procedures Followed in Practice" field="polCompliance" value={data.polCompliance} onChange={(v:any) => update('polCompliance', v)} />
          <Row label="Regulatory/Internal Mapping" field="regCompliance" value={data.regCompliance} onChange={(v:any) => update('regCompliance', v)} />
          <Row label="Change Mgmt & Audit Trail" field="changeAudit" value={data.changeAudit} onChange={(v:any) => update('changeAudit', v)} />
        </Section>
        <Section title="3. Risk & Vendor GRC">
          <Row label="Formal Risk Assessment" field="riskAssessment" value={data.riskAssessment} onChange={(v:any) => update('riskAssessment', v)} />
          <Row label="Third-Party/Vendor Governance" field="vendorGov" value={data.vendorGov} onChange={(v:any) => update('vendorGov', v)} />
        </Section>
      </div>

      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Governance Observations</label>
        <textarea 
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:ring-1 focus:ring-blue-400 outline-none resize-none h-24 transition-all"
          placeholder="Document ITGC testing results, open exceptions, or compensating control details..."
          value={data.comments}
          onChange={(e) => update('comments', e.target.value)}
        />
      </div>

      <div className="flex flex-col items-center py-6">
        <button 
          onClick={() => onAnalyze(AssessmentModule.GOVERNANCE, data)}
          disabled={isProcessing}
          className="bg-slate-900 text-white px-16 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing ? 'CALCULATING GOVERNANCE MATURITY...' : 'AUDIT GRC COMPLIANCE'}
        </button>
      </div>

      <ModuleFindingsList findings={findings} />
    </div>
  );
};

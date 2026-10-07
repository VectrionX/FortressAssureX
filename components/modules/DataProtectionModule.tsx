
import React, { useState } from 'react';
import { AssessmentModule, Finding } from '../../types';
import { ModuleFindingsList, ManualFindingForm } from './SharedModuleComponents';

interface DataProtectionModuleProps {
  onAnalyze: (module: AssessmentModule, data: any) => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
}

type DataStatus = 'yes' | 'no' | 'partial';

const DATA_DETAILS: Record<string, { req: string; risk: string }> = {
  classification: { 
    req: "Identify types (PII, Financial, Confidential, Public). Check if a documented classification matrix and tagging exist.", 
    risk: "Sensitive data handled as public data, violating banking secrecy and GDPR." 
  },
  storageEncryption: { 
    req: "AES-256 at-rest encryption for databases, file systems, backups, and cloud storage. Secure key management (KMS/HSM).", 
    risk: "Physical theft or logical disk image exposure results in total customer data loss." 
  },
  transitEncryption: { 
    req: "Mandatory TLS 1.2+, VPNs, or secure APIs. Avoid cleartext protocols like HTTP, FTP, or Telnet.", 
    risk: "Network sniffing (MitM) capturing plaintext login or transaction packets." 
  },
  masking: { 
    req: "Sensitive elements (Names, PANs, Balances) must be masked or tokenized in dev, test, and analytics environments.", 
    risk: "Non-production staff accessing real financial data, leading to insider fraud or leakage." 
  },
  retention: { 
    req: "Documented retention policy enforced via automated deletion or archival after the statutory period (e.g. 7 years).", 
    risk: "Increased legal liability and 'blast radius' from retaining obsolete sensitive data." 
  },
  accessControl: { 
    req: "Only authorized users access sensitive data. Role-Based (RBAC) or Attribute-Based (ABAC) controls applied at the data layer.", 
    risk: "Over-privileged users or service accounts querying sensitive client information without a business need." 
  },
  dlp: { 
    req: "Data Leak Prevention policies for email, web, and host. Alerts on unauthorized data access or external transfer.", 
    risk: "Undetected exfiltration of customer databases via peripheral channels." 
  },
  auditMonitoring: { 
    req: "Logging of all sensitive data accesses. Automated detection of anomalous access patterns or bulk exports.", 
    risk: "Inability to perform forensics after a breach; slow detection of systematic data harvesting." 
  },
  compliance: { 
    req: "Explicit alignment with PCI DSS, GDPR, ISO 27001, and local Central Bank data security circulars.", 
    risk: "Regulatory fines, litigation, and withdrawal of the institution's operating license." 
  }
};

export const DataProtectionModule: React.FC<DataProtectionModuleProps> = ({
  onAnalyze, isProcessing, findings, showManualForm, onToggleManualForm, onAddManual
}) => {
  const [data, setData] = useState({
    classification: 'no' as DataStatus,
    storageEncryption: 'no' as DataStatus,
    transitEncryption: 'no' as DataStatus,
    masking: 'no' as DataStatus,
    retention: 'no' as DataStatus,
    accessControl: 'no' as DataStatus,
    dlp: 'no' as DataStatus,
    auditMonitoring: 'no' as DataStatus,
    compliance: 'no' as DataStatus,
    
    // 5.1 Matrix State
    classificationMatrix: { public: false, internal: false, confidential: false, restricted: false },
    
    // 5.2 Residency State
    residency: { sovereign: false, publicCloud: false, byok: false },
    
    comments: ''
  });

  const update = (key: keyof typeof data, val: any) => setData(prev => ({ ...prev, [key]: val }));
  const updateMatrix = (key: keyof typeof data.classificationMatrix) => setData(p => ({...p, classificationMatrix: {...p.classificationMatrix, [key]: !p.classificationMatrix[key]}}));
  const updateResidency = (key: keyof typeof data.residency) => setData(p => ({...p, residency: {...p.residency, [key]: !p.residency[key]}}));

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
        <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="invisible group-hover:visible absolute left-0 md:left-auto md:right-0 bottom-full mb-2 z-[100] w-72 p-4 bg-slate-900/95 backdrop-blur-md text-white text-[10px] rounded-2xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 slide-in-from-bottom-2 border border-white/10">
        <div className="space-y-3">
          <div>
            <p className="font-black uppercase text-emerald-400 tracking-tighter mb-1">Audit Requirement</p>
            <p className="text-slate-200 leading-relaxed font-medium">{DATA_DETAILS[field]?.req}</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <p className="font-black uppercase text-rose-400 tracking-tighter mb-1">Impact Risk</p>
            <p className="text-slate-300 leading-relaxed italic">{DATA_DETAILS[field]?.risk}</p>
          </div>
        </div>
        <div className="absolute -bottom-1 right-6 md:right-8 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10"></div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
        {(['yes', 'no', 'partial'] as DataStatus[]).map((opt) => (
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
      <div className="bg-emerald-900 p-6 rounded-2xl text-white shadow-xl border-b-4 border-emerald-400/30">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-emerald-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Data Protection Assessment Objective
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          Evaluate the complete data lifecycle: identification, encryption at rest/transit, resilient lifecycle policies, and proactive monitoring of sensitive data access.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Data Control Checklist</h3>
        <button onClick={onToggleManualForm} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl border border-slate-200 transition-all">
          {showManualForm ? 'CANCEL MANUAL' : '+ MANUAL FINDING'}
        </button>
      </div>

      {showManualForm && <ManualFindingForm onSubmit={onAddManual} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* 5.1 Data Classification Matrix */}
          <Section title="Data Classification Matrix">
            <p className="text-[10px] text-slate-500 mb-2">Select data types handled by this system to verify control adequacy.</p>
            <div className="grid grid-cols-2 gap-2">
              {['public', 'internal', 'confidential', 'restricted'].map(type => (
                 <label key={type} className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${data.classificationMatrix[type as keyof typeof data.classificationMatrix] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'}`}>
                    <input type="checkbox" className="hidden" checked={data.classificationMatrix[type as keyof typeof data.classificationMatrix]} onChange={() => updateMatrix(type as any)} />
                    <span className="block text-[10px] font-bold uppercase">{type}</span>
                 </label>
              ))}
            </div>
            {data.classificationMatrix.restricted && (
              <div className="mt-2 text-[9px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-100 font-bold">
                ⚠️ RESTRICTED data requires Encryption At Rest & Transit + Masking.
              </div>
            )}
          </Section>

          <Section title="1. Identification & Cryptography">
            <Row label="Data Classification Policy" field="classification" value={data.classification} onChange={(v:any) => update('classification', v)} />
            <Row label="Storage & Key Encryption" field="storageEncryption" value={data.storageEncryption} onChange={(v:any) => update('storageEncryption', v)} />
            <Row label="Data in Transit (TLS/VPN)" field="transitEncryption" value={data.transitEncryption} onChange={(v:any) => update('transitEncryption', v)} />
          </Section>
        </div>
        
        <div className="space-y-4">
           {/* 5.2 Residency Check */}
           <Section title="Data Sovereignty & Residency">
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-xs font-bold text-slate-700">Sovereign / National Data?</span>
                 <button onClick={() => updateResidency('sovereign')} className={`w-10 h-5 rounded-full relative transition-all ${data.residency.sovereign ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                   <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.residency.sovereign ? 'left-6' : 'left-1'}`}></span>
                 </button>
               </div>
               {data.residency.sovereign && (
                 <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Hosted in Public Cloud?</span>
                      <button onClick={() => updateResidency('publicCloud')} className={`w-10 h-5 rounded-full relative transition-all ${data.residency.publicCloud ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.residency.publicCloud ? 'left-6' : 'left-1'}`}></span>
                      </button>
                    </div>
                    {data.residency.publicCloud && (
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">BYOK Enabled?</span>
                          <button onClick={() => updateResidency('byok')} className={`w-10 h-5 rounded-full relative transition-all ${data.residency.byok ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                            <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.residency.byok ? 'left-6' : 'left-1'}`}></span>
                          </button>
                       </div>
                    )}
                 </>
               )}
               {data.residency.sovereign && data.residency.publicCloud && !data.residency.byok && (
                 <div className="p-2 bg-rose-100 text-rose-800 text-[9px] font-bold rounded border border-rose-200">
                    CRITICAL: Sovereignty Violation. Public cloud hosting of national data without BYOK is prohibited.
                 </div>
               )}
             </div>
           </Section>

          <Section title="2. Lifecycle & Exposure">
            <Row label="Masking & Tokenization" field="masking" value={data.masking} onChange={(v:any) => update('masking', v)} />
            <Row label="Retention & Deletion" field="retention" value={data.retention} onChange={(v:any) => update('retention', v)} />
            <Row label="Granular Access Control" field="accessControl" value={data.accessControl} onChange={(v:any) => update('accessControl', v)} />
          </Section>
          <Section title="3. Monitoring & GRC">
            <Row label="DLP Policy & Alerting" field="dlp" value={data.dlp} onChange={(v:any) => update('dlp', v)} />
            <Row label="Audit & Access Monitoring" field="auditMonitoring" value={data.auditMonitoring} onChange={(v:any) => update('auditMonitoring', v)} />
            <Row label="Regulatory Compliance" field="compliance" value={data.compliance} onChange={(v:any) => update('compliance', v)} />
          </Section>
        </div>
      </div>

      <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Data Security Observations</label>
        <textarea 
          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 focus:ring-1 focus:ring-emerald-400 outline-none resize-none h-24 transition-all"
          placeholder="Enter qualitative evidence for encryption gaps, DLP failures, or classification issues..."
          value={data.comments}
          onChange={(e) => update('comments', e.target.value)}
        />
      </div>

      <div className="flex flex-col items-center py-6">
        <button 
          onClick={() => onAnalyze(AssessmentModule.DATA, data)}
          disabled={isProcessing}
          className="bg-slate-900 text-white px-16 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing ? 'CALCULATING DATA MATURITY...' : 'AUDIT DATA PROTECTION'}
        </button>
      </div>

      <ModuleFindingsList findings={findings} />
    </div>
  );
};

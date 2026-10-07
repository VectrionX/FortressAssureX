
import React, { useState } from 'react';
import { AssessmentModule, Finding } from '../../types';
import { ModuleFindingsList } from './SharedModuleComponents';

interface SecurityAssuranceProps {
  onAnalyze: (data: any) => void;
  isProcessing: boolean;
  findings: Finding[];
}

type CheckStatus = 'exists' | 'missing' | 'na';

export const SecurityControlAssuranceModule: React.FC<SecurityAssuranceProps> = ({
  onAnalyze, isProcessing, findings
}) => {
  const [data, setData] = useState({
    scopeDefined: 'missing' as CheckStatus,
    periodicReview: 'missing' as CheckStatus,
    scopeComments: '',
    coverageGaps: 'exists' as CheckStatus,
    risksMapped: 'missing' as CheckStatus,
    coverageComments: '',
    primaryFunction: 'missing' as CheckStatus,
    threatMitigation: 'missing' as CheckStatus,
    adverseConditions: 'missing' as CheckStatus,
    functionComments: ''
  });

  const update = (key: keyof typeof data, val: CheckStatus | string) => setData(prev => ({ ...prev, [key]: val }));

  const Section = ({ title, children, commentKey, commentValue }: { title: string, children: React.ReactNode, commentKey: keyof typeof data, commentValue: string }) => (
    <div className="space-y-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-1">
        {children}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-50">
        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-2">Observations / Evidence Reference</label>
        <textarea 
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 focus:ring-1 focus:ring-blue-400 outline-none transition-all placeholder:text-slate-300 resize-none h-20"
          placeholder="Enter qualitative evidence or specific justifications for the above selection..."
          value={commentValue}
          onChange={(e) => update(commentKey, e.target.value)}
        />
      </div>
    </div>
  );

  const Row = ({ label, value, onChange, options }: any) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl shrink-0 gap-1 md:gap-0">
        {options.map((opt: any) => (
          <button
            key={opt.val}
            onClick={() => onChange(opt.val)}
            className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all flex-1 md:flex-none whitespace-nowrap text-center ${
              value === opt.val ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const stdOptions = [
    { label: 'In Place', val: 'exists' },
    { label: 'Not in Place', val: 'missing' },
    { label: 'N/A', val: 'na' }
  ];

  const gapOptions = [
    { label: 'No Gaps', val: 'na' },
    { label: 'Identified Gaps', val: 'exists' },
    { label: 'Unknown', val: 'missing' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-lg shadow-blue-200">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h4 className="text-white font-bold text-sm tracking-tight">Security Control Assurance Analysis</h4>
        </div>
        <p className="text-blue-100 text-[10px] opacity-90 leading-relaxed">
          As a registered Security Solution, efficacy is audited across three integrity pillars. Observations entered below will be included in the Final Finding Impact analysis.
        </p>
      </div>

      <Section title="1. Scope & Documentation" commentKey="scopeComments" commentValue={data.scopeComments}>
        <Row label="Is the scope of the security control defined and documented?" value={data.scopeDefined} onChange={(v:any) => update('scopeDefined', v)} options={stdOptions} />
        <Row label="Are there periodic reviews to ensure the scope remains relevant?" value={data.periodicReview} onChange={(v:any) => update('periodicReview', v)} options={stdOptions} />
      </Section>

      <Section title="2. Coverage Matrix" commentKey="coverageComments" commentValue={data.coverageComments}>
        <Row label="Are there any identified gaps in the coverage?" value={data.coverageGaps} onChange={(v:any) => update('coverageGaps', v)} options={gapOptions} />
        <Row label="Does the control cover identified risks and vulnerabilities?" value={data.risksMapped} onChange={(v:any) => update('risksMapped', v)} options={stdOptions} />
      </Section>

      <Section title="3. Main Function & Resilience" commentKey="functionComments" commentValue={data.functionComments}>
        <Row label="Does the security control effectively fulfill its primary function?" value={data.primaryFunction} onChange={(v:any) => update('primaryFunction', v)} options={stdOptions} />
        <Row label="Does the control detect and mitigate threats as intended?" value={data.threatMitigation} onChange={(v:any) => update('threatMitigation', v)} options={stdOptions} />
        <Row label="Is the control capable of operating under adverse conditions?" value={data.adverseConditions} onChange={(v:any) => update('adverseConditions', v)} options={stdOptions} />
      </Section>

      <div className="flex flex-col items-center pt-4 pb-8">
        <button 
          onClick={() => onAnalyze(data)}
          disabled={isProcessing}
          className="bg-slate-900 text-white px-14 py-4 rounded-2xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              RECONCILING ASSURANCE DATA...
            </>
          ) : 'GENERATE ASSURANCE FINDINGS'}
        </button>
        <p className="text-[10px] text-slate-400 mt-4 uppercase font-black tracking-[0.2em]">Local Deterministic Engine</p>
      </div>

      <ModuleFindingsList findings={findings} />
    </div>
  );
};

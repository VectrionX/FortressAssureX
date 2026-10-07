
import React from 'react';
import { RiskLevel, Finding } from '../../types';
import { RiskBadge } from '../RiskBadge';

export const ModuleFindingsList: React.FC<{ findings: Finding[] }> = ({ findings }) => (
  <div className="mt-8 pt-8 border-t border-slate-100">
    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
      Module Result Register
    </h3>
    <div className="space-y-3">
      {findings.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
          No findings detected or recorded.
        </div>
      ) : (
        findings.map(finding => (
          <div key={finding.id} className={`p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white shadow-sm border-l-4 ${finding.title.startsWith('[Manual]') ? 'border-l-indigo-400' : 'border-l-slate-800'}`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900">{finding.title}</h4>
              <RiskBadge level={finding.riskLevel} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{finding.impact}</p>
            {finding.recommendation && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[9px] block mb-1">Recommended Remediation</span>
                {finding.recommendation}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

export const ManualFindingForm: React.FC<{ onSubmit: (f: any) => void }> = ({ onSubmit }) => {
  const [f, setF] = React.useState({ title: '', riskLevel: RiskLevel.MEDIUM, impact: '', recommendation: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-tighter">New Manual Finding</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input placeholder="Title" required className="p-2 text-sm border border-slate-300 rounded" value={f.title} onChange={e => setF({...f, title: e.target.value})} />
        <select className="p-2 text-sm border border-slate-300 rounded bg-white" value={f.riskLevel} onChange={e => setF({...f, riskLevel: e.target.value as RiskLevel})}>
          {Object.values(RiskLevel).map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <textarea placeholder="Impact Analysis" required className="w-full p-2 text-sm border border-slate-300 rounded h-20 mb-4 resize-none" value={f.impact} onChange={e => setF({...f, impact: e.target.value})} />
      <textarea placeholder="Remediation Strategy" className="w-full p-2 text-sm border border-slate-300 rounded h-20 mb-6 resize-none" value={f.recommendation} onChange={e => setF({...f, recommendation: e.target.value})} />
      <button type="submit" className="w-full py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-all">Add to Register</button>
    </form>
  );
};

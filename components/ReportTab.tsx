
import React, { useMemo } from 'react';
import { AssessmentState, RiskLevel, Finding, AssessmentModule } from '../types';
import { RiskBadge } from './RiskBadge';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ReportTabProps {
  state: AssessmentState;
}

const COLORS = {
  [RiskLevel.CRITICAL]: '#dc2626', // red-600
  [RiskLevel.HIGH]: '#ea580c', // orange-600
  [RiskLevel.MEDIUM]: '#d97706', // amber-600
  [RiskLevel.LOW]: '#16a34a', // green-600
  [RiskLevel.INFORMATIONAL]: '#3b82f6' // blue-500
};

export const ReportTab: React.FC<ReportTabProps> = ({ state }) => {
  
  // --- Analytics Hooks ---
  const stats = useMemo(() => {
    const counts = {
      [RiskLevel.CRITICAL]: 0,
      [RiskLevel.HIGH]: 0,
      [RiskLevel.MEDIUM]: 0,
      [RiskLevel.LOW]: 0,
      [RiskLevel.INFORMATIONAL]: 0,
      total: state.findings.length
    };
    state.findings.forEach(f => {
      if (counts[f.riskLevel] !== undefined) counts[f.riskLevel]++;
    });
    return counts;
  }, [state.findings]);

  const maturityData = useMemo(() => {
    return state.enabledModules.map(mod => ({
      name: mod,
      score: state.moduleScores[mod] || 0,
      fill: (state.moduleScores[mod] || 0) > 80 ? '#10b981' : (state.moduleScores[mod] || 0) > 50 ? '#f59e0b' : '#ef4444'
    })).sort((a, b) => a.score - b.score);
  }, [state.moduleScores, state.enabledModules]);

  const overallMaturity = useMemo(() => {
    const scores = Object.values(state.moduleScores);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [state.moduleScores]);

  const pieData = [
    { name: 'Critical', value: stats[RiskLevel.CRITICAL] },
    { name: 'High', value: stats[RiskLevel.HIGH] },
    { name: 'Medium', value: stats[RiskLevel.MEDIUM] },
    { name: 'Low', value: stats[RiskLevel.LOW] },
  ].filter(d => d.value > 0);

  const roadmap = useMemo(() => {
    const criticals = state.findings.filter(f => f.riskLevel === RiskLevel.CRITICAL);
    const highs = state.findings.filter(f => f.riskLevel === RiskLevel.HIGH);
    const mediums = state.findings.filter(f => f.riskLevel === RiskLevel.MEDIUM);
    const lows = state.findings.filter(f => f.riskLevel === RiskLevel.LOW || f.riskLevel === RiskLevel.INFORMATIONAL);
    
    return [
      { phase: 'Phase 1: Immediate Stabilization', timeframe: '0-7 Days', findings: criticals, color: 'border-l-red-500', bg: 'bg-red-50', priority: 'Urgent' },
      { phase: 'Phase 2: Risk Reduction', timeframe: '30 Days', findings: highs, color: 'border-l-orange-500', bg: 'bg-orange-50', priority: 'High' },
      { phase: 'Phase 3: Tactical Improvements', timeframe: '90 Days', findings: mediums, color: 'border-l-amber-500', bg: 'bg-amber-50', priority: 'Medium' },
      { phase: 'Phase 4: Strategic Optimization', timeframe: '6 Months', findings: lows, color: 'border-l-green-500', bg: 'bg-green-50', priority: 'Low' },
    ];
  }, [state.findings]);

  // --- Cross-Module Correlation ---
  const systemicRisks = useMemo(() => {
    const keywords = [
      { term: 'Encryption', keys: ['encrypt', 'cipher', 'tls', 'ssl'], count: 0, modules: new Set<string>() },
      { term: 'Access Control', keys: ['access', 'permission', 'role', 'privilege', 'mfa'], count: 0, modules: new Set<string>() },
      { term: 'Patching', keys: ['patch', 'update', 'version', 'outdated'], count: 0, modules: new Set<string>() },
      { term: 'Logging', keys: ['log', 'audit', 'monitor', 'siem'], count: 0, modules: new Set<string>() },
    ];

    state.findings.forEach(f => {
      const text = (f.title + ' ' + f.impact).toLowerCase();
      keywords.forEach(k => {
        if (k.keys.some(key => text.includes(key))) {
          k.count++;
          k.modules.add(f.module);
        }
      });
    });

    return keywords.filter(k => k.count > 1 && k.modules.size > 1);
  }, [state.findings]);

  // --- Helper Components ---
  const StatCard = ({ title, value, sub, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{title}</h3>
        <p className={`text-4xl font-bold mt-2 ${colorClass}`}>{value}</p>
      </div>
      <p className="text-[10px] text-slate-400 font-medium mt-4 leading-tight">{sub}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 print:space-y-6">
      
      {/* 1. Executive Summary Header */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border-b-4 border-indigo-500 print:bg-white print:text-black print:border-black">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Final Assurance Report</h1>
            <p className="text-slate-400 text-sm max-w-2xl print:text-slate-600">
              Comprehensive cybersecurity assessment for <span className="text-white font-bold print:text-black">{state.projectName}</span>. 
              This document outlines current risk exposure, control maturity, and a prioritized roadmap for remediation.
            </p>
          </div>
          <div className="flex w-full md:w-auto justify-between md:justify-center items-center gap-4 bg-white/10 px-4 md:px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm print:border-slate-200">
            <div className="text-left md:text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assurance Rating</p>
              <p className={`text-3xl font-bold ${overallMaturity > 80 ? 'text-emerald-400' : overallMaturity > 50 ? 'text-amber-400' : 'text-rose-400'} print:text-black`}>
                {overallMaturity >= 95 ? 'AAA' : overallMaturity >= 90 ? 'AA' : overallMaturity >= 85 ? 'A' : overallMaturity >= 80 ? 'BBB' : overallMaturity >= 70 ? 'BB' : overallMaturity >= 60 ? 'B' : 'C'}
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold ${overallMaturity > 80 ? 'border-emerald-500 text-emerald-500' : overallMaturity > 50 ? 'border-amber-500 text-amber-500' : 'border-rose-500 text-rose-500'}`}>
              {overallMaturity}%
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:grid-cols-2">
        <StatCard 
          title="Total Findings" 
          value={stats.total} 
          sub={`${stats[RiskLevel.CRITICAL]} Critical items require immediate attention.`} 
          colorClass="text-slate-800"
        />
        <StatCard 
          title="Critical Risks" 
          value={stats[RiskLevel.CRITICAL]} 
          sub="Highest priority security gaps identifying immediate exploit paths." 
          colorClass="text-red-600"
        />
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Risk Distribution Profile</h3>
          <div className="flex flex-col sm:flex-row items-center h-full gap-4 sm:gap-0">
            <div className="w-full sm:w-1/2 h-40 sm:h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name === 'Critical' ? RiskLevel.CRITICAL : entry.name === 'High' ? RiskLevel.HIGH : entry.name === 'Medium' ? RiskLevel.MEDIUM : RiskLevel.LOW]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-2 px-4 sm:px-0">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[d.name === 'Critical' ? RiskLevel.CRITICAL : d.name === 'High' ? RiskLevel.HIGH : d.name === 'Medium' ? RiskLevel.MEDIUM : RiskLevel.LOW] }}></span>
                    <span className="font-bold text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-mono text-slate-500">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Maturity (Heatmap Removed) */}
      <div className="grid grid-cols-1 gap-6 print:break-before-page">
        {/* Maturity Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Control Maturity by Domain
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maturityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 9, fontWeight: 600, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Cross-Module Systemic Risks */}
      {systemicRisks.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Systemic Risk Correlation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemicRisks.map(risk => (
              <div key={risk.term} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                <h3 className="font-black text-xs uppercase text-slate-500 mb-1">{risk.term} Findings</h3>
                <p className="text-2xl font-bold text-indigo-600 mb-2">{risk.count}</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(risk.modules).map(m => (
                    <span key={m} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-bold rounded border border-indigo-200">{(m || '').split(' ')[0]}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Strategic Remediation Roadmap */}
      <div className="space-y-6 print:break-before-page">
        <h2 className="text-xl font-bold text-slate-900 px-2">Strategic Remediation Roadmap</h2>
        <div className="grid grid-cols-1 gap-6">
          {roadmap.map((phase, idx) => (
            <div key={idx} className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${phase.findings.length === 0 ? 'opacity-50 grayscale' : ''}`}>
              <div className={`p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 ${phase.bg}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-white shadow-sm border flex-shrink-0 ${phase.color.replace('border-l-', 'text-').replace('500', '600')}`}>
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{phase.phase}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                       <span className="text-[10px] text-slate-500 font-medium bg-white/50 px-2 py-0.5 rounded border border-slate-200/50 whitespace-nowrap">Timeframe: {phase.timeframe}</span>
                       <span className="text-[10px] text-slate-500 font-medium bg-white/50 px-2 py-0.5 rounded border border-slate-200/50 whitespace-nowrap">Priority: {phase.priority}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 whitespace-nowrap self-start sm:self-auto">
                  {phase.findings.length} Tasks
                </span>
              </div>
              <div className="p-4 space-y-3">
                {phase.findings.length > 0 ? (
                  phase.findings.slice(0, 5).map(f => (
                    <div key={f.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                      <div className="mt-0.5"><RiskBadge level={f.riskLevel} /></div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{f.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{f.impact}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                           <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{f.module}</span>
                           <span className="text-[9px] text-indigo-500 font-bold cursor-pointer hover:underline">View Remediation &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="text-center py-4 text-xs text-slate-400 italic">No findings in this phase.</div>
                )}
                {phase.findings.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+ {phase.findings.length - 5} More Items</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Detailed Findings Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:break-before-page">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Detailed Findings Register</h2>
            <p className="text-xs text-slate-500">Full inventory of identified risks and deviations.</p>
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 print:hidden">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID & Module</th>
                <th className="px-6 py-4">Finding & Impact</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Owner (Inferred)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.findings.sort((a,b) => (a.riskLevel === RiskLevel.CRITICAL ? -1 : 1)).map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <span className="font-mono text-[10px] text-slate-400 block mb-1">{(f.id || '').split('-').slice(0,2).join('-')}</span>
                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">{f.module}</span>
                  </td>
                  <td className="px-6 py-4 align-top max-w-md">
                    <p className="font-bold text-slate-900 text-sm mb-1">{f.title}</p>
                    {f.observation && <p className="text-slate-600 leading-relaxed mb-1 italic text-[11px]">Obs: {f.observation}</p>}
                    <p className="text-slate-500 leading-relaxed mb-2">{f.impact}</p>
                    {(f.rootCause || f.evidence) && (
                      <div className="flex flex-col gap-1 mb-2">
                        {f.rootCause && <span className="text-[10px] text-slate-400">Root Cause: {f.rootCause}</span>}
                        {f.evidence && <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 py-0.5 rounded break-all">Evidence: {f.evidence}</span>}
                      </div>
                    )}
                    <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50">
                       <span className="text-[9px] font-black text-indigo-400 uppercase block mb-0.5">Recommendation</span>
                       <p className="text-indigo-900 leading-snug">{f.recommendation}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <RiskBadge level={f.riskLevel} />
                    {f.riskScore !== undefined && <div className="mt-2 text-[10px] font-bold text-slate-500">Score: {f.riskScore}/100</div>}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${f.module === AssessmentModule.GOVERNANCE ? 'bg-purple-500' : f.module === AssessmentModule.ARCHITECTURE ? 'bg-blue-500' : 'bg-slate-500'}`}>
                        {f.owner ? f.owner.substring(0, 2).toUpperCase() : (f.module === AssessmentModule.GOVERNANCE ? 'BS' : 'IT')}
                      </div>
                      <span className="font-medium text-slate-700">
                        {f.owner || (f.module === AssessmentModule.GOVERNANCE ? 'Business Owner' : 
                         f.module === AssessmentModule.THIRD_PARTY ? 'Vendor Mgr' : 
                         f.module === AssessmentModule.HARDENING ? 'SysAdmin' : 'IT Security')}
                      </span>
                    </div>
                    {f.frameworks && f.frameworks.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {f.frameworks.map(fw => <span key={fw} className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded">{fw}</span>)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${f.status === 'Open' ? 'bg-rose-100 text-rose-800' : f.status === 'Mitigated' ? 'bg-emerald-100 text-emerald-800' : f.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                      {f.status}
                    </span>
                    {f.dueDate && <div className="mt-1 text-[9px] text-slate-400">Due: {f.dueDate}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

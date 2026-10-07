
import React, { useMemo } from 'react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { AssessmentState, RiskLevel, SystemCategory, AssessmentType } from '../types';

interface DashboardProps {
  data: AssessmentState;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const riskCounts = {
    [RiskLevel.CRITICAL]: data.findings.filter(f => f.riskLevel === RiskLevel.CRITICAL).length,
    [RiskLevel.HIGH]: data.findings.filter(f => f.riskLevel === RiskLevel.HIGH).length,
    [RiskLevel.MEDIUM]: data.findings.filter(f => f.riskLevel === RiskLevel.MEDIUM).length,
    [RiskLevel.LOW]: data.findings.filter(f => f.riskLevel === RiskLevel.LOW).length,
  };

  const radarData = data.enabledModules.map((moduleName) => ({
    subject: (moduleName || '').split(' ')[0], // shortened for UI
    A: data.moduleScores[moduleName] || 0,
    fullMark: 100,
  }));

  const enabledScores = data.enabledModules.map(m => data.moduleScores[m]);
  const overallScore = enabledScores.length > 0 
    ? Math.round(enabledScores.reduce((a, b) => a + b, 0) / enabledScores.length)
    : 0;

  const getRating = (score: number) => {
    if (score >= 95) return 'AAA';
    if (score >= 90) return 'AA';
    if (score >= 85) return 'A';
    if (score >= 80) return 'BBB';
    if (score >= 70) return 'BB';
    if (score >= 60) return 'B';
    return 'C';
  };

  const overallRating = getRating(overallScore);

  // --- Heatmap Logic ---
  const heatMapData = useMemo(() => {
    // Rows: Critical, High, Medium, Low
    // Cols: Modules
    const matrix: Record<string, Record<string, number>> = {};
    const modules = data.enabledModules;
    
    [RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW].forEach(risk => {
      matrix[risk] = {};
      modules.forEach(mod => {
        matrix[risk][mod] = data.findings.filter(f => f.riskLevel === risk && f.module === mod).length;
      });
    });
    return { matrix, modules };
  }, [data.findings, data.enabledModules]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className={`rounded-3xl p-6 md:p-8 text-white relative shadow-xl border-b-4 ${data.assessmentType === AssessmentType.SECURITY_SOLUTION ? 'bg-blue-900 border-blue-700' : 'bg-slate-900 border-slate-700'}`}>
          <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
            <div className="w-full xl:w-auto overflow-hidden">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${data.assessmentType === AssessmentType.SECURITY_SOLUTION ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {data.assessmentType} {data.solutionCategory ? `- ${data.solutionCategory}` : ''}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold break-words">{data.projectName}</h2>
              <p className="text-slate-400 text-base md:text-lg max-w-2xl font-light mt-2">Comprehensive cyber assurance and control validation for {data.systemOwner}.</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5">
                  Started: {data.startDate}
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5">
                  Scope: {data.systemScope.length} Assets
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 w-full xl:w-auto bg-black/20 p-4 md:p-6 rounded-2xl border border-white/5 items-center justify-between xl:justify-end">
              <div className="text-center md:pr-4 md:border-r border-white/10 flex-1 md:flex-none">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Assurance Rating</span>
                <span className={`text-4xl font-black ${overallScore > 85 ? 'text-emerald-400' : overallScore > 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {overallRating}
                </span>
              </div>
              <div className="text-center pl-4 pr-4 border-r border-white/10 hidden md:block">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Maturity Score</span>
                <span className={`text-3xl font-bold ${overallScore > 70 ? 'text-emerald-400' : overallScore > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {overallScore}%
                </span>
              </div>
               <div className="text-center pl-4">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">In-Scope Modules</span>
                <span className="text-3xl font-bold text-blue-400">{data.enabledModules.length}</span>
              </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest break-words">Critical Risks</span>
          <div className="text-2xl md:text-3xl font-bold text-red-600 mt-1">{riskCounts[RiskLevel.CRITICAL]}</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest break-words">High Risks</span>
          <div className="text-2xl md:text-3xl font-bold text-orange-600 mt-1">{riskCounts[RiskLevel.HIGH]}</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest break-words">Medium Risks</span>
          <div className="text-2xl md:text-3xl font-bold text-amber-500 mt-1">{riskCounts[RiskLevel.MEDIUM]}</div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest break-words">Low Risks</span>
          <div className="text-2xl md:text-3xl font-bold text-emerald-500 mt-1">{riskCounts[RiskLevel.LOW]}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
            Control Maturity Radar
          </h3>
          <div className="h-80">
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Control Level" dataKey="A" stroke="#0f172a" fill="#0f172a" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                <p>Add 3+ modules to view radar analysis</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
             <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
             Risk Heat Map
          </h3>
          <div className="flex-1 overflow-x-auto">
             <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left font-bold text-slate-400 pb-2 align-bottom">Severity</th>
                  {heatMapData.modules.map(m => (
                    <th key={m} className="pb-2 font-bold text-slate-500 text-center w-10 align-bottom pt-4 h-24">
                      <div 
                        className="mx-auto text-[10px] tracking-widest uppercase flex items-center justify-center h-full"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        {(m || '').split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW].map(risk => (
                  <tr key={risk} className="border-t border-slate-50">
                    <td className="py-2 font-bold text-slate-700 pr-4">{risk}</td>
                    {heatMapData.modules.map(mod => {
                      const count = heatMapData.matrix[risk][mod];
                      return (
                        <td key={mod} className="p-1 text-center min-w-[2.5rem]">
                          <div 
                            className={`w-full h-8 rounded flex items-center justify-center font-bold text-white transition-all
                              ${count === 0 ? 'bg-slate-50 text-slate-300' : 
                                risk === RiskLevel.CRITICAL ? `bg-rose-600` : 
                                risk === RiskLevel.HIGH ? `bg-orange-500` : 
                                risk === RiskLevel.MEDIUM ? `bg-amber-400` : `bg-emerald-400`}
                              ${count > 0 ? 'opacity-90 hover:opacity-100 scale-95 hover:scale-100 shadow-sm' : ''}
                            `}
                            style={{ opacity: count === 0 ? 0.3 : 0.6 + (count * 0.1) }}
                          >
                            {count > 0 ? count : '-'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

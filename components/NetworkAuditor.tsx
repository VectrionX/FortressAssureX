
import React, { useState, useMemo } from 'react';
import { AssessmentModule } from '../types';

interface NetworkAuditorProps {
  onAnalyze: (archData: string, fwData: string) => void;
  isGenerating: boolean;
}

export const NetworkAuditor: React.FC<NetworkAuditorProps> = ({ onAnalyze, isGenerating }) => {
  const [archFile, setArchFile] = useState<string>("");
  const [fwFile, setFwFile] = useState<string>("");
  const [analyzed, setAnalyzed] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setter(event.target?.result as string);
      setAnalyzed(false); // Reset analysis on new file
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    setAnalyzed(true);
    onAnalyze(archFile, fwFile);
  };

  const activeFlows = useMemo(() => {
    if (!analyzed || !fwFile) return [];
    const lower = fwFile.toLowerCase();
    const flows = [];

    // Always show standard HTTPS if not blocked (assumed allowed for web apps)
    flows.push({ type: 'HTTPS (443)', color: 'emerald', from: 'internet', to: 'dmz', style: 'dashed' });

    // Detect Risks for Visualization
    if (lower.includes('any any') || lower.includes('any\tany') || (lower.includes('allow') && lower.match(/any.*any/))) {
        flows.push({ type: 'ANY / ANY', color: 'rose', from: 'internet', to: 'dmz', style: 'solid' });
    }
    
    // Check specific ports associated with "Any" or "Internet"
    const lines = lower.split('\n');
    const hasPortExposure = (port: string) => lines.some(l => (l.includes('allow') || l.includes('permit')) && (l.includes('any') || l.includes('internet')) && l.includes(port));

    if (hasPortExposure('1433')) flows.push({ type: 'SQL (1433)', color: 'rose', from: 'internet', to: 'app', style: 'solid' });
    if (hasPortExposure('3389')) flows.push({ type: 'RDP (3389)', color: 'rose', from: 'internet', to: 'app', style: 'solid' });
    if (hasPortExposure('22')) flows.push({ type: 'SSH (22)', color: 'orange', from: 'internet', to: 'app', style: 'solid' });
    if (hasPortExposure('8080')) flows.push({ type: 'TCP 8080', color: 'amber', from: 'dmz', to: 'app', style: 'solid' });

    return flows;
  }, [analyzed, fwFile]);

  const isReady = archFile && fwFile;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-400 transition-colors bg-slate-50">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">1. Approved Architecture</label>
          <p className="text-[10px] text-slate-500 mb-4">Expected traffic matrix (Source, Dst, Port)</p>
          <input 
            type="file" 
            accept=".csv,.txt" 
            onChange={(e) => handleFileUpload(e, setArchFile)}
            className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
          />
          {archFile && <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
            Matrix Loaded
          </div>}
        </div>

        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-400 transition-colors bg-slate-50">
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">2. Firewall Rules</label>
          <p className="text-[10px] text-slate-500 mb-4">Dump of current production rules</p>
          <input 
            type="file" 
            accept=".csv,.txt,.log" 
            onChange={(e) => handleFileUpload(e, setFwFile)}
            className="block w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
          />
          {fwFile && <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
            Rules Loaded
          </div>}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isGenerating || !isReady}
          className="flex items-center space-x-2 bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-30"
        >
          {isGenerating ? 'Running Scoped Audit...' : 'Reconcile Against Master Scope'}
        </button>
      </div>

      {analyzed && !isGenerating && (
        <div className="mt-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 text-center">Visual Traffic Topology (Actual vs. Approved)</h3>
          
          <div className="relative w-full h-72 flex items-center justify-between px-4 md:px-12 select-none overflow-hidden">
            {/* Background Lines */}
            <div className="absolute inset-0 top-1/2 border-t-2 border-dashed border-slate-200 z-0"></div>

            {/* Nodes */}
            <div className="relative z-10 flex flex-col items-center group w-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <span className="text-[10px] font-bold uppercase mt-2 text-slate-500">Internet</span>
            </div>

            <div className="relative z-0 flex-1 h-full mx-4">
              {/* Dynamic Flow Arrows */}
              {activeFlows.map((flow, idx) => {
                 const isInternetToApp = flow.from === 'internet' && flow.to === 'app';
                 const isInternetToDmz = flow.from === 'internet' && flow.to === 'dmz';
                 const isDmzToApp = flow.from === 'dmz' && flow.to === 'app';
                 
                 // Positioning logic (simplified)
                 let topPos = 40 + (idx * 25);
                 if (idx > 3) topPos = 40 + (idx * 15); // compress if many flows

                 let widthClass = 'w-full';
                 let leftClass = 'left-0';
                 
                 if (isInternetToDmz) { widthClass = 'w-1/2'; }
                 if (isDmzToApp) { widthClass = 'w-1/2'; leftClass = 'left-1/2'; }

                 const colorClass = flow.color === 'rose' ? 'text-rose-400' : flow.color === 'emerald' ? 'text-emerald-400' : flow.color === 'orange' ? 'text-orange-400' : 'text-amber-400';
                 const badgeClass = flow.color === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-100' : flow.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100';

                 return (
                    <div key={idx} className={`absolute ${leftClass} ${widthClass} flex flex-col items-center transition-all duration-500`} style={{ top: `${topPos}px` }}>
                       <div className="relative w-full">
                          <svg className={`w-full h-4 ${colorClass}`} viewBox="0 0 100 10" preserveAspectRatio="none">
                             <path d="M0 5 H100" stroke="currentColor" strokeWidth={flow.style === 'solid' ? 3 : 2} strokeDasharray={flow.style === 'dashed' ? '4 2' : '0'} markerEnd={`url(#arrow-${flow.color})`} />
                          </svg>
                          <span className={`absolute top-[-14px] left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded border ${badgeClass} shadow-sm whitespace-nowrap z-20`}>
                             {flow.type}
                          </span>
                       </div>
                    </div>
                 );
              })}
            </div>

            <div className="relative z-10 flex flex-col items-center group w-20">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <span className="text-[10px] font-bold uppercase mt-2 text-indigo-500">DMZ (Web)</span>
            </div>

            <div className="relative z-10 flex flex-col items-center group w-20 ml-4 md:ml-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              </div>
              <span className="text-[10px] font-bold uppercase mt-2 text-slate-500">App / DB</span>
            </div>
            
            {/* SVG Defs for Arrows */}
            <svg className="absolute w-0 h-0">
              <defs>
                <marker id="arrow-emerald" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#34d399" />
                </marker>
                <marker id="arrow-rose" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#f43f5e" />
                </marker>
                <marker id="arrow-orange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#fb923c" />
                </marker>
                <marker id="arrow-amber" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#fbbf24" />
                </marker>
              </defs>
            </svg>

          </div>
          
          <div className="flex justify-center gap-6 mt-4 border-t border-slate-50 pt-4">
             <div className="flex items-center gap-2">
               <div className="w-3 h-0.5 bg-emerald-400 border-t border-dashed border-emerald-400"></div>
               <span className="text-[9px] text-slate-500 font-medium">Authorized Flow</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-0.5 bg-rose-400"></div>
               <span className="text-[9px] text-slate-500 font-medium">Unauthorized / Breach</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

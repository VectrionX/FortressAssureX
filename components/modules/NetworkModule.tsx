
import React, { useState } from 'react';
import { AssessmentModule, Finding, SystemAsset } from '../../types';
import { NetworkAuditor } from '../NetworkAuditor';
import { ModuleFindingsList, ManualFindingForm } from './SharedModuleComponents';

interface NetworkModuleProps {
  onAnalyze: (archData: string, fwData: string, scopeIps: string) => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
  systemScope: SystemAsset[];
}

export const NetworkModule: React.FC<NetworkModuleProps> = ({
  onAnalyze, isProcessing, findings, showManualForm, onToggleManualForm, onAddManual, systemScope
}) => {
  const scopeIps = systemScope.map(s => s.ip).join(',');

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl border-b-4 border-slate-500/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-slate-800 p-2 rounded-lg">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h4 className="font-bold text-sm">Network & Architecture Objective</h4>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          Verify network segmentation integrity by reconciling active firewall rules against approved architectural designs. Detecting over-permissive policies, lateral movement risks, and insecure protocol usage.
        </p>
      </div>

      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Architectural Reconciliation</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Currently evaluating <span className="text-slate-900 font-bold">{systemScope.length}</span> scope IP addresses</p>
        </div>
        <button onClick={onToggleManualForm} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl border border-slate-200 transition-all">
          {showManualForm ? 'CANCEL MANUAL' : '+ MANUAL FINDING'}
        </button>
      </div>

      {showManualForm && <ManualFindingForm onSubmit={onAddManual} />}
      
      <div className="p-1 bg-slate-50 rounded-2xl border border-slate-100">
        <NetworkAuditor 
          onAnalyze={(arch, fw) => onAnalyze(arch, fw, scopeIps)} 
          isGenerating={isProcessing} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
          <span className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-tighter">1. Segment Integrity</span>
          <p className="text-[10px] text-slate-600 leading-tight italic">Verify that Web, App, and Data tiers are logically isolated.</p>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
          <span className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-tighter">2. Protocol Hygiene</span>
          <p className="text-[10px] text-slate-600 leading-tight italic">Identify cleartext (HTTP/Telnet) or legacy protocol risks.</p>
        </div>
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
          <span className="block text-[9px] font-black text-slate-400 uppercase mb-2 tracking-tighter">3. Management OOB</span>
          <p className="text-[10px] text-slate-600 leading-tight italic">Check for SSH/RDP exposure outside of management VLANs.</p>
        </div>
      </div>

      <ModuleFindingsList findings={findings} />
    </div>
  );
};

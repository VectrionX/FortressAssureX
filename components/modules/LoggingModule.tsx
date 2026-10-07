
import React, { useState } from 'react';
import { AssessmentModule, Finding, SystemAsset } from '../../types';
import { ModuleFindingsList, ManualFindingForm } from './SharedModuleComponents';

interface LoggingModuleProps {
  onAnalyze: (module: AssessmentModule, data: any) => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
  systemScope: SystemAsset[];
}

type LogStatus = 'exists' | 'missing' | 'na';

const LOG_METADATA: Record<string, string> = {
  windows: "timestamp, hostname, log_type, severity, message, user",
  app: "timestamp, app_name, user_id, action, result, error_code",
  network: "timestamp, source_ip, destination_ip, port, action, rule_id",
  iam: "timestamp, user, event_type, success/failure, device",
  siem: "event_id, timestamp, source_system, severity, alert_type"
};

export const LoggingModule: React.FC<LoggingModuleProps> = ({
  onAnalyze, isProcessing, findings, showManualForm, onToggleManualForm, onAddManual, systemScope
}) => {
  const [checklist, setChecklist] = useState<Record<string, LogStatus>>({
    windows: 'na',
    app: 'na',
    network: 'na',
    iam: 'na'
  });

  const [config, setConfig] = useState({
    retentionPeriod: 'no' as 'yes' | 'no',
    alertingRules: 'no' as 'yes' | 'no'
  });

  const [siemFile, setSiemFile] = useState<{ name: string; content: string } | null>(null);

  const handleStatusChange = (key: string, status: LogStatus) => {
    setChecklist(prev => ({ ...prev, [key]: status }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setSiemFile({ name: file.name, content: text });
    }
  };

  const triggerAudit = () => {
    onAnalyze(AssessmentModule.LOGGING, { 
      checklist, 
      siemContent: siemFile?.content || "",
      config 
    });
  };

  const checklistItems = [
    { key: 'windows', label: '1. System / OS Logs (Win/Linux)' },
    { key: 'app', label: '2. Application Logs (Banking Apps)' },
    { key: 'network', label: '3. Network / Firewall Logs' },
    { key: 'iam', label: '4. Authentication & IAM Logs' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl border-b-4 border-blue-500/30">
        <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-blue-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Logging & Monitoring Objective
        </h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          Evaluate log generation across 4 technical layers, central SIEM aggregation (Splunk/Sentinel), and the presence of mandatory banking metadata fields.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Logging Source Checklist</h3>
        <button onClick={onToggleManualForm} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl border border-slate-200 transition-all">
          {showManualForm ? 'CANCEL MANUAL' : '+ MANUAL FINDING'}
        </button>
      </div>

      {showManualForm && <ManualFindingForm onSubmit={onAddManual} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {checklistItems.map(item => (
          <div key={item.key} className="group relative p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['exists', 'missing', 'na'] as LogStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(item.key, status)}
                    className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${
                      checklist[item.key] === status 
                        ? status === 'exists' ? 'bg-emerald-600 text-white shadow-md' : status === 'missing' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-500'
                    }`}
                  >
                    {status === 'na' ? 'N/A' : status}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[10px] bg-slate-100/50 p-3 rounded-xl border border-slate-50">
               <span className="block font-black text-slate-400 uppercase tracking-tighter mb-1">Mandatory Fields:</span>
               <code className="text-slate-500 font-mono italic">{LOG_METADATA[item.key]}</code>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">5. SIEM Aggregator Export</h3>
          {!siemFile ? (
            <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl text-center">
               <input type="file" accept=".csv" onChange={handleFileUpload} className="mx-auto block text-[9px] file:mr-2 file:py-1 file:px-3 file:rounded-full file:bg-slate-900 file:text-white" />
               <p className="text-[9px] text-slate-400 mt-2">Required Fields: {LOG_METADATA.siem}</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
               <span className="text-[10px] font-bold text-emerald-800 truncate">✓ {siemFile.name}</span>
               <button onClick={() => setSiemFile(null)} className="text-[9px] font-black text-rose-500 uppercase">Change</button>
            </div>
          )}
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">6. Audit & Alert Config</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Standard Retention (365d+)</span>
              <button onClick={() => setConfig(prev => ({...prev, retentionPeriod: prev.retentionPeriod === 'yes' ? 'no' : 'yes'}))} className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${config.retentionPeriod === 'yes' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {config.retentionPeriod === 'yes' ? 'Configured' : 'Inadequate'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Real-time Alerting Rules</span>
              <button onClick={() => setConfig(prev => ({...prev, alertingRules: prev.alertingRules === 'yes' ? 'no' : 'yes'}))} className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${config.alertingRules === 'yes' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {config.alertingRules === 'yes' ? 'Active' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center py-6">
        <button 
          onClick={triggerAudit}
          disabled={isProcessing}
          className="bg-slate-900 text-white px-16 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing ? 'ANALYZING MONITORING MATURITY...' : 'AUDIT LOGGING CONTROLS'}
        </button>
      </div>

      <ModuleFindingsList findings={findings} />
    </div>
  );
};

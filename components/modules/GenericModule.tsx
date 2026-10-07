
import React from 'react';
import { AssessmentModule, Finding } from '../../types';
import { ModuleFindingsList, ManualFindingForm } from './SharedModuleComponents';

interface GenericModuleProps {
  module: AssessmentModule;
  inputValue: string;
  onInputChange: (val: string) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
  placeholder?: string;
}

export const GenericModule: React.FC<GenericModuleProps> = ({
  module, inputValue, onInputChange, onAnalyze, isProcessing, findings, showManualForm, onToggleManualForm, onAddManual, placeholder
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">Heuristic audit and expert manual verification for {module}.</p>
        <button onClick={onToggleManualForm} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-lg border border-slate-200">
          {showManualForm ? 'Cancel Manual' : '+ Manual Finding'}
        </button>
      </div>
      {showManualForm && <ManualFindingForm onSubmit={onAddManual} />}
      <div className="space-y-4">
        <textarea
          className="w-full h-64 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none transition-all resize-none text-slate-700 font-mono text-xs"
          placeholder={placeholder || `Paste ${module} configuration or logs...`}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <div className="flex justify-end">
          <button onClick={onAnalyze} disabled={isProcessing || !inputValue} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 disabled:opacity-50 transition-all shadow-md">
            {isProcessing ? 'Auditing...' : 'Run Automated Audit'}
          </button>
        </div>
      </div>
      <ModuleFindingsList findings={findings} />
    </div>
  );
};

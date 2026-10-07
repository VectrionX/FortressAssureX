
import React from 'react';
import { AssessmentModule, Finding } from '../../types';
import { GenericModule } from './GenericModule';

interface IdentityModuleProps {
  inputValue: string;
  onInputChange: (val: string) => void;
  onAnalyze: () => void;
  isProcessing: boolean;
  findings: Finding[];
  showManualForm: boolean;
  onToggleManualForm: () => void;
  onAddManual: (finding: any) => void;
}

export const IdentityModule: React.FC<IdentityModuleProps> = (props) => (
  <GenericModule {...props} module={AssessmentModule.IDENTITY} />
);


import React from 'react';
import { AssessmentModule, Finding } from '../../types';
import { GenericModule } from './GenericModule';

export const IncidentModule: React.FC<any> = (props) => (
  <GenericModule {...props} module={AssessmentModule.INCIDENT} />
);

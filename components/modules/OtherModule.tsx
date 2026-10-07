
import React from 'react';
import { AssessmentModule, Finding } from '../../types';
import { GenericModule } from './GenericModule';

export const OtherModule: React.FC<any> = (props) => (
  <GenericModule 
    {...props} 
    module={AssessmentModule.OTHER} 
    placeholder="Document miscellaneous findings or context that doesn't fit into technical modules..."
  />
);

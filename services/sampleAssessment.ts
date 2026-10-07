import {
  AssessmentModule,
  AssessmentState,
  AssessmentType,
  AssetType,
  Criticality,
  RiskLevel,
  SystemCategory,
} from '../types';

export function createSampleAssessment(): AssessmentState {
  return {
    mode: 'sample',
    isInitialized: true,
    projectName: 'Sample Payments Gateway',
    systemOwner: 'Synthetic Example Team',
    assetCriticality: Criticality.MEDIUM,
    businessCriticality: Criticality.HIGH,
    systemCategory: SystemCategory.BANKING,
    assessmentType: AssessmentType.BANKING,
    startDate: '2025-01-15',
    systemScope: [
      {
        hostname: 'sample-edge-firewall',
        type: AssetType.NETWORK_DEVICE,
        environment: 'Synthetic demonstration only',
      },
    ],
    findings: [
      {
        id: 'sample-architecture-001',
        module: AssessmentModule.ARCHITECTURE,
        title: 'Illustrative broad firewall rule',
        riskLevel: RiskLevel.HIGH,
        observation: 'Synthetic assessor observation for demonstration only; no system was assessed.',
        evidenceReference: 'SAMPLE-EVIDENCE-ARCH-001',
        evidenceExcerpt: 'Synthetic excerpt — illustrative configuration scope only.',
        impact: 'Illustrative impact statement only; not a conclusion about a real environment.',
        recommendation: 'Illustrative recommended action only; validate against real evidence before action.',
        status: 'Recorded — human review required',
        recordedAt: '2025-01-15T00:00:00.000Z',
      },
      {
        id: 'sample-vulnerability-001',
        module: AssessmentModule.VULNERABILITY,
        title: 'Illustrative unsupported component record',
        riskLevel: RiskLevel.MEDIUM,
        observation: 'Synthetic assessor observation for demonstration only; no scan or validation was performed.',
        evidenceReference: 'SAMPLE-EVIDENCE-VULN-001',
        evidenceExcerpt: 'Synthetic excerpt — illustrative inventory review only.',
        impact: 'Illustrative impact statement only; not a conclusion about a real environment.',
        recommendation: 'Illustrative recommended action only; validate against real evidence before action.',
        status: 'Recorded — human review required',
        recordedAt: '2025-01-15T00:00:00.000Z',
      },
    ],
  };
}

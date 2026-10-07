export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFORMATIONAL = 'INFORMATIONAL',
}

export enum Criticality {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum AssessmentType {
  BANKING = 'Banking system or application',
  SECURITY_SOLUTION = 'Security solution',
}

export enum SystemCategory {
  BANKING = 'Banking System',
  SECURITY = 'Security Solution',
}

export enum AssessmentModule {
  ARCHITECTURE = 'Architecture & Network',
  IDENTITY = 'Identity & Access',
  VULNERABILITY = 'Vulnerability & Exposure',
  APPLICATION = 'App Security',
  DATA = 'Data Protection',
  LOGGING = 'Logging & Monitoring',
  INCIDENT = 'Incident Response',
  HARDENING = 'Hardening & Config',
  CLOUD_SECURITY = 'Cloud Security',
  ENDPOINT_SECURITY = 'Endpoint Security',
  EMAIL_SECURITY = 'Email Security',
  SECURITY_OPERATIONS = 'Security Operations',
  BUSINESS_CONTINUITY = 'Business Continuity & Resilience',
  THIRD_PARTY = 'Third-Party Risk',
  GOVERNANCE = 'Governance & GRC',
  OTHER = 'Other Observations',
}

export enum AssetType {
  SERVER = 'Server',
  WORKSTATION = 'Workstation',
  DATABASE = 'Database',
  APPLICATION = 'Application',
  API = 'API',
  NETWORK_DEVICE = 'Network Device',
  CLOUD_ASSET = 'Cloud Asset',
  CONTAINER = 'Container',
  K8S_CLUSTER = 'Kubernetes Cluster',
  SERVICE_ACCOUNT = 'Service Account',
  PRIVILEGED_ACCOUNT = 'Privileged Account',
  THIRD_PARTY = 'Third Party',
  DATA_REPOSITORY = 'Data Repository',
  SECURITY_SOLUTION = 'Security Solution',
  EXTERNAL_INTEGRATION = 'External Integration',
}

export interface SystemAsset {
  ip?: string;
  hostname: string;
  type?: AssetType;
  environment?: string;
}

export interface Finding {
  id: string;
  module: AssessmentModule;
  title: string;
  riskLevel: RiskLevel;
  observation: string;
  evidenceReference: string;
  evidenceExcerpt: string;
  impact: string;
  recommendation: string;
  status: 'Recorded — human review required';
  recordedAt: string;
}

export interface AssessmentState {
  mode: 'live' | 'sample';
  projectName: string;
  systemOwner: string;
  assetCriticality: Criticality;
  businessCriticality: Criticality;
  systemCategory: SystemCategory;
  assessmentType: AssessmentType;
  startDate: string;
  systemScope: SystemAsset[];
  findings: Finding[];
  isInitialized: boolean;
}

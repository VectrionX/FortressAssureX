
export enum RiskLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFORMATIONAL = 'INFORMATIONAL'
}

export enum Criticality {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum AssessmentType {
  BANKING = 'Banking System Assessment',
  SECURITY_SOLUTION = 'Security Solution Assessment'
}

export enum SolutionCategory {
  SIEM = 'SIEM',
  EDR = 'EDR',
  XDR = 'XDR',
  SOAR = 'SOAR',
  PAM = 'PAM',
  IAM = 'IAM',
  FIREWALL = 'Firewall',
  WAF = 'WAF',
  DLP = 'DLP',
  CASB = 'CASB',
  PROXY = 'Proxy',
  EMAIL_SECURITY = 'Email Security',
  THREAT_INTEL = 'Threat Intelligence',
  VULN_SCANNER = 'Vulnerability Scanner',
  NAC = 'NAC',
  CLOUD_SECURITY = 'Cloud Security Platform',
  OTHER = 'Other'
}

export enum SystemCategory {
  BANKING = 'Banking System',
  SECURITY = 'Security Solution'
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
  OTHER = 'Other Observations'
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
  EXTERNAL_INTEGRATION = 'External Integration'
}

export interface Finding {
  id: string;
  module: AssessmentModule;
  title: string;
  riskLevel: RiskLevel;
  riskScore?: number;
  observation?: string;
  evidence?: string;
  impact: string;
  likelihood?: string;
  rootCause?: string;
  recommendation: string;
  owner?: string;
  dueDate?: string;
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Closed' | 'In Progress';
  frameworks?: string[];
}

export interface SystemAsset {
  ip?: string;
  hostname: string;
  type?: AssetType;
  environment?: string;
  businessCritical?: boolean;
  internetFacing?: boolean;
}

export interface AssessmentState {
  projectName: string;
  systemOwner: string;
  assetCriticality: Criticality;
  businessCriticality: Criticality;
  systemCategory: SystemCategory;
  assessmentType: AssessmentType;
  solutionCategory?: SolutionCategory;
  startDate: string;
  systemScope: SystemAsset[];
  findings: Finding[];
  moduleScores: Record<AssessmentModule, number>;
  enabledModules: AssessmentModule[];
  isInitialized: boolean;
}


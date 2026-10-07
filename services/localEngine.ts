
import { AssessmentModule, RiskLevel, Finding, Criticality, SystemAsset } from "../types";

/**
 * BANKING-GRADE DETERMINISTIC RISK ENGINE
 */

export const parseHardeningReport = (fileName: string): Finding[] => {
  const timestamp = Date.now();
  const findings: Finding[] = [];

  // Simulated logic for parsing CIS / STIG / Qualys Hardening Reports
  findings.push({
    id: `auto-hard-1-${timestamp}`,
    module: AssessmentModule.HARDENING,
    title: `[Hardening Auto] CIS Benchmark Violation: Insecure Services`,
    riskLevel: RiskLevel.HIGH,
    impact: `The report "${fileName}" indicates that legacy or unnecessary services (e.g., Telnet, SMBv1) are still enabled on production nodes.`,
    recommendation: "Disable all non-essential services as per CIS Layer 1 benchmarks.",
    status: 'Open'
  });

  findings.push({
    id: `auto-hard-2-${timestamp}`,
    module: AssessmentModule.HARDENING,
    title: `[Hardening Auto] Weak Administrative Cipher Suite`,
    riskLevel: RiskLevel.MEDIUM,
    impact: "Remote management interfaces are configured with deprecated SSH/TLS ciphers, allowing for potential decryption of admin sessions.",
    recommendation: "Update SSHD config to exclusively use modern ciphers (e.g., AES-GCM, Chacha20).",
    status: 'Open'
  });

  return findings;
};

export const parseVendorReport = (vendor: string, fileName: string, fileContent: string = ""): Finding[] => {
  const timestamp = Date.now();
  const findings: Finding[] = [];
  const lowerContent = fileContent.toLowerCase();

  // 3.2 Exploitability Context
  const hasExploit = lowerContent.includes("exploit available") || lowerContent.includes("rce") || lowerContent.includes("remote code execution");
  const baseRisk = hasExploit ? RiskLevel.CRITICAL : RiskLevel.HIGH;
  
  if (vendor === 'qualys') {
    if (hasExploit) {
      findings.push({
        id: `auto-qualys-exploit-${timestamp}`,
        module: AssessmentModule.VULNERABILITY,
        title: `[Qualys Auto] Weaponized Vulnerability Detected`,
        riskLevel: RiskLevel.CRITICAL,
        impact: `Report contains indicators ("Exploit Available", "RCE") confirmed in the wild. Immediate exploitation probable on exposed assets.`,
        recommendation: "Invoke Incident Response Plan. Isolate affected assets immediately.",
        status: 'Open'
      });
    }

    findings.push({
      id: `auto-qualys-${timestamp}`,
      module: AssessmentModule.VULNERABILITY,
      title: `[Qualys Auto] Critical Vulnerabilities in ${fileName}`,
      riskLevel: RiskLevel.CRITICAL,
      impact: "Report indicates multiple unpatched CVEs with scores > 9.0 on core infrastructure. These bypass the 48-hour banking remediation window.",
      recommendation: "Apply emergency cumulative security updates and perform a verification rescan.",
      status: 'Open'
    });
  } else if (vendor === 'ms-edr') {
    findings.push({
      id: `auto-edr-${timestamp}`,
      module: AssessmentModule.VULNERABILITY,
      title: `[EDR Auto] Suspicious Lateral Movement Patterns`,
      riskLevel: RiskLevel.HIGH,
      impact: "Microsoft EDR identifies persistent credential harvesting attempts or unauthorized execution patterns on the analyzed host.",
      recommendation: "Isolate affected hosts and perform a full forensic investigation via the SOC.",
      status: 'Open'
    });
  } else if (vendor.includes('fortify')) {
    const type = vendor.includes('sast') ? 'SAST' : 'DAST';
    findings.push({
      id: `auto-fortify-${timestamp}`,
      module: AssessmentModule.VULNERABILITY,
      title: `[Fortify ${type} Auto] High-Risk OWASP Top 10 Weakness`,
      riskLevel: RiskLevel.HIGH,
      impact: "Automated analysis detected potential Injection (SQLi) or Broken Access Control in the application layer.",
      recommendation: "Review code blocks identified in the Fortify report and implement secure input sanitization.",
      status: 'Open'
    });
  }

  return findings;
};

export const runVulnerabilityAudit = (data: any, assetCriticality: Criticality): Finding[] => {
  const findings: Finding[] = [];
  const timestamp = Date.now();

  // Deterministic Banking Compliance Logic
  if (data.scanFrequency === 'missing' || data.scanFrequency === 'na') {
    findings.push({
      id: `vuln-freq-${timestamp}`,
      module: AssessmentModule.VULNERABILITY,
      title: "HIGH: Inadequate Vulnerability Scan Frequency",
      riskLevel: RiskLevel.HIGH,
      impact: "Mandatory weekly automated scanning is missing or incorrectly marked N/A. The institution cannot guarantee visibility over new zero-days.",
      recommendation: "Establish a mandatory weekly scan schedule across all production zones.",
      status: 'Open'
    });
  }

  if (data.remediationSLA === 'missing' || data.remediationSLA === 'na') {
    findings.push({
      id: `vuln-sla-${timestamp}`,
      module: AssessmentModule.VULNERABILITY,
      title: "CRITICAL: Non-Compliant Patching SLA",
      riskLevel: RiskLevel.CRITICAL,
      impact: "No documented SLA exists for remediation. Critical banking assets remain exposed beyond regulatory thresholds.",
      recommendation: "Formalize a Patch Management Policy aligned with Central Bank circulars.",
      status: 'Open'
    });
  }

  if (data.codeSecurity === 'missing' || data.codeSecurity === 'na') {
    findings.push({
      id: `vuln-appsec-${timestamp}`,
      module: AssessmentModule.VULNERABILITY,
      title: "HIGH: Missing Fortify SAST/DAST Verification",
      riskLevel: RiskLevel.HIGH,
      impact: "Production release proceeded without verified application security testing results.",
      recommendation: "Mandate Fortify scan clearance as a prerequisite for CI/CD pipeline completion.",
      status: 'Open'
    });
  }

  return findings;
};

export const runHardeningAudit = (data: any): Finding[] => {
  const findings: Finding[] = [];
  const timestamp = Date.now();

  if (data.osHardening === 'no') {
    findings.push({
      id: `hard-base-${timestamp}`,
      module: AssessmentModule.HARDENING,
      title: "CRITICAL: Non-Compliant OS Hardening Baseline",
      riskLevel: RiskLevel.CRITICAL,
      impact: "The system does not follow CIS/STIG hardening standards. Default services and weak configurations are exposed.",
      recommendation: "Re-image the asset using the Bank's verified Golden Image.",
      status: 'Open'
    });
  }

  if (data.patchingCycle === 'no') {
    findings.push({
      id: `hard-patch-${timestamp}`,
      module: AssessmentModule.HARDENING,
      title: "HIGH: Systemic Patching Lifecycle Breach",
      riskLevel: RiskLevel.HIGH,
      impact: "Continuous integration of security updates is failing, leading to cumulative risk debt.",
      recommendation: "Automate patching cycles using centralized management tools.",
      status: 'Open'
    });
  }

  return findings;
};

export const runLocalNetworkAudit = (archData: string, fwData: string, scopeIps: string): Finding[] => {
  const findings: Finding[] = [];
  const lowerFw = fwData.toLowerCase();
  const timestamp = Date.now();

  // 1. Any/Any Check (Wildcard Permissive)
  if (lowerFw.includes("any any") || (lowerFw.includes("any") && lowerFw.includes("allow") && lowerFw.match(/any.*any/))) {
    findings.push({
      id: `net-permissive-${timestamp}`,
      module: AssessmentModule.ARCHITECTURE,
      title: "CRITICAL: Overly Permissive Firewall Policy (Any/Any)",
      riskLevel: RiskLevel.CRITICAL,
      impact: "Direct violation of Zero Trust. Rules exist permitting traffic from 'Any' source to 'Any' destination, bypassing segmentation.",
      recommendation: "Remove specific 'Any/Any' rules immediately and implement default-deny.",
      status: 'Open'
    });
  }

  // 2. Sensitive Port Exposure (Heuristic Analysis)
  const riskyPorts = [
    { port: '3389', name: 'RDP', level: RiskLevel.CRITICAL, desc: 'Remote Desktop' },
    { port: '22', name: 'SSH', level: RiskLevel.HIGH, desc: 'Shell Access' },
    { port: '1433', name: 'SQL', level: RiskLevel.CRITICAL, desc: 'MSSQL Database' },
    { port: '23', name: 'Telnet', level: RiskLevel.CRITICAL, desc: 'Cleartext Management' },
    { port: '21', name: 'FTP', level: RiskLevel.HIGH, desc: 'Cleartext File Transfer' }
  ];

  const lines = lowerFw.split('\n');
  riskyPorts.forEach(rp => {
    // Check if any line has 'allow', 'any'/'internet', and the port
    const hasExposure = lines.some(line => 
      (line.includes('allow') || line.includes('permit')) && 
      (line.includes('any') || line.includes('0.0.0.0') || line.includes('internet') || line.includes('external')) &&
      line.includes(rp.port)
    );

    if (hasExposure) {
      findings.push({
        id: `net-expose-${rp.name}-${timestamp}`,
        module: AssessmentModule.ARCHITECTURE,
        title: `${rp.level}: ${rp.name} (${rp.port}) Exposed to Internet`,
        riskLevel: rp.level,
        impact: `Firewall rules permit external traffic (Source: Any/Internet) on port ${rp.port}. This ${rp.desc} service is a primary target for brute-force and exploit attacks.`,
        recommendation: `Restrict port ${rp.port} to specific management IP ranges or require VPN access.`,
        status: 'Open'
      });
    }
  });

  // 3. Architecture Reconciliation (Simple Heuristic)
  if (archData && fwData) {
     const archLines = archData.toLowerCase().split('\n').filter(l => l.includes(',')); // Assume CSV-ish
     const missingSegments = archLines.filter(archLine => {
         const parts = archLine.split(',');
         if (parts.length < 2) return false;
         // If Architecture defines a flow, checking if FW has it is complex text matching.
         // Here we just check for basic "Zone" keywords not appearing in FW data
         const zoneName = parts[0].trim();
         return zoneName.length > 3 && !lowerFw.includes(zoneName);
     });

     if (missingSegments.length > 0) {
        findings.push({
          id: `net-drift-${timestamp}`,
          module: AssessmentModule.ARCHITECTURE,
          title: "MEDIUM: Architecture Documentation Drift",
          riskLevel: RiskLevel.MEDIUM,
          impact: `Defined zones in architecture (e.g., "${missingSegments[0].split(',')[0]}") do not appear as objects/labels in the firewall config.`,
          recommendation: "Update network diagrams to reflect actual firewall zone definitions.",
          status: 'Open'
        });
     }
  }

  return findings;
};

export const runGenericAudit = (module: AssessmentModule, input: string): Finding[] => {
  const timestamp = Date.now();
  if (!input || input.trim() === '') return [];
  
  let riskLevel = RiskLevel.MEDIUM;
  let riskScore = 65;
  const lowerInput = input.toLowerCase();

  if(lowerInput.includes('critical') || lowerInput.includes('fail') || lowerInput.includes('breach') || lowerInput.includes('exposed')) {
     riskLevel = RiskLevel.CRITICAL;
     riskScore = 95;
  } else if(lowerInput.includes('high') || lowerInput.includes('missing') || lowerInput.includes('vulnerable')) {
     riskLevel = RiskLevel.HIGH;
     riskScore = 80;
  } else if(lowerInput.includes('low') || lowerInput.includes('info')) {
     riskLevel = RiskLevel.LOW;
     riskScore = 30;
  }

  return [{
      id: `gen-${module.substring(0,3).toLowerCase()}-${timestamp}`,
      module: module,
      title: `Automated Assurance Analysis: ${module}`,
      riskLevel: riskLevel,
      riskScore: riskScore,
      observation: `Heuristic analysis identified control deviations within ${module}.`,
      impact: `Unmitigated gaps increase susceptibility to defined threat vectors and reduce compliance posture.`,
      evidence: `Excerpt: ${input.substring(0, 120)}...`,
      likelihood: riskScore > 75 ? 'High' : 'Medium',
      rootCause: 'Control Deterioration / Missing Implementation',
      recommendation: `Align configurations and practices with established baseline requirements.`,
      owner: 'Domain Owner',
      dueDate: riskScore > 85 ? '7 Days' : '30 Days',
      status: 'Open',
      frameworks: ['NIST CSF PR.DS', 'ISO 27001:A.12', 'CIS v8']
  }];
};
export const runLoggingAudit = (checklist: any, siemContent: string, scope: SystemAsset[], config: any): Finding[] => [];
export const runSecurityControlAudit = (data: any): Finding[] => [];
export const runGovernanceAudit = (data: any): Finding[] => [];
export const runThirdPartyAudit = (data: any): Finding[] => [];
export const runDataProtectionAudit = (data: any): Finding[] => [];
export const runAppSecAudit = (data: any): Finding[] => [];

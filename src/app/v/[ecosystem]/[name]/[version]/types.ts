import { Report_Evidence_Confidence } from "@buf/safedep_api.bufbuild_es/safedep/messages/malysis/v1/report_pb";
import { Severity_Risk } from "@buf/safedep_api.bufbuild_es/safedep/messages/vulnerability/v1/severity_pb";

export enum MalwareStatus {
  Safe = "Safe",
  PossiblyMalicious = "Possibly Malicious",
  Malicious = "Malicious",
  Unknown = "Unknown",
}

export enum PackageSafetyStatus {
  Safe = "Safe",
  PossiblyMalicious = "Possibly Malicious",
  Malicious = "Malicious",
  Vulnerable = "Vulnerable",
  Unmaintained = "Unmaintained",
  Unpopular = "Unpopular",
  PoorSecurityHygiene = "Poor Security Hygiene",
  Unknown = "Unknown",
}

export enum SecurityScorecardCheck {
  Vulnerability = "Vulnerability",
  Maintenance = "Maintenance",
  SAST = "SAST",
  CodeReview = "Code Review",
  Contributors = "Contributors",
  SignedReleases = "Signed Releases",
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity_Risk;
  reference_url?: string;
  cve?: string;
}

export interface Version {
  version: string;
  published_at: string;
  is_default: boolean;
}

export interface MalwareEvidence {
  source: string;
  fileKey?: string;
  projectSource?: string;
  confidence: Report_Evidence_Confidence;
  title: string;
  details: string;
}

export interface MalwareAnalysisBehavior {
  network_calls?: boolean;
  file_access?: boolean;
  process_creation?: boolean;
  suspicious_project?: boolean;
  package_signature_missing?: boolean;
}

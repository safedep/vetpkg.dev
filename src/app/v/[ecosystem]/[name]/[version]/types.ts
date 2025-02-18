import { Report_Evidence_Confidence } from "@buf/safedep_api.bufbuild_es/safedep/messages/malysis/v1/report_pb";
import { Severity_Risk } from "@buf/safedep_api.bufbuild_es/safedep/messages/vulnerability/v1/severity_pb";

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity_Risk;
  cve?: string;
  reference_url?: string;
}

export interface MalwareEvidence {
  source: string;
  fileKey?: string;
  projectSource?: string;
  confidence: Report_Evidence_Confidence;
  title: string;
  details: string;
}

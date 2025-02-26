export interface Violation {
  check_type: string;
  filter: {
    name: string;
    value: string;
    check_type: string;
    summary: string;
  };
}

export interface Vulnerability {
  severity: string;
  description: string;
  affected_versions?: string[];
  fixed_versions?: string[];
}

export interface License {
  name: string;
  description: string;
  type?: string;
}

export interface Advice {
  type: string;
  target_package_version?: string;
  target_alternate_package_version?: string;
}

export interface Package {
  ecosystem: string;
  name: string;
  version: string;
}

export interface PackageData {
  package: Package;
  violations?: Violation[];
  vulnerabilities?: Vulnerability[];
  licenses?: License[];
  advices?: Advice[];
}

export interface VetData {
  meta: {
    tool_name: string;
    tool_version: string;
    created_at: string;
  };
  packages: PackageData[];
}

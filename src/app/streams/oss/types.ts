interface Package {
  ecosystem: string;
  name: string;
}

export interface PackageStreamItem {
  package: Package;
  version: string;
  timestamp?: string;
  sequenceNumber?: number;
}

import { Ecosystem } from "@buf/safedep_api.bufbuild_es/safedep/messages/package/v1/ecosystem_pb";

/**
 * Parse the ecosystem name to the corresponding enum value.
 *
 * @param {string} ecosystem - The ecosystem name
 * @returns {Ecosystem} The corresponding enum value
 */
export function parseEcosystem(ecosystem: string): Ecosystem {
  switch (ecosystem.toLowerCase()) {
    case "npm":
      return Ecosystem.NPM;
    case "rubygems":
      return Ecosystem.RUBYGEMS;
    case "rubygem":
      return Ecosystem.RUBYGEMS;
    case "go":
      return Ecosystem.GO;
    case "maven":
      return Ecosystem.MAVEN;
    case "pypi":
      return Ecosystem.PYPI;
    case "packagist":
      return Ecosystem.PACKAGIST;
    default:
      throw new Error(`Unsupported ecosystem: ${ecosystem}`);
  }
}

/**
 * Convert the ecosystem enum to the corresponding ecosystem name.
 *
 * @param {Ecosystem | undefined} ecosystem - The ecosystem enum
 * @returns {string} The corresponding ecosystem name
 */
export function ToEcosystemName(ecosystem: Ecosystem | undefined): string {
  if (!ecosystem) return "unknown";

  switch (ecosystem) {
    case Ecosystem.NPM:
      return "npm";
    case Ecosystem.RUBYGEMS:
      return "rubygems";
    case Ecosystem.GO:
      return "go";
    case Ecosystem.MAVEN:
      return "maven";
    case Ecosystem.PYPI:
      return "pypi";
    case Ecosystem.PACKAGIST:
      return "packagist";
    case Ecosystem.GITHUB_ACTIONS:
      return "github-actions";
    case Ecosystem.GITHUB_REPOSITORY:
      return "github-repository";
    default:
      return "unknown";
  }
}

/**
 * Get the credentials for the RPC call. These are static credentials
 * passed through the environment variables.
 *
 * @returns {Object} The credentials for the RPC call
 */
export function getRpcCallCredentials(): {
  tenant: string;
  token: string;
} {
  return {
    tenant: process.env.SAFEDEP_TENANT_ID!,
    token: process.env.SAFEDEP_API_KEY!,
  };
}

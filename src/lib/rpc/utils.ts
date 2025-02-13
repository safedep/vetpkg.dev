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
    default:
      throw new Error(`Unsupported ecosystem: ${ecosystem}`);
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

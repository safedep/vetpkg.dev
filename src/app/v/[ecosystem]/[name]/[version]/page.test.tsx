import { render } from "@testing-library/react";
import { beforeEach, describe, it, vi } from "vitest";
import { getPackageVersionInfo, queryMalwareAnalysis } from "./actions";
import Page from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({
    ecosystem: "npm",
    name: "test-package",
    version: "1.0.0",
  }),
}));

vi.mock("./actions", () => ({
  getPackageVersionInfo: vi.fn(),
  queryMalwareAnalysis: vi.fn(),
}));

describe("Package Version Info Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPackageVersionInfo as any).mockResolvedValue({
      vulnerabilities: [],
      licenses: { licenses: [{ licenseId: "MIT" }] },
      availableVersions: [
        { version: "1.0.0", defaultVersion: true },
        { version: "0.9.0", defaultVersion: false },
      ],
      projectInsights: [
        {
          scorecard: {
            score: 8.5,
            checks: [
              { name: "Vulnerabilities", score: 9 },
              { name: "Maintained", score: 8 },
              { name: "SAST", score: 7 },
              { name: "Code-Review", score: 8 },
              { name: "Contributors", score: 9 },
              { name: "Signed-Releases", score: 8 },
            ],
          },
          stars: 1000,
          forks: 100,
          issues: { open: 50 },
          pullRequests: { open: 20 },
          project: { url: "https://github.com/test/test-package" },
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (queryMalwareAnalysis as any).mockResolvedValue({
      status: 2, // COMPLETED
      report: {
        inference: {
          isMalware: false,
          summary: "No malicious behavior detected",
          details: "Package appears to be safe",
        },
        fileEvidences: [],
        projectEvidences: [],
      },
    });
  });

  it("should render", () => {
    render(<Page />);
  });
});

"use server";

import { Octokit } from "octokit";

const vetWorkflowTemplate = Buffer.from(`
# https://github.com/safedep/vet-action
name: vet OSS Components

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  # Required for actions/checkout@v4
  contents: read

  # Required for writing pull request comment
  issues: write
  pull-requests: write

jobs:
  vet:
    name: vet
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        id: checkout
        uses: actions/checkout@v4

      - name: Run vet
        id: vet
        uses: safedep/vet-action@v1
        with:
          # Path to the policy file.
          # Remove following line to use the default policy
          policy: .github/vet/policy.yml
          # Enable comments proxy to allow comments on the PR from forked repo
          enable-comments-proxy: true
        env:
          # Required for writing pull request comment
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`);

const vetPolicyTemplate = Buffer.from(`
# https://github.com/safedep/vet-action
# https://github.com/safedep/vet
name: vet Open Source Components
description: General purpose OSS best practices policy for vet
tags:
  - general
  - safedep-managed
filters:
  - name: critical-or-high-vulns
    check_type: CheckTypeVulnerability
    summary: Critical or high risk vulnerabilities were found
    value: |
      vulns.critical.exists(p, true) || vulns.high.exists(p, true)
  - name: risky-oss-licenses
    check_type: CheckTypeLicense
    summary: Risky OSS license was detected
    value: |
      licenses.exists(p, p == "GPL-2.0") ||
      licenses.exists(p, p == "GPL-2.0-only") ||
      licenses.exists(p, p == "GPL-3.0") ||
      licenses.exists(p, p == "GPL-3.0-only") ||
      licenses.exists(p, p == "BSD-3-Clause OR GPL-2.0")
  - name: ossf-unmaintained
    check_type: CheckTypeMaintenance
    summary: Component appears to be unmaintained
    value: |
      scorecard.scores["Maintained"] == 0
`);

// We will use our GitHub bot account credentials to create the PR
// because OAuth2 tokens cannot be used to create a PR from a forked repo.
// https://docs.github.com/en/rest/repos/forks?apiVersion=2022-11-28#create-a-fork

const SAFEDEP_GITHUB_BOT_TOKEN = process.env.SAFEDEP_GITHUB_BOT_TOKEN;

export async function createVetPR({
  owner,
  repo,
  user,
}: {
  owner: string;
  repo: string;
  user: string;
}): Promise<{ success: boolean; message: string; prUrl?: string }> {
  if (!SAFEDEP_GITHUB_BOT_TOKEN) {
    throw new Error("SAFEDEP_GITHUB_BOT_TOKEN is not set");
  }

  const client = new Octokit({ auth: SAFEDEP_GITHUB_BOT_TOKEN });

  // Fork the repository
  const fork = await client.rest.repos.createFork({
    owner: owner,
    repo: repo,
    name: `${repo}-vet-integration-${Date.now()}`,
    default_branch_only: true,
  });

  // Wait for the fork to be created
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const defaultBranch = fork.data.default_branch;
  const prBranchName = `vet-integration`;

  // Get the default branch head commit
  const defaultBranchHeadCommit = await client.rest.git.getRef({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    ref: `heads/${defaultBranch}`,
  });

  // Create a new branch
  console.log(`Creating branch`);
  const branch = await client.rest.git.createRef({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    ref: `refs/heads/${prBranchName}`,
    sha: defaultBranchHeadCommit.data.object.sha,
  });

  // Add vet GitHub Action workflow file
  console.log(`Adding vet GitHub Action workflow file`);
  await client.rest.repos.createOrUpdateFileContents({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    path: ".github/workflows/vet-ci.yml",
    message: "Add vet GitHub Action workflow",
    content: vetWorkflowTemplate.toString("base64"),
    branch: branch.data.ref,
  });

  // Add vet policy file
  console.log(`Adding vet policy file`);
  await client.rest.repos.createOrUpdateFileContents({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    path: ".github/vet/policy.yml",
    message: "Add vet policy",
    content: vetPolicyTemplate.toString("base64"),
    branch: branch.data.ref,
  });

  // Create pull request
  const pr = await client.rest.pulls.create({
    owner: owner,
    repo: repo,
    title: "Add vet GitHub Action workflow",
    body: `This PR adds a GitHub Action workflow to [vet](https://github.com/safedep/vet) the repository.
    This PR is raised on behalf of \`${user}\` using \`https://vetpkg.dev/gha\`.    
    `,
    head: prBranchName,
    head_repo: fork.data.full_name,
    base: defaultBranch,
  });

  return {
    success: true,
    message: "Pull request created successfully",
    prUrl: pr.data.html_url,
  };
}

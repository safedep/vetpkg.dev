"use server";

import { randomUUID } from "node:crypto";
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
# Learn more about policies: https://docs.safedep.io/advanced/filtering
name: vet Open Source Components
description: General purpose OSS best practices policy for vet
tags:
  - general
  - community
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

const vetWorkflowPath = ".github/workflows/vet-ci.yml";
const vetPolicyPath = ".github/vet/policy.yml";

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
  const botUser = await client.rest.users.getAuthenticated();

  console.log(`Bot user: ${botUser.data.login}`);

  // Check if the repository already has a vet-ci.yml file
  try {
    await client.rest.repos.getContent({
      owner: owner,
      repo: repo,
      path: vetWorkflowPath,
    });

    console.log(`${vetWorkflowPath} already exists`);
    return {
      success: true,
      message:
        "Looks like the repository already has vet integration using `.github/workflows/vet-ci.yml`",
    };
  } catch (error) {
    console.log(`${vetWorkflowPath} does not exist, error: ${error}`);
  }

  // Fork the repository
  let fork;
  let forkReady = false;
  try {
    console.log(`Creating fork ${owner}/${repo}-vet-integration`);
    fork = await client.rest.repos.createFork({
      owner: owner,
      repo: repo,
      name: `${owner}-${repo}-vet-integration`,
      default_branch_only: true,
    });
  } catch (error) {
    console.log(`Error creating fork: ${error}`);
    console.log(`Attempting to get existing fork`);

    // We may already have a forked repo, so we don't need to create a new one
    // and we can use the existing one.
    fork = await client.rest.repos.get({
      owner: botUser.data.login,
      repo: `${owner}-${repo}-vet-integration`,
    });

    forkReady = true;
  }

  // Wait for the fork to be created
  if (!forkReady) {
    const maxRetries = 10;
    const retryDelay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < maxRetries; i++) {
      try {
        fork = await client.rest.repos.get({
          owner: botUser.data.login,
          repo: `${owner}-${repo}-vet-integration`,
        });

        forkReady = true;
        break;
      } catch (error) {
        console.log(`Failed to get repository info: ${error}`);
        console.log(`Fork not ready yet, retrying... (${i + 1}/${maxRetries})`);
        console.log(`Waiting for 2 seconds before retrying...`);

        await retryDelay(2000);
      }
    }

    if (!forkReady) {
      throw new Error("Fork was not created within the expected time frame.");
    }
  }

  const defaultBranch = fork.data.default_branch;
  const prBranchName = `vet-integration-${randomUUID()}`;

  // Get the default branch head commit
  console.log(`Getting default branch head commit for ${fork.data.full_name}`);
  const defaultBranchHeadCommit = await client.rest.git.getRef({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    ref: `heads/${defaultBranch}`,
  });

  console.log(
    `Default branch head commit: ${defaultBranchHeadCommit.data.object.sha}`,
  );

  // Create a new branch
  console.log(`Creating branch ${prBranchName} for ${fork.data.full_name}`);
  const branch = await client.rest.git.createRef({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    ref: `refs/heads/${prBranchName}`,
    sha: defaultBranchHeadCommit.data.object.sha,
  });

  // Add vet GitHub Action workflow file
  console.log(`Adding vet GitHub Action workflow file to ${prBranchName}`);
  await client.rest.repos.createOrUpdateFileContents({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    path: vetWorkflowPath,
    message: "Add vet GitHub Action workflow",
    content: vetWorkflowTemplate.toString("base64"),
    branch: branch.data.ref,
  });

  // Add vet policy file
  console.log(`Adding vet policy file to ${prBranchName}`);
  await client.rest.repos.createOrUpdateFileContents({
    owner: fork.data.owner.login,
    repo: fork.data.name,
    path: vetPolicyPath,
    message: "Add vet policy",
    content: vetPolicyTemplate.toString("base64"),
    branch: branch.data.ref,
  });

  // Create pull request
  console.log(`Creating pull request from ${prBranchName} to ${defaultBranch}`);
  const pr = await client.rest.pulls.create({
    owner: owner,
    repo: repo,
    title: "Add vet GitHub Action workflow",
    body: `
# 🚀 Protect against Malicious Open Source Components

> Integrates [vet](https://github.com/safedep/vet) to automate vetting of OSS packages for security vulnerabilities, malicious code and other risks.
> This PR is raised on behalf of [${user}](https://github.com/${user}) using [https://vetpkg.dev/gha](https://vetpkg.dev/gha).
    
## Why?

This PR integrates [vet](https://github.com/safedep/vet) to automate vetting of open source packages for security vulnerabilities, malware and other risks. 
The policy is configured to be minimal, checking only for common OSS risks. The policy can be fine tuned / improved based on the project requirements.

## Example

<img width="588" alt="example" src="https://github.com/user-attachments/assets/06f83184-2c27-45c5-8893-9fb79cee9cfa">

## Learn more

- [vet](https://github.com/safedep/vet)
- [vet-action](https://github.com/safedep/vet-action)
- [Malicious OSS Package Scanning](https://docs.safedep.io/cloud/malware-analysis)
    `,
    head: prBranchName,
    head_repo: fork.data.full_name,
    base: defaultBranch,
    maintainer_can_modify: true,
  });

  return {
    success: true,
    message: "Pull request created successfully",
    prUrl: pr.data.html_url,
  };
}

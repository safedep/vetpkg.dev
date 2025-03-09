import { Octokit } from "octokit";

/**
 * Raises a pull request to integrate vet into the user's repository
 * @param repoUrl GitHub repository URL
 * @param userToken GitHub OAuth token of the user
 * @returns Promise with the result of the PR creation
 */
export async function raiseVetIntegrationPullRequest(
  repoUrl: string,
  userToken: string,
): Promise<{ success: boolean; message: string; prUrl?: string }> {
  // This is a placeholder function as specified in the requirements
  // Actual implementation will use the GitHub API to create a PR

  try {
    const { owner, repo } = await parseRepoUrl(repoUrl);

    console.log(`Creating PR for ${owner}/${repo} using user token`);

    // TODO: Implement actual PR creation logic using GitHub API
    // 1. Check if the user is a contributor to the repository
    // 2. Fork the repository if needed
    // 3. Create a new branch
    // 4. Add vet GitHub Action workflow file
    // 5. Commit changes
    // 6. Create pull request

    // Simulate successful PR creation
    return {
      success: true,
      message: "Pull request created successfully",
      prUrl: `https://github.com/${owner}/${repo}/pull/1`,
    };
  } catch (error) {
    console.error("Error creating pull request:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Checks if a user is a contributor to a repository
 * @param repoUrl GitHub repository URL
 * @param userToken GitHub OAuth token of the user
 * @returns Promise with boolean indicating if user is a contributor
 */
export async function isUserContributor(
  repoUrl: string,
  userToken: string,
): Promise<boolean> {
  const client = new Octokit({ auth: userToken });
  const { owner, repo } = await parseRepoUrl(repoUrl);

  console.log(`Getting user info using token`);
  const user = await client.rest.users.getAuthenticated();
  console.log(`User: ${user.data.login}`);

  console.log(`Checking if user is contributor to ${repoUrl}`);
  const response = await client.rest.repos.listContributors({
    owner: owner,
    repo: repo,
    per_page: 100,
  });

  const isContributor = response.data.some(
    (contributor) => contributor.login === user.data.login,
  );

  console.log(`Is contributor: ${isContributor}`);
  return isContributor;
}

async function parseRepoUrl(
  repoUrl: string,
): Promise<{ owner: string; repo: string }> {
  const urlParts = repoUrl.replace(/^https?:\/\/github\.com\//, "").split("/");
  return { owner: urlParts[0], repo: urlParts[1] };
}

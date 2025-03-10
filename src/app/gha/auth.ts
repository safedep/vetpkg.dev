// auth.ts - GitHub OAuth Authentication

/**
 * Configuration for GitHub OAuth
 */
export const githubOAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
  redirectUri:
    typeof window !== "undefined"
      ? `${window.location.origin}/gha/callback`
      : "",
  scope: "repo:status", // Minimum scope needed to verify contributor status and create PRs
};

/**
 * Generates the GitHub OAuth authorization URL
 * @returns The URL to redirect the user to for GitHub OAuth
 */
export function getGithubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: githubOAuthConfig.clientId,
    redirect_uri: githubOAuthConfig.redirectUri,
    scope: githubOAuthConfig.scope,
    state: state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Initiates the GitHub OAuth flow
 * @param repoUrl The repository URL to store in the state
 */
export function initiateGithubAuth(repoUrl: string): void {
  // Generate a random state value for security
  const state = JSON.stringify({
    repoUrl,
    nonce: Math.random().toString(36).substring(2),
    timestamp: Date.now(),
  });

  // Encode state and save it in sessionStorage for verification when the user returns
  const encodedState = btoa(state);
  sessionStorage.setItem("github_oauth_state", encodedState);

  // Redirect to GitHub authorization page
  window.location.href = getGithubAuthUrl(encodedState);
}

/**
 * Validates the OAuth state parameter
 * @param state The state parameter returned from GitHub
 * @returns The decoded state object or null if invalid
 */
export function validateOAuthState(
  state: string,
): { repoUrl: string; nonce: string; timestamp: number } | null {
  try {
    const savedState = sessionStorage.getItem("github_oauth_state");
    if (!savedState || savedState !== state) {
      console.error("OAuth state mismatch");
      return null;
    }

    // Decode and parse the state
    const decodedState = JSON.parse(atob(state));

    // Verify the timestamp isn't too old (e.g., 1 hour)
    const MAX_AGE = 60 * 60 * 1000; // 1 hour in milliseconds
    if (Date.now() - decodedState.timestamp > MAX_AGE) {
      console.error("OAuth state expired");
      return null;
    }

    return decodedState;
  } catch (error) {
    console.error("Error validating OAuth state:", error);
    return null;
  }
}

/**
 * Exchanges the authorization code for an access token
 * This uses a server-side API route to protect the client secret
 * @param code The authorization code from GitHub
 * @returns Promise with the access token
 */
export async function exchangeCodeForToken(code: string): Promise<string> {
  try {
    // Call our server-side API route to exchange the code for a token
    const response = await fetch("/api/github/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to obtain access token");
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    throw new Error("Failed to obtain access token");
  }
}

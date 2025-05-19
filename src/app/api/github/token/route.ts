import { NextRequest, NextResponse } from "next/server";

// GitHub OAuth API endpoints
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

/**
 * POST /api/github/token
 * Exchanges an authorization code for a GitHub access token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 },
      );
    }

    // Get client ID and secret from environment variables
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("GitHub OAuth credentials are not configured");
      return NextResponse.json(
        { error: "OAuth configuration error" },
        { status: 500 },
      );
    }

    console.log(`Exchanging code for token with client ID: ${clientId}`);

    // Exchange the code for an access token
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error(
        "Failed to exchange code for token",
        await tokenResponse.text(),
      );
      return NextResponse.json(
        { error: "Failed to obtain access token" },
        { status: 500 },
      );
    }

    // Parse the token response
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error },
        { status: 400 },
      );
    }

    // Return the access token to the client
    return NextResponse.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

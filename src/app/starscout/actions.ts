"use server";

import { Octokit } from "octokit";
import { parseRepoUrl } from "./auth";
import {
  Repository,
  StarEvent,
  StarScoutResults,
  SuspectedStar,
  MonthlyStarData,
} from "./types";

/**
 * Get repository information
 */
async function getRepositoryInfo(
  owner: string,
  repo: string,
  octokit: Octokit,
): Promise<Repository> {
  const { data } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return {
    owner: data.owner.login,
    name: data.name,
    url: data.html_url,
    stars: data.stargazers_count,
  };
}

/**
 * Get all stargazers for a repository with timestamps
 */
async function getStargazersWithTimestamps(
  owner: string,
  repo: string,
  octokit: Octokit,
): Promise<StarEvent[]> {
  const starEvents: StarEvent[] = [];
  let page = 1;
  let hasMorePages = true;

  // GitHub API pagination for stargazers with timestamps
  while (hasMorePages) {
    const response = await octokit.rest.activity.listStargazersForRepo({
      owner,
      repo,
      per_page: 100,
      page,
      headers: {
        accept: "application/vnd.github.star+json",
      },
    });

    if (response.data.length === 0) {
      hasMorePages = false;
    } else {
      // Add stars to the collection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.data.forEach((item: any) => {
        if (item.user && item.starred_at) {
          starEvents.push({
            user: {
              id: item.user.id,
              login: item.user.login,
              avatar_url: item.user.avatar_url,
              html_url: item.user.html_url,
            },
            starred_at: item.starred_at,
          });
        }
      });
      page++;
    }
  }

  return starEvents;
}

/**
 * Check if a user has low activity (Stage A of StarScout algorithm)
 */
async function checkLowActivitySignature(
  user: { login: string },
  octokit: Octokit,
): Promise<boolean> {
  try {
    // Get user's public events
    const { data: events } =
      await octokit.rest.activity.listPublicEventsForUser({
        username: user.login,
        per_page: 10, // Just need a small sample to determine activity level
      });

    // Count watch events (stars)
    const watchEvents = events.filter((event) => event.type === "WatchEvent");

    // User has low activity if they have only 1 watch event and <= 2 total events
    // This matches the paper's definition: "one WatchEvent (+ ≤ 1 other same-day event)"
    return watchEvents.length === 1 && events.length <= 2;
  } catch (error) {
    console.error(`Error checking activity for user ${user.login}:`, error);
    return false;
  }
}

/**
 * Group stars by month for time analysis
 */
function groupStarsByMonth(stars: StarEvent[]): Map<string, StarEvent[]> {
  const starsByMonth = new Map<string, StarEvent[]>();

  for (const star of stars) {
    const date = new Date(star.starred_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!starsByMonth.has(monthKey)) {
      starsByMonth.set(monthKey, []);
    }

    starsByMonth.get(monthKey)!.push(star);
  }

  return starsByMonth;
}

/**
 * Check for lock-step behavior (Stage B of StarScout algorithm)
 * This is a simplified approximation of the CopyCatch algorithm described in the paper
 * that looks for coordinated star bursts within a time window
 */
function checkLockStepSignature(stars: StarEvent[]): SuspectedStar[] {
  const suspectedStars: SuspectedStar[] = [];
  const starsByMonth = groupStarsByMonth(stars);

  // Time window for lock-step detection (15 days as mentioned in paper)
  const timeWindowMs = 15 * 24 * 60 * 60 * 1000;

  // Look for months with unusual star burst patterns
  for (const monthStars of starsByMonth.values()) {
    // Skip months with few stars (minimum 50 as per paper)
    if (monthStars.length < 50) continue;

    // Sort stars by timestamp
    const sortedStars = [...monthStars].sort(
      (a, b) =>
        new Date(a.starred_at).getTime() - new Date(b.starred_at).getTime(),
    );

    // Use a sliding window to detect bursts within the 15-day window
    let windowStart = 0;

    for (let windowEnd = 0; windowEnd < sortedStars.length; windowEnd++) {
      const endTime = new Date(sortedStars[windowEnd].starred_at).getTime();
      const startTime = new Date(sortedStars[windowStart].starred_at).getTime();

      // If window exceeds 15 days, advance window start
      while (endTime - startTime > timeWindowMs && windowStart < windowEnd) {
        windowStart++;
        const newStartTime = new Date(
          sortedStars[windowStart].starred_at,
        ).getTime();
        if (endTime - newStartTime <= timeWindowMs) break;
      }

      // Check if we have at least 50 stars in this time window (n=50 parameter from paper)
      const windowSize = windowEnd - windowStart + 1;
      if (windowSize >= 50) {
        // Mark all stars in this window as suspicious
        for (let i = windowStart; i <= windowEnd; i++) {
          suspectedStars.push({
            user: sortedStars[i].user,
            starred_at: sortedStars[i].starred_at,
            reason: "lock_step",
          });
        }
      }
    }
  }

  return suspectedStars;
}

/**
 * Apply post-processing risk filter (Stage C of StarScout algorithm)
 */
function applyRiskFilter(
  repo: Repository,
  stars: StarEvent[],
  suspectedStars: SuspectedStar[],
): StarScoutResults {
  const starsByMonth = groupStarsByMonth(stars);
  const suspectedStarsByMonth = groupStarsByMonth(suspectedStars);

  // Calculate monthly star data for visualization
  const monthlyData: MonthlyStarData[] = [];
  let isRisky = false;

  for (const [month, monthStars] of starsByMonth.entries()) {
    const totalStars = monthStars.length;
    const suspectedMonthStars = suspectedStarsByMonth.get(month) || [];
    const suspectedCount = suspectedMonthStars.length;

    monthlyData.push({
      month,
      totalStars,
      suspectedFakeStars: suspectedCount,
    });

    // Apply risk criteria from paper:
    // (i) it has a month where ≥ 50 fake stars form > 50% of that month's total
    if (suspectedCount >= 50 && suspectedCount / totalStars > 0.5) {
      isRisky = true;
    }
  }

  // Calculate overall metrics
  const totalStars = stars.length;
  const totalSuspectedStars = suspectedStars.length;
  const percentageFake =
    totalStars > 0 ? (totalSuspectedStars / totalStars) * 100 : 0;

  // Additional risk check from paper:
  // (ii) overall ≥ 10% of its stars are fake
  isRisky = isRisky && percentageFake >= 10;

  // Risk score from 0-100
  const riskScore = Math.min(100, Math.round(percentageFake * 1.5));

  return {
    repository: repo,
    totalStars,
    suspectedFakeStars: suspectedStars,
    percentageFake,
    riskScore,
    hasLowActivityStars: suspectedStars.some(
      (star) => star.reason === "low_activity" || star.reason === "both",
    ),
    hasLockStepStars: suspectedStars.some(
      (star) => star.reason === "lock_step" || star.reason === "both",
    ),
    isRisky,
    analysisDate: new Date().toISOString(),
  };
}

/**
 * Main function to analyze a repository for fake stars
 */
export async function analyzeRepoForFakeStars(
  repoUrl: string,
  githubToken: string,
): Promise<StarScoutResults> {
  const octokit = new Octokit({ auth: githubToken });
  const { owner, repo } = parseRepoUrl(repoUrl);

  // Step 1: Get repository information
  const repository = await getRepositoryInfo(owner, repo, octokit);

  // Step 2: Get all stargazers with timestamps
  const stars = await getStargazersWithTimestamps(owner, repo, octokit);

  // Step 3A: Check for low-activity signature
  const lowActivityPromises = stars.map(async (star) => {
    const isLowActivity = await checkLowActivitySignature(star.user, octokit);
    if (isLowActivity) {
      return {
        user: star.user,
        starred_at: star.starred_at,
        reason: "low_activity" as const,
      };
    }
    return null;
  });

  const lowActivityResults = await Promise.all(lowActivityPromises);
  const lowActivitySuspects = lowActivityResults.filter(
    Boolean,
  ) as SuspectedStar[];

  // Step 3B: Check for lock-step signature
  const lockStepSuspects = checkLockStepSignature(stars);

  // Step 4: Merge suspicions
  const allSuspects = [...lowActivitySuspects];

  // Add lock-step suspects, avoiding duplicates
  for (const suspect of lockStepSuspects) {
    const existingIndex = allSuspects.findIndex(
      (s) => s.user.id === suspect.user.id,
    );
    if (existingIndex >= 0) {
      // Update reason for existing suspect
      allSuspects[existingIndex].reason = "both";
    } else {
      allSuspects.push(suspect);
    }
  }

  // Step 5: Apply risk filter and post-processing
  return applyRiskFilter(repository, stars, allSuspects);
}

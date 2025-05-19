// StarScout types

/**
 * Repository information
 */
export interface Repository {
  owner: string;
  name: string;
  url: string;
  stars: number;
}

/**
 * GitHub user information
 */
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

/**
 * Star event data
 */
export interface StarEvent {
  user: GitHubUser;
  starred_at: string;
}

/**
 * Suspected fake star with reason
 */
export interface SuspectedStar {
  user: GitHubUser;
  starred_at: string;
  reason: "low_activity" | "lock_step" | "both";
}

/**
 * Results of the StarScout analysis
 */
export interface StarScoutResults {
  repository: Repository;
  totalStars: number;
  suspectedFakeStars: SuspectedStar[];
  percentageFake: number;
  riskScore: number;
  hasLowActivityStars: boolean;
  hasLockStepStars: boolean;
  isRisky: boolean;
  analysisDate: string;
}

/**
 * Monthly star count data for charts
 */
export interface MonthlyStarData {
  month: string;
  totalStars: number;
  suspectedFakeStars: number;
}

/**
 * API response format
 */
export interface StarScoutResponse {
  success: boolean;
  message: string;
  results?: StarScoutResults;
}

/**
 * Discord API Helper Functions
 * Provides extended functionality for Discord token validation
 */

import { validateToken, checkTokenValidity, extractTokensWithMetadata } from './tokenChecker';
import { parseTokenLine } from './tokenParser';

export interface DiscordUserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  verified?: boolean;
  discriminator?: string;
  public_flags?: number;
  banner?: string;
  banner_color?: string;
  accent_color?: number;
  locale?: string;
  mfa_enabled?: boolean;
  premium_type?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner?: boolean;
  permissions?: string;
  features?: string[];
}

export interface DiscordConnection {
  id: string;
  name: string;
  type: string;
  verified?: boolean;
  visibility?: number;
  friend_sync?: boolean;
  show_activity?: boolean;
  revoked?: boolean;
}

/**
 * Get detailed user profile information
 */
export async function getDiscordUserProfile(token: string): Promise<DiscordUserProfile | null> {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

/**
 * Get user's guilds (servers)
 */
export async function getDiscordUserGuilds(token: string): Promise<DiscordGuild[] | null> {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

/**
 * Get user's connections (linked accounts)
 */
export async function getDiscordUserConnections(token: string): Promise<DiscordConnection[] | null> {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me/connections', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

/**
 * Comprehensive token check with all available data
 */
export interface CompleteTokenCheckResult {
  token: string;
  originalInput?: string;
  email?: string;
  password?: string;
  formatValid: boolean;
  userId: string | null;
  isAlive: boolean;
  profile?: DiscordUserProfile | null;
  guilds?: DiscordGuild[] | null;
  connections?: DiscordConnection[] | null;
  error?: string;
}

/**
 * Perform comprehensive check on a Discord token with all data
 */
export async function checkTokenComprehensive(token: string, originalInput?: string): Promise<CompleteTokenCheckResult> {
  // Parse original input to extract email/password if provided
  let email: string | undefined;
  let password: string | undefined;

  if (originalInput) {
    const parsed = parseTokenLine(originalInput);
    if (parsed) {
      email = parsed.email;
      password = parsed.password;
    }
  }

  // First validate format
  const validation = validateToken(token);

  if (!validation.isValid) {
    return {
      token,
      originalInput,
      email,
      password,
      formatValid: false,
      userId: null,
      isAlive: false,
      error: validation.error,
    };
  }

  // Check if token is alive
  const isAlive = await checkTokenValidity(token);

  let profile = null;
  let guilds = null;
  let connections = null;

  if (isAlive) {
    // Fetch all data in parallel
    const [profileData, guildsData, connectionsData] = await Promise.all([
      getDiscordUserProfile(token),
      getDiscordUserGuilds(token),
      getDiscordUserConnections(token),
    ]);

    profile = profileData;
    guilds = guildsData;
    connections = connectionsData;
  }

  return {
    token,
    originalInput,
    email,
    password,
    formatValid: true,
    userId: validation.userId,
    isAlive,
    profile: profile || undefined,
    guilds: guilds || undefined,
    connections: connections || undefined,
  };
}

/**
 * Check multiple tokens comprehensively with metadata
 */
export async function checkMultipleTokensComprehensive(
  inputs: Array<{ token: string; originalInput?: string }>
): Promise<CompleteTokenCheckResult[]> {
  const results = await Promise.all(
    inputs.map(({ token, originalInput }) =>
      checkTokenComprehensive(token, originalInput)
    )
  );
  return results;
}

/**
 * Parse and check tokens from raw input comprehensively
 */
export async function parseAndCheckTokensComprehensive(
  input: string
): Promise<CompleteTokenCheckResult[]> {
  const extracted = extractTokensWithMetadata(input);
  const results = await Promise.all(
    extracted.map(({ token, originalInput }) =>
      checkTokenComprehensive(token, originalInput)
    )
  );
  return results;
}

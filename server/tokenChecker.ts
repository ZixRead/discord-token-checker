/**
 * Discord Token Checker Module
 * Provides utilities for parsing, validating, and checking Discord tokens
 */

import { parseTokenLine } from './tokenParser';

export interface ExtractedTokenData {
  token: string;
  email?: string;
  password?: string;
  originalInput: string;
}

/**
 * Extracts Discord tokens from raw text input with metadata
 * Supports formats like: email:password:token or just token
 */
export function extractTokensWithMetadata(input: string): ExtractedTokenData[] {
  const results: ExtractedTokenData[] = [];
  
  const lines = input.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const parsed = parseTokenLine(trimmed);
    if (parsed && isValidTokenFormat(parsed.token)) {
      results.push({
        token: parsed.token,
        email: parsed.email,
        password: parsed.password,
        originalInput: trimmed,
      });
    }
  }
  
  return results;
}

/**
 * Extracts Discord tokens from raw text input
 * Supports formats like: email:password:token or just token
 * Token format: user_id.timestamp.signature
 */
export function extractTokens(input: string): string[] {
  const results = extractTokensWithMetadata(input);
  return results.map(r => r.token);
}

/**
 * Validates if a string matches Discord token format
 * Discord tokens follow pattern: user_id.timestamp.signature
 * Each part is base64url encoded
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // Discord tokens contain exactly 2 dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Each part should be non-empty and contain valid base64url characters
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  
  return parts.every(part => 
    part.length > 0 && base64urlRegex.test(part)
  );
}

/**
 * Decodes the user ID from a Discord token
 * The first part of the token is base64url encoded user ID
 */
export function decodeTokenUserId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const userIdPart = parts[0];
    // Add padding if needed for base64 decoding
    const padded = userIdPart + '='.repeat((4 - userIdPart.length % 4) % 4);
    
    // Decode from base64url
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    
    // Validate it's a number (Discord user IDs are numeric)
    if (/^\d+$/.test(decoded)) {
      return decoded;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  token: string;
  isValid: boolean;
  userId: string | null;
  format: 'valid' | 'invalid';
  error?: string;
}

/**
 * Validates a Discord token format and extracts information
 */
export function validateToken(token: string): TokenValidationResult {
  if (!isValidTokenFormat(token)) {
    return {
      token,
      isValid: false,
      userId: null,
      format: 'invalid',
      error: 'Token does not match Discord token format (should be: user_id.timestamp.signature)',
    };
  }
  
  const userId = decodeTokenUserId(token);
  
  return {
    token,
    isValid: true,
    userId,
    format: 'valid',
  };
}

/**
 * Check token validity by calling Discord API
 * Returns true if token is valid, false if invalid or error occurs
 */
export async function checkTokenValidity(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });
    
    // 200 = valid token, 401 = invalid token
    return response.status === 200;
  } catch (error) {
    // Network error or other issues
    return false;
  }
}

/**
 * Get user information from a valid Discord token
 */
export async function getUserInfo(token: string): Promise<{
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
} | null> {
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
 * Comprehensive token check result
 */
export interface TokenCheckResult {
  token: string;
  formatValid: boolean;
  userId: string | null;
  isAlive: boolean;
  userInfo?: {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    verified?: boolean;
  } | null;
  error?: string;
}

/**
 * Perform comprehensive check on a Discord token
 */
export async function checkToken(token: string): Promise<TokenCheckResult> {
  // First validate format
  const validation = validateToken(token);
  
  if (!validation.isValid) {
    return {
      token,
      formatValid: false,
      userId: null,
      isAlive: false,
      error: validation.error,
    };
  }
  
  // Check if token is alive
  const isAlive = await checkTokenValidity(token);
  
  let userInfo = null;
  if (isAlive) {
    userInfo = await getUserInfo(token);
  }
  
  return {
    token,
    formatValid: true,
    userId: validation.userId,
    isAlive,
    userInfo: userInfo || undefined,
  };
}

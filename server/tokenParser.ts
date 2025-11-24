/**
 * Token Parser Utilities
 * Handles parsing of email:password:token format
 */

export interface ParsedTokenInput {
  email?: string;
  password?: string;
  token: string;
}

/**
 * Parse email:password:token format from a single line
 */
export function parseTokenLine(line: string): ParsedTokenInput | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Check if line contains colon-separated format
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length >= 3) {
      // Last part is token, second-to-last is password, first is email
      const token = parts[parts.length - 1]?.trim();
      const password = parts[parts.length - 2]?.trim();
      const email = parts.slice(0, -2).join(':').trim(); // Handle emails with colons

      return {
        email: email || undefined,
        password: password || undefined,
        token: token || '',
      };
    } else if (parts.length === 2) {
      // Assume format is password:token
      return {
        password: parts[0]?.trim(),
        token: parts[1]?.trim() || '',
      };
    }
  }

  // Just a token
  return {
    token: trimmed,
  };
}

/**
 * Format token data for copying
 */
export function formatTokenForCopy(data: {
  email?: string;
  password?: string;
  token: string;
}, format: 'full' | 'token'): string {
  if (format === 'full' && (data.email || data.password)) {
    const parts = [];
    if (data.email) parts.push(data.email);
    if (data.password) parts.push(data.password);
    parts.push(data.token);
    return parts.join(':');
  }
  return data.token;
}

/**
 * Export results to CSV format
 */
export function exportToCSV(results: Array<{
  email?: string;
  password?: string;
  token: string;
  isAlive: boolean;
  username?: string;
  error?: string;
}>, type: 'valid' | 'invalid' | 'all'): string {
  const filtered = results.filter(r => {
    if (type === 'valid') return r.isAlive;
    if (type === 'invalid') return !r.isAlive;
    return true;
  });

  const headers = ['Email', 'Password', 'Token', 'Username', 'Status', 'Error'];
  const rows = filtered.map(r => [
    r.email || '',
    r.password || '',
    r.token,
    r.username || '',
    r.isAlive ? 'Valid' : 'Invalid',
    r.error || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

/**
 * Export results to JSON format
 */
export function exportToJSON(results: Array<{
  email?: string;
  password?: string;
  token: string;
  isAlive: boolean;
  username?: string;
  error?: string;
}>, type: 'valid' | 'invalid' | 'all'): string {
  const filtered = results.filter(r => {
    if (type === 'valid') return r.isAlive;
    if (type === 'invalid') return !r.isAlive;
    return true;
  });

  return JSON.stringify(filtered, null, 2);
}

/**
 * Export tokens only (one per line)
 */
export function exportTokensOnly(results: Array<{
  token: string;
  isAlive: boolean;
}>, type: 'valid' | 'invalid' | 'all'): string {
  const filtered = results.filter(r => {
    if (type === 'valid') return r.isAlive;
    if (type === 'invalid') return !r.isAlive;
    return true;
  });

  return filtered.map(r => r.token).join('\n');
}

/**
 * Export full format (email:password:token)
 */
export function exportFullFormat(results: Array<{
  email?: string;
  password?: string;
  token: string;
  isAlive: boolean;
}>, type: 'valid' | 'invalid' | 'all'): string {
  const filtered = results.filter(r => {
    if (type === 'valid') return r.isAlive;
    if (type === 'invalid') return !r.isAlive;
    return true;
  });

  return filtered.map(r => {
    const parts = [];
    if (r.email) parts.push(r.email);
    if (r.password) parts.push(r.password);
    parts.push(r.token);
    return parts.join(':');
  }).join('\n');
}

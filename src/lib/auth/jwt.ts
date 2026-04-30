/**
 * JWT Token Management
 * Handles token creation, verification, and refresh logic
 *
 * Token Strategy:
 * - Short-lived access tokens: 15 minutes
 * - Long-lived refresh tokens: 7 days
 * - Refresh before expiry: 5 minutes before expiration
 */

import { JWTPayload } from '../types';

// ========== TOKEN CONFIGURATION ==========
const ACCESS_TOKEN_LIFETIME = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60; // 7 days in seconds
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

// ========== INTERFACES ==========

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export interface DecodedToken {
  header: {
    alg: string;
    typ: string;
  };
  payload: JWTPayload;
  signature: string;
}

// ========== TOKEN GENERATION ==========

/**
 * Create JWT access token
 *
 * @param payload - JWT payload with user info
 * @param secret - Secret key for signing
 * @param expiresIn - Expiration time in seconds (default: 15 minutes)
 * @returns Signed JWT token
 */
export function signAccessToken(
  payload: JWTPayload,
  secret: string,
  expiresIn: number = ACCESS_TOKEN_LIFETIME
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  try {
    return createToken(header, tokenPayload, secret);
  } catch (err) {
    throw new Error(`Failed to sign access token: ${err}`);
  }
}

/**
 * Create JWT refresh token
 *
 * @param userId - User ID
 * @param secret - Secret key for signing
 * @param expiresIn - Expiration time in seconds (default: 7 days)
 * @returns Signed refresh token
 */
export function signRefreshToken(
  userId: string,
  secret: string,
  expiresIn: number = REFRESH_TOKEN_LIFETIME
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    type: 'refresh',
    iat: now,
    exp: now + expiresIn,
  };

  try {
    return createToken(header, payload, secret);
  } catch (err) {
    throw new Error(`Failed to sign refresh token: ${err}`);
  }
}

/**
 * Create both access and refresh tokens for a user
 *
 * @param payload - JWT payload
 * @param secret - Secret key
 * @returns Token set with both access and refresh tokens
 */
export function createTokenSet(
  payload: JWTPayload,
  secret: string
): TokenSet {
  const now = Date.now();

  const accessToken = signAccessToken(payload, secret, ACCESS_TOKEN_LIFETIME);
  const refreshToken = signRefreshToken(payload.sub, secret, REFRESH_TOKEN_LIFETIME);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: now + ACCESS_TOKEN_LIFETIME * 1000,
    refreshTokenExpiresAt: now + REFRESH_TOKEN_LIFETIME * 1000,
  };
}

// ========== TOKEN VERIFICATION ==========

/**
 * Verify JWT token and return payload
 *
 * @param token - JWT token to verify
 * @param secret - Secret key for verification
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string, secret: string): JWTPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerEnc, payloadEnc, signatureEnc] = parts;

    // Decode and parse payload
    const payload = JSON.parse(base64UrlDecode(payloadEnc));

    // Verify signature
    const expectedSignature = computeSignature(
      `${headerEnc}.${payloadEnc}`,
      secret
    );

    if (expectedSignature !== signatureEnc) {
      throw new Error('Invalid token signature');
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token has expired');
    }

    return payload as JWTPayload;
  } catch (err) {
    throw new Error(`Token verification failed: ${err}`);
  }
}

/**
 * Decode token WITHOUT verification (for debugging)
 * NEVER use for security-critical operations
 *
 * @param token - JWT token
 * @returns Decoded token parts
 */
export function decodeTokenUnsafe(token: string): DecodedToken {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch (err) {
    throw new Error(`Token decode failed: ${err}`);
  }
}

/**
 * Check if token is expired
 *
 * @param token - JWT token
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeTokenUnsafe(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.payload.exp ? decoded.payload.exp < now : false;
  } catch {
    return true; // Treat invalid tokens as expired
  }
}

/**
 * Check if token should be refreshed
 * (within REFRESH_THRESHOLD of expiration)
 *
 * @param token - JWT token
 * @returns true if should refresh, false otherwise
 */
export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = decodeTokenUnsafe(token);
    const now = Date.now();
    const expiresAt = decoded.payload.exp ? decoded.payload.exp * 1000 : 0;
    const timeRemaining = expiresAt - now;

    return timeRemaining < REFRESH_THRESHOLD && timeRemaining > 0;
  } catch {
    return true; // Treat invalid tokens as needing refresh
  }
}

/**
 * Get token expiration time as Date
 *
 * @param token - JWT token
 * @returns Expiration date or null if invalid
 */
export function getTokenExpirationDate(token: string): Date | null {
  try {
    const decoded = decodeTokenUnsafe(token);
    if (!decoded.payload.exp) return null;
    return new Date(decoded.payload.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Get time remaining until token expires (in milliseconds)
 *
 * @param token - JWT token
 * @returns Milliseconds until expiration, or 0 if expired
 */
export function getTokenTimeRemaining(token: string): number {
  try {
    const decoded = decodeTokenUnsafe(token);
    if (!decoded.payload.exp) return 0;

    const expiresAt = decoded.payload.exp * 1000;
    const now = Date.now();
    const remaining = expiresAt - now;

    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

// ========== REFRESH TOKEN LOGIC ==========

/**
 * Handle token refresh
 * Validates refresh token and creates new access token
 *
 * @param refreshToken - Current refresh token
 * @param secret - Secret key
 * @param getUserPayload - Function to get fresh user payload
 * @returns New token set
 */
export async function refreshAccessToken(
  refreshToken: string,
  secret: string,
  getUserPayload: (userId: string) => Promise<JWTPayload>
): Promise<TokenSet> {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken, secret);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Get fresh user payload
    const userId = decoded.sub;
    const newPayload = await getUserPayload(userId);

    // Create new token set
    return createTokenSet(newPayload, secret);
  } catch (err) {
    throw new Error(`Token refresh failed: ${err}`);
  }
}

// ========== INTERNAL HELPERS ==========

/**
 * Create JWT token with header, payload, and signature
 */
function createToken(
  header: any,
  payload: any,
  secret: string
): string {
  const headerEnc = base64UrlEncode(JSON.stringify(header));
  const payloadEnc = base64UrlEncode(JSON.stringify(payload));
  const signature = computeSignature(`${headerEnc}.${payloadEnc}`, secret);

  return `${headerEnc}.${payloadEnc}.${signature}`;
}

/**
 * Compute HMAC-SHA256 signature for JWT
 */
function computeSignature(message: string, secret: string): string {
  if (typeof window !== 'undefined') {
    // Browser environment - use Web Crypto API
    return computeSignatureBrowser(message, secret);
  } else {
    // Node.js environment - use crypto module
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    const digest = hmac.digest('base64');
    return base64ToBase64Url(digest);
  }
}

/**
 * Browser-compatible HMAC-SHA256 using Web Crypto API
 */
async function computeSignatureBrowser(
  message: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  return base64UrlEncode(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(signature)))
  );
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  const encoded = Buffer ? Buffer.from(str).toString('base64') : btoa(str);
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  let padded = str + '=='.substring(0, (4 - (str.length % 4)) % 4);
  padded = padded.replace(/-/g, '+').replace(/_/g, '/');

  if (typeof window !== 'undefined') {
    return atob(padded);
  } else {
    return Buffer.from(padded, 'base64').toString();
  }
}

/**
 * Convert standard base64 to base64url
 */
function base64ToBase64Url(str: string): string {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ========== EXPORTS ==========
export const JWT_CONFIG = {
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
  REFRESH_THRESHOLD,
};

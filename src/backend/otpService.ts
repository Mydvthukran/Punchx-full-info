import crypto from 'crypto';
import { logger } from './logger.js';

// ─── Cryptographic Server-Authoritative OTP Engine ───
// Enforces Section 8: OTP & Completion Verification [P0] from Backend Task Sheet.
// Hardcoded OTPs ('8842', '9921', etc.) are eliminated.
// Generates secure random numbers, hashes with per-challenge salt, enforces 15m TTL & 3-attempt lockout.

export interface GeneratedOtp {
  code: string;
  hash: string;
  salt: string;
  expiresAt: string;
}

export interface OtpVerificationRecord {
  hash?: string;
  salt?: string;
  expiresAt?: string;
  attempts?: number;
}

export interface OtpVerifyResult {
  valid: boolean;
  error?: string;
  attemptsRemaining?: number;
  locked?: boolean;
}

const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const MAX_ATTEMPTS = 3;

/**
 * Generates a cryptographically random 6-digit OTP, salt, and SHA-256 hash.
 */
export function generateSecureOtp(ttlMs = OTP_TTL_MS): GeneratedOtp {
  const codeInt = crypto.randomInt(100000, 1000000);
  const code = codeInt.toString();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + code).digest('hex');
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  return { code, hash, salt, expiresAt };
}

/**
 * Verifies a candidate OTP against stored hash, salt, expiry, and attempt limits.
 * Uses timing-safe constant-time comparison.
 */
export function verifyOtpChallenge(
  candidateCode: string,
  record: OtpVerificationRecord
): OtpVerifyResult {
  const currentAttempts = record.attempts || 0;

  if (currentAttempts >= MAX_ATTEMPTS) {
    logger.security('OTP verification rejected: max attempts exceeded (lockout)', {
      attempts: currentAttempts,
    });
    return {
      valid: false,
      locked: true,
      error: 'Maximum verification attempts exceeded. Please request a new security code.',
      attemptsRemaining: 0,
    };
  }

  if (!record.hash || !record.salt || !record.expiresAt) {
    return {
      valid: false,
      error: 'No active verification challenge found for this request.',
    };
  }

  const expiryTime = new Date(record.expiresAt).getTime();
  if (Date.now() > expiryTime) {
    logger.security('OTP verification rejected: code expired', {
      expiresAt: record.expiresAt,
    });
    return {
      valid: false,
      error: 'Verification code has expired. Please request a fresh code.',
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - (currentAttempts + 1)),
    };
  }

  const cleanCandidate = (candidateCode || '').trim();
  if (!cleanCandidate || cleanCandidate.length < 4 || cleanCandidate.length > 8) {
    return {
      valid: false,
      error: 'Invalid verification code format.',
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - currentAttempts),
    };
  }

  // Compute candidate hash
  const candidateHash = crypto.createHash('sha256').update(record.salt + cleanCandidate).digest('hex');

  // Constant-time timing-safe comparison to prevent side-channel timing attacks
  const bufExpected = Buffer.from(record.hash, 'utf-8');
  const bufCandidate = Buffer.from(candidateHash, 'utf-8');

  let match = false;
  if (bufExpected.length === bufCandidate.length) {
    match = crypto.timingSafeEqual(bufExpected, bufCandidate);
  }

  if (!match) {
    const newAttempts = currentAttempts + 1;
    const remaining = Math.max(0, MAX_ATTEMPTS - newAttempts);
    logger.security('OTP verification failed: incorrect code', {
      attempts: newAttempts,
      remaining,
    });
    return {
      valid: false,
      attemptsRemaining: remaining,
      locked: remaining === 0,
      error: remaining > 0 
        ? `Incorrect security code. ${remaining} attempt(s) remaining.` 
        : 'Maximum attempts exceeded. This security challenge has been locked.',
    };
  }

  return {
    valid: true,
  };
}

/**
 * reCAPTCHA v3 Verification
 * Server-side verification of reCAPTCHA tokens
 */

const RECAPTCHA_SECRET_KEY = "6LeOBBYsAAAAAE-Mc5LCcjCiPXWOEi_tm_6VrlYP";
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export interface RecaptchaVerifyResult {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  error_codes?: string[];
}

/**
 * Verify reCAPTCHA token on the server
 * @param token - reCAPTCHA token from client
 * @returns Verification result with score
 */
export async function verifyRecaptchaToken(
  token: string
): Promise<RecaptchaVerifyResult | null> {
  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    if (!response.ok) {
      console.error("reCAPTCHA verification failed:", response.statusText);
      return null;
    }

    const result: RecaptchaVerifyResult = await response.json();
    return result;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return null;
  }
}

/**
 * Check if reCAPTCHA verification is successful
 * @param token - reCAPTCHA token from client
 * @param minScore - Minimum score threshold (0.0 - 1.0)
 * @returns true if verification is successful and score is above threshold
 */
export async function isRecaptchaValid(
  token: string,
  minScore: number = 0.5
): Promise<boolean> {
  const result = await verifyRecaptchaToken(token);

  if (!result) {
    return false;
  }

  // Check if verification was successful and score is above threshold
  return result.success && result.score >= minScore;
}

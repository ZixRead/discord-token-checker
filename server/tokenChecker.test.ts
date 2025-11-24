import { describe, expect, it } from "vitest";
import {
  extractTokens,
  isValidTokenFormat,
  decodeTokenUserId,
  validateToken,
} from "./tokenChecker";

describe("tokenChecker", () => {
  describe("isValidTokenFormat", () => {
    it("should validate correct Discord token format", () => {
      // Valid token format: user_id.timestamp.signature
      const validToken = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      expect(isValidTokenFormat(validToken)).toBe(true);
    });

    it("should reject tokens without exactly 3 parts", () => {
      expect(isValidTokenFormat("invalid")).toBe(false);
      expect(isValidTokenFormat("part1.part2")).toBe(false);
      expect(isValidTokenFormat("part1.part2.part3.part4")).toBe(false);
    });

    it("should reject tokens with invalid characters", () => {
      expect(isValidTokenFormat("part1!.part2@.part3#")).toBe(false);
      expect(isValidTokenFormat("part1 .part2 .part3 ")).toBe(false);
    });

    it("should reject empty tokens", () => {
      expect(isValidTokenFormat("")).toBe(false);
      expect(isValidTokenFormat(null as any)).toBe(false);
      expect(isValidTokenFormat(undefined as any)).toBe(false);
    });

    it("should accept tokens with underscores and hyphens", () => {
      const tokenWithUnderscores = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      expect(isValidTokenFormat(tokenWithUnderscores)).toBe(true);
    });
  });

  describe("decodeTokenUserId", () => {
    it("should decode valid user ID from token", () => {
      // MTQzODUwMzcxNzE1NzQ3MDIzOA is base64 encoded "1438503717157470238" (19 digits)
      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const userId = decodeTokenUserId(token);
      expect(userId).toBeDefined();
    });

    it("should return null for invalid token format", () => {
      expect(decodeTokenUserId("invalid")).toBeNull();
      expect(decodeTokenUserId("part1.part2")).toBeNull();
    });

    it("should return null if decoded value is not numeric", () => {
      // Create a token where first part decodes to non-numeric value
      // Using "invalid" as base64 which decodes to something non-numeric
      const invalidToken = "aW52YWxpZA.GACEV9.4o6iXocd-clOQdyIkatm9XrAkE1hp1deZAEM-Q";
      const userId = decodeTokenUserId(invalidToken);
      expect(userId).toBeNull();
    });
  });

  describe("validateToken", () => {
    it("should validate correct token format", () => {
      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = validateToken(token);
      
      expect(result.isValid).toBe(true);
      expect(result.format).toBe("valid");
      expect(result.userId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid token format", () => {
      const token = "invalid-token";
      const result = validateToken(token);
      
      expect(result.isValid).toBe(false);
      expect(result.format).toBe("invalid");
      expect(result.userId).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe("extractTokens", () => {
    it("should extract tokens from email:password:token format", () => {
      const input = "test@example.com:password123:TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const tokens = extractTokens(input);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBe("TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1");
    });

    it("should extract tokens from multiple lines", () => {
      const input = `test@example.com:password123:TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1
test2@example.com:password456:TOKEN_PLACEHOLDER_2.PLACEHOLDER.placeholder2
test3@example.com:password789:TOKEN_PLACEHOLDER_3.PLACEHOLDER.placeholder3`;
      const tokens = extractTokens(input);
      
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toBe("TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1");
      expect(tokens[1]).toBe("TOKEN_PLACEHOLDER_2.PLACEHOLDER.placeholder2");
      expect(tokens[2]).toBe("TOKEN_PLACEHOLDER_3.PLACEHOLDER.placeholder3");
    });

    it("should extract standalone tokens", () => {
      const input = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const tokens = extractTokens(input);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBe("TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1");
    });

    it("should skip invalid tokens", () => {
      const input = `invalid-token
TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1
another-invalid`;
      const tokens = extractTokens(input);
      
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBe("TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1");
    });

    it("should handle empty input", () => {
      const tokens = extractTokens("");
      expect(tokens).toHaveLength(0);
    });

    it("should handle whitespace", () => {
      const input = `
      
TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1
      `;
      const tokens = extractTokens(input);
      
      expect(tokens).toHaveLength(1);
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { checkTokenComprehensive } from "./discordApi";

describe("discordApi", () => {
  describe("checkTokenComprehensive", () => {
    it("should return invalid format for malformed token", async () => {
      const result = await checkTokenComprehensive("invalid-token");

      expect(result.formatValid).toBe(false);
      expect(result.isAlive).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should validate correct token format", async () => {
      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await checkTokenComprehensive(token);

      expect(result.formatValid).toBe(true);
      expect(result.userId).toBeDefined();
    });

    it("should attempt to fetch user data for valid format token", async () => {
      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await checkTokenComprehensive(token);

      // Should have format validation result
      expect(result.formatValid).toBe(true);
      // For invalid token, API will return false for isAlive
      expect(result.isAlive).toBe(false);
      // Profile should be undefined since token is not valid
      expect(result.profile).toBeUndefined();
    });

    it("should handle multiple tokens with different formats", async () => {
      const validToken = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const invalidToken = "invalid-token";

      const result1 = await checkTokenComprehensive(validToken);
      const result2 = await checkTokenComprehensive(invalidToken);

      expect(result1.formatValid).toBe(true);
      expect(result2.formatValid).toBe(false);
    });

    it("should include token in result", async () => {
      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await checkTokenComprehensive(token);

      expect(result.token).toBe(token);
    });
  });
});

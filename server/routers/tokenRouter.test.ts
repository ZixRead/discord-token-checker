import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("tokenRouter", () => {
  describe("token.extract", () => {
    it("should extract tokens from email:password:token format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const input = "test@example.com:password123:TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await caller.token.extract({ input });

      expect(result).toHaveLength(1);
      expect(result[0]?.token).toBe("TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1");
      expect(result[0]?.validation.isValid).toBe(true);
    });

    it("should extract multiple tokens from multiline input", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const input = `test1@example.com:pass1:TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1
test2@example.com:pass2:TOKEN_PLACEHOLDER_2.PLACEHOLDER.placeholder2`;
      const result = await caller.token.extract({ input });

      expect(result).toHaveLength(2);
      expect(result[0]?.validation.isValid).toBe(true);
      expect(result[1]?.validation.isValid).toBe(true);
    });

    it("should extract standalone tokens", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const input = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await caller.token.extract({ input });

      expect(result).toHaveLength(1);
      expect(result[0]?.validation.isValid).toBe(true);
    });

    it("should skip invalid tokens", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const input = `invalid-token
TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1
another-invalid`;
      const result = await caller.token.extract({ input });

      expect(result).toHaveLength(1);
      expect(result[0]?.validation.isValid).toBe(true);
    });

    it("should return empty array for empty input", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.token.extract({ input: "" });

      expect(result).toHaveLength(0);
    });
  });

  describe("token.checkComprehensive", () => {
    it("should validate token format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await caller.token.checkComprehensive({ token });

      expect(result.formatValid).toBe(true);
      expect(result.userId).toBeDefined();
    });

    it("should reject invalid token format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.token.checkComprehensive({ token: "invalid-token" });

      expect(result.formatValid).toBe(false);
      expect(result.userId).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should attempt to check token validity with Discord API", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await caller.token.checkComprehensive({ token });

      expect(result.formatValid).toBe(true);
      expect(result.isAlive).toBe(false);
    });

    it("should include email and password from originalInput", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const token = "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const originalInput = "test@example.com:password123:TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1";
      const result = await caller.token.checkComprehensive({ token, originalInput });

      expect(result.email).toBe("test@example.com");
      expect(result.password).toBe("password123");
    });
  });

  describe("token.checkMultipleComprehensive", () => {
    it("should check multiple tokens comprehensively", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const tokens = [
        { token: "TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1" },
        { token: "TOKEN_PLACEHOLDER_2.PLACEHOLDER.placeholder2" },
      ];
      const result = await caller.token.checkMultipleComprehensive({ tokens });

      expect(result).toHaveLength(2);
      expect(result[0]?.formatValid).toBe(true);
      expect(result[1]?.formatValid).toBe(true);
    });

    it("should handle empty token array", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.token.checkMultipleComprehensive({ tokens: [] });

      expect(result).toHaveLength(0);
    });
  });

  describe("token.parseAndCheckComprehensive", () => {
    it("should parse and check tokens from raw input comprehensively", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const input = `test1@example.com:pass1:TOKEN_PLACEHOLDER_1.PLACEHOLDER.placeholder1
test2@example.com:pass2:TOKEN_PLACEHOLDER_2.PLACEHOLDER.placeholder2`;
      const result = await caller.token.parseAndCheckComprehensive({ input });

      expect(result).toHaveLength(2);
      expect(result[0]?.formatValid).toBe(true);
      expect(result[1]?.formatValid).toBe(true);
      expect(result[0]?.userId).toBeDefined();
      expect(result[0]?.email).toBe("test1@example.com");
      expect(result[0]?.password).toBe("pass1");
    });

    it("should return empty array for input with no valid tokens", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.token.parseAndCheckComprehensive({ input: "invalid-token\nanother-invalid" });

      expect(result).toHaveLength(0);
    });
  });

  describe("token.exportCSV", () => {
    it("should export valid tokens to CSV", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const results = [
        { email: "test@example.com", password: "pass123", token: "token1", isAlive: true, username: "testuser" },
        { email: "test2@example.com", password: "pass456", token: "token2", isAlive: false, error: "Invalid token" },
      ];

      const csv = await caller.token.exportCSV({ results, type: "valid" });

      expect(csv).toContain("test@example.com");
      expect(csv).toContain("testuser");
      expect(csv).not.toContain("test2@example.com");
    });
  });

  describe("token.exportTokensOnly", () => {
    it("should export only valid tokens", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const results = [
        { token: "token1", isAlive: true },
        { token: "token2", isAlive: false },
      ];

      const tokens = await caller.token.exportTokensOnly({ results, type: "valid" });

      expect(tokens).toBe("token1");
      expect(tokens).not.toContain("token2");
    });
  });

  describe("token.exportFullFormat", () => {
    it("should export full format (email:password:token)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const results = [
        { email: "test@example.com", password: "pass123", token: "token1", isAlive: true },
        { email: "test2@example.com", password: "pass456", token: "token2", isAlive: false },
      ];

      const fullFormat = await caller.token.exportFullFormat({ results, type: "valid" });

      expect(fullFormat).toBe("test@example.com:pass123:token1");
      expect(fullFormat).not.toContain("test2@example.com");
    });
  });
});

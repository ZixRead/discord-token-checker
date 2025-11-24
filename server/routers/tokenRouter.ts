import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  extractTokens,
  extractTokensWithMetadata,
  validateToken,
} from "../tokenChecker";
import {
  checkTokenComprehensive,
  checkMultipleTokensComprehensive,
  parseAndCheckTokensComprehensive,
  type CompleteTokenCheckResult,
} from "../discordApi";
import {
  exportToCSV,
  exportToJSON,
  exportTokensOnly,
  exportFullFormat,
} from "../tokenParser";

export const tokenRouter = router({
  /**
   * Extract and validate tokens from raw input
   * Returns a list of tokens with basic validation
   */
  extract: publicProcedure
    .input(z.object({ input: z.string() }))
    .query(({ input }) => {
      const tokens = extractTokens(input.input);
      return tokens.map((token) => ({
        token,
        validation: validateToken(token),
      }));
    }),

  /**
   * Check a single token comprehensively
   */
  checkComprehensive: publicProcedure
    .input(z.object({ token: z.string(), originalInput: z.string().optional() }))
    .mutation(async ({ input }): Promise<CompleteTokenCheckResult> => {
      return checkTokenComprehensive(input.token, input.originalInput);
    }),

  /**
   * Check multiple tokens comprehensively
   */
  checkMultipleComprehensive: publicProcedure
    .input(z.object({ tokens: z.array(z.object({ token: z.string(), originalInput: z.string().optional() })) }))
    .mutation(async ({ input }): Promise<CompleteTokenCheckResult[]> => {
      return checkMultipleTokensComprehensive(input.tokens);
    }),

  /**
   * Parse and check tokens from raw input comprehensively
   */
  parseAndCheckComprehensive: publicProcedure
    .input(z.object({ input: z.string() }))
    .mutation(async ({ input }): Promise<CompleteTokenCheckResult[]> => {
      return parseAndCheckTokensComprehensive(input.input);
    }),

  /**
   * Export results to CSV
   */
  exportCSV: publicProcedure
    .input(z.object({
      results: z.array(z.object({
        email: z.string().optional(),
        password: z.string().optional(),
        token: z.string(),
        isAlive: z.boolean(),
        username: z.string().optional(),
        error: z.string().optional(),
      })),
      type: z.enum(['valid', 'invalid', 'all']),
    }))
    .query(({ input }) => {
      return exportToCSV(input.results, input.type);
    }),

  /**
   * Export results to JSON
   */
  exportJSON: publicProcedure
    .input(z.object({
      results: z.array(z.object({
        email: z.string().optional(),
        password: z.string().optional(),
        token: z.string(),
        isAlive: z.boolean(),
        username: z.string().optional(),
        error: z.string().optional(),
      })),
      type: z.enum(['valid', 'invalid', 'all']),
    }))
    .query(({ input }) => {
      return exportToJSON(input.results, input.type);
    }),

  /**
   * Export tokens only
   */
  exportTokensOnly: publicProcedure
    .input(z.object({
      results: z.array(z.object({
        token: z.string(),
        isAlive: z.boolean(),
      })),
      type: z.enum(['valid', 'invalid', 'all']),
    }))
    .query(({ input }) => {
      return exportTokensOnly(input.results, input.type);
    }),

  /**
   * Export full format (email:password:token)
   */
  exportFullFormat: publicProcedure
    .input(z.object({
      results: z.array(z.object({
        email: z.string().optional(),
        password: z.string().optional(),
        token: z.string(),
        isAlive: z.boolean(),
      })),
      type: z.enum(['valid', 'invalid', 'all']),
    }))
    .query(({ input }) => {
      return exportFullFormat(input.results, input.type);
    }),
});

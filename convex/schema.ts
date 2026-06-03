import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  matches: defineTable({
    matchId: v.string(),       // e.g. "A1", "SF1", "Final"
    team1: v.string(),
    team2: v.string(),
    courts: v.string(),
    timeSlot: v.string(),      // e.g. "slot1", "semis", "final"
    phase: v.string(),         // "group" | "semis" | "final"
    // Seed scores: array of [team1Score, team2Score] per seed
    seedScores: v.array(
      v.object({
        seed: v.number(),
        team1Games: v.optional(v.number()),
        team2Games: v.optional(v.number()),
      })
    ),
    // Computed totals (updated by mutation)
    team1Total: v.optional(v.number()),
    team2Total: v.optional(v.number()),
    status: v.string(),        // "pending" | "in_progress" | "complete"
  }).index("by_matchId", ["matchId"])
    .index("by_timeSlot", ["timeSlot"]),
});

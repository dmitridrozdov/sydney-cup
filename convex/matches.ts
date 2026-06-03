import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("matches").collect();
  },
});

export const getByMatchId = query({
  args: { matchId: v.string() },
  handler: async (ctx, { matchId }) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", matchId))
      .first();
  },
});

export const getByPhase = query({
  args: { phase: v.string() },
  handler: async (ctx, { phase }) => {
    return await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("phase"), phase))
      .collect();
  },
});

// ── Mutations ────────────────────────────────────────────────────────

// Seed the initial match schedule (run once from admin)
export const seedMatches = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("matches").collect();
    if (existing.length > 0) return { message: "Already seeded" };

    const schedule = [
      // Time Slot 1
      { matchId:"A1", team1:"Royal Blues", team2:"Hartley",     courts:"1, 2, 3", timeSlot:"slot1", phase:"group" },
      { matchId:"A2", team1:"Joes",        team2:"STC",         courts:"4, 5, 6", timeSlot:"slot1", phase:"group" },
      { matchId:"B1", team1:"Royal Golds", team2:"Trinity",     courts:"7, 8, 9", timeSlot:"slot1", phase:"group" },
      { matchId:"B2", team1:"Hindu Golds", team2:"Ananda",      courts:"10–12",   timeSlot:"slot1", phase:"group" },
      // Time Slot 2
      { matchId:"A3", team1:"Hindu Blues", team2:"Joes",        courts:"1, 2, 3", timeSlot:"slot2", phase:"group" },
      { matchId:"A4", team1:"Hartley",     team2:"STC",         courts:"4, 5, 6", timeSlot:"slot2", phase:"group" },
      { matchId:"B3", team1:"Ananda",      team2:"Trinity",     courts:"7, 8, 9", timeSlot:"slot2", phase:"group" },
      { matchId:"B4", team1:"Combined",    team2:"Royal Golds", courts:"10–12",   timeSlot:"slot2", phase:"group" },
      // Time Slot 3
      { matchId:"A5", team1:"Royal Blues", team2:"Hindu Blues", courts:"1, 2, 3", timeSlot:"slot3", phase:"group" },
      { matchId:"A6", team1:"Joes",        team2:"Hartley",     courts:"4, 5, 6", timeSlot:"slot3", phase:"group" },
      { matchId:"B5", team1:"Royal Golds", team2:"Hindu Golds", courts:"7, 8, 9", timeSlot:"slot3", phase:"group" },
      { matchId:"B6", team1:"Trinity",     team2:"Combined",    courts:"10–12",   timeSlot:"slot3", phase:"group" },
      // Time Slot 4
      { matchId:"A7", team1:"Royal Blues", team2:"Joes",        courts:"1, 2, 3", timeSlot:"slot4", phase:"group" },
      { matchId:"A8", team1:"Hindu Blues", team2:"STC",         courts:"4, 5, 6", timeSlot:"slot4", phase:"group" },
      { matchId:"B7", team1:"Hindu Golds", team2:"Combined",    courts:"7, 8, 9", timeSlot:"slot4", phase:"group" },
      { matchId:"B8", team1:"Royal Golds", team2:"Ananda",      courts:"10–12",   timeSlot:"slot4", phase:"group" },
      // Time Slot 5
      { matchId:"A9",  team1:"Royal Blues", team2:"STC",      courts:"1, 2, 3", timeSlot:"slot5", phase:"group" },
      { matchId:"A10", team1:"Hindu Blues", team2:"Hartley",  courts:"4, 5, 6", timeSlot:"slot5", phase:"group" },
      { matchId:"B9",  team1:"Hindu Golds", team2:"Trinity",  courts:"7, 8, 9", timeSlot:"slot5", phase:"group" },
      { matchId:"B10", team1:"Ananda",      team2:"Combined", courts:"10–12",   timeSlot:"slot5", phase:"group" },
      // Semis
      { matchId:"SF1", team1:"TBD (Blue Winner)",  team2:"TBD (Gold 2nd)", courts:"1, 2, 3", timeSlot:"semis", phase:"semis" },
      { matchId:"SF2", team1:"TBD (Gold Winner)",  team2:"TBD (Blue 2nd)", courts:"4, 5, 6", timeSlot:"semis", phase:"semis" },
      // Final
      { matchId:"Final", team1:"TBD", team2:"TBD", courts:"1, 2, 3", timeSlot:"final", phase:"final" },
    ];

    for (const m of schedule) {
      await ctx.db.insert("matches", {
        ...m,
        seedScores: [
          { seed: 1 },
          { seed: 2 },
          { seed: 3 },
        ],
        status: "pending",
      });
    }

    return { message: `Seeded ${schedule.length} matches` };
  },
});

// Update a single seed score within a match
export const updateSeedScore = mutation({
  args: {
    matchId:     v.string(),
    seed:        v.number(),       // 1, 2, or 3
    team1Games:  v.number(),
    team2Games:  v.number(),
  },
  handler: async (ctx, { matchId, seed, team1Games, team2Games }) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", matchId))
      .first();

    if (!match) throw new Error(`Match ${matchId} not found`);

    const updatedSeeds = match.seedScores.map((s) =>
      s.seed === seed ? { ...s, team1Games, team2Games } : s
    );

    const team1Total = updatedSeeds.reduce((sum, s) => sum + (s.team1Games ?? 0), 0);
    const team2Total = updatedSeeds.reduce((sum, s) => sum + (s.team2Games ?? 0), 0);

    const allFilled = updatedSeeds.every(
      (s) => s.team1Games !== undefined && s.team2Games !== undefined
    );

    await ctx.db.patch(match._id, {
      seedScores: updatedSeeds,
      team1Total,
      team2Total,
      status: allFilled ? "complete" : "in_progress",
    });
  },
});

// Update match status manually
export const updateStatus = mutation({
  args: {
    matchId: v.string(),
    status:  v.union(v.literal("pending"), v.literal("in_progress"), v.literal("complete")),
  },
  handler: async (ctx, { matchId, status }) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", matchId))
      .first();
    if (!match) throw new Error(`Match ${matchId} not found`);
    await ctx.db.patch(match._id, { status });
  },
});

// Update team names (for semis/final once group stage is done)
export const updateTeamNames = mutation({
  args: {
    matchId: v.string(),
    team1:   v.string(),
    team2:   v.string(),
  },
  handler: async (ctx, { matchId, team1, team2 }) => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_matchId", (q) => q.eq("matchId", matchId))
      .first();
    if (!match) throw new Error(`Match ${matchId} not found`);
    await ctx.db.patch(match._id, { team1, team2 });
  },
});

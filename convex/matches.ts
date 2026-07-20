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
      // Round 1 — Bye: Royal Blues
      { matchId:"R1-M1", team1:"Joes",        team2:"Royal Golds", courts:"1, 2, 3", timeSlot:"round1", phase:"group" },
      { matchId:"R1-M2", team1:"STC",         team2:"Combined",    courts:"4, 5, 6", timeSlot:"round1", phase:"group" },
      { matchId:"R1-M3", team1:"Trinity",     team2:"Ananda",      courts:"7, 8, 9", timeSlot:"round1", phase:"group" },
      // Round 2 — Bye: Combined
      { matchId:"R2-M1", team1:"Royal Blues", team2:"Royal Golds", courts:"1, 2, 3", timeSlot:"round2", phase:"group" },
      { matchId:"R2-M2", team1:"Joes",        team2:"Ananda",      courts:"4, 5, 6", timeSlot:"round2", phase:"group" },
      { matchId:"R2-M3", team1:"STC",         team2:"Trinity",     courts:"7, 8, 9", timeSlot:"round2", phase:"group" },
      // Round 3 — Bye: Trinity
      { matchId:"R3-M1", team1:"Royal Blues", team2:"Combined",    courts:"1, 2, 3", timeSlot:"round3", phase:"group" },
      { matchId:"R3-M2", team1:"Royal Golds", team2:"Ananda",      courts:"4, 5, 6", timeSlot:"round3", phase:"group" },
      { matchId:"R3-M3", team1:"Joes",        team2:"STC",         courts:"7, 8, 9", timeSlot:"round3", phase:"group" },
      // Round 4 — Bye: Joes
      { matchId:"R4-M1", team1:"Royal Blues", team2:"Ananda",      courts:"1, 2, 3", timeSlot:"round4", phase:"group" },
      { matchId:"R4-M2", team1:"Combined",    team2:"Trinity",     courts:"4, 5, 6", timeSlot:"round4", phase:"group" },
      { matchId:"R4-M3", team1:"Royal Golds", team2:"STC",         courts:"7, 8, 9", timeSlot:"round4", phase:"group" },
      // Round 5 — Bye: Royal Golds
      { matchId:"R5-M1", team1:"Royal Blues", team2:"Trinity",     courts:"1, 2, 3", timeSlot:"round5", phase:"group" },
      { matchId:"R5-M2", team1:"Ananda",      team2:"STC",         courts:"4, 5, 6", timeSlot:"round5", phase:"group" },
      { matchId:"R5-M3", team1:"Combined",    team2:"Joes",        courts:"7, 8, 9", timeSlot:"round5", phase:"group" },
      // Round 6 — Bye: Ananda
      { matchId:"R6-M1", team1:"Royal Blues", team2:"STC",         courts:"1, 2, 3", timeSlot:"round6", phase:"group" },
      { matchId:"R6-M2", team1:"Trinity",     team2:"Joes",        courts:"4, 5, 6", timeSlot:"round6", phase:"group" },
      { matchId:"R6-M3", team1:"Combined",    team2:"Royal Golds", courts:"7, 8, 9", timeSlot:"round6", phase:"group" },
      // Round 7 — Bye: STC
      { matchId:"R7-M1", team1:"Royal Blues", team2:"Joes",        courts:"1, 2, 3", timeSlot:"round7", phase:"group" },
      { matchId:"R7-M2", team1:"Trinity",     team2:"Royal Golds", courts:"4, 5, 6", timeSlot:"round7", phase:"group" },
      { matchId:"R7-M3", team1:"Ananda",      team2:"Combined",    courts:"7, 8, 9", timeSlot:"round7", phase:"group" },
      // Final
      { matchId:"Final", team1:"TBD (Rank 1)", team2:"TBD (Rank 2)", courts:"1, 2, 3", timeSlot:"final", phase:"final" },
    ];

    for (const m of schedule) {
      await ctx.db.insert("matches", {
        ...m,
        seedScores: [{ seed: 1 }, { seed: 2 }, { seed: 3 }],
        status: "pending",
      });
    }
    return { message: `Seeded ${schedule.length} matches` };
  },
});

// Update a single seed score within a match
export const updateSeedScore = mutation({
  args: {
    matchId:    v.string(),
    seed:       v.number(),
    team1Games: v.number(),
    team2Games: v.number(),
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

    // Sets won = number of seeds where this team scored more games
    const team1Sets = updatedSeeds.filter(
      (s) => s.team1Games !== undefined && s.team2Games !== undefined && s.team1Games > s.team2Games
    ).length;
    const team2Sets = updatedSeeds.filter(
      (s) => s.team1Games !== undefined && s.team2Games !== undefined && s.team2Games > s.team1Games
    ).length;

    const allFilled = updatedSeeds.every(
      (s) => s.team1Games !== undefined && s.team2Games !== undefined
    );

    await ctx.db.patch(match._id, {
      seedScores: updatedSeeds,
      team1Total,
      team2Total,
      team1Sets,
      team2Sets,
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

export const getStandings = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches")
      .filter((q) => q.eq(q.field("phase"), "group"))
      .collect();

    const ALL_TEAMS = ["Royal Blues","Joes","STC","Trinity","Ananda","Combined","Royal Golds"];
    const stats: Record<string, { games: number; sets: number; matchesWon: number }> = {};
    for (const t of ALL_TEAMS) stats[t] = { games: 0, sets: 0, matchesWon: 0 };

    for (const m of matches) {
      if (m.status !== "complete") continue;
      const t1 = m.team1; const t2 = m.team2;
      if (!stats[t1]) stats[t1] = { games: 0, sets: 0, matchesWon: 0 };
      if (!stats[t2]) stats[t2] = { games: 0, sets: 0, matchesWon: 0 };

      stats[t1].games += m.team1Total ?? 0;
      stats[t2].games += m.team2Total ?? 0;
      stats[t1].sets  += m.team1Sets  ?? 0;
      stats[t2].sets  += m.team2Sets  ?? 0;

      if ((m.team1Sets ?? 0) > (m.team2Sets ?? 0)) stats[t1].matchesWon++;
      else if ((m.team2Sets ?? 0) > (m.team1Sets ?? 0)) stats[t2].matchesWon++;
    }

    return stats;
  },
});

export const resetMatches = mutation({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    for (const m of matches) {
      await ctx.db.patch(m._id, {
        seedScores: [
          { seed: 1 },
          { seed: 2 },
          { seed: 3 },
        ],
        team1Total: undefined,
        team2Total: undefined,
        team1Sets:  undefined,
        team2Sets:  undefined,
        status: "pending",
      });
    }
    return { message: `Reset ${matches.length} matches` };
  },
});

export const setFinalTeamsFromStandings = mutation({
  args: {},
  handler: async (ctx) => {
    const standings = await ctx.db.query("matches")
      .filter((q) => q.eq(q.field("phase"), "group"))
      .collect();

    // Accumulate sets and games per team
    const stats: Record<string, { sets: number; games: number }> = {};
    for (const m of standings) {
      if (m.status !== "complete") continue;
      if (!stats[m.team1]) stats[m.team1] = { sets: 0, games: 0 };
      if (!stats[m.team2]) stats[m.team2] = { sets: 0, games: 0 };
      stats[m.team1].sets  += m.team1Sets  ?? 0;
      stats[m.team2].sets  += m.team2Sets  ?? 0;
      stats[m.team1].games += m.team1Total ?? 0;
      stats[m.team2].games += m.team2Total ?? 0;
    }

    const ranked = Object.entries(stats)
      .sort(([, a], [, b]) => b.sets - a.sets || b.games - a.games);

    if (ranked.length < 2) throw new Error("Not enough completed matches to determine finalists");

    const rank1 = ranked[0][0];
    const rank2 = ranked[1][0];

    const final = await ctx.db.query("matches")
      .filter((q) => q.eq(q.field("phase"), "final"))
      .first();

    if (!final) throw new Error("Final match not found");

    await ctx.db.patch(final._id, { team1: rank1, team2: rank2 });

    return { message: `Final set: ${rank1} vs ${rank2}` };
  },
});
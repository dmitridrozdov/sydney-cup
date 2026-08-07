"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navigation from "@/components/Navigation";
import playersData from "@/data/players.json";
import styles from "./analytics.module.css";

// ── Types ────────────────────────────────────────────────────────────
interface TeamStat {
  team: string;
  games: number;
  sets: number;
  matchesWon: number;
  matchesLost: number;
  matchesPlayed: number;
  gamesFor: number;
  gamesAgainst: number;
  gameDiff: number;
  winPct: number;
}

interface SeedMatchStat {
  matchId: string;
  opponent: string;
  team1Games: number;
  team2Games: number;
  won: boolean;
}

interface TeamSeedStat {
  team: string;
  seed: number;
  players: string[];
  wins: number;
  losses: number;
  played: number;
  gamesFor: number;
  gamesAgainst: number;
  winPct: number;
  matches: SeedMatchStat[];
}

// ── Helpers ──────────────────────────────────────────────────────────
function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

function Bar({ value, max, color = "gold" }: { value: number; max: number; color?: "gold" | "green" | "red" }) {
  const w = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className={styles.barTrack}>
      <div className={`${styles.barFill} ${styles[`barFill_${color}`]}`} style={{ width: `${w}%` }} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const matches = useQuery(api.matches.getAll);

  if (matches === undefined) {
    return (
      <main className={styles.main}>
        <Navigation />
        <div className={styles.loading}>Loading analytics…</div>
      </main>
    );
  }

  const completed = matches.filter((m) => m.status === "complete");
  const groupMatches = completed.filter((m) => m.phase === "group");
  const finalMatch = completed.find((m) => m.phase === "final");

  // ── Build team stats ──────────────────────────────────────────────
  const statsMap: Record<string, TeamStat> = {};
  const ensure = (team: string) => {
    if (!statsMap[team]) statsMap[team] = {
      team, games: 0, sets: 0, matchesWon: 0, matchesLost: 0,
      matchesPlayed: 0, gamesFor: 0, gamesAgainst: 0, gameDiff: 0, winPct: 0,
    };
  };

  for (const m of groupMatches) {
    ensure(m.team1); ensure(m.team2);
    const s1 = statsMap[m.team1]; const s2 = statsMap[m.team2];
    const g1 = m.team1Total ?? 0; const g2 = m.team2Total ?? 0;
    const se1 = m.team1Sets ?? 0; const se2 = m.team2Sets ?? 0;
    s1.gamesFor += g1; s1.gamesAgainst += g2; s1.sets += se1;
    s2.gamesFor += g2; s2.gamesAgainst += g1; s2.sets += se2;
    s1.matchesPlayed++; s2.matchesPlayed++;
    if (se1 > se2) { s1.matchesWon++; s2.matchesLost++; }
    else if (se2 > se1) { s2.matchesWon++; s1.matchesLost++; }
  }

  const teams = Object.values(statsMap).map((s) => ({
    ...s,
    gameDiff: s.gamesFor - s.gamesAgainst,
    winPct: pct(s.matchesWon, s.matchesPlayed),
  })).sort((a, b) => b.sets - a.sets || b.gamesFor - a.gamesFor);

  // ── Build per-seed stats per team ─────────────────────────────────
  const seedStats: TeamSeedStat[] = [];

  for (const school of playersData.schools) {
    for (const seedInfo of school.seeds) {
      const stat: TeamSeedStat = {
        team: school.name,
        seed: seedInfo.seed,
        players: seedInfo.players,
        wins: 0, losses: 0, played: 0,
        gamesFor: 0, gamesAgainst: 0,
        winPct: 0, matches: [],
      };

      for (const m of groupMatches) {
        const isTeam1 = m.team1 === (school.matchName ?? school.name);
        const isTeam2 = m.team2 === (school.matchName ?? school.name);
        if (!isTeam1 && !isTeam2) continue;

        const s = m.seedScores.find((x) => x.seed === seedInfo.seed);
        if (!s || s.team1Games === undefined || s.team2Games === undefined) continue;

        const myGames  = isTeam1 ? s.team1Games : s.team2Games;
        const oppGames = isTeam1 ? s.team2Games : s.team1Games;
        const won = myGames > oppGames;
        const opponent = isTeam1 ? m.team2 : m.team1;

        stat.played++;
        stat.gamesFor += myGames;
        stat.gamesAgainst += oppGames;
        if (won) stat.wins++;
        else stat.losses++;

        stat.matches.push({
          matchId: m.matchId,
          opponent,
          team1Games: myGames,
          team2Games: oppGames,
          won,
        });
      }

      stat.winPct = pct(stat.wins, stat.played);
      seedStats.push(stat);
    }
  }

  // ── Aggregate stats ───────────────────────────────────────────────
  const totalGames = groupMatches.reduce(
    (s, m) => s + (m.team1Total ?? 0) + (m.team2Total ?? 0), 0
  );
  const avgGamesPerMatch = groupMatches.length
    ? Math.round(totalGames / groupMatches.length) : 0;

  const closestMatch = [...groupMatches].sort((a, b) =>
    Math.abs((a.team1Total ?? 0) - (a.team2Total ?? 0)) -
    Math.abs((b.team1Total ?? 0) - (b.team2Total ?? 0))
  )[0];

  const biggestWin = [...groupMatches].sort((a, b) =>
    Math.abs((b.team1Total ?? 0) - (b.team2Total ?? 0)) -
    Math.abs((a.team1Total ?? 0) - (a.team2Total ?? 0))
  )[0];

  const highestScore = [...groupMatches].reduce((best, m) => {
    const t1 = m.team1Total ?? 0; const t2 = m.team2Total ?? 0;
    if (t1 > best.score) return { score: t1, team: m.team1, opp: m.team2 };
    if (t2 > best.score) return { score: t2, team: m.team2, opp: m.team1 };
    return best;
  }, { score: 0, team: "", opp: "" });

  // Global seed win rates
  const globalSeedStats = [1, 2, 3].map((seed) => {
    const relevant = seedStats.filter((s) => s.seed === seed);
    const wins = relevant.reduce((n, s) => n + s.wins, 0);
    const played = relevant.reduce((n, s) => n + s.played, 0);
    return { seed, wins, played, winPct: pct(wins, played) };
  });

  const champion = finalMatch
    ? ((finalMatch.team1Total ?? 0) > (finalMatch.team2Total ?? 0)
      ? finalMatch.team1 : finalMatch.team2)
    : teams[0]?.team ?? "TBD";

  const runnerUp = finalMatch
    ? ((finalMatch.team1Total ?? 0) > (finalMatch.team2Total ?? 0)
      ? finalMatch.team2 : finalMatch.team1)
    : teams[1]?.team ?? "TBD";

  const maxGames = Math.max(...teams.map((t) => t.gamesFor), 1);
  const maxSets  = Math.max(...teams.map((t) => t.sets), 1);
  const maxSeedGames = Math.max(...seedStats.map((s) => s.gamesFor), 1);

  // Group seed stats by team for the detailed section
  const seedsByTeam = playersData.schools.map((school) => ({
    school,
    seeds: seedStats.filter((s) => s.team === school.name).sort((a, b) => a.seed - b.seed),
  }));

  return (
    <main className={styles.main}>
      <Navigation />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className={styles.editionBadge}>
            <span className={styles.editionLine} />
            <span className={styles.editionText}>Sydney Cup 3.0 · 2026</span>
            <span className={styles.editionLine} />
          </div>
          <h1 className={styles.heroTitle}>
            Competition <span className={styles.goldText}>Analytics</span>
          </h1>
          <p className={styles.heroSub}>
            {completed.length} matches · {totalGames} total games played
          </p>
        </div>
      </section>

      <div className={styles.content}>

        {/* ── CHAMPION BANNER ── */}
        {finalMatch && (
          <section className={styles.championSection}>
            <div className={styles.championCard}>
              <div className={styles.championLeft}>
                <span className={styles.champEyebrow}>Champion</span>
                <div className={styles.champName}>{champion}</div>
                <div className={styles.champScore}>
                  {finalMatch.team1Total ?? "–"} – {finalMatch.team2Total ?? "–"}
                </div>
              </div>
              <div className={styles.trophyIcon}>
                <svg viewBox="0 0 60 70" fill="none">
                  <path d="M15 6h30v21c0 11-6 18-15 20C21 45 15 38 15 27V6z"
                    stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M15 10H6c0 9 4 15 9 17" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M45 10h9c0 9-4 15-9 17" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="24" y="47" width="12" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
                  <rect x="19" y="50" width="22" height="4" rx="1" fill="currentColor"/>
                  <path d="M30 20l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z" fill="currentColor"/>
                </svg>
              </div>
              <div className={styles.championRight}>
                <span className={styles.champEyebrow}>Runner Up</span>
                <div className={styles.champRunnerUp}>{runnerUp}</div>
                <div className={styles.champScoreSub}>
                  Final · {finalMatch.seedScores.map((s) =>
                    `S${s.seed}: ${s.team1Games ?? "–"}–${s.team2Games ?? "–"}`
                  ).join(" · ")}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── TOURNAMENT SNAPSHOT ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Overview</span>
            <h2 className={styles.sectionTitle}>Tournament Snapshot</h2>
          </div>
          <div className={styles.snapshotGrid}>
            <StatCard label="Matches Played" value={completed.length} />
            <StatCard label="Total Games" value={totalGames} />
            <StatCard label="Avg Games / Match" value={avgGamesPerMatch} />
            <StatCard label="Teams" value={teams.length} />
            {closestMatch && (
              <StatCard
                label="Closest Match"
                value={`${Math.abs((closestMatch.team1Total ?? 0) - (closestMatch.team2Total ?? 0))} games`}
                sub={`${closestMatch.team1} vs ${closestMatch.team2}`}
              />
            )}
            {biggestWin && (
              <StatCard
                label="Biggest Margin"
                value={`${Math.abs((biggestWin.team1Total ?? 0) - (biggestWin.team2Total ?? 0))} games`}
                sub={`${biggestWin.team1} vs ${biggestWin.team2}`}
              />
            )}
            {highestScore.score > 0 && (
              <StatCard
                label="Highest Score"
                value={highestScore.score}
                sub={`${highestScore.team} vs ${highestScore.opp}`}
              />
            )}
          </div>
        </section>

        {/* ── STANDINGS TABLE ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Round Robin</span>
            <h2 className={styles.sectionTitle}>Final Standings</h2>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>L</th>
                  <th>Sets</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>+/−</th>
                  <th>Win %</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => (
                  <tr key={t.team} className={i < 2 ? styles.qualRow : ""}>
                    <td className={styles.posCell}>{i + 1}</td>
                    <td className={styles.nameCell}>
                      {t.team}
                      {i === 0 && <span className={styles.badge} data-type="champion">Champion</span>}
                      {i === 1 && finalMatch && <span className={styles.badge} data-type="finalist">Finalist</span>}
                    </td>
                    <td>{t.matchesPlayed}</td>
                    <td className={styles.winCell}>{t.matchesWon}</td>
                    <td className={styles.lossCell}>{t.matchesLost}</td>
                    <td className={styles.setsCell}>{t.sets}</td>
                    <td>{t.gamesFor}</td>
                    <td>{t.gamesAgainst}</td>
                    <td className={t.gameDiff >= 0 ? styles.diffPos : styles.diffNeg}>
                      {t.gameDiff > 0 ? `+${t.gameDiff}` : t.gameDiff}
                    </td>
                    <td>
                      <div className={styles.winPctCell}>
                        <span>{t.winPct}%</span>
                        <Bar value={t.winPct} max={100} color={i < 2 ? "gold" : "green"} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── GAMES FOR vs AGAINST ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Scoring</span>
            <h2 className={styles.sectionTitle}>Games For vs Against</h2>
          </div>
          <div className={styles.barsSection}>
            {teams.map((t) => (
              <div key={t.team} className={styles.barRow}>
                <div className={styles.barTeam}>{t.team}</div>
                <div className={styles.barPair}>
                  <div className={styles.barPairRow}>
                    <span className={styles.barPairLabel}>For</span>
                    <div className={styles.barTrackWide}>
                      <div className={styles.barFill} style={{ width: `${Math.round((t.gamesFor / maxGames) * 100)}%`, background: "var(--gold)" }} />
                    </div>
                    <span className={styles.barPairVal}>{t.gamesFor}</span>
                  </div>
                  <div className={styles.barPairRow}>
                    <span className={styles.barPairLabel}>Agn</span>
                    <div className={styles.barTrackWide}>
                      <div className={styles.barFill} style={{ width: `${Math.round((t.gamesAgainst / maxGames) * 100)}%`, background: "var(--red)", opacity: 0.7 }} />
                    </div>
                    <span className={styles.barPairVal}>{t.gamesAgainst}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SETS WON ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Performance</span>
            <h2 className={styles.sectionTitle}>Sets Won</h2>
          </div>
          <div className={styles.barsSection}>
            {teams.map((t) => (
              <div key={t.team} className={styles.barRow}>
                <div className={styles.barTeam}>{t.team}</div>
                <div className={styles.barSingle}>
                  <div className={styles.barTrackWide}>
                    <div className={styles.barFill} style={{ width: `${Math.round((t.sets / maxSets) * 100)}%`, background: "var(--gold)" }} />
                  </div>
                  <span className={styles.barPairVal}>{t.sets}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── GLOBAL SEED PERFORMANCE ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Doubles Pairs</span>
            <h2 className={styles.sectionTitle}>Seed Performance — All Teams</h2>
          </div>
          <div className={styles.seedGrid}>
            {globalSeedStats.map((s) => (
              <div key={s.seed} className={styles.seedCard}>
                <div className={styles.seedCardNum}>Seed {s.seed}</div>
                <div className={styles.seedCardStat}>{s.wins}</div>
                <div className={styles.seedCardLabel}>wins from {s.played} matches</div>
                <div className={styles.seedCardBar}>
                  <div className={styles.seedCardFill} style={{ width: `${s.winPct}%` }} />
                </div>
                <div className={styles.seedCardPct}>{s.winPct}% win rate</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PER-TEAM SEED BREAKDOWN ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Detailed Breakdown</span>
            <h2 className={styles.sectionTitle}>Seed Statistics by Team</h2>
          </div>

          <div className={styles.teamSeedGrid}>
            {seedsByTeam.map(({ school, seeds }) => (
              <div key={school.id} className={styles.teamSeedCard}>
                <div className={styles.teamSeedHeader}>
                  <span className={styles.teamSeedName}>{school.name}</span>
                </div>
                <div className={styles.teamSeedSeeds}>
                  {seeds.map((s) => (
                    <div key={s.seed} className={styles.seedDetail}>
                      {/* Seed header */}
                      <div className={styles.seedDetailHeader}>
                        <span className={styles.seedDetailNum}>S{s.seed}</span>
                        <span className={styles.seedDetailPlayers}>
                          {s.players.join(" & ")}
                        </span>
                        <span className={`${styles.seedDetailRecord} ${s.wins > s.losses ? styles.recordPos : s.losses > s.wins ? styles.recordNeg : ""}`}>
                          {s.wins}W – {s.losses}L
                        </span>
                      </div>

                      {/* Win rate bar */}
                      <div className={styles.seedDetailBarRow}>
                        <div className={styles.barTrackWide}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${s.winPct}%`,
                              background: s.winPct >= 60 ? "var(--green-light)"
                                : s.winPct >= 40 ? "var(--gold)"
                                : "var(--red)",
                            }}
                          />
                        </div>
                        <span className={styles.seedDetailPct}>{s.winPct}%</span>
                      </div>

                      {/* Games for/against */}
                      <div className={styles.seedDetailStats}>
                        <span className={styles.seedDetailStat}>
                          <span className={styles.seedDetailStatLbl}>GF</span>
                          <span className={styles.seedDetailStatVal}>{s.gamesFor}</span>
                        </span>
                        <span className={styles.seedDetailStat}>
                          <span className={styles.seedDetailStatLbl}>GA</span>
                          <span className={styles.seedDetailStatVal}>{s.gamesAgainst}</span>
                        </span>
                        <span className={styles.seedDetailStat}>
                          <span className={styles.seedDetailStatLbl}>+/−</span>
                          <span className={`${styles.seedDetailStatVal} ${s.gamesFor - s.gamesAgainst >= 0 ? styles.diffPos : styles.diffNeg}`}>
                            {s.gamesFor - s.gamesAgainst > 0 ? `+${s.gamesFor - s.gamesAgainst}` : s.gamesFor - s.gamesAgainst}
                          </span>
                        </span>
                        <span className={styles.seedDetailStat}>
                          <span className={styles.seedDetailStatLbl}>Played</span>
                          <span className={styles.seedDetailStatVal}>{s.played}</span>
                        </span>
                      </div>

                      {/* Match-by-match results */}
                      <div className={styles.seedMatchList}>
                        {s.matches.map((mr) => (
                          <div key={mr.matchId} className={`${styles.seedMatchRow} ${mr.won ? styles.seedMatchWon : styles.seedMatchLost}`}>
                            <span className={styles.seedMatchId}>{mr.matchId}</span>
                            <span className={styles.seedMatchOpp}>vs {mr.opponent}</span>
                            <span className={styles.seedMatchScore}>
                              <span className={mr.won ? styles.seedScoreWin : styles.seedScoreLose}>{mr.team1Games}</span>
                              <span className={styles.seedScoreDash}>–</span>
                              <span className={!mr.won ? styles.seedScoreWin : styles.seedScoreLose}>{mr.team2Games}</span>
                            </span>
                            <span className={`${styles.seedMatchResult} ${mr.won ? styles.seedResultW : styles.seedResultL}`}>
                              {mr.won ? "W" : "L"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SEED GAMES COMPARISON ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Scoring by Pair</span>
            <h2 className={styles.sectionTitle}>Games Won per Seed</h2>
          </div>
          {[1, 2, 3].map((seed) => {
            const relevant = seedStats
              .filter((s) => s.seed === seed)
              .sort((a, b) => b.gamesFor - a.gamesFor);
            return (
              <div key={seed} className={styles.seedCompareBlock}>
                <div className={styles.seedCompareTitle}>Seed {seed}</div>
                {relevant.map((s) => (
                  <div key={s.team} className={styles.barRow}>
                    <div className={styles.barTeam}>
                      <div className={styles.barTeamName}>{s.team}</div>
                      <div className={styles.barTeamPlayers}>{s.players.join(" & ")}</div>
                    </div>
                    <div className={styles.barPair}>
                      <div className={styles.barPairRow}>
                        <span className={styles.barPairLabel}>For</span>
                        <div className={styles.barTrackWide}>
                          <div className={styles.barFill} style={{ width: `${Math.round((s.gamesFor / maxSeedGames) * 100)}%`, background: "var(--gold)" }} />
                        </div>
                        <span className={styles.barPairVal}>{s.gamesFor}</span>
                      </div>
                      <div className={styles.barPairRow}>
                        <span className={styles.barPairLabel}>Agn</span>
                        <div className={styles.barTrackWide}>
                          <div className={styles.barFill} style={{ width: `${Math.round((s.gamesAgainst / maxSeedGames) * 100)}%`, background: "var(--red)", opacity: 0.7 }} />
                        </div>
                        <span className={styles.barPairVal}>{s.gamesAgainst}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </section>

        {/* ── ALL MATCHES ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Full Results</span>
            <h2 className={styles.sectionTitle}>All Matches</h2>
          </div>
          <div className={styles.allMatches}>
            {matches
              .filter((m) => m.status === "complete")
              .map((m) => {
                const t1w = (m.team1Total ?? 0) > (m.team2Total ?? 0);
                const t2w = (m.team2Total ?? 0) > (m.team1Total ?? 0);
                return (
                  <div key={m.matchId} className={`${styles.resultRow} ${m.phase === "final" ? styles.resultRowFinal : ""}`}>
                    <span className={styles.resultId}>{m.matchId}</span>
                    <span className={`${styles.resultTeam} ${t1w ? styles.resultWinner : ""}`}>{m.team1}</span>
                    <div className={styles.resultScore}>
                      <span className={t1w ? styles.scoreWin : styles.scoreLose}>{m.team1Total ?? "–"}</span>
                      <span className={styles.scoreDash}>–</span>
                      <span className={t2w ? styles.scoreWin : styles.scoreLose}>{m.team2Total ?? "–"}</span>
                    </div>
                    <span className={`${styles.resultTeam} ${styles.resultTeamRight} ${t2w ? styles.resultWinner : ""}`}>{m.team2}</span>
                    <div className={styles.resultSeeds}>
                      {m.seedScores.map((s) => (
                        <span key={s.seed} className={styles.resultSeed}>
                          <span className={styles.resultSeedLbl}>S{s.seed}</span>
                          <span className={(s.team1Games ?? 0) > (s.team2Games ?? 0) ? styles.seedW : styles.seedL}>{s.team1Games ?? "–"}</span>
                          <span className={styles.seedDash}>–</span>
                          <span className={(s.team2Games ?? 0) > (s.team1Games ?? 0) ? styles.seedW : styles.seedL}>{s.team2Games ?? "–"}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

      </div>
    </main>
  );
}
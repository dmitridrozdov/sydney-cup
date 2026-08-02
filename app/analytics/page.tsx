"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navigation from "@/components/Navigation";
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
  setWinPct: number;
}

// ── Helpers ──────────────────────────────────────────────────────────
function pct(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

function Bar({ value, max, gold = false }: { value: number; max: number; gold?: boolean }) {
  const w = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className={styles.barTrack}>
      <div
        className={gold ? styles.barFillGold : styles.barFill}
        style={{ width: `${w}%` }}
      />
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
      matchesPlayed: 0, gamesFor: 0, gamesAgainst: 0, gameDiff: 0,
      winPct: 0, setWinPct: 0,
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
    setWinPct: pct(s.sets, s.matchesPlayed * 3),
  })).sort((a, b) => b.sets - a.sets || b.gamesFor - a.gamesFor);

  // ── Aggregate stats ───────────────────────────────────────────────
  const totalGames = groupMatches.reduce(
    (s, m) => s + (m.team1Total ?? 0) + (m.team2Total ?? 0), 0
  );
  const avgGamesPerMatch = groupMatches.length
    ? Math.round(totalGames / groupMatches.length) : 0;

  const closestMatch = [...groupMatches].sort((a, b) => {
    const da = Math.abs((a.team1Total ?? 0) - (a.team2Total ?? 0));
    const db = Math.abs((b.team1Total ?? 0) - (b.team2Total ?? 0));
    return da - db;
  })[0];

  const biggestWin = [...groupMatches].sort((a, b) => {
    const da = Math.abs((a.team1Total ?? 0) - (a.team2Total ?? 0));
    const db = Math.abs((b.team1Total ?? 0) - (b.team2Total ?? 0));
    return db - da;
  })[0];

  const highestScore = [...groupMatches].reduce((best, m) => {
    const t1 = m.team1Total ?? 0; const t2 = m.team2Total ?? 0;
    if (t1 > best.score) return { score: t1, team: m.team1, opp: m.team2, matchId: m.matchId };
    if (t2 > best.score) return { score: t2, team: m.team2, opp: m.team1, matchId: m.matchId };
    return best;
  }, { score: 0, team: "", opp: "", matchId: "" });

  // Per-seed performance across all matches
  const seedTotals = [1, 2, 3].map((seed) => {
    let wins = 0; let played = 0;
    for (const m of groupMatches) {
      const s = m.seedScores.find((x) => x.seed === seed);
      if (s?.team1Games !== undefined && s?.team2Games !== undefined) {
        played++;
        if (s.team1Games > s.team2Games) wins++;
        else if (s.team2Games > s.team1Games) wins++;
      }
    }
    const t1wins = groupMatches.reduce((n, m) => {
      const s = m.seedScores.find((x) => x.seed === seed);
      return n + (s?.team1Games !== undefined && s.team1Games > (s.team2Games ?? 0) ? 1 : 0);
    }, 0);
    return { seed, played, wins: t1wins, totalPlayed: played };
  });

  // Champion
  const champion = finalMatch
    ? ((finalMatch.team1Total ?? 0) > (finalMatch.team2Total ?? 0)
      ? finalMatch.team1 : finalMatch.team2)
    : teams[0]?.team ?? "TBD";

  const runnerUp = finalMatch
    ? ((finalMatch.team1Total ?? 0) > (finalMatch.team2Total ?? 0)
      ? finalMatch.team2 : finalMatch.team1)
    : teams[1]?.team ?? "TBD";

  const maxGames = Math.max(...teams.map((t) => t.gamesFor));
  const maxSets  = Math.max(...teams.map((t) => t.sets));

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
                        <Bar value={t.winPct} max={100} gold={i < 2} />
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
                      <div className={styles.barFillGold} style={{ width: `${Math.round((t.gamesFor / maxGames) * 100)}%` }} />
                    </div>
                    <span className={styles.barPairVal}>{t.gamesFor}</span>
                  </div>
                  <div className={styles.barPairRow}>
                    <span className={styles.barPairLabel}>Agn</span>
                    <div className={styles.barTrackWide}>
                      <div className={styles.barFillRed} style={{ width: `${Math.round((t.gamesAgainst / maxGames) * 100)}%` }} />
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
                    <div className={styles.barFillGold} style={{ width: `${Math.round((t.sets / maxSets) * 100)}%` }} />
                  </div>
                  <span className={styles.barPairVal}>{t.sets}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SEED ANALYSIS ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Doubles Pairs</span>
            <h2 className={styles.sectionTitle}>Seed Performance</h2>
          </div>
          <div className={styles.seedGrid}>
            {seedTotals.map((s) => (
              <div key={s.seed} className={styles.seedCard}>
                <div className={styles.seedCardNum}>Seed {s.seed}</div>
                <div className={styles.seedCardStat}>{s.wins}</div>
                <div className={styles.seedCardLabel}>wins from {s.totalPlayed} matches</div>
                <div className={styles.seedCardBar}>
                  <div
                    className={styles.seedCardFill}
                    style={{ width: `${pct(s.wins, s.totalPlayed)}%` }}
                  />
                </div>
                <div className={styles.seedCardPct}>{pct(s.wins, s.totalPlayed)}% win rate</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MATCH BY MATCH ── */}
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
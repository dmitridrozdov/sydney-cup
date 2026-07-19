"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navigation from "@/components/Navigation";
import playersData from "@/data/players.json";
import styles from "./competition.module.css";

const ROUNDS = [
  { key: "round1", label: "Round 1", time: "8:00 AM – 8:25 AM",   bye: "Royal Blues" },
  { key: "round2", label: "Round 2", time: "8:35 AM – 9:00 AM",   bye: "Combined" },
  { key: "round3", label: "Round 3", time: "9:10 AM – 9:35 AM",   bye: "Trinity" },
  { key: "round4", label: "Round 4", time: "9:45 AM – 10:10 AM",  bye: "Joes" },
  { key: "round5", label: "Round 5", time: "10:20 AM – 10:45 AM", bye: "Royal Golds" },
  { key: "round6", label: "Round 6", time: "10:55 AM – 11:20 AM", bye: "Ananda" },
  { key: "round7", label: "Round 7", time: "11:30 AM – 11:55 AM", bye: "STC" },
];

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={styles.statusDot}
      data-status={status}
      title={status}
    />
  );
}

export default function CompetitionPage() {
  const matches  = useQuery(api.matches.getAll);
  const standings = useQuery(api.matches.getStandings);

  const bySlot = (slot: string) =>
    (matches ?? []).filter((m) => m.timeSlot === slot);

  const finals = (matches ?? []).filter((m) => m.phase === "final");

  return (
    <main className={styles.main}>
      <Navigation />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.bgGrid} />
        <div className={styles.heroInner}>
          <div className={styles.editionBadge}>
            <span className={styles.editionLine} />
            <span className={styles.editionText}>Sydney Cup 3.0 · Live</span>
            <span className={styles.editionLine} />
          </div>
          <h1 className={styles.heroTitle}>
            Competition <span className={styles.goldText}>Draw</span>
          </h1>
          <p className={styles.heroSub}>Doubles Tennis Championship · August 2, 2026</p>
          <div className={styles.liveTag}>
            <span className={styles.livePulse} />
            Live Results
          </div>
        </div>
      </section>

      <div className={styles.content}>

        {/* ── PLAYERS ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Registered Teams</span>
            <h2 className={styles.sectionTitle}>Players</h2>
          </div>
          <div className={styles.playersGrid}>
            {playersData.schools.map((school) => (
              <div key={school.id} className={styles.schoolCard}>
                <div className={styles.schoolHeader}>
                  <span className={styles.schoolName}>{school.name}</span>
                </div>
                <div className={styles.seedList}>
                  {school.seeds.map((s) => (
                    <div key={s.seed} className={styles.seedItem}>
                      <span className={styles.seedNum}>S{s.seed}</span>
                      <div className={styles.playerNames}>
                        {s.players.map((p, i) => (
                          <span key={i} className={styles.playerName}>{p}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STANDINGS ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Round Robin</span>
            <h2 className={styles.sectionTitle}>Standings</h2>
          </div>
          <div className={styles.standingCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Sets</th>
                  <th>Games</th>
                  <th>W</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(standings ?? {})
                  .sort(([, a], [, b]) => b.sets - a.sets || b.games - a.games)
                  .map(([team, s], i) => (
                    <tr key={team} className={i < 2 ? styles.qualifiedRow : ""}>
                      <td className={styles.posCell}>{i + 1}</td>
                      <td className={styles.teamCell}>
                        {team}
                        {i < 2 && <span className={styles.qualBadge}>Final</span>}
                      </td>
                      <td className={styles.gamesCell}>{s.sets}</td>
                      <td className={styles.gamesCell}>{s.games}</td>
                      <td className={styles.gamesCell}>{s.matchesWon}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── MATCH SCHEDULE ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Round Robin</span>
            <h2 className={styles.sectionTitle}>Match Schedule</h2>
          </div>

          {matches === undefined && (
            <div className={styles.loading}>Loading live results…</div>
          )}

          {ROUNDS.map((round) => (
            <div key={round.key} className={styles.slotBlock}>
              <div className={styles.slotHeader}>
                <span className={styles.slotName}>{round.label}</span>
                <div className={styles.slotRight}>
                  <span className={styles.byeTag}>Bye: {round.bye}</span>
                  <span className={styles.slotTime}>{round.time}</span>
                </div>
              </div>
              <div className={styles.matchList}>
                {bySlot(round.key).map((m) => {
                  const t1w = (m.team1Total ?? 0) > (m.team2Total ?? 0);
                  const t2w = (m.team2Total ?? 0) > (m.team1Total ?? 0);
                  return (
                    <div key={m.matchId} className={styles.matchRow}>
                      <span className={styles.matchId}>{m.matchId}</span>
                      <div className={styles.matchMain}>
                        <div className={styles.matchTeams}>
                          <span className={`${styles.teamName} ${t1w && m.status === "complete" ? styles.winner : ""}`}>
                            {m.team1}
                          </span>
                          <div className={styles.scoreBox}>
                            {m.status === "pending" ? (
                              <span className={styles.scorePending}>vs</span>
                            ) : (
                              <>
                                <span className={t1w ? styles.scoreWin : styles.scoreLose}>
                                  {m.team1Total ?? "–"}
                                </span>
                                <span className={styles.scoreDash}>–</span>
                                <span className={t2w ? styles.scoreWin : styles.scoreLose}>
                                  {m.team2Total ?? "–"}
                                </span>
                              </>
                            )}
                          </div>
                          <span className={`${styles.teamName} ${styles.teamRight} ${t2w && m.status === "complete" ? styles.winner : ""}`}>
                            {m.team2}
                          </span>
                        </div>
                        {m.status !== "pending" && (
                          <div className={styles.seedRow}>
                            {m.seedScores.map((s) => {
                              const s1w = (s.team1Games ?? 0) > (s.team2Games ?? 0);
                              const s2w = (s.team2Games ?? 0) > (s.team1Games ?? 0);
                              return (
                                <span key={s.seed} className={styles.seedScore}>
                                  <span className={styles.seedLabel}>S{s.seed}</span>
                                  <span className={s1w ? styles.seedWin : styles.seedDim}>
                                    {s.team1Games ?? "–"}
                                  </span>
                                  <span className={styles.seedSep}>–</span>
                                  <span className={s2w ? styles.seedWin : styles.seedDim}>
                                    {s.team2Games ?? "–"}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className={styles.matchMeta}>
                        <StatusDot status={m.status} />
                        <span className={styles.courts}>Cts {m.courts}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* ── FINAL ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Knockout</span>
            <h2 className={styles.sectionTitle}>Grand Final</h2>
          </div>

          {finals.length > 0 && (
            <div className={`${styles.slotBlock} ${styles.finalBlock}`}>
              <div className={styles.slotHeader}>
                <span className={`${styles.slotName} ${styles.finalLabel}`}>Grand Final</span>
                <span className={styles.slotTime}>12:05 PM – 12:30 PM</span>
              </div>
              <div className={styles.matchList}>
                {finals.map((m) => {
                  const t1w = (m.team1Total ?? 0) > (m.team2Total ?? 0);
                  const t2w = (m.team2Total ?? 0) > (m.team1Total ?? 0);
                  return (
                    <div key={m.matchId} className={`${styles.matchRow} ${styles.finalRow}`}>
                      <span className={styles.matchId}>{m.matchId}</span>
                      <div className={styles.matchMain}>
                        <div className={styles.matchTeams}>
                          <span className={`${styles.teamName} ${t1w && m.status === "complete" ? styles.winner : ""}`}>
                            {m.team1}
                          </span>
                          <div className={styles.scoreBox}>
                            {m.status === "pending" ? (
                              <span className={styles.scorePending}>vs</span>
                            ) : (
                              <>
                                <span className={t1w ? styles.scoreWin : styles.scoreLose}>
                                  {m.team1Total ?? "–"}
                                </span>
                                <span className={styles.scoreDash}>–</span>
                                <span className={t2w ? styles.scoreWin : styles.scoreLose}>
                                  {m.team2Total ?? "–"}
                                </span>
                              </>
                            )}
                          </div>
                          <span className={`${styles.teamName} ${styles.teamRight} ${t2w && m.status === "complete" ? styles.winner : ""}`}>
                            {m.team2}
                          </span>
                        </div>
                        {m.status !== "pending" && (
                          <div className={styles.seedRow}>
                            {m.seedScores.map((s) => {
                              const s1w = (s.team1Games ?? 0) > (s.team2Games ?? 0);
                              const s2w = (s.team2Games ?? 0) > (s.team1Games ?? 0);
                              return (
                                <span key={s.seed} className={styles.seedScore}>
                                  <span className={styles.seedLabel}>S{s.seed}</span>
                                  <span className={s1w ? styles.seedWin : styles.seedDim}>
                                    {s.team1Games ?? "–"}
                                  </span>
                                  <span className={styles.seedSep}>–</span>
                                  <span className={s2w ? styles.seedWin : styles.seedDim}>
                                    {s.team2Games ?? "–"}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <StatusDot status={m.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
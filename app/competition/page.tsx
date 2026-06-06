"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navigation from "@/components/Navigation";
import playersData from "@/data/players.json";
import styles from "./competition.module.css";

const TIME_SLOTS = [
  { key: "slot1", label: "Time Slot 1", time: "8:00 AM – 8:25 AM" },
  { key: "slot2", label: "Time Slot 2", time: "8:35 AM – 9:00 AM" },
  { key: "slot3", label: "Time Slot 3", time: "9:10 AM – 9:35 AM" },
  { key: "slot4", label: "Time Slot 4", time: "9:45 AM – 10:10 AM" },
  { key: "slot5", label: "Time Slot 5", time: "10:20 AM – 10:45 AM" },
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
  const matches = useQuery(api.matches.getAll);
  const standings = useQuery(api.matches.getStandings);

  const bySlot = (slot: string) =>
    (matches ?? []).filter((m) => m.timeSlot === slot);

  const semis  = (matches ?? []).filter((m) => m.phase === "semis");
  const finals = (matches ?? []).filter((m) => m.phase === "final");

  const BLUE_GROUP = ["Royal Blues", "STC", "Hindu Blues", "Joes", "Hartley"];
  const GOLD_GROUP = ["Ananda", "Combined", "Royal Golds", "Trinity", "Hindu Golds"];

  function StandingsTable({ teams, label, color }: { teams: string[]; label: string; color: string }) {
    const rows = teams
      .map((t) => ({ team: t, games: standings?.[t] ?? 0 }))
      .sort((a, b) => b.games - a.games);

    return (
      <div className={styles.standingCard}>
        <div className={styles.groupHeader}>
          <span className={styles.groupPip} style={{ background: color }} />
          <span className={styles.groupName}>{label}</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Games</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.team} className={i < 2 ? styles.qualifiedRow : ""}>
                <td className={styles.posCell}>{i + 1}</td>
                <td className={styles.teamCell}>{r.team}</td>
                <td className={styles.gamesCell}>{r.games || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

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
                  <span
                    className={styles.groupPip}
                    data-group={school.group}
                  />
                  <span className={styles.schoolName}>{school.name}</span>
                  <span className={styles.groupTag}>{school.group} group</span>
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

        {/* ── GROUP STAGE ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Group Stage</span>
            <h2 className={styles.sectionTitle}>Match Schedule</h2>
          </div>

          {matches === undefined && (
            <div className={styles.loading}>Loading live results…</div>
          )}

          {TIME_SLOTS.map((slot) => (
            <div key={slot.key} className={styles.slotBlock}>
              <div className={styles.slotHeader}>
                <span className={styles.slotName}>{slot.label}</span>
                <span className={styles.slotTime}>{slot.time}</span>
              </div>
              <div className={styles.matchList}>
                {bySlot(slot.key).length === 0 && matches !== undefined && (
                  <div className={styles.noMatches}>Schedule loading…</div>
                )}
                {bySlot(slot.key).map((m) => {
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

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Group Stage</span>
            <h2 className={styles.sectionTitle}>Standings</h2>
          </div>
          <div className={styles.standingsGrid}>
            <StandingsTable
              teams={BLUE_GROUP}
              label="Blue Group"
              color="#3b6fd4"
            />
            <StandingsTable
              teams={GOLD_GROUP}
              label="Gold Group"
              color="#b8952a"
            />
          </div>
        </section>

        {/* ── KNOCKOUTS ── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Knockouts</span>
            <h2 className={styles.sectionTitle}>Semifinals & Final</h2>
          </div>

          {semis.length > 0 && (
            <div className={styles.slotBlock}>
              <div className={styles.slotHeader}>
                <span className={styles.slotName}>Semifinals</span>
                <span className={styles.slotTime}>11:00 AM – 11:25 AM</span>
              </div>
              <div className={styles.matchList}>
                {semis.map((m) => {
                  const t1w = (m.team1Total ?? 0) > (m.team2Total ?? 0);
                  const t2w = (m.team2Total ?? 0) > (m.team1Total ?? 0);
                  return (
                    <div key={m.matchId} className={styles.matchRow}>
                      <span className={styles.matchId}>{m.matchId}</span>
                      <div className={styles.matchMain}>
                        <div className={styles.matchTeams}>
                          <span className={`${styles.teamName} ${t1w && m.status === "complete" ? styles.winner : ""}`}>{m.team1}</span>
                          <div className={styles.scoreBox}>
                            {m.status === "pending" ? (
                              <span className={styles.scorePending}>vs</span>
                            ) : (
                              <>
                                <span className={t1w ? styles.scoreWin : styles.scoreLose}>{m.team1Total ?? "–"}</span>
                                <span className={styles.scoreDash}>–</span>
                                <span className={t2w ? styles.scoreWin : styles.scoreLose}>{m.team2Total ?? "–"}</span>
                              </>
                            )}
                          </div>
                          <span className={`${styles.teamName} ${styles.teamRight} ${t2w && m.status === "complete" ? styles.winner : ""}`}>{m.team2}</span>
                        </div>
                        {m.status !== "pending" && (
                          <div className={styles.seedRow}>
                            {m.seedScores.map((s) => {
                              const s1w = (s.team1Games ?? 0) > (s.team2Games ?? 0);
                              const s2w = (s.team2Games ?? 0) > (s.team1Games ?? 0);
                              return (
                                <span key={s.seed} className={styles.seedScore}>
                                  <span className={styles.seedLabel}>S{s.seed}</span>
                                  <span className={s1w ? styles.seedWin : styles.seedDim}>{s.team1Games ?? "–"}</span>
                                  <span className={styles.seedSep}>–</span>
                                  <span className={s2w ? styles.seedWin : styles.seedDim}>{s.team2Games ?? "–"}</span>
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
          )}

          {finals.length > 0 && (
            <div className={`${styles.slotBlock} ${styles.finalBlock}`}>
              <div className={styles.slotHeader}>
                <span className={`${styles.slotName} ${styles.finalLabel}`}>Grand Final</span>
                <span className={styles.slotTime}>11:35 AM – 12:00 PM</span>
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
                          <span className={`${styles.teamName} ${t1w && m.status === "complete" ? styles.winner : ""}`}>{m.team1}</span>
                          <div className={styles.scoreBox}>
                            {m.status === "pending" ? (
                              <span className={styles.scorePending}>vs</span>
                            ) : (
                              <>
                                <span className={t1w ? styles.scoreWin : styles.scoreLose}>{m.team1Total ?? "–"}</span>
                                <span className={styles.scoreDash}>–</span>
                                <span className={t2w ? styles.scoreWin : styles.scoreLose}>{m.team2Total ?? "–"}</span>
                              </>
                            )}
                          </div>
                          <span className={`${styles.teamName} ${styles.teamRight} ${t2w && m.status === "complete" ? styles.winner : ""}`}>{m.team2}</span>
                        </div>
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

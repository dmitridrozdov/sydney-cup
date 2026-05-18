import Navigation from "@/components/Navigation";
import styles from "./sydney-cup-2.module.css";
import Link from "next/link";

export const metadata = {
  title: "Sydney Cup 2.0 — Results & Scoresheet",
  description: "Full results, standings, and match scores from Sydney Cup 2.0 — 2025.",
};

const blueGroup = [
  { pos: 1, team: "Royal Blues", games: 77, outcome: "Winner" },
  { pos: 2, team: "STC",         games: 53, outcome: "2nd Place" },
  { pos: 3, team: "Hindu Blues", games: 46, outcome: null },
  { pos: 4, team: "Hartley",     games: 42, outcome: null },
  { pos: 5, team: "Joes",        games: 22, outcome: null },
];

const goldGroup = [
  { pos: 1, team: "Ananda",      games: 58, outcome: "Winner" },
  { pos: 2, team: "Combined",    games: 52, outcome: "2nd Place" },
  { pos: 3, team: "Royal Golds", games: 48, outcome: null },
  { pos: 4, team: "Trinity",     games: 43, outcome: null },
  { pos: 5, team: "Hindu Golds", games: 39, outcome: null },
];

const timeSlots = [
  {
    slot: "Time Slot 1", time: "8:00 AM – 8:25 AM",
    matches: [
      { id: "A1", t1: "Royal Blues", t2: "Hartley",     courts: "1, 2, 3", g1: 18, g2: 6,  seeds: [[2,6],[8,0],[8,0]] },
      { id: "A2", t1: "Joes",        t2: "STC",         courts: "4, 5, 6", g1: 5,  g2: 19, seeds: [[0,8],[1,7],[4,4]] },
      { id: "B1", t1: "Royal Golds", t2: "Trinity",     courts: "7, 8, 9", g1: 13, g2: 11, seeds: [[3,5],[4,4],[6,2]] },
      { id: "B2", t1: "Hindu Golds", t2: "Ananda",      courts: "10–12",   g1: 10, g2: 14, seeds: [[4,4],[6,2],[0,8]] },
    ],
  },
  {
    slot: "Time Slot 2", time: "8:35 AM – 9:00 AM",
    matches: [
      { id: "A3", t1: "Hindu Blues", t2: "Joes",        courts: "1, 2, 3", g1: 14, g2: 10, seeds: [[3,5],[5,3],[6,2]] },
      { id: "A4", t1: "Hartley",     t2: "STC",         courts: "4, 5, 6", g1: 8,  g2: 16, seeds: [[0,8],[3,5],[5,3]] },
      { id: "B3", t1: "Ananda",      t2: "Trinity",     courts: "7, 8, 9", g1: 11, g2: 13, seeds: [[3,5],[1,7],[7,1]] },
      { id: "B4", t1: "Combined",    t2: "Royal Golds", courts: "10–12",   g1: 12, g2: 12, seeds: [[4,4],[3,5],[5,3]] },
    ],
  },
  {
    slot: "Time Slot 3", time: "9:10 AM – 9:35 AM",
    matches: [
      { id: "A5", t1: "Royal Blues", t2: "Hindu Blues", courts: "1, 2, 3", g1: 20, g2: 4,  seeds: [[6,2],[7,1],[7,1]] },
      { id: "A6", t1: "Joes",        t2: "Hartley",     courts: "4, 5, 6", g1: 6,  g2: 18, seeds: [[5,3],[1,7],[0,8]] },
      { id: "B5", t1: "Royal Golds", t2: "Hindu Golds", courts: "7, 8, 9", g1: 16, g2: 8,  seeds: [[7,1],[4,4],[5,3]] },
      { id: "B6", t1: "Trinity",     t2: "Combined",    courts: "10–12",   g1: 6,  g2: 18, seeds: [[2,6],[4,4],[0,8]] },
    ],
  },
  {
    slot: "Time Slot 4", time: "9:45 AM – 10:10 AM",
    matches: [
      { id: "A7", t1: "Royal Blues", t2: "Joes",        courts: "1, 2, 3", g1: 23, g2: 1,  seeds: [[8,0],[8,0],[7,1]] },
      { id: "A8", t1: "Hindu Blues", t2: "STC",         courts: "4, 5, 6", g1: 14, g2: 10, seeds: [[1,7],[6,2],[7,1]] },
      { id: "B7", t1: "Hindu Golds", t2: "Combined",    courts: "7, 8, 9", g1: 10, g2: 14, seeds: [[1,7],[7,1],[2,6]] },
      { id: "B8", t1: "Royal Golds", t2: "Ananda",      courts: "10–12",   g1: 7,  g2: 17, seeds: [[5,3],[0,8],[2,6]] },
    ],
  },
  {
    slot: "Time Slot 5", time: "10:20 AM – 10:45 AM",
    matches: [
      { id: "A9",  t1: "Royal Blues", t2: "STC",      courts: "1, 2, 3", g1: 16, g2: 8,  seeds: [[3,5],[6,2],[7,1]] },
      { id: "A10", t1: "Hindu Blues", t2: "Hartley",  courts: "4, 5, 6", g1: 14, g2: 10, seeds: [[5,3],[4,4],[5,3]] },
      { id: "B9",  t1: "Hindu Golds", t2: "Trinity",  courts: "7, 8, 9", g1: 11, g2: 13, seeds: [[5,3],[5,3],[1,7]] },
      { id: "B10", t1: "Ananda",      t2: "Combined", courts: "10–12",   g1: 16, g2: 8,  seeds: [[2,6],[8,0],[6,2]] },
    ],
  },
];

const semis = [
  { id: "SF1", t1: "Royal Blues", t2: "Combined", courts: "1, 2, 3", g1: 18, g2: 2,  seeds: [[6,2],[8,0],[4,0]] },
  { id: "SF2", t1: "Ananda",      t2: "STC",      courts: "4, 5, 6", g1: 8,  g2: 16, seeds: [[0,8],[5,3],[3,5]] },
];

const final = { id: "Final", t1: "Royal Blues", t2: "STC", courts: "1, 2, 3", g1: 16, g2: 8, seeds: [[1,7],[7,1],[8,0]] };

export default function SydneyCup2() {
  return (
    <main className={styles.main}>
      <Navigation />

      <section className={styles.hero}>
        <div className={styles.bgGrid} />
        <div className={styles.bgOrb} />
        <div className={styles.heroInner}>
          <Link href="/" className={styles.backLink}>← Sydney Cup 3.0</Link>
          <div className={styles.editionBadge}>
            <span className={styles.editionLine} />
            <span className={styles.editionText}>Past Edition · 2025</span>
            <span className={styles.editionLine} />
          </div>
          <h1 className={styles.heroTitle}>Sydney Cup <span className={styles.goldText}>2.0</span></h1>
          <p className={styles.heroSub}>Doubles Tennis Championship</p>
          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Format</span>
              <span className={styles.metaValue}>Best of 8 doubles · Sudden death deuce</span>
            </div>
            <div className={styles.metaDot} />
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Duration</span>
              <span className={styles.metaValue}>25 min per match</span>
            </div>
            <div className={styles.metaDot} />
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Courts</span>
              <span className={styles.metaValue}>12 courts · 4 matches per slot</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>

        {/* CHAMPION */}
        <section className={styles.championBanner}>
          <div className={styles.championLeft}>
            <span className={styles.champLabel}>Champion</span>
            <div className={styles.champName}>Royal Blues</div>
          </div>
          <svg className={styles.champTrophy} viewBox="0 0 60 70" fill="none">
            <path d="M15 6h30v21c0 11-6 18-15 20C21 45 15 38 15 27V6z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M15 10H6c0 9 4 15 9 17" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M45 10h9c0 9-4 15-9 17" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <rect x="24" y="47" width="12" height="3" rx="0.5" fill="currentColor" opacity="0.8"/>
            <rect x="19" y="50" width="22" height="4" rx="1" fill="currentColor"/>
            <path d="M30 20l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z" fill="currentColor"/>
          </svg>
          <div className={styles.championRight}>
            <span className={styles.champLabel}>Runner Up</span>
            <div className={styles.champRunnerUp}>STC</div>
          </div>
        </section>

        {/* STANDINGS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Group Stage</span>
            <h2 className={styles.sectionTitle}>Final Standings</h2>
          </div>
          <div className={styles.standingsGrid}>
            {[
              { name: "Blue Group", color: "#3b6fd4", rows: blueGroup },
              { name: "Gold Group", color: "#b8952a", rows: goldGroup },
            ].map(({ name, color, rows }) => (
              <div key={name} className={styles.standingCard}>
                <div className={styles.groupHeader}>
                  <span className={styles.groupDot} style={{ background: color }} />
                  <span className={styles.groupName}>{name}</span>
                </div>
                <table className={styles.table}>
                  <thead>
                    <tr><th>#</th><th>Team</th><th>Games</th><th></th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.team} className={r.outcome ? styles.qualifiedRow : ""}>
                        <td className={styles.posCell}>{r.pos}</td>
                        <td className={styles.teamCell}>{r.team}</td>
                        <td className={styles.gamesCell}>{r.games}</td>
                        <td className={styles.outcomeCell}>
                          {r.outcome === "Winner"   && <span className={styles.badgeWinner}>Winner</span>}
                          {r.outcome === "2nd Place" && <span className={styles.badge2nd}>2nd</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* MATCHES */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Group Stage</span>
            <h2 className={styles.sectionTitle}>Match Results</h2>
          </div>
          {timeSlots.map((slot) => (
            <div key={slot.slot} className={styles.slotBlock}>
              <div className={styles.slotHeader}>
                <span className={styles.slotName}>{slot.slot}</span>
                <span className={styles.slotTime}>{slot.time}</span>
              </div>
              <div className={styles.matchList}>
                {slot.matches.map((m) => {
                  const t1w = m.g1 > m.g2;
                  const draw = m.g1 === m.g2;
                  return (
                    <div key={m.id} className={styles.matchRow}>
                      <span className={styles.matchId}>{m.id}</span>
                      <div className={styles.matchMain}>
                        <div className={styles.matchTeams}>
                          <span className={`${styles.teamName} ${t1w && !draw ? styles.winner : ""}`}>{m.t1}</span>
                          <div className={styles.scoreBox}>
                            <span className={t1w && !draw ? styles.scoreWin : styles.scoreLose}>{m.g1}</span>
                            <span className={styles.scoreDash}>–</span>
                            <span className={!t1w && !draw ? styles.scoreWin : styles.scoreLose}>{m.g2}</span>
                          </div>
                          <span className={`${styles.teamName} ${styles.teamRight} ${!t1w && !draw ? styles.winner : ""}`}>{m.t2}</span>
                        </div>
                        <div className={styles.seedRow}>
                          {m.seeds.map((s, i) => (
                            <span key={i} className={styles.seedScore}>
                              <span className={styles.seedLabel}>S{i + 1}</span>
                              <span className={s[0] > s[1] ? styles.seedWin : styles.seedDim}>{s[0]}</span>
                              <span className={styles.seedSep}>–</span>
                              <span className={s[1] > s[0] ? styles.seedWin : styles.seedDim}>{s[1]}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={styles.courts}>Courts {m.courts}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* KNOCKOUTS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Knockouts</span>
            <h2 className={styles.sectionTitle}>Semifinals & Final</h2>
          </div>
          <div className={styles.slotBlock}>
            <div className={styles.slotHeader}>
              <span className={styles.slotName}>Semifinals</span>
              <span className={styles.slotTime}>11:00 AM – 11:25 AM</span>
            </div>
            <div className={styles.matchList}>
              {semis.map((m) => {
                const t1w = m.g1 > m.g2;
                return (
                  <div key={m.id} className={styles.matchRow}>
                    <span className={styles.matchId}>{m.id}</span>
                    <span className={`${styles.teamName} ${t1w ? styles.winner : ""}`}>{m.t1}</span>
                    <div className={styles.scoreBox}>
                      <span className={t1w ? styles.scoreWin : styles.scoreLose}>{m.g1}</span>
                      <span className={styles.scoreDash}>–</span>
                      <span className={!t1w ? styles.scoreWin : styles.scoreLose}>{m.g2}</span>
                    </div>
                    <span className={`${styles.teamName} ${styles.teamRight} ${!t1w ? styles.winner : ""}`}>{m.t2}</span>
                    <span className={styles.courts}>Courts {m.courts}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`${styles.slotBlock} ${styles.finalBlock}`}>
            <div className={styles.slotHeader}>
              <span className={`${styles.slotName} ${styles.finalLabel}`}>Grand Final</span>
              <span className={styles.slotTime}>11:35 AM – 12:00 PM</span>
            </div>
            <div className={styles.matchList}>
              <div className={`${styles.matchRow} ${styles.finalRow}`}>
                <span className={styles.matchId}>{final.id}</span>
                <span className={`${styles.teamName} ${styles.winner}`}>{final.t1}</span>
                <div className={styles.scoreBox}>
                  <span className={styles.scoreWin}>{final.g1}</span>
                  <span className={styles.scoreDash}>–</span>
                  <span className={styles.scoreLose}>{final.g2}</span>
                </div>
                <span className={`${styles.teamName} ${styles.teamRight}`}>{final.t2}</span>
                <span className={styles.courts}>Courts {final.courts}</span>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.footerLine}>
          <Link href="/" className={styles.footerBack}>← Back to Sydney Cup 3.0</Link>
          <span className={styles.footerText}>Sydney Cup 2.0 · 2025 · Parramatta City Tennis</span>
        </div>

      </div>
    </main>
  );
}

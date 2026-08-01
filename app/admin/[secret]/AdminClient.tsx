"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import styles from "./admin.module.css";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "sc2026";

const ROUNDS = [
  { key: "round1", label: "Round 1", time: "8:00 AM – 8:25 AM",   bye: "Royal Blues" },
  { key: "round2", label: "Round 2", time: "8:35 AM – 9:00 AM",   bye: "Combined" },
  { key: "round3", label: "Round 3", time: "9:10 AM – 9:35 AM",   bye: "Trinity" },
  { key: "round4", label: "Round 4", time: "9:45 AM – 10:10 AM",  bye: "Joes" },
  { key: "round5", label: "Round 5", time: "10:20 AM – 10:45 AM", bye: "Royal Golds" },
  { key: "round6", label: "Round 6", time: "10:55 AM – 11:20 AM", bye: "Ananda" },
  { key: "round7", label: "Round 7", time: "11:30 AM – 11:55 AM", bye: "STC" },
];

type Props = { secret: string };

export default function AdminClient({ secret }: Props) {
  const matches     = useQuery(api.matches.getAll);
  const seedMatches  = useMutation(api.matches.seedMatches);
  const resetMatches = useMutation(api.matches.resetMatches);
  const updateScore  = useMutation(api.matches.updateSeedScore);
  const updateStatus = useMutation(api.matches.updateStatus);
  const updateTeams  = useMutation(api.matches.updateTeamNames);
  const setFinalTeams = useMutation(api.matches.setFinalTeamsFromStandings);

  const [seeding, setSeeding] = useState(false);
  const [saving,  setSaving]  = useState<string | null>(null);
  const [edits,   setEdits]   = useState<Record<string, Record<number, [string, string]>>>({});
  const [teamEdits, setTeamEdits] = useState<Record<string, [string, string]>>({});
  const [msg, setMsg] = useState("");

  if (secret !== ADMIN_SECRET) {
    return (
      <div className={styles.denied}>
        <h1>Access denied</h1>
        <p>Invalid admin route.</p>
      </div>
    );
  }

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleSeed = async () => {
    setSeeding(true);
    const r = await seedMatches({});
    flash((r as { message: string }).message);
    setSeeding(false);
  };


  const handleSetFinalTeams = async () => {
    try {
      const r = await setFinalTeams({});
      flash((r as { message: string }).message);
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : "Error setting final teams");
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset ALL match scores? This cannot be undone.")) return;
    const r = await resetMatches({});
    flash((r as { message: string }).message);
  };

  const handleScoreSave = async (matchId: string) => {
    const matchEdits = edits[matchId];
    if (!matchEdits) return;
    setSaving(matchId);
    for (const [seedStr, [g1, g2]] of Object.entries(matchEdits)) {
      if (g1 === "" || g2 === "") continue;
      await updateScore({
        matchId,
        seed:       Number(seedStr),
        team1Games: Number(g1),
        team2Games: Number(g2),
      });
    }
    setSaving(null);
    flash(`Saved ${matchId}`);
  };

  const handleTeamSave = async (matchId: string) => {
    const te = teamEdits[matchId];
    if (!te) return;
    await updateTeams({ matchId, team1: te[0], team2: te[1] });
    flash(`Teams updated for ${matchId}`);
  };

  const setEdit = (matchId: string, seed: number, idx: 0 | 1, val: string) => {
    setEdits((prev) => {
      const m = { ...(prev[matchId] ?? {}) };
      const cur = m[seed] ?? ["", ""];
      const next: [string, string] = [cur[0], cur[1]];
      next[idx] = val;
      m[seed] = next;
      return { ...prev, [matchId]: m };
    });
  };

  // ── Round section (group stage) ──────────────────────────────────
  const RoundSection = ({
    roundKey, label, time, bye,
  }: { roundKey: string; label: string; time: string; bye: string }) => {
    const roundMatches = (matches ?? []).filter((m) => m.timeSlot === roundKey);
    return (
      <div className={styles.phaseBlock}>
        <div className={styles.phaseHeader}>
          <h2 className={styles.phaseTitle}>{label}</h2>
          <div className={styles.phaseMeta}>
            <span className={styles.byeTag}>Bye: {bye}</span>
            <span className={styles.phaseTime}>{time}</span>
          </div>
        </div>
        {roundMatches.map((m) => (
          <div key={m.matchId} className={styles.matchCard}>
            <div className={styles.matchCardHeader}>
              <span className={styles.matchCardId}>{m.matchId}</span>
              <span className={styles.matchCardTeams}>{m.team1} vs {m.team2}</span>
              <select
                className={styles.statusSelect}
                value={m.status}
                onChange={(e) => updateStatus({
                  matchId: m.matchId,
                  status: e.target.value as "pending" | "in_progress" | "complete",
                })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div className={styles.seedsGrid}>
              {m.seedScores.map((s) => {
                const cur = edits[m.matchId]?.[s.seed] ?? [
                  s.team1Games?.toString() ?? "",
                  s.team2Games?.toString() ?? "",
                ];
                return (
                  <div key={s.seed} className={styles.seedRow}>
                    <span className={styles.seedLbl}>S{s.seed}</span>
                    <input
                      type="number" min="0" max="8"
                      className={styles.scoreInput}
                      value={cur[0]}
                      onChange={(e) => setEdit(m.matchId, s.seed, 0, e.target.value)}
                      placeholder="–"
                    />
                    <span className={styles.dash}>–</span>
                    <input
                      type="number" min="0" max="8"
                      className={styles.scoreInput}
                      value={cur[1]}
                      onChange={(e) => setEdit(m.matchId, s.seed, 1, e.target.value)}
                      placeholder="–"
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles.matchCardFooter}>
              <span className={styles.totals}>
                Total: {m.team1Total ?? "–"} – {m.team2Total ?? "–"}
                &nbsp;·&nbsp;
                Sets: {m.team1Sets ?? "–"} – {m.team2Sets ?? "–"}
              </span>
              <button
                className={styles.btnSave}
                onClick={() => handleScoreSave(m.matchId)}
                disabled={saving === m.matchId}
              >
                {saving === m.matchId ? "Saving…" : "Save Scores"}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

// ── Final section ────────────────────────────────────────────────
const FinalSection = () => {
  const finalMatches = (matches ?? []).filter((m) => m.phase === "final");
  return (
    <div className={styles.phaseBlock}>
      <div className={styles.phaseHeader}>
        <h2 className={styles.phaseTitle}>Grand Final</h2>
        <span className={styles.phaseTime}>12:05 PM – 12:30 PM</span>
      </div>
      {finalMatches.map((m) => {
        return (
          <div key={m.matchId} className={styles.matchCard}>
            <div className={styles.matchCardHeader}>
              <span className={styles.matchCardId}>{m.matchId}</span>
              <span className={styles.matchCardTeams}>
                {m.team1} vs {m.team2}
              </span>
              <button className={styles.btnSm} onClick={handleSetFinalTeams}>
                Auto-set from Standings
              </button>
              <select
                className={styles.statusSelect}
                value={m.status}
                onChange={(e) => updateStatus({
                  matchId: m.matchId,
                  status: e.target.value as "pending" | "in_progress" | "complete",
                })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div className={styles.seedsGrid}>
              {m.seedScores.map((s) => {
                const cur = edits[m.matchId]?.[s.seed] ?? [
                  s.team1Games?.toString() ?? "",
                  s.team2Games?.toString() ?? "",
                ];
                return (
                  <div key={s.seed} className={styles.seedRow}>
                    <span className={styles.seedLbl}>S{s.seed}</span>
                    <input
                      type="number" min="0" max="8"
                      className={styles.scoreInput}
                      value={cur[0]}
                      onChange={(e) => setEdit(m.matchId, s.seed, 0, e.target.value)}
                      placeholder="–"
                    />
                    <span className={styles.dash}>–</span>
                    <input
                      type="number" min="0" max="8"
                      className={styles.scoreInput}
                      value={cur[1]}
                      onChange={(e) => setEdit(m.matchId, s.seed, 1, e.target.value)}
                      placeholder="–"
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles.matchCardFooter}>
              <span className={styles.totals}>
                Total: {m.team1Total ?? "–"} – {m.team2Total ?? "–"}
              </span>
              <button
                className={styles.btnSave}
                onClick={() => handleScoreSave(m.matchId)}
                disabled={saving === m.matchId}
              >
                {saving === m.matchId ? "Saving…" : "Save Scores"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <div className={styles.topTitle}>Sydney Cup 3.0</div>
          <div className={styles.topSub}>Admin · Score Entry</div>
        </div>
        <div className={styles.topActions}>
          {msg && <span className={styles.flash}>{msg}</span>}
          {/* <button className={styles.btnReset} onClick={handleReset}>
            Reset All Scores
          </button> */}
          {/* <button className={styles.btnSeed} onClick={handleSeed} disabled={seeding}>
            {seeding ? "Seeding…" : "Seed Match Schedule"}
          </button> */}
        </div>
      </div>

      <div className={styles.content}>
        {matches === undefined && (
          <p className={styles.loading}>Connecting to database…</p>
        )}
        {matches?.length === 0 && (
          <div className={styles.empty}>
            <p>No matches yet. Click <strong>Seed Match Schedule</strong> to initialise.</p>
          </div>
        )}

        {(matches?.length ?? 0) > 0 && (
          <>
            {ROUNDS.map((r) => (
              <RoundSection
                key={r.key}
                roundKey={r.key}
                label={r.label}
                time={r.time}
                bye={r.bye}
              />
            ))}
            <FinalSection />
          </>
        )}
      </div>
    </div>
  );
}
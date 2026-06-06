"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import styles from "./admin.module.css";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "sc2026";

type Props = { secret: string };

export default function AdminClient({ secret }: Props) {
  const matches = useQuery(api.matches.getAll);

  const seedMatches   = useMutation(api.matches.seedMatches);
  const updateScore   = useMutation(api.matches.updateSeedScore);
  const updateStatus  = useMutation(api.matches.updateStatus);
  const updateTeams   = useMutation(api.matches.updateTeamNames);
  const resetMatches  = useMutation(api.matches.resetMatches);

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

  // Add handler alongside handleSeed
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

  const byPhase = (phase: string) =>
    (matches ?? []).filter((m) => m.phase === phase);

  const PhaseSection = ({ phase, label }: { phase: string; label: string }) => (
    <div className={styles.phaseBlock}>
      <h2 className={styles.phaseTitle}>{label}</h2>
      {byPhase(phase).map((m) => {
        const te = teamEdits[m.matchId] ?? [m.team1, m.team2];
        return (
          <div key={m.matchId} className={styles.matchCard}>
            <div className={styles.matchCardHeader}>
              <span className={styles.matchCardId}>{m.matchId}</span>

              {/* Team name editors for semis/final */}
              {(phase === "semis" || phase === "final") ? (
                <div className={styles.teamEditorRow}>
                  <input
                    className={styles.teamInput}
                    value={te[0]}
                    onChange={(e) => setTeamEdits((p) => ({ ...p, [m.matchId]: [e.target.value, te[1]] }))}
                    placeholder="Team 1"
                  />
                  <span className={styles.vs}>vs</span>
                  <input
                    className={styles.teamInput}
                    value={te[1]}
                    onChange={(e) => setTeamEdits((p) => ({ ...p, [m.matchId]: [te[0], e.target.value] }))}
                    placeholder="Team 2"
                  />
                  <button className={styles.btnSm} onClick={() => handleTeamSave(m.matchId)}>
                    Set Teams
                  </button>
                </div>
              ) : (
                <span className={styles.matchCardTeams}>{m.team1} vs {m.team2}</span>
              )}

              <select
                className={styles.statusSelect}
                value={m.status}
                onChange={(e) => updateStatus({ matchId: m.matchId, status: e.target.value as "pending" | "in_progress" | "complete" })}
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

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <div className={styles.topTitle}>Sydney Cup 3.0</div>
          <div className={styles.topSub}>Admin · Score Entry</div>
        </div>
        <div className={styles.topActions}>
          {msg && <span className={styles.flash}>{msg}</span>}
          <button className={styles.btnSeed} onClick={handleSeed} disabled={seeding}>
            {seeding ? "Seeding…" : "Seed Match Schedule"}
          </button>
          <button className={styles.btnReset} onClick={handleReset}>
            Reset All Scores
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {matches === undefined && <p className={styles.loading}>Connecting to database…</p>}
        {matches?.length === 0 && (
          <div className={styles.empty}>
            <p>No matches yet. Click <strong>Seed Match Schedule</strong> to initialise.</p>
          </div>
        )}

        {(matches?.length ?? 0) > 0 && (
          <>
            <PhaseSection phase="group" label="Group Stage" />
            <PhaseSection phase="semis" label="Semifinals" />
            <PhaseSection phase="final" label="Grand Final" />
          </>
        )}
      </div>
    </div>
  );
}
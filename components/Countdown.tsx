"use client";

import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface CountdownProps {
  targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const update = () => {
      const t = getTimeLeft(targetDate);
      setTimeLeft(t);
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setStarted(true);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (started) {
    return (
      <div className={styles.started}>
        <span className={styles.startedText}>The Competition Has Begun</span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days, display: String(timeLeft.days).padStart(2, "0") },
    { label: "Hours", value: timeLeft.hours, display: pad(timeLeft.hours) },
    { label: "Minutes", value: timeLeft.minutes, display: pad(timeLeft.minutes) },
    { label: "Seconds", value: timeLeft.seconds, display: pad(timeLeft.seconds) },
  ];

  return (
    <div className={styles.countdown}>
      {units.map((unit, i) => (
        <div key={unit.label} className={styles.unitWrap}>
          <div className={styles.unit}>
            <div className={styles.cardOuter}>
              <div className={styles.card}>
                <span className={styles.number} key={unit.display}>
                  {unit.display}
                </span>
              </div>
              <div className={styles.cardGlow} />
              {/* Corner accents */}
              <span className={`${styles.corner} ${styles.cornerTL}`} />
              <span className={`${styles.corner} ${styles.cornerTR}`} />
              <span className={`${styles.corner} ${styles.cornerBL}`} />
              <span className={`${styles.corner} ${styles.cornerBR}`} />
            </div>
            <span className={styles.label}>{unit.label}</span>
          </div>
          {i < 3 && <span className={styles.separator}>·</span>}
        </div>
      ))}
    </div>
  );
}

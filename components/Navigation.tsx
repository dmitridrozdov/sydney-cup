"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Navigation.module.css";

// ── Scalable config ───────────────────────────────────────────────────
// Add future editions here; they'll appear automatically in the nav.
const PAST_EVENTS = [
  { label: "Sydney Cup 1.0", href: "/events/sydney-cup-1" },
  { label: "Sydney Cup 2.0", href: "/events/sydney-cup-2" },
];
// ─────────────────────────────────────────────────────────────────────

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <span className={styles.logoText}>SC</span>
        <span className={styles.logoDivider}>|</span>
        <span className={styles.logoSub}>Sydney Cup</span>
      </Link>

      {/* Desktop links */}
      <div className={styles.links}>
        <Link href="/competition" className={styles.link}>
          Competition
        </Link>

        {/* Past events dropdown */}
        <div
          className={styles.dropdown}
          onMouseEnter={() => setPastOpen(true)}
          onMouseLeave={() => setPastOpen(false)}
        >
          <button className={styles.link} aria-haspopup="true" aria-expanded={pastOpen}>
            Past Events
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={pastOpen ? styles.chevronOpen : styles.chevron}>
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {pastOpen && (
            <div className={styles.dropdownMenu}>
              {PAST_EVENTS.map((e) => (
                <Link key={e.href} href={e.href} className={styles.dropdownItem}>
                  {e.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={menuOpen ? styles.barOpen1 : styles.bar} />
        <span className={menuOpen ? styles.barOpen2 : styles.bar} />
        <span className={menuOpen ? styles.barOpen3 : styles.bar} />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/competition" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
            Competition
          </Link>
          <div className={styles.mobileDivider} />
          <span className={styles.mobileSectionLabel}>Past Events</span>
          {PAST_EVENTS.map((e) => (
            <Link key={e.href} href={e.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {e.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

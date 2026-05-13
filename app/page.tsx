import Countdown from "@/components/Countdown";
import Navigation from "@/components/Navigation";
import styles from "./page.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Decorative background elements */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgGrid} />

      <Navigation />

      <div className={styles.hero}>
        {/* Edition badge */}
        <div className={styles.editionBadge}>
          <span className={styles.editionLine} />
          <span className={styles.editionText}>Edition III</span>
          <span className={styles.editionLine} />
        </div>

        {/* Trophy icon */}
        <div className={styles.trophyWrap}>
          {/* <svg
            className={styles.trophySvg}
            viewBox="0 0 80 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 8h40v28c0 15-8 24-20 27C28 60 20 51 20 36V8z"
              stroke="url(#goldGrad)"
              strokeWidth="1.5"
              fill="none"
            />
            <path d="M20 14H8c0 12 5 20 12 22" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" />
            <path d="M60 14h12c0 12-5 20-12 22" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" />
            <rect x="32" y="63" width="16" height="4" rx="1" fill="url(#goldGrad)" opacity="0.8" />
            <rect x="26" y="67" width="28" height="5" rx="2" fill="url(#goldGrad)" opacity="0.9" />
            <circle cx="40" cy="30" r="8" stroke="url(#goldGrad)" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M40 26l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="url(#goldGrad)" />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e8c97a" />
                <stop offset="50%" stopColor="#c9a84c" />
                <stop offset="100%" stopColor="#a07830" />
              </linearGradient>
            </defs>
          </svg> */}
           <Image
            src="/crest.png"
            alt="Sydney Cup crest"
            width={110}
            height={172}
            priority
          />
        </div>

        {/* Title */}
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Sydney Cup</h1>
          <div className={styles.titleAccent}>
            <span className={styles.accentLine} />
            <span className={styles.versionText}>3.0</span>
            <span className={styles.accentLine} />
          </div>
          <p className={styles.subtitle}>Doubles Tennis Championship | Organised by RCOBA in NSW and ACT</p>
        </div>

        {/* Date */}
        <div className={styles.dateBlock}>
          <span className={styles.dateLabel}>Commences</span>
          <span className={styles.dateValue}>August 2, 2026 · 8:00 AM</span>
        </div>

         <div className={styles.venueBlock}>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path
              d="M6 0C2.69 0 0 2.69 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.31-2.69-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
              fill="currentColor"
            />
          </svg>
          <span>Parramatta City Tennis, Barton St.</span>
        </div>

        {/* Countdown */}
        <Countdown targetDate="2026-08-02T08:00:00" />
        
        {/* CTA */}
        <div className={styles.ctaBlock}>
          <a href="/competition" className={styles.ctaPrimary}>
            <span>View Competition</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Section divider */}
        <div className={styles.sectionDivider}>
          <span className={styles.divLine} />
          <span className={styles.divDiamond} />
          <span className={styles.divLine} />
        </div>

        {/* Info cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.icLabel}>Format</span>
            <div className={styles.icTitle}>Teams of 6</div>
            <p className={styles.icBody}>3 doubles pairings per school, competing across multiple rounds.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.icLabel}>Edition</span>
            <div className={styles.icTitle}>Third Edition</div>
            <p className={styles.icBody}>The Sri Lankan Schools Invitational Tennis Competition returns for 2026.</p>
          </div>
        </div>

        {/* Register banner */}
        <div className={styles.registerBanner}>
          <span className={styles.regEyebrow}>Open Now</span>
          <div className={styles.regTitle}>Register Your Team</div>
          <p className={styles.regBody}>
            Teams of 6 players representing 3 doubles pairings from each school
            are invited to register their interest.
          </p>
        </div>
        
        {/* Contacts */}
        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <span className={styles.ccLabel}>Contact</span>
            <div className={styles.ccName}>Sanj</div>
            <div className={styles.ccPhone}>0401 254 200</div>
          </div>
          <div className={styles.contactCard}>
            <span className={styles.ccLabel}>Contact</span>
            <div className={styles.ccName}>Selvan</div>
            <div className={styles.ccPhone}>0406 100 199</div>
          </div>
        </div>

        {/* Tennis court decorative line */}
        <div className={styles.courtLine} />
      </div>
    </main>
  );
}

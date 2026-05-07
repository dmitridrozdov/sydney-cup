import Navigation from "@/components/Navigation";
import styles from "./competition.module.css";

export const metadata = {
  title: "Competition — Sydney Cup 3.0",
};

export default function CompetitionPage() {
  return (
    <main className={styles.main}>
      <Navigation />
      <div className={styles.content}>
        <div className={styles.badge}>Sydney Cup 3.0</div>
        <h1 className={styles.title}>Competition</h1>
        <div className={styles.divider} />
        <p className={styles.body}>
          Competition details, draws, schedules, and results will be published here
          as the event approaches. Check back soon.
        </p>
        <p className={styles.date}>August 2, 2026 · 8:00 AM</p>
      </div>
    </main>
  );
}

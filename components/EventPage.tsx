import Navigation from "@/components/Navigation";
import Link from "next/link";
import styles from "./event.module.css";

interface EventPageProps {
  edition: string;
  year?: string;
  description?: string;
}

export default function EventPage({ edition, year, description }: EventPageProps) {
  return (
    <main className={styles.main}>
      <Navigation />
      <div className={styles.content}>
        <div className={styles.badge}>Past Edition</div>
        <h1 className={styles.title}>Sydney Cup<br /><span className={styles.edition}>{edition}</span></h1>
        <div className={styles.divider} />
        {year && <p className={styles.year}>{year}</p>}
        <p className={styles.body}>
          {description ?? "Highlights, results, and gallery for this edition will be available here."}
        </p>
        <Link href="/" className={styles.back}>
          ← Back to Sydney Cup 3.0
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import { UtilityDock } from "@/components/utility-dock";

export default function Home() {
  return (
    <main className="landing-page">
      <div className="film-grain" aria-hidden="true" />

      <header className="landing-header page-enter page-enter-1">
        <div className="wordmark">
          <span className="wordmark-dot" aria-hidden="true" />
          <span>Look Closer</span>
        </div>
        <p>Vol. 01 · Da Vinci</p>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <p className="eyebrow page-enter page-enter-2">
          An immersive exhibition
        </p>
        <h1 id="landing-title" className="page-enter page-enter-3">
          <span>AI notices what catches your eye</span>
          <em>—and reveals the stories behind it.</em>
        </h1>
        <div className="landing-action page-enter page-enter-4">
          <Link className="explore-cta" href="/artwork">
            <span>Explore The Last Supper</span>
            <span className="cta-line" aria-hidden="true" />
          </Link>
          <p>Leonardo da Vinci · 1495–1498</p>
        </div>
      </section>

      <footer className="landing-footer page-enter page-enter-4">
        <p>Est. MMXXVI</p>
        <p>Look with intention</p>
      </footer>

      <UtilityDock />
    </main>
  );
}

import { useEffect, useState } from "react";
import { Q1Reach } from "./sections/Q1Reach";
import { FactBase } from "./sections/FactBase";
import { Upcoming } from "./sections/Upcoming";
import { useLevers } from "./state/useLevers";

const chapters = [
  { id: "q1", label: "Q1 · Reach" },
  { id: "q2", label: "Q2" },
  { id: "q3", label: "Q3" },
  { id: "q4", label: "Q4" },
  { id: "facts", label: "Fact base" },
] as const;

type ChapterId = (typeof chapters)[number]["id"];

export function App() {
  const [chapter, setChapter] = useState<ChapterId>("q1");
  const levers = useLevers();

  // A new chapter starts at the top, like the next slide.
  // Block body on purpose: newer browsers return a Promise from scrollTo, which React would call as a cleanup.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [chapter]);

  // Arrow keys page through the chapters when presenting.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      const k = chapters.findIndex((c) => c.id === chapter);
      const next = chapters[k + (e.key === "ArrowRight" ? 1 : -1)];
      if (next) setChapter(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg className="brand__mark" viewBox="0 0 24 24" aria-hidden>
            <path d="M4 20 L20 4" />
            <circle cx="20" cy="4" r="2.2" />
          </svg>
          <div>
            <div className="brand__title">Expansion Navigator</div>
            <div className="brand__sub">Isar Aerospace · prepared for SSVE</div>
          </div>
        </div>
        <nav className="nav">
          {chapters.map((c) => (
            <button key={c.id} className={chapter === c.id ? "is-active" : ""} onClick={() => setChapter(c.id)}>
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content" key={chapter}>
        {chapter === "q1" && <Q1Reach state={levers} />}
        {chapter === "q2" && <Upcoming question="Question 2" opens="21 Oct, 16:15" />}
        {chapter === "q3" && <Upcoming question="Question 3" opens="22 Oct, 09:30" />}
        {chapter === "q4" && <Upcoming question="Question 4" opens="22 Oct, 12:45" />}
        {chapter === "facts" && <FactBase />}
      </main>

      <footer className="footer">
        <span>SSCO AI Hackathon 2026</span>
        <span>Team Benedikt, Luca, Nils · built on public information</span>
      </footer>
    </div>
  );
}

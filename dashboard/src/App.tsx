import { useState } from "react";
import { Q1Reach } from "./sections/Q1Reach";
import { Sources } from "./sections/Sources";
import { Upcoming } from "./sections/Upcoming";
import { useScenario } from "./state/useScenario";

const chapters = [
  { id: "q1", label: "Q1 · Reach from Andøya" },
  { id: "q2", label: "Q2" },
  { id: "q3", label: "Q3" },
  { id: "q4", label: "Q4" },
  { id: "sources", label: "Assumptions & sources" },
] as const;

type ChapterId = (typeof chapters)[number]["id"];

export function App() {
  const [chapter, setChapter] = useState<ChapterId>("q1");
  const scenario = useScenario();

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" aria-hidden>
            ▲
          </span>
          <div>
            <div className="brand__title">Isar Aerospace · Expansion Navigator</div>
            <div className="brand__sub">Decision support for SSVE · 22 Oct 2026</div>
          </div>
        </div>
        <nav className="tabs">
          {chapters.map((c) => (
            <button key={c.id} className={chapter === c.id ? "is-active" : ""} onClick={() => setChapter(c.id)}>
              {c.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {chapter === "q1" && <Q1Reach scenario={scenario} />}
        {chapter === "q2" && <Upcoming question="Question 2" opens="21 Oct, 16:15" />}
        {chapter === "q3" && <Upcoming question="Question 3" opens="22 Oct, 09:30" />}
        {chapter === "q4" && <Upcoming question="Question 4" opens="22 Oct, 12:45" />}
        {chapter === "sources" && <Sources />}
      </main>

      <footer className="footer">Case built on publicly available information · SSCO AI Hackathon 2026</footer>
    </div>
  );
}

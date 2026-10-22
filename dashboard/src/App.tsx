import { useEffect, useState } from "react";
import { Q1Reach } from "./sections/Q1Reach";
import { FactBase } from "./sections/FactBase";
import { Q2Growth } from "./sections/Q2Growth";
import { Q3Sites } from "./sections/Q3Sites";
import { Rockets } from "./sections/Rockets";
import { Scenarios } from "./sections/Scenarios";
import { Spaceports } from "./sections/Spaceports";
import { Upcoming } from "./sections/Upcoming";
import { Present } from "./present/Present";
import { useLevers } from "./state/useLevers";
import { BASE_SETTINGS, type ScenarioSettings } from "./state/scenario";

const chapters = [
  { id: "q1", label: "Q1 · Reach" },
  { id: "q2", label: "Q2 · Growth" },
  { id: "q3", label: "Q3 · Sites" },
  { id: "q4", label: "Q4" },
  { id: "scenarios", label: "Scenarios" },
  { id: "sites", label: "Spaceports" },
  { id: "rockets", label: "Rockets" },
  { id: "facts", label: "Fact base" },
] as const;

type ChapterId = (typeof chapters)[number]["id"];

export function App() {
  const [chapter, setChapter] = useState<ChapterId>("q1");
  const [presenting, setPresenting] = useState(false);
  // One owner for the scenario settings, so the presentation and Explore show the same numbers.
  const [scenario, setScenario] = useState<ScenarioSettings>(BASE_SETTINGS);
  const levers = useLevers();

  // A new chapter or beat starts at the top, like the next slide.
  // Block body on purpose: newer browsers return a Promise from scrollTo, which React would call as a cleanup.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [chapter, presenting]);

  // Arrow keys page through the chapters in Explore; Esc leaves the presentation.
  useEffect(() => {
    if (presenting) {
      const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setPresenting(false);
      window.addEventListener("keydown", onEsc);
      return () => window.removeEventListener("keydown", onEsc);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      const k = chapters.findIndex((c) => c.id === chapter);
      const next = chapters[k + (e.key === "ArrowRight" ? 1 : -1)];
      if (next) setChapter(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, presenting]);

  return (
    <div className={`app${presenting ? " app--present" : ""}`}>
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
            <button key={c.id} className={!presenting && chapter === c.id ? "is-active" : ""} onClick={() => (setChapter(c.id), setPresenting(false))}>
              {c.label}
            </button>
          ))}
          <button className={`present-button${presenting ? " present-button--exit" : ""}`} onClick={() => setPresenting(!presenting)}>
            {presenting ? "Exit" : "▶ Present"}
          </button>
        </nav>
      </header>

      {presenting ? (
        <main className="content content--present">
          <Present settings={scenario} setSettings={setScenario} />
        </main>
      ) : (
        <main className="content" key={chapter}>
          {chapter === "q1" && <Q1Reach state={levers} />}
          {chapter === "q2" && <Q2Growth />}
          {chapter === "q3" && <Q3Sites />}
          {chapter === "q4" && <Upcoming question="Question 4" opens="22 Oct, 12:45" />}
          {chapter === "scenarios" && <Scenarios settings={scenario} setSettings={setScenario} />}
          {chapter === "sites" && <Spaceports />}
          {chapter === "rockets" && <Rockets />}
          {chapter === "facts" && <FactBase />}
        </main>
      )}

      <footer className="footer">
        <span>SSCO AI Hackathon 2026</span>
        <span>Team Benedikt, Luca, Nils · built on public information</span>
      </footer>
    </div>
  );
}

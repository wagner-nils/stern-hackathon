import { useEffect, useState } from "react";
import { Q1Reach } from "./sections/Q1Reach";
import { FactBase } from "./sections/FactBase";
import { Q2Growth } from "./sections/Q2Growth";
import { Q3Sites } from "./sections/Q3Sites";
import { Rockets } from "./sections/Rockets";
import { Scenarios } from "./sections/Scenarios";
import { Spaceports } from "./sections/Spaceports";
import { Upcoming } from "./sections/Upcoming";
import { BEATS, type DeepDive, Story, type StoryPosition } from "./story/Story";
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
  const [at, setAt] = useState<StoryPosition>({ beat: 0, step: 0 });
  // Set when a deep dive leaves the story, so "Back to story" returns to the same beat.
  const [returnTo, setReturnTo] = useState<StoryPosition | null>(null);
  // One owner for the scenario settings, so story and Explore show the same numbers.
  const [scenario, setScenario] = useState<ScenarioSettings>(BASE_SETTINGS);
  const levers = useLevers();

  // A new chapter or beat starts at the top, like the next slide.
  // Block body on purpose: newer browsers return a Promise from scrollTo, which React would call as a cleanup.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [chapter, presenting, at]);

  // Arrow keys page through the chapters in Explore; the story has its own keys.
  useEffect(() => {
    if (presenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      const k = chapters.findIndex((c) => c.id === chapter);
      const next = chapters[k + (e.key === "ArrowRight" ? 1 : -1)];
      if (next) setChapter(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, presenting]);

  const dive = (to: DeepDive) => {
    setReturnTo(at);
    setChapter(to);
    setPresenting(false);
  };
  const present = (from: StoryPosition) => {
    setAt(from);
    setReturnTo(null);
    setPresenting(true);
  };

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
        {presenting ? (
          <nav className="nav nav--story" aria-label="Storyline">
            {BEATS.map((b, k) => (
              <button key={b.id} className={k === at.beat ? "is-active" : k < at.beat ? "is-done" : ""} onClick={() => setAt({ beat: k, step: 0 })}>
                <span className="nav__num">{k + 1}</span>
                {b.label}
              </button>
            ))}
            <button className="present-button present-button--exit" onClick={() => setPresenting(false)}>
              Exit
            </button>
          </nav>
        ) : (
          <nav className="nav">
            {chapters.map((c) => (
              <button key={c.id} className={chapter === c.id ? "is-active" : ""} onClick={() => setChapter(c.id)}>
                {c.label}
              </button>
            ))}
            <button className="present-button" onClick={() => present(returnTo ?? { beat: 0, step: 0 })}>
              ▶ Present
            </button>
          </nav>
        )}
      </header>

      {presenting ? (
        <main className="content content--story">
          <Story at={at} setAt={setAt} settings={scenario} setSettings={setScenario} dive={dive} exit={() => setPresenting(false)} />
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

      {!presenting && returnTo && (
        <button className="back-to-story" onClick={() => present(returnTo)}>
          ← Back to story · {BEATS[returnTo.beat].label}
        </button>
      )}

      <footer className="footer">
        <span>SSCO AI Hackathon 2026</span>
        <span>Team Benedikt, Luca, Nils · built on public information</span>
      </footer>
    </div>
  );
}

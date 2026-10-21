export function Upcoming({ question, opens }: { question: string; opens: string }) {
  return (
    <section className="chapter">
      <p className="eyebrow">{question}</p>
      <h2>Opens {opens}</h2>
      <p className="muted">This chapter is built once the question is released.</p>
    </section>
  );
}

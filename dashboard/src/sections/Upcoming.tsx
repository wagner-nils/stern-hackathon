export function Upcoming({ question, opens }: { question: string; opens: string }) {
  return (
    <section className="chapter">
      <header className="chapter__head">
        <div className="overline overline--primary">{question}</div>
        <h2>Opens {opens}</h2>
      </header>
      <p className="lead">This chapter is built once the question is released.</p>
    </section>
  );
}

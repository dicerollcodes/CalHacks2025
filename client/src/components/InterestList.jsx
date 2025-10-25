const ICON = {
  Hackathons: "🧠",
  Robotics: "🤖",
  SciOly: "🔭",
  Chess: "♟️",
  Anime: "🎌",
  "Iced Matcha": "🧋",
  Cosplay: "🧵",
  "CS Humor": "💻",
  Coding: "⌨️",
};

const NEAR_MAP = [
  ["hackathons", "coding"],
  ["anime", "cosplay"],
  ["robotics", "engineering"],
  ["scioIy", "astronomy"],
  ["cs humor", "coding"],
];

function localSemanticScore(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  if (a === b) return { score: 100, triggers: [a, b] };
  for (const [x, y] of NEAR_MAP) {
    if ((a === x && b === y) || (a === y && b === x)) return { score: 80, triggers: [x, y] };
  }
  if (a.includes(b) || b.includes(a)) return { score: 70, triggers: [a, b] };
  return { score: 0, triggers: [a, b] };
}

export default function InterestList({ userA = [], userB = [], stagger = false }) {
  const A = userA.map((s) => s.trim()).filter(Boolean);
  const B = userB.map((s) => s.trim()).filter(Boolean);

  const rows = [];
  const usedB = new Set();

  for (const a of A) {
    let best = { score: -1, b: null, triggers: [] };
    for (const b of B) {
      if (usedB.has(b)) continue;
      const { score, triggers } = localSemanticScore(a, b);
      if (score > best.score) best = { score, b, triggers };
    }
    if (best.b && best.score >= 60) {
      usedB.add(best.b);
      rows.push({
        label: best.score === 100 ? a : `${a} ↔ ${best.b}`,
        score: best.score,
        triggers: best.triggers,
      });
    }
  }

  if (!rows.length) {
    return <p className="text-white/60">No meaningful overlap detected yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {rows.map((r, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-left"
          style={
            stagger
              ? {
                  animation: "fadeUp 500ms ease-out forwards",
                  animationDelay: `${i * 110}ms`,
                  opacity: 0,
                  transform: "translateY(6px)",
                }
              : undefined
          }
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl leading-none">{ICON[r.label.split(" ↔ ")[0]] ?? "✨"}</div>
            <div className="flex-1">
              <div className="font-semibold">{r.label}</div>
              <div className="text-sm text-white/70">
                Similarity: <span className="font-medium">{r.score}%</span>
              </div>
              <div className="text-xs text-white/60">
                Triggers: {r.triggers.join(", ")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

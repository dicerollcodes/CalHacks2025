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
  ["scioly", "astronomy"],   // <- fixed spelling
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

export default function HorizontalChips({ userA = [], userB = [] }) {
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
        a,
        b: best.b,
        score: best.score,
        icon: ICON[a] ?? "✨",
        triggers: best.triggers,
      });
    }
  }

  if (!rows.length) {
    return <div className="px-1 text-white/60 text-xs">No meaningful overlap detected yet.</div>;
  }

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-1 py-1 items-stretch">
      {rows.map((r, i) => (
        <div
          key={i}
          className="shrink-0 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm"
          style={{
            animation: "fadeUp 500ms ease-out forwards",
            animationDelay: `${i * 110}ms`,
            opacity: 0,
            transform: "translateY(6px)",
          }}
          title={`Triggers: ${r.triggers.join(", ")}`}
        >
          <span className="text-base">{r.icon}</span>
          <span className="text-xs font-medium">
            {r.a === r.b ? r.a : `${r.a} ↔ ${r.b}`}
          </span>
          <span className="text-[10px] text-white/70">{r.score}%</span>
        </div>
      ))}
    </div>
  );
}

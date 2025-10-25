const ICONS = {
  Hackathons: "🧠",
  Robotics: "🤖",
  SciOly: "🔭",
  Chess: "♟️",
  Anime: "🎌",
  "Iced Matcha": "🧋",
  Cosplay: "🧵",
  "CS Humor": "💻",
};

export default function FandomGrid({ items = [] }) {
  if (!items.length) {
    return <p className="text-white/50">No shared fandoms (yet).</p>;
  }
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 justify-center">
      {items.map((label) => (
        <div
          key={label}
          className="rounded-xl bg-white/10 p-4 flex flex-col items-center gap-2 shadow-md"
        >
          <div className="text-3xl">{ICONS[label] ?? "✨"}</div>
          <div className="font-semibold">{label}</div>
        </div>
      ))}
    </div>
  );
}

import { Outlet, Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-dvh text-white font-sans">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-wide">
            SHATTER<span className="text-white/50">/</span>THE<span className="text-white/50">/</span>ICE
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-white/40">
        © 2025 Shatter the Ice · Built at Cal Hacks
      </footer>
    </div>
  );
}

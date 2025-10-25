import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [handle, setHandle] = useState("eddy");
  const navigate = useNavigate();

  return (
    <section className="grid place-items-center">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Shatter the Ice
        </h1>
        <p className="text-white/70 mb-8">
          Put this link in your profile. Friends tap it to see how strongly you vibe.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <label className="block text-left text-white/70 text-sm mb-2">
            Preview a profile link
          </label>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-3">
              app.com/u/
            </span>
            <input
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none text-white"
              placeholder="username"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
            <button
              onClick={() => navigate(`/u/${encodeURIComponent(handle || "user")}`)}
              className="rounded-lg bg-white text-black px-4 font-medium hover:bg-white/90"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

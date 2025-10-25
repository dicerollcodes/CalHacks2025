import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ThreeCube from "../components/ThreeCube.jsx";
import SocialButtons from "../components/SocialButtons.jsx";
import HorizontalChips from "../components/HorizontalChips.jsx";
import useIsMobile from "../utils/useIsMobile.js";

const MOCK_PROFILES = {
  eddy: {
    name: "EDDY ZHAO",
    avatar: "https://i.pravatar.cc/400?img=64",
    socials: { ig: "eddyzow", discord: "eddy#1234" },
    interests: ["Hackathons", "Robotics", "SciOly", "Chess", "Anime", "Iced Matcha"],
  },
};

const VIEWER = {
  name: "You",
  interests: ["Hackathons", "SciOly", "Anime", "Iced Matcha", "CS Humor", "Coding"],
};

function compatibilityScore(a, b) {
  const A = new Set(a.map((s) => s.toLowerCase()));
  const B = new Set(b.map((s) => s.toLowerCase()));
  const shared = [...A].filter((x) => B.has(x)).length;
  const denom = new Set([...A, ...B]).size || 1;
  return Math.round((shared / denom) * 100);
}

export default function ProfileReveal() {
  const isMobile = useIsMobile();
  const { username } = useParams();
  const profile = useMemo(() => MOCK_PROFILES[username] ?? MOCK_PROFILES.eddy, [username]);
  const targetScore = compatibilityScore(profile.interests, VIEWER.interests);

  const [shattered, setShattered] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreScale, setScoreScale] = useState(0.85);
  const [liftScore, setLiftScore] = useState(false);
  const [chipsContentVisible, setChipsContentVisible] = useState(false);

  // Animate score; AFTER it finishes, lift the score and then reveal chips content
  useEffect(() => {
    if (!shattered) return;
    let raf;
    const start = performance.now();
    const duration = 1200;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      setScore(Math.round(e * targetScore));
      setScoreScale(0.85 + e * 0.35);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setLiftScore(true);                    // move score UP (just the score block)
        setTimeout(() => setChipsContentVisible(true), 350); // chips content fades in
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shattered, targetScore]);

  return (
    <div className="w-full h-[100vh] bg-black text-white max-w-md mx-auto flex flex-col overflow-hidden">
      {/* HEADER (fixed top, does NOT move) */}
      <div className="pt-6 pb-3 text-center">
        <h1 className="text-4xl font-extrabold italic uppercase">{profile.name}</h1>
        <img
          src={profile.avatar}
          alt=""
          className="mt-2 w-20 h-20 rounded-full mx-auto object-cover"
        />
        <div className="mt-2 flex justify-center gap-3 text-sm text-white/80">
          @{username}
          <SocialButtons socials={profile.socials} />
        </div>
      </div>

      {/* STAGE (centered). Score ABOVE cube; only score shifts up after shatter */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* SCORE OUTER handles translate (UP). INNER handles scale. */}
        {shattered && (
          <div className={`text-center transition-transform duration-500 ${liftScore ? "-translate-y-10" : ""}`}>
            <div style={{ transform: `scale(${scoreScale})` }}>
              <div className="text-7xl font-black glow-medium leading-none">{score}</div>
              <div className="text-xs text-white/70 mt-1">Compatibility</div>
            </div>
          </div>
        )}

        {/* Cube stays centered below */}
        <div className="mt-2 w-full max-w-xs">
          <ThreeCube
            shattered={shattered}
            onShatter={() => setShattered(true)}
            hintText={`${isMobile ? "TAP" : "CLICK"} TO SHATTER THE ICE`}
          />
        </div>
      </div>

      {/* BOTTOM TRAY (always present). Only its CONTENT fades in after score. */}
      <div className="h-20 px-3 pb-3">
        <p className="text-white/65 text-xs mb-2">You both like</p>
        <div className={`transition-opacity duration-500 ${chipsContentVisible ? "opacity-100" : "opacity-0"}`}>
          <HorizontalChips userA={VIEWER.interests} userB={profile.interests} />
        </div>
      </div>
    </div>
  );
}

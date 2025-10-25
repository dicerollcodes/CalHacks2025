export default function SocialButtons({ socials = {} }) {
  const items = [];

  if (socials.ig) {
    items.push({
      key: "ig",
      href: `https://instagram.com/${socials.ig}`,
      label: `@${socials.ig}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 .001 7.001A3.5 3.5 0 0 0 12 9.5zM18 7.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
      ),
    });
  }

  if (socials.discord) {
    items.push({
      key: "discord",
      href: `https://discord.com/users/${encodeURIComponent(socials.discord)}`,
      label: socials.discord,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M20 4a4 4 0 0 0-3.5-2H7.5A4 4 0 0 0 4 4v12a4 4 0 0 0 4 4l.5-1.5 1 .5h5l1-.5.5 1.5a4 4 0 0 0 4-4V4zm-6.6 4.5c.6 0 1.1.5 1.1 1.1s-.5 1.2-1.1 1.2-1.1-.6-1.1-1.2.5-1.1 1.1-1.1zm-2.8 0c.6 0 1.1.5 1.1 1.1s-.5 1.2-1.1 1.2-1.1-.6-1.1-1.2.5-1.1 1.1-1.1z"/>
        </svg>
      ),
    });
  }

  if (!items.length) return null;

  return (
    <div className="flex items-center gap-2">
      {items.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white hover:bg-white/10"
        >
          {s.icon}
          <span>{s.label}</span>
        </a>
      ))}
    </div>
  );
}

export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const text = dark ? "text-white/70" : "text-bark/60";
  return (
    <div
      className={`flex items-center justify-between px-5 h-10 text-[11px] font-medium ${
        dark ? "bg-bark text-white/70" : "bg-cream text-text-muted"
      }`}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dark ? "bg-white/50" : "bg-bark/30"}`} />
        <span className={`w-1.5 h-1.5 rounded-full ${dark ? "bg-white/50" : "bg-bark/30"}`} />
        <span className={`w-1.5 h-1.5 rounded-full ${dark ? "bg-white/50" : "bg-bark/30"}`} />
        <svg className={`w-3.5 h-3.5 ${dark ? "text-white/70" : "text-bark/60"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className={`w-3.5 h-3.5 ${dark ? "text-white/70" : "text-bark/60"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

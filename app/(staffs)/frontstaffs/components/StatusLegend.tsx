const LEGEND_ITEMS = [
  { label: "Available", color: "bg-sage" },
  { label: "Occupied", color: "bg-gold" },
  { label: "Needs attention", color: "bg-rose" },
  { label: "Reserved", color: "bg-text-hint" },
];

export default function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-[12px] text-text-muted">
          <span className={`w-2 h-2 rounded-sm ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

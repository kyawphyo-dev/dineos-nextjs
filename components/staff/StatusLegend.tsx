const LEGEND_ITEMS = [
  { label: "Available", color: "bg-green-500" },
  { label: "Occupied", color: "bg-blue-500" },
  { label: "Needs attention", color: "bg-red-500" },
  { label: "Request bill", color: "bg-yellow-500" },
  { label: "Reserved", color: "bg-cyan-700" },
  { label: "Cleaning", color: "bg-gray-500" },
];

export default function StatusLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 text-[12px] text-text-muted"
        >
          <span className={`w-2 h-2 rounded-sm ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

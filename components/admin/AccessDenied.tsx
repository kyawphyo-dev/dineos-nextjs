import { Lock } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center mb-4">
        <Lock className="w-5 h-5 text-text-hint" />
      </div>
      <p className="text-[15px] font-medium text-text-primary mb-1">Owner access only</p>
      <p className="text-[13px] text-text-muted max-w-xs">
        Sales reports contain financial data restricted to Owner-level accounts.
      </p>
    </div>
  );
}

import { AlertTriangle, Bell } from "lucide-react";

import CallStaffDemoButton from "./CallStaffDemoButton";

export default function NoDiningSessionView({
  tableIdentifier,
  tableNumber,
}: {
  tableIdentifier: string;
  tableNumber?: string | null;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <div className="bg-bark px-5 pt-6 pb-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-clay opacity-10 translate-x-8 -translate-y-8" />
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[11px] text-white/60 font-medium">
            Session not found
          </span>
        </div>
        <h1 className="text-[22px] font-medium text-white leading-snug">
          There is no dining session
          <br />
          for this table
        </h1>
        <p className="text-[13px] text-clay-mid mt-1">
          Please call staff to start a session before ordering.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-clay rounded-xl px-3.5 py-2">
          <span className="text-[11px] text-white/75">Table</span>
          <span className="w-px h-4 bg-white/25" />
          <span className="text-[15px] font-medium text-white">
            {tableNumber ?? tableIdentifier}
          </span>
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        <div className="bg-white rounded-2xl border border-black/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-clay-light flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-clay-dark" />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-text-primary">
                Call staff to help
              </p>
              <p className="text-[12px] text-text-muted mt-0.5">
                Staff can start a dining session for your table.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <CallStaffDemoButton />
        </div>
      </div>
    </div>
  );
}

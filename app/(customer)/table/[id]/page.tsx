"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  Package,
  QrCode,
  Users,
  Phone,
  X,
  Loader2,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCustomerTableSession } from "../../../../context/CustomerTableSessionProvider";
import UpdateTableStatusCustomer from "@/lib/actions/customer/UpdateTableStatusCustomer.action";

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const tableId = params.id as string;
  const { setTableId } = useCart();
  const { restaurant, branch, table, session } = useCustomerTableSession();
  const [, startTransition] = useTransition();
  const [isCallingStaff, setIsCallingStaff] = useState(false);
  const [isCancellingStaff, setIsCancellingStaff] = useState(false);

  const isNeedAttentionActive = table.status === "need_attention";

  useEffect(() => {
    setTableId(tableId);
  }, [tableId, setTableId]);

  const handleCallStaff = async () => {
    if (!tableId || isCallingStaff) return;
    setIsCallingStaff(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "need_attention",
      });
      if (res.success) {
        toast.success("Staff has been notified!");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.message ?? "Failed to call staff. Please try again.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCallingStaff(false);
    }
  };

  const handleCancelCallStaff = async () => {
    if (!tableId || isCancellingStaff) return;
    setIsCancellingStaff(true);
    try {
      const res = await UpdateTableStatusCustomer({
        tableId,
        status: "occupied",
      });
      if (res.success) {
        toast.success("Call staff cancelled.");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.message ?? "Failed to cancel call staff.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsCancellingStaff(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <div className="bg-bark px-5 pt-6 pb-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-clay opacity-10 translate-x-8 -translate-y-8" />
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[11px] text-white/60 font-medium">
            QR scanned
          </span>
        </div>
        <h1 className="text-[22px] font-medium text-white leading-snug">
          {restaurant.name}
        </h1>
        <p className="text-[13px] text-clay-mid mt-1">
          {branch.name}
          {branch.location ? ` · ${branch.location}` : ""}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-clay rounded-xl px-3.5 py-2">
          <span className="text-[11px] text-white/75">Table</span>
          <span className="w-px h-4 bg-white/25" />
          <span className="text-[15px] font-medium text-white">
            {table.tableNumber}
          </span>
        </div>
      </div>

      <div className="flex-1 px-5 py-5">
        <p className="text-[13px] text-text-muted mb-3">Confirm your package</p>
        <div className="mb-5">
          <AssignedPackageCard
            name={session.package?.name ?? "Package not assigned"}
            description={
              session.package?.description ??
              "Please ask staff to assign a package for this session."
            }
            price={session.package?.price ?? null}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(`/table/${tableId}/menu`)}
          className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors"
          disabled={!session.package}
        >
          <ArrowRight className="w-4 h-4" />
          Confirm and continue
        </motion.button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-text-hint">
          <Users className="w-3.5 h-3.5" />
          <span>{session.guestCount} guests at this table</span>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-black/10 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-clay-light flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-clay-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-text-primary">
                Need help?
              </p>
              <p className="text-[12px] text-text-muted mt-0.5">
                Call staff to your table for assistance.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {isNeedAttentionActive ? (
            <div className="flex flex-col gap-2">
              <div className="bg-rose-light rounded-2xl p-3.5 text-center">
                <p className="text-[13px] font-medium text-rose">
                  <Phone className="w-4 h-4 inline mr-1.5" />
                  Staff has been notified. They will arrive shortly.
                </p>
              </div>
              <motion.button
                whileTap={!isCancellingStaff ? { scale: 0.97 } : {}}
                onClick={handleCancelCallStaff}
                disabled={isCancellingStaff}
                className="w-full bg-white border-[1.5px] border-text-hint text-text-primary rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-cream-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCancellingStaff ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {isCancellingStaff ? "Cancelling…" : "Cancel call staff"}
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={!isCallingStaff ? { scale: 0.97 } : {}}
              onClick={handleCallStaff}
              disabled={isCallingStaff}
              className="w-full bg-white border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCallingStaff ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              {isCallingStaff ? "Calling…" : "Call staff"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

function AssignedPackageCard({
  name,
  description,
  price,
}: {
  name: string;
  description: string;
  price: number | null;
}) {
  return (
    <div className="w-full text-left bg-white rounded-2xl border border-black/10 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-clay-light flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-clay-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-text-primary">{name}</p>
          <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
        </div>
        {price !== null && (
          <div className="text-right shrink-0">
            <p className="text-[18px] font-medium text-clay-dark">฿{price}</p>
            <p className="text-[11px] text-text-hint">/ person</p>
          </div>
        )}
      </div>
    </div>
  );
}

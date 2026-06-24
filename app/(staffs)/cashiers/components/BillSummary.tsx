"use client";

import type { DiningSession, Discount } from "../types";
import { calculateBill } from "@/context/SessionsContext";

interface Props {
  session: DiningSession;
  discount: Discount | null;
}

export default function BillSummary({ session, discount }: Props) {
  const { subtotal, discountAmount, total } = calculateBill(session, discount);
  const orderLabel = session.orderIds.length > 1 ? `Orders #${session.orderIds.join(", #")}` : `Order #${session.orderIds[0]}`;

  return (
    <div className="bg-white rounded-2xl border border-black/8 p-5">
      <p className="text-[14px] font-medium text-text-primary">Order summary</p>
      <p className="text-[11px] text-text-hint mt-0.5 mb-4">
        {orderLabel} · {session.guestCount} guests
      </p>

      <div className="flex flex-col gap-1.5 mb-3">
        {session.items.map((item) => (
          <div key={item.id} className="flex justify-between text-[13px]">
            <span className="text-text-muted">
              {item.qty}× {item.name}
            </span>
            <span className="text-text-primary font-medium">
              ฿{(item.qty * item.price).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-black/8 pt-3 flex flex-col gap-1.5">
        <div className="flex justify-between text-[13px] text-text-muted">
          <span>Subtotal</span>
          <span>฿{subtotal.toLocaleString()}</span>
        </div>
        {discount && discountAmount > 0 && (
          <div className="flex justify-between text-[13px] text-rose">
            <span>Discount {discount.type === "percent" ? `(${discount.value}%)` : "(fixed)"}</span>
            <span>−฿{discountAmount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-[17px] font-semibold text-text-primary pt-2 mt-1 border-t border-black/8">
          <span>Total</span>
          <span>฿{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

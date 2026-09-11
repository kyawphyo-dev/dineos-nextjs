"use client";

import type { DiningSession, Discount } from "@/app/types/cashier";
import {
  calculateBill,
  SERVICE_CHARGE_RATE,
  TAX_RATE,
} from "@/context/CashierSessionContext";

interface Props {
  session: DiningSession;
  discount: Discount | null;
}

export default function BillSummary({ session, discount }: Props) {
  const { subtotal, discountAmount, serviceCharge, tax, grandTotal } =
    calculateBill(session, discount);
  const orderLabel =
    session.orderIds.length > 1
      ? `Orders #${session.orderIds.join(", #")}`
      : `Order #${session.orderIds[0]}`;

  const billSubtotal = session.billSubtotal ?? subtotal;
  const billDiscount = session.billDiscount ?? discountAmount;
  const billGrandTotal = session.billGrandTotal ?? grandTotal;

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
          <span>฿{billSubtotal.toLocaleString()}</span>
        </div>
        {billDiscount > 0 && (
          <div className="flex justify-between text-[13px] text-rose">
            <span>
              Discount{" "}
              {discount?.type === "percent"
                ? `(${discount.value}%)`
                : "(fixed)"}
            </span>
            <span>−฿{billDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px] text-text-muted">
          <span>Service charge ({SERVICE_CHARGE_RATE}%)</span>
          <span>฿{serviceCharge.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[13px] text-text-muted">
          <span>VAT ({TAX_RATE}%)</span>
          <span>฿{tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[17px] font-semibold text-text-primary pt-2 mt-1 border-t border-black/8">
          <span>Grand total</span>
          <span>฿{billGrandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

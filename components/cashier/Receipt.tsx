"use client";

import type { ReceiptRecord } from "@/app/types/cashier";

const METHOD_LABEL: Record<ReceiptRecord["method"], string> = {
  cash: "Cash",
  card: "Card",
  qr: "QR Pay",
};

interface Props {
  receipt: ReceiptRecord;
}

/**
 * Print-isolated receipt layout. Designed to be narrow (like a physical
 * receipt) and to render cleanly on its own via the `receipt-print-area`
 * class, which `globals.css` uses to hide everything else during print.
 */
export default function Receipt({ receipt }: Props) {
  return (
    <div
      id="receipt-print-area"
      className="receipt-print-area bg-white rounded-2xl border border-black/8 p-6 max-w-[340px] mx-auto font-mono"
    >
      <div className="text-center mb-4">
        <p className="text-[15px] font-semibold tracking-wide text-text-primary">BAAN RIM NAAM</p>
        <p className="text-[10px] text-text-muted mt-0.5">Thai Kitchen · Sukhumvit, Bangkok</p>
        <p className="text-[10px] text-text-hint">Tax ID: 0-1055-XXXXX-XX-X</p>
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="flex flex-col gap-0.5 text-[11px] text-text-muted">
        <Row label="Receipt #" value={receipt.id} />
        <Row label="Table" value={receipt.tableId} />
        <Row label="Guests" value={String(receipt.guestCount)} />
        <Row label="Date" value={receipt.paidDate} />
        <Row label="Time" value={receipt.paidAt} />
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="flex flex-col gap-1.5">
        {receipt.items.map((item) => (
          <div key={item.id} className="flex justify-between text-[12px] text-text-primary">
            <span className="flex-1 pr-2">
              {item.name}
              <span className="text-text-hint"> ×{item.qty}</span>
            </span>
            <span className="flex-shrink-0">{(item.qty * item.price).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="flex flex-col gap-1 text-[12px]">
        <div className="flex justify-between text-text-muted">
          <span>Subtotal</span>
          <span>฿{receipt.subtotal.toLocaleString()}</span>
        </div>
        {receipt.discount && receipt.discountAmount > 0 && (
          <div className="flex justify-between text-rose">
            <span>
              Discount {receipt.discount.type === "percent" ? `(${receipt.discount.value}%)` : "(fixed)"}
            </span>
            <span>−฿{receipt.discountAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="border-t border-black/20 my-2" />

      <div className="flex justify-between text-[15px] font-semibold text-text-primary mb-3">
        <span>TOTAL</span>
        <span>฿{receipt.total.toLocaleString()}</span>
      </div>

      <div className="flex justify-between text-[11px] text-text-muted mb-4">
        <span>Paid via</span>
        <span className="font-medium text-text-primary">{METHOD_LABEL[receipt.method]}</span>
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <p className="text-center text-[10px] text-text-hint mt-3">
        Thank you for dining with us
      </p>
      <p className="text-center text-[10px] text-text-hint">Powered by DineOS</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}

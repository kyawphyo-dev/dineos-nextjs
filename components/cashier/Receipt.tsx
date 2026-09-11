"use client";

import type { ReceiptRecord, ReceiptPayment } from "@/app/types/cashier";

const METHOD_LABEL: Record<ReceiptPayment["method"], string> = {
  cash: "Cash",
  card: "Card",
  qr: "QR Pay",
};

const METHOD_ICON: Record<ReceiptPayment["method"], string> = {
  cash: "💵",
  card: "💳",
  qr: "📱",
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
  const displayItems = receipt.items.reduce(
    (acc: typeof receipt.items, item) => {
      const existing = acc.find((x) => x.name === item.name && x.price === item.price);
      if (existing) {
        existing.qty += item.qty;
      } else {
        acc.push({ ...item });
      }
      return acc;
    },
    [],
  );

  return (
    <div
      id="receipt-print-area"
      className="receipt-print-area bg-white rounded-2xl border border-black/8 p-6 max-w-[340px] mx-auto font-mono"
    >
      <div className="text-center mb-4">
        <p className="text-[15px] font-semibold tracking-wide text-text-primary">
          BAAN RIM NAAM
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">
          Thai Kitchen · Sukhumvit, Bangkok
        </p>
        <p className="text-[10px] text-text-hint mt-0.5">
          Tax ID: 0-1055-XXXXX-XX-X
        </p>
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="flex flex-col gap-0.5 text-[11px] text-text-muted">
        <Row label="Receipt #" value={receipt.id} monoValue />
        <Row label="Table" value={receipt.tableId} />
        <Row label="Package" value={receipt.packageName} />
        <Row label="Guests" value={String(receipt.guestCount)} />
        <Row label="Date" value={receipt.paidDate} />
        <Row label="Time" value={receipt.paidAt} />
        {receipt.cashierName && (
          <Row label="Cashier" value={receipt.cashierName} />
        )}
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="flex flex-col gap-1.5">
        {displayItems.map((item) => (
          <div
            key={`${item.id}-${item.price}`}
            className="flex justify-between text-[12px] text-text-primary"
          >
            <span className="flex-1 pr-2">
              {item.name}
              <span className="text-text-hint"> ×{item.qty}</span>
              <br />
              <span className="text-[10px] text-text-hint">
                @ ฿{item.price.toLocaleString()}
              </span>
            </span>
            <span className="flex-shrink-0 text-right self-end">
              {(item.qty * item.price).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="flex flex-col gap-1 text-[12px]">
        <Row label="Subtotal" value={`฿${receipt.subtotal.toLocaleString()}`} />
        {receipt.discount && receipt.discountAmount > 0 && (
          <Row
            label={
              receipt.discount.type === "percent"
                ? `Discount (${receipt.discount.value}%)`
                : "Discount (fixed)"
            }
            value={`−฿${receipt.discountAmount.toLocaleString()}`}
            emphasize="discount"
          />
        )}
        <Row
          label={`Service charge (${Number(receipt.serviceChargeRate ?? 5).toFixed(0)}%)`}
          value={`฿${Number(receipt.serviceCharge ?? 0).toLocaleString()}`}
        />
        <Row
          label={`VAT (${Number(receipt.taxRate ?? 7).toFixed(0)}%)`}
          value={`฿${Number(receipt.tax ?? 0).toLocaleString()}`}
        />
      </div>

      <div className="border-t border-black/20 my-2" />

      <div className="flex justify-between text-[15px] font-semibold text-text-primary mb-3">
        <span>GRAND TOTAL</span>
        <span>฿{receipt.grandTotal.toLocaleString()}</span>
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="mb-1">
        <p className="text-[11px] text-text-muted mb-1.5">Payment details</p>
        <div className="flex flex-col gap-1.5">
          {(receipt.payments?.length ? receipt.payments : [
            {
              method: receipt.method,
              amount: receipt.grandTotal,
            },
          ]).map((p, idx) => (
            <div
              key={idx}
              className="border border-black/8 rounded-lg px-2.5 py-2 text-[11px]"
            >
              <div className="flex justify-between">
                <span className="font-medium text-text-primary flex items-center gap-1.5">
                  <span>{METHOD_ICON[p.method]}</span>
                  <span>{METHOD_LABEL[p.method]}</span>
                </span>
                <span className="font-semibold text-text-primary">
                  ฿{p.amount.toLocaleString()}
                </span>
              </div>
              {p.referenceNo && (
                <div className="flex justify-between mt-1 text-[10px] text-text-hint font-mono">
                  <span>Ref</span>
                  <span>{p.referenceNo}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <div className="flex flex-col gap-1 text-[11px] text-text-muted mb-4">
        <div className="flex justify-between">
          <span>Total paid</span>
          <span className="font-semibold text-success">
            ฿{receipt.grandTotal.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Change due</span>
          <span className="font-medium text-text-primary">฿0</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black/20 my-3" />

      <p className="text-center text-[10px] text-text-hint mt-3">
        Thank you for dining with us
      </p>
      <p className="text-center text-[10px] text-text-hint">
        Please come again 🙏
      </p>
      <p className="text-center text-[9px] text-text-hint mt-2 opacity-60">
        Powered by DineOS
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  emphasize,
  monoValue,
}: {
  label: string;
  value: string;
  emphasize?: "discount" | "primary";
  monoValue?: boolean;
}) {
  const valueClass =
    emphasize === "discount"
      ? "text-rose"
      : emphasize === "primary"
      ? "text-text-primary font-semibold"
      : "text-text-primary";
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={`${valueClass} ${monoValue ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

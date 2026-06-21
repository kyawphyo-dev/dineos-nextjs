import { ShoppingBag } from "lucide-react";

export default function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-clay-light flex items-center justify-center mb-4">
          <ShoppingBag className="w-7 h-7 text-clay-dark" />
        </div>
        <p className="text-[15px] font-medium text-text-primary mb-1">Your cart is empty</p>
        <p className="text-[13px] text-text-muted mb-5">Add some dishes from the menu to get started.</p>
        <button
          onClick={onBrowse}
          className="bg-clay text-white rounded-xl px-5 py-2.5 text-[13px] font-medium"
        >
          Browse menu
        </button>
      </div>
    );
  }
"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/app/admin/components/PageHeader";
import { useCatalog } from "@/context/CatalogContext";

export default function MenuItemsPage() {
  const { menuItems, categories, addMenuItem, toggleMenuItemAvailable, removeMenuItem } =
    useCatalog();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const handleAdd = () => {
    const priceNum = parseFloat(price);
    if (!name.trim() || isNaN(priceNum) || !categoryId) return;
    addMenuItem({ name: name.trim(), price: priceNum, categoryId, available: true });
    setName("");
    setPrice("");
  };

  return (
    <div>
      <PageHeader title="Menu Items" subtitle={`${menuItems.length} items across ${categories.length} categories`} />

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="flex-1 min-w-[160px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-xl border border-black/10 px-3 py-2.5 text-[13px] outline-none focus:border-clay"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price ฿"
          inputMode="decimal"
          className="w-24 rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <button
          onClick={handleAdd}
          className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_90px_90px_40px] gap-2 px-4 py-2.5 bg-cream-dark text-[10px] font-medium text-text-hint uppercase tracking-wider">
          <span>Item</span>
          <span>Category</span>
          <span>Price</span>
          <span>Available</span>
          <span></span>
        </div>
        {menuItems.map((item, i) => (
          <div
            key={item.id}
            className={`grid grid-cols-[1fr_120px_90px_90px_40px] gap-2 items-center px-4 py-3 ${
              i !== menuItems.length - 1 ? "border-b border-black/6" : ""
            }`}
          >
            <span className="text-[13px] font-medium text-text-primary truncate">{item.name}</span>
            <span className="text-[12px] text-text-muted truncate">{categoryName(item.categoryId)}</span>
            <span className="text-[13px] text-clay-dark font-medium">฿{item.price}</span>
            <button
              onClick={() => toggleMenuItemAvailable(item.id)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full w-fit ${
                item.available ? "bg-sage-light text-sage" : "bg-rose-light text-rose"
              }`}
            >
              {item.available ? "Available" : "Sold out"}
            </button>
            <button
              onClick={() => removeMenuItem(item.id)}
              className="text-text-hint hover:text-rose p-1 justify-self-end"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {menuItems.length === 0 && (
          <p className="text-center text-text-hint text-[13px] py-10">No menu items yet.</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import PageHeader from "@/app/admin/components/PageHeader";
import { useCatalog } from "@/context/CatalogContext";

export default function CategoriesPage() {
  const { categories, addCategory, removeCategory } = useCatalog();
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim());
    setNewName("");
  };

  return (
    <div>
      <PageHeader title="Categories" subtitle={`${categories.length} categories`} />

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New category name (e.g. Beverages)"
          className="flex-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
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
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              i !== categories.length - 1 ? "border-b border-black/6" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-clay-light flex items-center justify-center flex-shrink-0">
              <Tag className="w-3.5 h-3.5 text-clay-dark" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-text-primary">{cat.name}</p>
              <p className="text-[11px] text-text-hint">{cat.itemCount} items</p>
            </div>
            <button
              onClick={() => removeCategory(cat.id)}
              className="text-text-hint hover:text-rose p-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-text-hint text-[13px] py-10">No categories yet.</p>
        )}
      </div>
    </div>
  );
}

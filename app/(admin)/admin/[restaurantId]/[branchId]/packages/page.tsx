"use client";

import RouteGuard from "@/components/shared/RouteGuard";
import { useState } from "react";
import { Plus, Trash2, Package as PackageIcon } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { useCatalog } from "@/context/CatalogContext";

function PackagesDashboard() {
  const { packages, addPackage, removePackage } = useCatalog();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = () => {
    const priceNum = parseFloat(price);
    if (!name.trim() || isNaN(priceNum)) return;
    addPackage({ name: name.trim(), description: description.trim(), price: priceNum });
    setName("");
    setDescription("");
    setPrice("");
  };

  return (
    <div>
      <PageHeader title="Packages" subtitle={`${packages.length} dining packages`} />

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Package name"
          className="flex-1 min-w-[140px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="flex-1 min-w-[160px] rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price ฿ / person"
          inputMode="decimal"
          className="w-32 rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
        />
        <button
          onClick={handleAdd}
          className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-2xl border border-black/8 p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-clay-light flex items-center justify-center flex-shrink-0">
              <PackageIcon className="w-4 h-4 text-clay-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-text-primary">{pkg.name}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{pkg.description}</p>
              <p className="text-[13px] font-medium text-clay-dark mt-1.5">฿{pkg.price} / person</p>
            </div>
            <button
              onClick={() => removePackage(pkg.id)}
              className="text-text-hint hover:text-rose p-1 flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      {packages.length === 0 && (
        <p className="text-center text-text-hint text-[13px] py-10">No packages yet.</p>
      )}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <RouteGuard allow={["owner", "manager"]}>
      <PackagesDashboard />
    </RouteGuard>
  );
}

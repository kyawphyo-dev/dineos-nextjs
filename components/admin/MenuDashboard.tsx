"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NotebookText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Menu } from "@/app/types/admin";
import PageHeader from "@/components/admin/PageHeader";
import CreateMenu from "@/lib/actions/CreateMenu.action";

type Props = {
  menuList: Menu[];
  branchId: string;
};

function MenuDashboard({ menuList, branchId }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMenuAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Menu name is required");
      return;
    }

    try {
      setLoading(true);

      const result = await CreateMenu({
        name,
        branchId,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setName("");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuDelete = async (menuId: string) => {
    alert(`Delete menu ${menuId}`);
  };

  return (
    <div>
      <form onSubmit={handleMenuAdd}>
        <PageHeader
          title="Menu"
          subtitle={`${menuList.length} menu${
            menuList.length !== 1 ? "s" : ""
          }`}
        />

        <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4 w-3/4">
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Menu name"
              className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-1/4 bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} />
              {loading ? "Adding..." : "Add Menu"}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuList.length > 0 ? (
          menuList.map((menu) => (
            <motion.div
              key={menu.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl border border-black/8 p-4 hover:border-clay/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-clay-light flex items-center justify-center">
                  <NotebookText size={18} className="text-clay-dark" />
                </div>

                <button
                  type="button"
                  className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuDelete(menu.id);
                  }}
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>

              <h3 className="text-[15px] font-semibold">{menu.name}</h3>

              <p className="text-xs text-gray-500 mt-1">
                {menu.categories?.length ?? 0} categor
                {(menu.categories?.length ?? 0) === 1 ? "y" : "ies"}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <NotebookText size={36} className="mx-auto text-gray-400 mb-3" />

            <h3 className="font-medium text-gray-700">No menus yet</h3>

            <p className="text-sm text-gray-500 mt-1">
              Create your first menu to organize categories and menu items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuDashboard;

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NotebookText, Plus, Trash2, Edit, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Menu } from "@/app/types/admin";
import PageHeader from "@/components/admin/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import ConfirmDelete from "@/components/shared/ConfirmDelete";
import CreateMenu from "@/lib/actions/CreateMenu.action";
import { UpdateMenu } from "@/lib/actions/UpdateMenu.action";
import { DeleteMenu } from "@/lib/actions/DeleteMenu.action";

type Props = {
  menuList: Menu[];
  branchId: string;
};

function MenuDashboard({ menuList, branchId }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  const filteredMenuList = useMemo(() => {
    if (!search.trim()) return menuList;
    const q = search.toLowerCase();
    return menuList.filter(
      (menu) =>
        menu.name.toLowerCase().includes(q) ||
        (menu.categories || []).some(
          (cat) =>
            cat.name.toLowerCase().includes(q) ||
            (cat.description || "").toLowerCase().includes(q),
        ),
    );
  }, [menuList, search]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Menu name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingMenu) {
        const result = await UpdateMenu({
          id: editingMenu.id,
          name,
          branchId,
        });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
      } else {
        const result = await CreateMenu({
          name,
          branchId,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
      }

      setName("");
      setEditingMenu(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setName(menu.name);
  };

  const cancelEdit = () => {
    setEditingMenu(null);
    setName("");
  };

  const handleMenuDelete = async (menuId: string) => {
    try {
      const result = await DeleteMenu(menuId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <PageHeader
        title="Menu"
        subtitle={`${menuList.length} menu${menuList.length !== 1 ? "s" : ""}`}
        center={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search menus or categories..."
            resultCount={filteredMenuList.length}
            totalCount={menuList.length}
          />
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4 w-3/4">
          {editingMenu && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-clay-light rounded-xl">
              <Edit className="w-4 h-4 text-clay" />
              <span className="text-sm text-clay font-medium">
                Editing: {editingMenu.name}
              </span>
              <button
                type="button"
                onClick={cancelEdit}
                className="ml-auto text-text-hint hover:text-rose transition"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Menu name"
              className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
              required
            />
            {editingMenu && (
              <button
                type="button"
                onClick={cancelEdit}
                className="w-1/4 bg-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-[13px] font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-1/4 bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {editingMenu ? (
                <>
                  <Edit size={16} />
                  {loading ? "Updating..." : "Update Menu"}
                </>
              ) : (
                <>
                  <Plus size={16} />
                  {loading ? "Adding..." : "Add Menu"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenuList.length > 0 ? (
          filteredMenuList.map((menu) => (
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

                <div className="flex gap-1">
                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl hover:bg-clay/10 flex items-center justify-center transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMenu(menu);
                    }}
                  >
                    <Edit size={16} className="text-clay" />
                  </button>
                  <ConfirmDelete
                    trigger={
                      <button
                        type="button"
                        className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center transition"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    }
                    title="Delete Menu"
                    description="Are you sure you want to delete this menu? This will also delete all categories, menu items, and their images from Cloudinary."
                    onConfirm={() => handleMenuDelete(menu.id)}
                  />
                </div>
              </div>

              <h3 className="text-[15px] font-semibold">{menu.name}</h3>

              <p className="text-xs text-gray-500 mt-1">
                {menu.categories?.length ?? 0} categor
                {(menu.categories?.length ?? 0) === 1 ? "y" : "ies"}
              </p>
            </motion.div>
          ))
        ) : search.trim() ? (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <NotebookText size={36} className="mx-auto text-gray-400 mb-3" />
            <h3 className="font-medium text-gray-700">No matching menus</h3>
            <p className="text-sm text-gray-500 mt-1">
              Try a different search term.
            </p>
          </div>
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

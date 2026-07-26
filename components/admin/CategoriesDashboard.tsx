"use client";
import PageHeader from "@/components/admin/PageHeader";
import ConfirmDelete from "@/components/shared/ConfirmDelete";
import SearchBar from "@/components/shared/SearchBar";
import { useState, useMemo } from "react";
import { Plus, Trash2, Tag, BookOpen, Edit, XCircle } from "lucide-react";
import { Menu, Category as CategoryType } from "@/app/types/admin";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CreateCategory from "@/lib/actions/CreateCategory.action";
import { UpdateCategory } from "@/lib/actions/UpdateCategory.action";
import { DeleteCategory } from "@/lib/actions/DeleteCategory.action";
import { DeleteMenu } from "@/lib/actions/DeleteMenu.action";

function CategoriesDashboard({
  menuList: initialMenuList,
}: {
  menuList: Menu[];
}) {
  const router = useRouter();
  const [menuList, setMenuList] = useState(initialMenuList);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    menuId: "",
    description: "",
  });
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    menuId: string;
    name: string;
    description?: string | null;
  } | null>(null);
  const [error, setError] = useState("");

  const totalCategories = useMemo(() => {
    return menuList.reduce(
      (sum, menu) => sum + (menu.categories?.length || 0),
      0,
    );
  }, [menuList]);

  const { filteredMenuList, filteredCategoryCount } = useMemo(() => {
    if (!search.trim()) {
      return {
        filteredMenuList: menuList,
        filteredCategoryCount: totalCategories,
      };
    }
    const q = search.toLowerCase();
    let count = 0;
    const filtered = menuList
      .map((menu) => {
        const menuMatches = menu.name.toLowerCase().includes(q);
        const categories = (menu.categories || []).filter((cat) => {
          const catMatches =
            cat.name.toLowerCase().includes(q) ||
            (cat.description || "").toLowerCase().includes(q) ||
            menuMatches;
          if (catMatches) count++;
          return catMatches;
        });
        if (menuMatches && categories.length === 0) {
          count += menu.categories?.length || 0;
          return { ...menu, categories: menu.categories };
        }
        return { ...menu, categories };
      })
      .filter(
        (menu) =>
          menu.name.toLowerCase().includes(q) ||
          (menu.categories && menu.categories.length > 0),
      );
    return { filteredMenuList: filtered, filteredCategoryCount: count };
  }, [menuList, search, totalCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter a category name");
    if (!form.menuId) return setError("Please select a menu");
    try {
      if (editingCategory) {
        const result = await UpdateCategory({
          id: editingCategory.id,
          name: form.name,
          menuId: form.menuId,
          description: form.description,
        });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
      } else {
        const result = await CreateCategory({ form });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
      }
      setForm({
        name: "",
        menuId: "",
        description: "",
      });
      setEditingCategory(null);
      window.location.reload();
    } catch (e) {
      toast.error("Something went wrong");
      console.error(e);
    } finally {
      setError("");
    }
  };

  const handleEditCategory = (
    category: CategoryType,
    currentMenuId: string,
  ) => {
    setEditingCategory({
      id: category.id,
      menuId: currentMenuId,
      name: category.name,
      description: category.description,
    });
    setForm({
      name: category.name,
      menuId: currentMenuId,
      description: category.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setForm({
      name: "",
      menuId: "",
      description: "",
    });
    setError("");
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const result = await DeleteCategory(categoryId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      window.location.reload();
    } catch (e) {
      toast.error("Something went wrong");
      console.error(e);
    }
  };

  const handleDeleteMenu = async (menuId: string) => {
    try {
      const result = await DeleteMenu(menuId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      window.location.reload();
    } catch (e) {
      toast.error("Something went wrong");
      console.error(e);
    }
  };

  const handleDeleteItem = (
    menuId: string,
    categoryId: string,
    itemId: string,
  ) => {
    setMenuList((prev) =>
      prev.map((menu) => {
        if (menu.id === menuId) {
          return {
            ...menu,
            categories: menu.categories?.map((cat) => {
              if (cat.id === categoryId) {
                return {
                  ...cat,
                  items: cat.items?.filter((item) => item.id !== itemId),
                };
              }
              return cat;
            }),
          };
        }
        return menu;
      }),
    );
    toast.success("Item deleted (demo)");
  };

  return (
    <div>
      <PageHeader
        title="Categories & Menus"
        subtitle={`${menuList.length} menus · ${totalCategories} categories`}
        center={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search menus, categories..."
            resultCount={filteredCategoryCount}
            totalCount={totalCategories}
          />
        }
      />

      <div className="flex items-center text-center justify-center mb-5">
        {error && (
          <div className="w-1/2 bg-rose-light text-rose text-[12px] rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4">
        {editingCategory && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-clay-light rounded-xl">
            <Edit className="w-4 h-4 text-clay" />
            <span className="text-sm text-clay font-medium">
              Editing: {editingCategory.name}
            </span>
            <button
              onClick={cancelEdit}
              className="ml-auto text-text-hint hover:text-rose transition"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Category name (e.g. Beverages)"
            className="flex-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (Optional)"
            className="flex-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay"
          />
          <select
            value={form.menuId}
            onChange={(e) => setForm({ ...form, menuId: e.target.value })}
            className="min-w-[180px] rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-clay"
          >
            <option value="">Select Menu</option>
            {menuList.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.name}
              </option>
            ))}
          </select>
          {editingCategory && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-gray-100 text-gray-600 rounded-xl px-4 py-2.5 text-[13px] font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 flex-shrink-0"
          >
            {editingCategory ? (
              <>
                <Edit className="w-3.5 h-3.5" />
                Update
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {filteredMenuList.map((menu) => (
          <div
            key={menu.id}
            className=" rounded-2xl border border-black/8 overflow-hidden"
          >
            <div className="px-4 py-3 bg-cream-dark border-b border-black/6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-clay-light flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-clay-dark" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-text-primary">
                  {menu.name}
                </p>
                <p className="text-[11px] text-text-hint">
                  {menu.categories?.length || 0} categories
                </p>
              </div>
              <ConfirmDelete
                trigger={
                  <button className="text-text-hint hover:text-rose p-1.5 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                }
                title="Delete Menu"
                description="Are you sure you want to delete this menu? This will also delete all categories and menu items associated with it, along with their images from Cloudinary."
                onConfirm={() => handleDeleteMenu(menu.id)}
              />
            </div>
            {menu.categories && menu.categories.length > 0 ? (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {menu.categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl border border-black/6 overflow-hidden"
                  >
                    <div className="px-3 py-2 bg-sage-light/30 border-b border-black/4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-sage-light flex items-center justify-center flex-shrink-0">
                        <Tag className="w-3 h-3 text-sage" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-medium text-text-primary">
                          {category.name}
                        </p>
                        <p className="text-[10px] text-text-hint">
                          {category._count?.items || 0} items
                        </p>
                      </div>
                      <button
                        onClick={() => handleEditCategory(category, menu.id)}
                        className="text-text-hint hover:text-clay p-1 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <ConfirmDelete
                        trigger={
                          <button className="text-text-hint hover:text-rose p-1 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        }
                        title="Delete Category"
                        description="Are you sure you want to delete this category? This will also delete all menu items in this category, along with their images from Cloudinary."
                        onConfirm={() => handleDeleteCategory(category.id)}
                      />
                    </div>
                    {category.description && (
                      <p className="px-3 py-1 text-[10px] text-text-hint border-b border-black/4">
                        {category.description}
                      </p>
                    )}
                    {/* {category.items && category.items.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-lg border border-black/4 p-2 flex items-center justify-between"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-text-primary truncate">
                                {item.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[11px] font-medium text-clay-dark">
                                ฿{item.price}
                              </span>
                              <span
                                className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${item.status === "available" ? "bg-sage-light text-sage" : "bg-rose-light text-rose"}`}
                              >
                                {item.status === "available" ? "Avail" : "Sold"}
                              </span>
                              <button
                                onClick={() =>
                                  handleDeleteItem(
                                    menu.id,
                                    category.id,
                                    item.id,
                                  )
                                }
                                className="text-text-hint hover:text-rose p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-[11px] text-text-hint">
                          No items yet.
                        </p>
                      </div>
                    )} */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-[13px] text-text-hint">
                  No categories yet for this menu.
                </p>
              </div>
            )}
          </div>
        ))}
        {filteredMenuList.length === 0 && search.trim() && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <BookOpen size={36} className="mx-auto text-gray-400 mb-3" />
            <h3 className="font-medium text-gray-700">
              No matching menus or categories
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Try a different search term.
            </p>
          </div>
        )}
        {menuList.length === 0 && !search.trim() && (
          <div className="bg-white rounded-2xl border border-black/8 p-6 text-center">
            <p className="text-[13px] text-text-hint">No menus found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default CategoriesDashboard;

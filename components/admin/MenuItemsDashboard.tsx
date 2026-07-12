"use client";
import { useState } from "react";
import { Plus, Trash2, Upload, X, Edit } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Menu as MenuType } from "@/app/types/admin";
import { CreateMenuItem } from "@/lib/actions/CreateMenuItem.action";
import DeleteMenuItem from "@/lib/actions/DeleteMenuItem.action";
import ToggleMenuItemAvailability from "@/lib/actions/ToggleMenuItemAvailability.action";
import ConfirmDialog from "../shared/ConfirmDelete";
import ConfirmDelete from "../shared/ConfirmDelete";

type Props = {
  menus?: MenuType[];
};
function MenuItemsDashboard({ menus = [] }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const allCategories = menus.flatMap((menu) =>
    (menu.categories || []).map((cat) => ({
      ...cat,
      menuName: menu.name,
    })),
  );

  const totalItems = menus.reduce((sum, menu) => {
    return (
      sum +
      (menu.categories || []).reduce((catSum, cat) => {
        return catSum + (cat.items || []).length;
      }, 0)
    );
  }, 0);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) return setError("Name is required");
    if (!price.trim()) return setError("Price is required");
    if (!categoryId) return setError("Category is required");
    if (!description.trim()) return setError("Description is required");
    try {
      const data = await CreateMenuItem({
        name,
        price,
        categoryId,
        description,
        image: imageFile || undefined,
      });
      if (!data.success) return setError(data.message);
      setError("");
      window.location.reload();
    } catch (err) {
      setError("Something went wrong at adding item");
      console.error(err);
    } finally {
      setName("");
      setPrice("");
      setCategoryId("");
      setDescription("");
      clearImage();
    }

    setError("");
  };

  const handleToggleAvailable = async (itemId: string) => {
    try {
      const data = await ToggleMenuItemAvailability(itemId);
      if (!data.success) {
        alert(data.message || "Failed to toggle availability");
        return;
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Something went wrong at toggling availability");
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const data = await DeleteMenuItem(itemId);
      if (!data.success) {
        alert(data.message || "Failed to delete menu item");
        return;
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Something went wrong at deleting menu item");
    }
  };

  return (
    <div>
      <PageHeader
        title="Menu Items"
        subtitle={`${totalItems} items across ${allCategories.length} categories`}
      />

      <div className="bg-white rounded-2xl border border-black/8 p-4 mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3">
            {imagePreview ? (
              <div className="relative aspect-square rounded-xl overflow-hidden border border-black/10">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-black/10 hover:border-clay/50 cursor-pointer transition">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="lg:col-span-9 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
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
                <option value="">Select Category</option>
                {allCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.menuName} - {cat.name}
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
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Item description"
              rows={2}
              className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-[13px] outline-none focus:border-clay resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {menus.map((menu) => {
          const menuItemCount = (menu.categories || []).reduce((sum, cat) => {
            return sum + (cat.items || []).length;
          }, 0);

          if (menuItemCount === 0) return null;

          return (
            <div key={menu.id} className="space-y-4">
              <h2 className="text-[18px] font-bold text-clay">{menu.name}</h2>
              {menu.categories && menu.categories.length > 0 ? (
                <div className="space-y-6">
                  {menu.categories.map((category) => {
                    const items = category.items || [];
                    if (items.length === 0) return null;
                    return (
                      <div key={category.id} className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-clay-dark flex items-center gap-2">
                          <span className="text-gray-400 font-normal">•</span>
                          {category.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="bg-white rounded-2xl border border-black/8 overflow-hidden flex flex-col"
                            >
                              {/* Image */}
                              <div className="aspect-video bg-gray-100">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Upload size={32} />
                                  </div>
                                )}
                              </div>
                              {/* Content */}
                              <div className="p-4 flex-1 flex flex-col">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-[15px] font-semibold text-text-primary">
                                    {item.name}
                                  </h4>
                                  <div>
                                    <button className="text-text-hint hover:text-rose p-1">
                                      <Edit className="w-4 h-4" />
                                    </button>

                                    <ConfirmDelete
                                      trigger={
                                        <button className="text-text-hint hover:text-rose p-1">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      }
                                      title="Delete Menu Item"
                                      description="Are you sure you want to delete this menu item? This action cannot be undone."
                                      onConfirm={() => handleRemove(item.id)}
                                    />
                                  </div>
                                </div>
                                {item.description && (
                                  <p className="text-[12px] text-text-muted mb-3 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                                <div className="mt-auto flex items-center justify-between">
                                  <span className="text-[15px] font-bold text-clay-dark">
                                    ฿{Number(item.price)}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleToggleAvailable(item.id)
                                    }
                                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                                      item.status === "available"
                                        ? "bg-sage-light text-sage"
                                        : "bg-rose-light text-rose"
                                    }`}
                                  >
                                    {item.status === "available"
                                      ? "Available"
                                      : "Sold out"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}

        {totalItems === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <Upload size={36} className="mx-auto text-gray-400 mb-3" />
            <h3 className="font-medium text-gray-700">No menu items yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first menu item to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
export default MenuItemsDashboard;

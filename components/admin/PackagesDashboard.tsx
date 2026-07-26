"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Package as PackageIcon,
  Upload,
  X,
  Edit,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import { toast } from "sonner";
import AddPackage from "@/lib/actions/CreatePackage.action";
import DeletePackage from "@/lib/actions/DeletePackage.action";
import UpdatePackage from "@/lib/actions/UpdatePackage.action";
import {
  AdminPackage,
  Menu,
  MenuItem as AdminMenuItem,
} from "@/app/types/admin";

type Props = {
  packages: AdminPackage[];
  menus: Menu[];
  branchId: string;
};

function PackagesDashboard({ packages, menus, branchId }: Props) {
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<AdminPackage | null>(
    null,
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredPackages = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(q) ||
        pkg.description.toLowerCase().includes(q) ||
        (pkg.packageItems || []).some((pi) =>
          pi.menuItem.name.toLowerCase().includes(q),
        ),
    );
  }, [packages, search]);

  // Flatten menus for easier access
  const flatMenuItems = menus.flatMap((menu) =>
    (menu.categories || []).flatMap((cat) => cat.items || []),
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const toggleMenuItem = (menuItemId: string) => {
    setSelectedMenuItemIds((prev) =>
      prev.includes(menuItemId)
        ? prev.filter((id) => id !== menuItemId)
        : [...prev, menuItemId],
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setSelectedMenuItemIds([]);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setSelectedPackage(null);
    setIsEditMode(false);
    setIsCreateModalOpen(false);
    setIsDetailsModalOpen(false);
  };

  const openDetailsModal = (pkg: AdminPackage) => {
    setSelectedPackage(pkg);
    setIsDetailsModalOpen(true);
    setIsEditMode(false);
  };

  const startEdit = () => {
    if (!selectedPackage) return;
    setName(selectedPackage.name);
    setDescription(selectedPackage.description);
    setPrice(String(selectedPackage.price));
    setSelectedMenuItemIds(
      (selectedPackage.packageItems || []).map((pi) => pi.menuItem.id),
    );
    setImagePreview(selectedPackage.imageUrl || null);
    setImageFile(null);
    setIsEditMode(true);
  };

  const handleAdd = async () => {
    const priceNum = parseFloat(price);

    if (!name.trim()) return setError("Package name is required");
    if (!description.trim()) return setError("Description is required");
    if (isNaN(priceNum) || priceNum <= 0)
      return setError("Price must be greater than 0");

    try {
      setLoading(true);
      setError(null);

      const res = await AddPackage({
        name,
        description,
        price: priceNum,
        branchId,
        menuItemIds:
          selectedMenuItemIds.length > 0 ? selectedMenuItemIds : undefined,
        image: imageFile || undefined,
      });

      if (!res.success) {
        setError(res.message || "Failed to add package");
        return;
      }

      toast.success("Package added successfully");
      resetForm();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add package");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPackage) return;
    const priceNum = parseFloat(price);

    if (!name.trim()) return setError("Package name is required");
    if (!description.trim()) return setError("Description is required");
    if (isNaN(priceNum) || priceNum <= 0)
      return setError("Price must be greater than 0");

    try {
      setLoading(true);
      setError(null);

      const res = await UpdatePackage({
        id: selectedPackage.id,
        name,
        description,
        price,
        menuItemIds: selectedMenuItemIds,
        image: imageFile || undefined,
      });

      if (!res.success) {
        setError(res.message || "Failed to update package");
        return;
      }

      toast.success("Package updated successfully");
      resetForm();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update package");
    } finally {
      setLoading(false);
    }
  };

  const removePackage = async (id: string) => {
    try {
      const res = await DeletePackage(id);

      if (!res.success) {
        toast.error(res.message || "Failed to delete package");
        return;
      }

      toast.success("Package deleted successfully");
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete package",
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Packages"
        subtitle={`${packages.length} dining packages`}
        center={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search packages, items..."
            resultCount={filteredPackages.length}
            totalCount={packages.length}
          />
        }
        action={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add package
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-2xl border border-black/8 p-4 flex items-start gap-3"
          >
            {pkg.imageUrl ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={pkg.imageUrl}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-clay-light flex items-center justify-center flex-shrink-0">
                <PackageIcon className="w-6 h-6 text-clay-dark" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-text-primary">
                {pkg.name}
              </p>

              <p className="text-[11px] text-text-muted mt-0.5">
                {pkg.description}
              </p>

              <p className="text-[13px] font-medium text-clay-dark mt-1.5">
                ฿{pkg.price} / person
              </p>

              <p className="text-[11px] text-text-hint mt-1.5">
                {pkg.packageItems?.length || 0} items included
              </p>

              <button
                onClick={() => openDetailsModal(pkg)}
                className="text-clay text-sm font-medium mt-1 hover:underline"
              >
                See Details
              </button>
            </div>

            <button
              onClick={() => removePackage(pkg.id)}
              className="text-text-hint hover:text-rose p-1 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && search.trim() && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <PackageIcon size={36} className="mx-auto text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-700">No matching packages</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try a different search term.
          </p>
        </div>
      )}

      {packages.length === 0 && !search.trim() && (
        <p className="text-center text-text-hint text-[13px] py-10">
          No packages yet.
        </p>
      )}

      {/* Create Package Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              className="bg-white rounded-2xl border border-black/8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
                <h2 className="text-[15px] font-semibold text-text-primary">
                  Add package
                </h2>
                <button
                  onClick={resetForm}
                  className="text-text-hint hover:text-text-primary p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-5">
                {error && (
                  <div className="bg-rose-light text-rose text-[12px] rounded-xl px-3.5 py-2.5">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
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
                        <span className="text-xs text-gray-500">
                          Upload Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="md:col-span-8 flex flex-col gap-3">
                    <div>
                      <label className="text-[12px] text-text-muted mb-1.5 block">
                        Package name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Romantic dinner for two"
                        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] text-text-muted mb-1.5 block">
                        Price (฿ / person)
                      </label>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 1200"
                        inputMode="decimal"
                        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] text-text-muted mb-1.5 block">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what's included in this package"
                        rows={3}
                        className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-black/8 pt-5">
                  <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
                    Included menu items
                  </p>

                  <div className="flex flex-col gap-4">
                    {menus.map((menu) => {
                      const menuItems =
                        menu.categories?.flatMap((cat) =>
                          (cat.items || []).map((item) => ({
                            ...item,
                            categoryName: cat.name,
                            menuName: menu.name,
                          })),
                        ) || [];

                      if (menuItems.length === 0) return null;

                      return (
                        <div key={menu.id} className="flex flex-col gap-2">
                          <h3 className="text-[13px] font-semibold text-clay">
                            {menu.name}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {menuItems.map((item) => (
                              <label
                                key={item.id}
                                className="flex items-start gap-2 p-3 rounded-xl border border-black/8 cursor-pointer hover:border-clay/30 transition"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedMenuItemIds.includes(
                                    item.id,
                                  )}
                                  onChange={() => toggleMenuItem(item.id)}
                                  className="mt-1 text-clay focus:ring-clay"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-text-primary">
                                    {item.name}
                                  </p>
                                  <p className="text-[11px] text-text-muted">
                                    {item.categoryName} · ฿{item.price}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end px-6 py-4 border-t border-black/8">
                <button
                  onClick={resetForm}
                  className="border border-black/12 text-text-muted rounded-xl px-4 py-2.5 text-[13px] font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={loading}
                  className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add package"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedPackage && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              className="bg-white rounded-2xl border border-black/8 w-full max-w-[700px] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
                <div className="flex items-center gap-2">
                  {!isEditMode && <Edit className="w-4 h-4 text-gray-600" />}
                  <h2 className="text-[15px] font-semibold text-text-primary">
                    {isEditMode ? "Edit package" : "Package Details"}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="text-text-hint hover:text-text-primary p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 flex flex-col gap-5">
                {error && (
                  <div className="bg-rose-light text-rose text-[12px] rounded-xl px-3.5 py-2.5">
                    {error}
                  </div>
                )}

                {/* Edit Mode Form */}
                {isEditMode ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
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
                            <span className="text-xs text-gray-500">
                              Upload Image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      <div className="md:col-span-8 flex flex-col gap-3">
                        <div>
                          <label className="text-[12px] text-text-muted mb-1.5 block">
                            Package name
                          </label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Romantic dinner for two"
                            className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] text-text-muted mb-1.5 block">
                            Price (฿ / person)
                          </label>
                          <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g. 1200"
                            inputMode="decimal"
                            className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay"
                          />
                        </div>

                        <div>
                          <label className="text-[12px] text-text-muted mb-1.5 block">
                            Description
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what's included in this package"
                            rows={3}
                            className="w-full rounded-xl border border-black/12 px-3.5 py-2.5 text-[14px] outline-none focus:border-clay resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/8 pt-5">
                      <p className="text-[11px] font-medium text-text-hint uppercase tracking-wider mb-3">
                        Included menu items
                      </p>

                      <div className="flex flex-col gap-4">
                        {menus.map((menu) => {
                          const menuItems =
                            menu.categories?.flatMap((cat) =>
                              (cat.items || []).map((item) => ({
                                ...item,
                                categoryName: cat.name,
                                menuName: menu.name,
                              })),
                            ) || [];

                          if (menuItems.length === 0) return null;

                          return (
                            <div key={menu.id} className="flex flex-col gap-2">
                              <h3 className="text-[13px] font-semibold text-clay">
                                {menu.name}
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {menuItems.map((item) => (
                                  <label
                                    key={item.id}
                                    className="flex items-start gap-2 p-3 rounded-xl border border-black/8 cursor-pointer hover:border-clay/30 transition"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedMenuItemIds.includes(
                                        item.id,
                                      )}
                                      onChange={() => toggleMenuItem(item.id)}
                                      className="mt-1 text-clay focus:ring-clay"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[13px] font-medium text-text-primary">
                                        {item.name}
                                      </p>
                                      <p className="text-[11px] text-text-muted">
                                        {item.categoryName} · ฿{item.price}
                                      </p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  // View Mode
                  <>
                    <div className="flex gap-4">
                      {selectedPackage.imageUrl ? (
                        <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={selectedPackage.imageUrl}
                            alt={selectedPackage.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-xl bg-clay-light flex items-center justify-center flex-shrink-0">
                          <PackageIcon className="w-10 h-10 text-clay-dark" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-[18px] font-semibold text-text-primary">
                          {selectedPackage.name}
                        </p>
                        <p className="text-[13px] text-text-muted mt-1">
                          {selectedPackage.description}
                        </p>
                        <p className="text-[18px] font-semibold text-clay-dark mt-2">
                          ฿{selectedPackage.price} / person
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-black/8 pt-5">
                      <p className="text-[14px] font-semibold text-text-primary mb-3">
                        Included Menu Items (
                        {selectedPackage.packageItems?.length || 0})
                      </p>
                      {selectedPackage.packageItems?.length ? (
                        <div className="space-y-2">
                          {selectedPackage.packageItems.map((packageItem) => (
                            <div
                              key={packageItem.id}
                              className="p-3 bg-gray-50 rounded-xl flex items-center gap-3"
                            >
                              {packageItem.menuItem.imageUrl && (
                                <img
                                  src={packageItem.menuItem.imageUrl}
                                  alt={packageItem.menuItem.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="text-[13px] font-medium text-text-primary">
                                  {packageItem.menuItem.name}
                                </p>
                                <p className="text-[11px] text-text-muted">
                                  ฿{packageItem.menuItem.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-hint text-[13px]">
                          No menu items added to this package
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end px-6 py-4 border-t border-black/8">
                {isEditMode ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setError(null);
                      }}
                      className="border border-black/12 text-text-muted rounded-xl px-4 py-2.5 text-[13px] font-medium"
                    >
                      Cancel Edit
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpdate}
                      disabled={loading}
                      className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </motion.button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={resetForm}
                      className="border border-black/12 text-text-muted rounded-xl px-4 py-2.5 text-[13px] font-medium"
                    >
                      Close
                    </button>
                    <button
                      onClick={startEdit}
                      className="bg-clay text-white rounded-xl px-4 py-2.5 text-[13px] font-medium flex items-center gap-1.5"
                    >
                      <Edit className="w-4 h-4" />
                      Update Package
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PackagesDashboard;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    "clothing" | "outfits" | "settings"
  >("clothing");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Fuku</h1>
          <button
            onClick={() => {
              fetch("/api/auth/logout", { method: "POST" }).then(() => {
                window.location.href = "/login";
              });
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            退出登录
          </button>
        </div>
      </header>

      <nav className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("clothing")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "clothing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              服装
            </button>
            <button
              onClick={() => setActiveTab("outfits")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "outfits"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              穿搭
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              设置
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "clothing" && <ClothingView />}
        {activeTab === "outfits" && <OutfitsView />}
        {activeTab === "settings" && <SettingsView />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab("clothing")}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === "clothing" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            服装
          </button>
          <button
            onClick={() => setActiveTab("outfits")}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === "outfits" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            穿搭
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === "settings" ? "text-blue-600" : "text-gray-500"
            }`}
          >
            设置
          </button>
        </div>
      </nav>
    </div>
  );
}

function ClothingView() {
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadItems = async () => {
    const url = filter ? `/api/clothing?category=${filter}` : "/api/clothing";
    const response = await fetch(url);
    const data = await response.json();
    setItems(data.items || []);
  };

  useEffect(() => {
    loadCategories();
    loadItems();
  }, [filter]);

  if (showForm) {
    return (
      <div>
        <button
          onClick={() => setShowForm(false)}
          className="mb-4 text-blue-500 hover:text-blue-700"
        >
          ← 返回
        </button>
        <ClothingForm
          onSuccess={() => {
            setShowForm(false);
            loadCategories();
            loadItems();
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的服装</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 min-h-[44px]"
        >
          添加服装
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded-md text-sm min-h-[44px] ${
            filter === "" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.name)}
            className={`px-3 py-1 rounded-md text-sm min-h-[44px] ${
              filter === cat.name ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden">
            <img
              src={item.image_path}
              alt={item.name}
              className="w-full aspect-square object-cover"
            />
            <div className="p-3">
              <h3 className="font-medium truncate">{item.name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                {item.category}
              </p>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          还没有服装，添加第一件吧！
        </div>
      )}
    </div>
  );
}

function ClothingForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (data.categories && data.categories.length > 0) {
          setCategory(data.categories[0].name);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name);
    formData.append("category", category);
    if (description) formData.append("description", description);
    if (price) formData.append("price", price);

    try {
      const response = await fetch("/api/clothing", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">添加服装</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm">名称 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-md min-h-[44px]"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">分类 *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border rounded-md min-h-[44px]"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={3}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">价格</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-3 border rounded-md min-h-[44px]"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">图片 *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full p-3 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400 min-h-[44px]"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </form>
    </div>
  );
}

function OutfitsView() {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [clothingItems, setClothingItems] = useState<any[]>([]);
  const [selectedClothing, setSelectedClothing] = useState<number[]>([]);

  const loadData = async () => {
    const [outfitsRes, clothingRes] = await Promise.all([
      fetch("/api/outfits"),
      fetch("/api/clothing"),
    ]);
    const outfitsData = await outfitsRes.json();
    const clothingData = await clothingRes.json();
    setOutfits(outfitsData.outfits || []);
    setClothingItems(clothingData.items || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOutfit = async () => {
    const response = await fetch("/api/outfits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Outfit ${outfits.length + 1}`,
        clothing_ids: selectedClothing,
      }),
    });
    if (response.ok) {
      setSelectedClothing([]);
      setShowForm(false);
      loadData();
    }
  };

  if (showForm) {
    return (
      <div>
        <button
          onClick={() => setShowForm(false)}
          className="mb-4 text-blue-500 hover:text-blue-700"
        >
          ← 返回
        </button>
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">创建穿搭</h2>
          <div className="space-y-2 mb-4">
            {clothingItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedClothing.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClothing([...selectedClothing, item.id]);
                    } else {
                      setSelectedClothing(
                        selectedClothing.filter((id) => id !== item.id)
                      );
                    }
                  }}
                  className="w-5 h-5"
                />
                <img
                  src={item.image_path}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="flex-1">{item.name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleCreateOutfit}
            disabled={selectedClothing.length === 0}
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400 min-h-[44px]"
          >
            创建穿搭（{selectedClothing.length}件）
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的穿搭</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 min-h-[44px]"
        >
          创建穿搭
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {outfits.map((outfit) => (
          <div key={outfit.id} className="border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-2">{outfit.name}</h3>
            {outfit.description && (
              <p className="text-gray-500 mb-3">{outfit.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {outfit.clothing_items?.map((item: any) => (
                <div key={item.id} className="text-center">
                  <img
                    src={item.image_path}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <p className="text-xs mt-1 truncate">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {outfits.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          还没有穿搭，创建第一个吧！
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">设置</h2>
      <div className="max-w-2xl">
        <CategoryManagement />
      </div>
    </div>
  );
}

function CategoryManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [itemCount, setItemCount] = useState<number>(0);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setAdding(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        setNewCategoryName("");
        loadCategories();
      } else {
        const data = await response.json();
        alert(data.error || "添加失败");
      }
    } catch (error) {
      alert("添加失败");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setDeleting(id);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        loadCategories();
      } else {
        const data = await response.json();
        alert(data.error || "删除失败");
      }
    } catch (error) {
      alert("删除失败");
    } finally {
      setDeleting(null);
      setShowDeleteConfirm(null);
      setItemCount(0);
    }
  };

  const confirmDelete = (id: number, count: number) => {
    setItemCount(count);
    setShowDeleteConfirm(id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">分类管理</h3>
        <p className="text-gray-600 mb-4">
          管理您的服装分类。您可以添加自定义分类或删除不需要的分类。
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="新分类名称"
          className="flex-1 p-3 border rounded-md min-h-[44px]"
          disabled={adding}
        />
        <button
          onClick={handleAddCategory}
          disabled={adding || !newCategoryName.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 min-h-[44px]"
        >
          {adding ? "添加中..." : "添加"}
        </button>
      </div>

      <div className="border rounded-lg divide-y">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            还没有自定义分类，添加一个吧！
          </div>
        ) : (
          categories.map((category) => {
            const itemCount = 0;

            return (
              <div
                key={category.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{category.name}</span>
                  {category.is_system === 1 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      系统分类
                    </span>
                  )}
                </div>

                {category.is_system === 0 && (
                  <div>
                    {showDeleteConfirm === category.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-orange-600">
                          {itemCount > 0
                            ? `将移动 ${itemCount} 件服装到"未分类"`
                            : "确认删除？"}
                        </span>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deleting === category.id}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:bg-gray-400 min-h-[32px]"
                        >
                          {deleting === category.id ? "删除中..." : "确认"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-200 rounded-md text-sm hover:bg-gray-300 min-h-[32px]"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => confirmDelete(category.id, itemCount)}
                        disabled={deleting !== null}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 min-h-[32px]"
                      >
                        删除
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

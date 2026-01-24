"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

type Outfit = {
  id: number;
  name: string;
  description: string | null;
  clothing_items?: ClothingItem[];
};

type ClothingItem = {
  id: number;
  name: string;
  category: string;
  category_names?: string[];
  description: string | null;
  price: number | null;
  image_path: string;
};

export default function OutfitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClothing, setSelectedClothing] = useState<number[]>([]);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadOutfit();
    loadCategories();
    loadClothingItems();
  }, [id]);

  useEffect(() => {
    loadClothingItems();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadClothingItems = async () => {
    try {
      const url = selectedCategory
        ? `/api/clothing?category=${selectedCategory}`
        : "/api/clothing";
      const response = await fetch(url);
      const data = await response.json();
      setClothingItems(data.items || []);
    } catch (err) {
      console.error("Failed to load clothing items:", err);
    }
  };

  const loadOutfit = async () => {
    try {
      const response = await fetch(`/api/outfits/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("穿搭不存在");
        } else {
          setError("加载失败");
        }
        setLoading(false);
        return;
      }
      const data = await response.json();
      const loadedOutfit = data.outfit as Outfit;
      setOutfit(loadedOutfit);
      setName(loadedOutfit.name);
      setDescription(loadedOutfit.description || "");
      setSelectedClothing(
        loadedOutfit.clothing_items?.map((item) => item.id) || []
      );
    } catch (err) {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("名称为必填项");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/outfits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          clothing_ids: selectedClothing,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "保存失败");
        return;
      }

      router.push("/outfits");
    } catch (err) {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/outfits/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "删除失败");
        setShowDeleteConfirm(false);
        return;
      }

      router.push("/outfits");
    } catch (err) {
      setError("删除失败");
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleClothingItem = (itemId: number) => {
    if (selectedClothing.includes(itemId)) {
      setSelectedClothing(selectedClothing.filter((id) => id !== itemId));
    } else {
      setSelectedClothing([...selectedClothing, itemId]);
    }
  };

  const renderCategories = (item: ClothingItem) => {
    if (item.category_names && item.category_names.length > 0) {
      return item.category_names.join(" · ");
    }

    return item.category || "";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">加载中...</div>
      </div>
    );
  }

  if (error && !outfit) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/outfits"
          className="mb-4 text-blue-500 hover:text-blue-700 inline-block"
        >
          ← 返回
        </Link>
        <div className="text-center py-12 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link
        href="/outfits"
        className="mb-4 text-blue-500 hover:text-blue-700 inline-block"
      >
        ← 返回
      </Link>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-4">编辑穿搭</h2>

        {outfit &&
          outfit.clothing_items &&
          outfit.clothing_items.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">
                已选服装 ({outfit.clothing_items.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {outfit.clothing_items.map((item) => (
                  <div key={item.id} className="border rounded-md p-2">
                    <img
                      src={item.image_path}
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded mb-1"
                    />
                    <p className="text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {renderCategories(item)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-md"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md"
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">
              选择服装 ({selectedClothing.length}件)
            </label>

            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                  !selectedCategory
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                    selectedCategory === cat.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
              {clothingItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  还没有服装项目
                </div>
              ) : (
                clothingItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClothing.includes(item.id)}
                      onChange={() => toggleClothingItem(item.id)}
                      className="w-5 h-5"
                    />
                    <img
                      src={item.image_path}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{item.name}</span>
                      <span className="text-xs text-gray-500 truncate block">
                        {renderCategories(item)}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {saving ? "保存中..." : "保存"}
            </button>
            <Link
              href="/outfits"
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-400 text-center inline-block pt-3"
            >
              取消
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="flex-1 bg-red-500 text-white py-3 rounded-md hover:bg-red-600 disabled:bg-gray-400"
            >
              删除
            </button>
          </div>
        </form>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">确认删除</h3>
            <p className="mb-6">
              确定要删除&quot;{outfit?.name}&quot;吗？此操作无法撤销。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

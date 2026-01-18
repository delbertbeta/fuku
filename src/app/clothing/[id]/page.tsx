"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";

type ClothingItem = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  purchase_date: string | null;
  image_path: string;
};

export default function ClothingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
    loadItem();
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadItem = async () => {
    try {
      const response = await fetch(`/api/clothing/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("服装项目不存在");
        } else {
          setError("加载失败");
        }
        setLoading(false);
        return;
      }
      const data = await response.json();
      const clothingItem = data.item as ClothingItem;
      setItem(clothingItem);
      setName(clothingItem.name);
      setCategory(clothingItem.category);
      setDescription(clothingItem.description || "");
      setPrice(clothingItem.price ? String(clothingItem.price) : "");
      setPurchaseDate(clothingItem.purchase_date || "");
    } catch (err) {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) {
      setError("名称和分类为必填项");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const body: any = {
        name,
        category: parseInt(category),
        description: description || null,
        price: price ? parseFloat(price) : null,
        purchase_date: purchaseDate || null,
      };

      const response = await fetch(`/api/clothing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "保存失败");
        return;
      }

      router.push("/clothing");
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
      const response = await fetch(`/api/clothing/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "删除失败");
        setShowDeleteConfirm(false);
        return;
      }

      router.push("/clothing");
    } catch (err) {
      setError("删除失败");
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12">加载中...</div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          href="/clothing"
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
        href="/clothing"
        className="mb-4 text-blue-500 hover:text-blue-700 inline-block"
      >
        ← 返回
      </Link>
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">编辑服装</h2>

        {item && (
          <div className="mb-4">
            <img
              src={item.image_path}
              alt={item.name}
              className="w-full aspect-square object-cover rounded-md"
            />
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
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">分类 *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-md"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
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
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">购买日期</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full p-3 border rounded-md"
            />
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
              href="/clothing"
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
            <p className="mb-6">确定要删除"{item?.name}"吗？此操作无法撤销。</p>
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

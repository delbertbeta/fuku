"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
};

export default function ClothingNewPage() {
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const loaded = data.categories || [];
        setCategories(loaded);
        if (loaded.length > 0) {
          setSelectedCategories([loaded[0].id]);
        }
      });
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || selectedCategories.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name);
    selectedCategories.forEach((categoryId) => {
      formData.append("categories", String(categoryId));
    });
    if (description) formData.append("description", description);
    if (price) formData.append("price", price);
    if (purchaseDate) formData.append("purchase_date", purchaseDate);

    try {
      const response = await fetch("/api/clothing", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        router.push("/clothing");
      }
    } catch (error) {
      alert("创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link
        href="/clothing"
        className="mb-4 text-blue-500 hover:text-blue-700 inline-block"
      >
        ← 返回
      </Link>
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">添加服装</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-xs text-red-500 mt-2">至少选择一个分类</p>
            )}
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
            disabled={loading || selectedCategories.length === 0}
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "保存中..." : "保存"}
          </button>
        </form>
      </div>
    </div>
  );
}

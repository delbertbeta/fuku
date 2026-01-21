"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ClothingItem = {
  id: number;
  name: string;
  image_path: string;
  category_names?: string[];
  category_name?: string | null;
};

export default function OutfitNewPage() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedClothing, setSelectedClothing] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [outfitName, setOutfitName] = useState<string>("");
  const router = useRouter();

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadData = async () => {
    const url = selectedCategory
      ? `/api/clothing?category=${selectedCategory}`
      : "/api/clothing";
    const response = await fetch(url);
    const data = await response.json();
    setClothingItems(data.items || []);
  };

  useEffect(() => {
    loadCategories();
    loadData();
  }, [selectedCategory]);

  const handleCreateOutfit = async () => {
    if (!outfitName.trim()) {
      alert("请输入穿搭名称");
      return;
    }
    const response = await fetch("/api/outfits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: outfitName,
        clothing_ids: selectedClothing,
      }),
    });
    if (response.ok) {
      setSelectedClothing([]);
      setOutfitName("");
      router.push("/outfits");
    }
  };

  const renderCategories = (item: ClothingItem) => {
    if (item.category_names && item.category_names.length > 0) {
      return item.category_names.join(" · ");
    }

    return item.category_name || "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link
        href="/outfits"
        className="mb-4 text-blue-500 hover:text-blue-700 inline-block"
      >
        ← 返回
      </Link>
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">创建穿搭</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">穿搭名称 *</label>
          <input
            type="text"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            placeholder="输入穿搭名称"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
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
              <div className="flex-1 min-w-0">
                <span className="block truncate">{item.name}</span>
                <span className="text-xs text-gray-500 truncate block">
                  {renderCategories(item)}
                </span>
              </div>
            </label>
          ))}
        </div>
        <button
          onClick={handleCreateOutfit}
          disabled={selectedClothing.length === 0}
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          创建穿搭（{selectedClothing.length}件）
        </button>
      </div>
    </div>
  );
}

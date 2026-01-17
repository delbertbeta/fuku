"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OutfitNewPage() {
  const [clothingItems, setClothingItems] = useState<any[]>([]);
  const [selectedClothing, setSelectedClothing] = useState<number[]>([]);
  const [outfitName, setOutfitName] = useState<string>("");
  const router = useRouter();

  const loadData = async () => {
    const response = await fetch("/api/clothing");
    const data = await response.json();
    setClothingItems(data.items || []);
  };

  useEffect(() => {
    loadData();
  }, []);

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
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          创建穿搭（{selectedClothing.length}件）
        </button>
      </div>
    </div>
  );
}

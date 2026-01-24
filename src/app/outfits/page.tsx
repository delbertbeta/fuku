"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizePrice } from "@/lib/utils/normalizePrice";

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [clothingItems, setClothingItems] = useState<any[]>([]);
  const [selectedClothing, setSelectedClothing] = useState<number[]>([]);
  const router = useRouter();

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
      router.push("/outfits");
      loadData();
    }
  };

  const renderCategories = (item: any) => {
    if (item.category_names && item.category_names.length > 0) {
      return item.category_names.map((name: string) => (
        <span
          key={`${item.id}-${name}`}
          className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
        >
          {name}
        </span>
      ));
    }

    if (item.category_name) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
          {item.category_name}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的穿搭</h2>
        <Link
          href="/outfits/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-block"
        >
          创建穿搭
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {outfits.map((outfit) => (
          <Link
            key={outfit.id}
            href={`/outfits/${outfit.id}`}
            className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-200"
          >
            <h3 className="font-bold text-lg mb-2">{outfit.name}</h3>
            {outfit.description && (
              <p className="text-gray-500 mb-3">{outfit.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {outfit.clothing_items?.map((item: any) => {
                const price = normalizePrice(item.price);

                return (
                  <div key={item.id} className="text-center">
                    <img
                      src={item.image_path}
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <p className="text-xs mt-1 truncate">{item.name}</p>
                    <div className="flex flex-wrap gap-1 justify-center mt-1">
                      {renderCategories(item)}
                    </div>
                    {price != null && (
                      <p className="text-xs font-semibold text-blue-600">
                        ¥{price.toFixed(2)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Link>
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

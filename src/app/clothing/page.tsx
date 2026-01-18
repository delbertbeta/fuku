"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ClothingContent() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

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
    const url = categoryId
      ? `/api/clothing?category=${categoryId}`
      : "/api/clothing";
    const response = await fetch(url);
    const data = await response.json();
    setItems(data.items || []);
  };

  useEffect(() => {
    loadCategories();
    loadItems();
  }, [categoryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的服装</h2>
        <Link
          href="/clothing/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-block"
        >
          添加服装
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/clothing"
          className={`flex items-center px-3 py-1.5 rounded-md text-sm no-underline ${
            !categoryId
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          全部
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/clothing?category=${cat.id}`}
            className={`flex items-center px-3 py-1.5 rounded-md text-sm no-underline ${
              categoryId === String(cat.id)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/clothing/${item.id}`}
            className="border rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-200"
          >
            <img
              src={item.image_path}
              alt={item.name}
              className="w-full aspect-square object-cover"
            />
            <div className="p-3">
              <h3 className="font-medium truncate">{item.name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                {item.category_name || item.category}
              </p>
              {item.description && (
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {item.description}
                </p>
              )}
              {item.price && (
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  ¥{item.price.toFixed(2)}
                </p>
              )}
            </div>
          </Link>
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

export default function ClothingPage() {
  return (
    <Suspense
      fallback={<div className="max-w-7xl mx-auto px-4 py-6">加载中...</div>}
    >
      <ClothingContent />
    </Suspense>
  );
}

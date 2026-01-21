"use client";

import { useState, useEffect } from "react";

type Category = {
  id: number;
  name: string;
  is_system: number;
  item_count?: number;
};

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">设置</h2>
      <div className="max-w-2xl">
        <CategoryManagement />
      </div>
    </div>
  );
}

function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
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
        await response.json();
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
          className="flex-1 p-3 border rounded-md"
          disabled={adding}
        />
        <button
          onClick={handleAddCategory}
          disabled={adding || !newCategoryName.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
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
            const count = category.item_count ?? 0;

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
                          {count > 0
                            ? `将移动 ${count} 件服装到"未分类"`
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
                        onClick={() => confirmDelete(category.id, count)}
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

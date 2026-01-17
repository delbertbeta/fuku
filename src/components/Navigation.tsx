"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { name: "服装", path: "/clothing" },
    { name: "穿搭", path: "/outfits" },
    { name: "设置", path: "/settings" },
  ];

  return (
    <nav className="sticky top-0 bg-white border-b z-10 md:block hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                pathname === tab.path
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

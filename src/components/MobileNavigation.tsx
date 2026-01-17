"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNavigation() {
  const pathname = usePathname();

  const tabs = [
    { name: "服装", path: "/clothing" },
    { name: "穿搭", path: "/outfits" },
    { name: "设置", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              pathname === tab.path ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

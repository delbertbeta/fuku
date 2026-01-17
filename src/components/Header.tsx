"use client";

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Fuku</h1>
        <button
          onClick={() => {
            fetch("/api/auth/logout", { method: "POST" }).then(() => {
              window.location.href = "/login";
            });
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          退出登录
        </button>
      </div>
    </header>
  );
}

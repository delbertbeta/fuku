import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fuku",
  description: "管理您的衣橱和穿搭",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

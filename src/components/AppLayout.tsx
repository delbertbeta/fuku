"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

const publicRoutes = ["/login", "/register"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <Header />
      <Navigation />
      <div className="min-h-screen pb-16 md:pb-0">{children}</div>
      <MobileNavigation />
    </>
  );
}

import { Suspense } from "react";
import CalendarClient from "./CalendarClient";

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6">日历加载中...</div>}>
      <CalendarClient />
    </Suspense>
  );
}

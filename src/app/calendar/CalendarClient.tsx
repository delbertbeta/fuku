"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const monthFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const displayFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Shanghai",
  weekday: "short",
});

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

type CalendarEntry = {
  date: string;
  outfit_id: number;
  name: string;
  description: string | null;
  preview_images?: string[];
};

type MonthState = {
  year: number;
  month: number;
};

function getShanghaiMonth(date: Date): MonthState {
  const parts = monthFormatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return { year, month };
}

function getShanghaiDate(date: Date): string {
  return dateFormatter.format(date);
}

function getShanghaiWeekday(date: Date): number {
  const label = weekdayFormatter.format(date);
  return weekdayMap[label] ?? 0;
}

function getMonthString(monthState: MonthState): string {
  return `${monthState.year}-${String(monthState.month).padStart(2, "0")}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function formatDisplayDate(date: string): string {
  if (!date) {
    return "";
  }
  const dateValue = new Date(`${date}T00:00:00+08:00`);
  return displayFormatter.format(dateValue);
}

function parseMonthQuery(value: string | null): MonthState | null {
  if (!value) {
    return null;
  }
  const match = value.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return null;
  }
  if (month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

export default function CalendarClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryMonth = parseMonthQuery(searchParams.get("date"));

  const [currentMonth, setCurrentMonth] = useState<MonthState>(() => {
    return queryMonth ?? getShanghaiMonth(new Date());
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [outfits, setOutfits] = useState<any[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthString = getMonthString(currentMonth);
  const todayDate = getShanghaiDate(new Date());

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const entry of entries) {
      if (!map.has(entry.date)) {
        map.set(entry.date, []);
      }
      map.get(entry.date)?.push(entry);
    }
    return map;
  }, [entries]);

  const selectedEntries = entriesByDate.get(selectedDate) || [];

  const availableOutfits = useMemo(() => {
    const taken = new Set(selectedEntries.map((entry) => entry.outfit_id));
    return outfits.filter((outfit) => !taken.has(outfit.id));
  }, [outfits, selectedEntries]);

  useEffect(() => {
    const loadOutfits = async () => {
      try {
        const response = await fetch("/api/outfits");
        const data = await response.json();
        setOutfits(data.outfits || []);
      } catch (loadError) {
        console.error("Failed to load outfits:", loadError);
      }
    };

    loadOutfits();
  }, []);

  useEffect(() => {
    if (queryMonth) {
      setCurrentMonth(queryMonth);
    }
  }, [queryMonth?.year, queryMonth?.month]);

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/calendar?month=${monthString}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "加载失败");
          setEntries([]);
          return;
        }
        setEntries(data.entries || []);
      } catch (loadError) {
        setError("加载失败");
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    const defaultDate = todayDate.startsWith(monthString)
      ? todayDate
      : `${monthString}-01`;
    setSelectedDate(defaultDate);
    setSelectedOutfit("");
    loadEntries();
  }, [monthString, todayDate]);

  const updateMonthQuery = (month: MonthState) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", getMonthString(month));
    router.push(`/calendar?${params.toString()}`);
  };

  const handlePrevMonth = () => {
    const { year, month } = currentMonth;
    const next =
      month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
    setCurrentMonth(next);
    updateMonthQuery(next);
  };

  const handleNextMonth = () => {
    const { year, month } = currentMonth;
    const next =
      month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
    setCurrentMonth(next);
    updateMonthQuery(next);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedOutfit("");
  };

  const handleAddOutfit = async () => {
    if (!selectedOutfit) {
      setError("请选择要添加的穿搭");
      return;
    }

    setError("");
    const response = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        outfit_id: Number(selectedOutfit),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setSelectedOutfit("");
    const refreshed = await fetch(`/api/calendar?month=${monthString}`);
    const refreshedData = await refreshed.json();
    setEntries(refreshedData.entries || []);
  };

  const handleRemoveOutfit = async (outfitId: number) => {
    setError("");
    const response = await fetch("/api/calendar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        outfit_id: outfitId,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "移除失败");
      return;
    }
    const refreshed = await fetch(`/api/calendar?month=${monthString}`);
    const refreshedData = await refreshed.json();
    setEntries(refreshedData.entries || []);
  };

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDate = new Date(
    Date.UTC(currentMonth.year, currentMonth.month - 1, 1)
  );
  const firstWeekday = getShanghaiWeekday(firstDate);
  const startOffset = (firstWeekday + 6) % 7;
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, idx) => {
    if (idx < startOffset) {
      return null;
    }
    const day = idx - startOffset + 1;
    return `${monthString}-${String(day).padStart(2, "0")}`;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">日历</h2>
          <p className="text-sm text-gray-500">按北京时间记录穿搭日期</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
          >
            上个月
          </button>
          <div className="text-base font-semibold">
            {currentMonth.year}年{currentMonth.month}月
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
          >
            下个月
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="border rounded-lg p-4 bg-white">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 mb-2">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-2 font-medium">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="h-20" />;
              }
              const day = Number(date.split("-")[2]);
              const dayEntries = entriesByDate.get(date) || [];
              const isSelected = selectedDate === date;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={`h-20 border rounded-md p-2 text-left hover:border-blue-400 hover:shadow-sm transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-sm font-semibold">{day}</div>
                  <div className="mt-1 space-y-1">
                    {dayEntries.slice(0, 2).map((entry) => (
                      <div
                        key={`${entry.outfit_id}-${entry.date}`}
                        className="text-xs text-gray-600 truncate"
                      >
                        {entry.name}
                      </div>
                    ))}
                    {dayEntries.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{dayEntries.length - 2} 更多
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {loading && (
            <div className="text-center text-sm text-gray-500 mt-4">
              日历加载中...
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {formatDisplayDate(selectedDate)}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedEntries.length} 套穿搭
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {selectedEntries.length === 0 ? (
              <div className="text-sm text-gray-500">
                暂无穿搭，添加一套吧。
              </div>
            ) : (
              selectedEntries.map((entry) => (
                <div
                  key={`${entry.outfit_id}-${entry.date}`}
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <Link
                    href={`/outfits/${entry.outfit_id}`}
                    className="flex flex-col gap-2 min-w-0"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{entry.name}</div>
                      {entry.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {entry.description}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.preview_images &&
                      entry.preview_images.length > 0 ? (
                        entry.preview_images.map((image, index) => (
                          <div
                            key={`${entry.outfit_id}-${image}-${index}`}
                            className="h-24 w-24 rounded-md border border-white overflow-hidden bg-gray-100"
                          >
                            <img
                              src={image}
                              alt={entry.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="h-24 w-24 rounded-md border border-white overflow-hidden bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          暂无
                        </div>
                      )}
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemoveOutfit(entry.outfit_id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    移除
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">添加穿搭</label>
            <div className="flex flex-col gap-2">
              <select
                value={selectedOutfit}
                onChange={(event) => setSelectedOutfit(event.target.value)}
                className="w-full border rounded-md p-2 text-sm"
              >
                <option value="">选择穿搭</option>
                {availableOutfits.map((outfit) => (
                  <option key={outfit.id} value={outfit.id}>
                    {outfit.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddOutfit}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                disabled={!selectedOutfit}
              >
                添加到当天
              </button>
              {availableOutfits.length === 0 && (
                <div className="text-xs text-gray-500">
                  今日已包含所有穿搭。
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

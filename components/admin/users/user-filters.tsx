"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type FilterOption = {
  label: string;
  value: string;
};

const STATUS_FILTERS: FilterOption[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Banned", value: "banned" },
];

const ROLE_FILTERS: FilterOption[] = [
  { label: "All Roles", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Dedicated", value: "dedicated" },
  { label: "User", value: "user" },
];

export function UserFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "all";
  const currentRole = searchParams.get("role") || "all";

  function handleFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);

    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1"); // Reset to first page on filter change

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap gap-4">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/60">Status:</span>
        <div className="flex gap-1">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={currentStatus === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("status", filter.value)}
              disabled={isPending}
              className={
                currentStatus === filter.value
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/60">Role:</span>
        <div className="flex gap-1">
          {ROLE_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={currentRole === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilter("role", filter.value)}
              disabled={isPending}
              className={
                currentRole === filter.value
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

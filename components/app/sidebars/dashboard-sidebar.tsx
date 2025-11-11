"use client";

import { BaseSidebar } from "./base-sidebar";
import { dashboardNavigationGroups } from "@/lib/navigation/dashboard-navigation";

export function DashboardSidebar() {
  return (
    <BaseSidebar
      navigationGroups={dashboardNavigationGroups}
      ariaLabel="Dashboard navigation"
    />
  );
}

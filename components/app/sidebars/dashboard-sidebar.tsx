"use client";

import { BaseSidebar } from "./base-sidebar";
import { dashboardNavigationGroups, loginNavigationGroups } from "@/lib/navigation/dashboard-navigation";

interface DashboardSidebarProps {
  isAuthenticated?: boolean;
}

export function DashboardSidebar({ isAuthenticated = false }: DashboardSidebarProps) {
  const navigationGroups = isAuthenticated ? dashboardNavigationGroups : loginNavigationGroups;

  return (
    <BaseSidebar
      navigationGroups={navigationGroups}
      ariaLabel="Dashboard navigation"
    />
  );
}

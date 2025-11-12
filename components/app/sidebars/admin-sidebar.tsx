"use client";

import { BaseSidebar } from "./base-sidebar";
import { adminNavigationGroups } from "@/lib/navigation/admin-navigation";

export function AdminSidebar() {
  return (
    <BaseSidebar
      navigationGroups={adminNavigationGroups}
      ariaLabel="Admin navigation"
    />
  );
}

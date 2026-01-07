"use client";

import { BaseSidebar } from "./base-sidebar";
import { supportNavigationGroups } from "@/lib/navigation/support-navigation";

export function SupportSidebar() {
  return (
    <BaseSidebar
      navigationGroups={supportNavigationGroups}
      ariaLabel="Support navigation"
    />
  );
}

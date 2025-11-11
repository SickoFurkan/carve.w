"use client";

import { BaseSidebar } from "./base-sidebar";
import { carveNavigationGroups } from "@/lib/navigation/carve-navigation";

export function CarveSidebar() {
  return (
    <BaseSidebar
      navigationGroups={carveNavigationGroups}
      ariaLabel="Carve navigation"
    />
  );
}

"use client";

import { BaseSidebar } from "./base-sidebar";
import { hiscoresNavigationGroups } from "@/lib/navigation/hiscores-navigation";

export function HiscoresSidebar() {
  return (
    <BaseSidebar
      navigationGroups={hiscoresNavigationGroups}
      ariaLabel="Hiscores navigation"
    />
  );
}

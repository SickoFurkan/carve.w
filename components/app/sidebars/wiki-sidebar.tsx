"use client";

import { BaseSidebar } from "./base-sidebar";
import { wikiNavigationGroups } from "@/lib/navigation/wiki-navigation";

export function WikiSidebar() {
  return (
    <BaseSidebar
      navigationGroups={wikiNavigationGroups}
      ariaLabel="Wiki navigation"
    />
  );
}

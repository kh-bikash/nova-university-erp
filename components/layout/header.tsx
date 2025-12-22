"use client"

import { ThemeToggle } from "@/components/theme/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { AdvancedSearch } from "@/components/search/advanced-search"

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <AdvancedSearch />

        <div className="flex items-center gap-2">
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

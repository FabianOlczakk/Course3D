"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Menu,
  FolderCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import {
  ChapterList,
  type SidebarChapter,
} from "@/components/chapters/chapter-list";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Pulpit", icon: LayoutDashboard },
  {
    href: "/admin/chapters",
    label: "Rozdziały",
    icon: FolderCog,
    adminOnly: true,
  },
  { href: "/admin/users", label: "Użytkownicy", icon: Users, adminOnly: true },
];

export function Sidebar({
  role,
  chapters,
}: {
  role: Role;
  chapters: SidebarChapter[];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-200 md:flex md:flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border-subtle)] px-4">
        <button
          type="button"
          aria-label="Zwiń pasek boczny"
          onClick={() => setCollapsed((c) => !c)}
          className="glow-icon-btn shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-bold text-text-primary">
              Course3D
            </span>
          </Link>
        )}
      </div>

      {!collapsed && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav className="space-y-1 p-3">
            {NAV_ITEMS.filter((i) => !i.adminOnly || role === "ADMIN").map(
              (item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-[var(--accent-glow)] text-text-primary shadow-glow"
                        : "text-text-secondary hover:bg-[var(--bg-elevated)] hover:text-text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              }
            )}
          </nav>

          <div className="px-3 pb-4">
            <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Kurs
            </p>
            <ChapterList chapters={chapters} />
          </div>
        </div>
      )}

      {collapsed && (
        <nav className="flex flex-col items-center gap-2 p-2">
          {NAV_ITEMS.filter((i) => !i.adminOnly || role === "ADMIN").map(
            (item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "glow-icon-btn",
                    active && "border-[var(--border-glow)] text-text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </Link>
              );
            }
          )}
        </nav>
      )}
    </aside>
  );
}

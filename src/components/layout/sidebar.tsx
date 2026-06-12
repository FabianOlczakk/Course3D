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
  X,
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
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Pulpit", icon: LayoutDashboard },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin/users", label: "Użytkownicy", icon: Users },
  { href: "/admin/chapters", label: "Rozdziały", icon: FolderCog },
];

export function Sidebar({
  role,
  chapters,
  mobileOpen = false,
  onMobileClose,
}: {
  role: Role;
  chapters: SidebarChapter[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navLink = (item: NavItem) => {
    const active =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onMobileClose}
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
  };

  const content = (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-[var(--border-subtle)] px-4">
        <button
          type="button"
          aria-label="Zwiń pasek boczny"
          onClick={() => setCollapsed((c) => !c)}
          className="glow-icon-btn hidden shrink-0 md:flex"
        >
          <Menu className="h-4 w-4" />
        </button>
        {onMobileClose && (
          <button
            type="button"
            aria-label="Zamknij menu"
            onClick={onMobileClose}
            className="glow-icon-btn shrink-0 md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!collapsed && (
          <Link
            href="/dashboard"
            onClick={onMobileClose}
            className="flex items-center gap-2"
          >
            <GraduationCap className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-bold text-text-primary">
              Course3D
            </span>
          </Link>
        )}
      </div>

      {!collapsed ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav className="space-y-1 p-3">{NAV_ITEMS.map(navLink)}</nav>

          <div className="px-3 pb-4">
            <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Kurs
            </p>
            <ChapterList chapters={chapters} onNavigate={onMobileClose} />
          </div>

          {role === "ADMIN" && (
            <div className="mt-auto border-t border-[var(--border-subtle)] p-3">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Admin
              </p>
              <nav className="space-y-1">{ADMIN_ITEMS.map(navLink)}</nav>
            </div>
          )}
        </div>
      ) : (
        <nav className="hidden flex-col items-center gap-2 p-2 md:flex">
          {[...NAV_ITEMS, ...(role === "ADMIN" ? ADMIN_ITEMS : [])].map(
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
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-card)] transition-all duration-200 md:flex md:flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside className="animate-in slide-in-from-left relative z-10 flex h-full w-64 max-w-[80vw] flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-card)] duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

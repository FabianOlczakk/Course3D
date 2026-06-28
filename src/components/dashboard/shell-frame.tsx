"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { SidebarChapter } from "@/components/chapters/chapter-list";
import type { Role } from "@prisma/client";

interface ShellFrameProps {
  username: string | null;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  chapters: SidebarChapter[];
  children: React.ReactNode;
}

/** Klient: zarządza otwieraniem paska bocznego na urządzeniach mobilnych. */
export function ShellFrame({
  username,
  email,
  role,
  avatarUrl,
  chapters,
  children,
}: ShellFrameProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        username={username}
        email={email}
        role={role}
        avatarUrl={avatarUrl}
        chapters={chapters}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          username={username}
          email={email}
          role={role}
          avatarUrl={avatarUrl}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

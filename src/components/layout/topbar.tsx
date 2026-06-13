"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  MessageSquare,
  Users2,
  Printer,
  User as UserIcon,
  Shield,
  Menu,
  Megaphone,
} from "lucide-react";
import { MessagesPanel } from "@/components/messages/messages-panel";
import { AnnouncementsPanel } from "@/components/announcements/announcements-panel";
import { PrinterPanel } from "@/components/printer/printer-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";

interface TopbarProps {
  username: string | null;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  onMenuClick?: () => void;
}

export function Topbar({
  username,
  email,
  role,
  avatarUrl,
  onMenuClick,
}: TopbarProps) {
  const initials = (username || email).slice(0, 2).toUpperCase();
  const router = useRouter();
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagesTarget, setMessagesTarget] = useState<{
    id: string;
    username: string | null;
    email: string;
    avatarUrl: string | null;
  } | null>(null);
  const [printerOpen, setPrinterOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [annUnread, setAnnUnread] = useState(0);

  // Globalny event: otwórz wiadomości (opcjonalnie z wybranym użytkownikiem).
  useEffect(() => {
    function onOpen(e: Event) {
      const detail = (e as CustomEvent).detail as
        | { id: string; username: string | null; email: string; avatarUrl: string | null }
        | undefined;
      setMessagesTarget(detail ?? null);
      setMessagesOpen(true);
    }
    window.addEventListener("open-messages", onOpen);
    return () => window.removeEventListener("open-messages", onOpen);
  }, []);

  // Liczba nieprzeczytanych ogłoszeń (porównanie dat z localStorage).
  useEffect(() => {
    let cancelled = false;
    async function loadAnn() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) return;
        const data = await res.json();
        const list: { createdAt: string }[] = data.announcements ?? [];
        const lastSeen = Number(
          localStorage.getItem("announcements-last-seen") || 0
        );
        const count = list.filter(
          (a) => new Date(a.createdAt).getTime() > lastSeen
        ).length;
        if (!cancelled) setAnnUnread(count);
      } catch {
        /* ignore */
      }
    }
    void loadAnn();
    const id = setInterval(loadAnn, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [announcementsOpen]);

  function openAnnouncements() {
    localStorage.setItem("announcements-last-seen", String(Date.now()));
    setAnnUnread(0);
    setAnnouncementsOpen(true);
  }

  // Liczba nieprzeczytanych wiadomości: pobierz przy montażu i odświeżaj co 10 s.
  useEffect(() => {
    let cancelled = false;
    async function loadUnread() {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setUnread(data.count ?? 0);
      } catch {
        /* ignore */
      }
    }
    void loadUnread();
    const id = setInterval(loadUnread, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [messagesOpen]);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6">
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Otwórz menu"
            className="glow-icon-btn"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">Course3D</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            title="Wiadomości"
            aria-label="Wiadomości"
            className="glow-icon-btn relative"
            onClick={() => setMessagesOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
          <button
            type="button"
            title="Ogłoszenia"
            aria-label="Ogłoszenia"
            className="glow-icon-btn relative"
            onClick={openAnnouncements}
          >
            <Megaphone className="h-4 w-4" />
            {annUnread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
                {annUnread > 99 ? "99+" : annUnread}
              </span>
            )}
          </button>
          <button
            type="button"
            title="Społeczność"
            aria-label="Społeczność"
            className="glow-icon-btn"
            onClick={() => router.push("/spolecznosc")}
          >
            <Users2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Sterowanie drukarką 3D"
            aria-label="Drukarka"
            className="glow-icon-btn"
            onClick={() => setPrinterOpen(true)}
          >
            <Printer className="h-4 w-4" />
          </button>

          <Badge
            variant={role === "ADMIN" ? "default" : "secondary"}
            className="ml-2"
          >
            {role === "ADMIN" ? "Administrator" : "Kursant"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar>
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={email} />}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{username || "Użytkownik"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="h-4 w-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              {role === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/chapters">
                    <Shield className="h-4 w-4" />
                    Panel admina
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <MessagesPanel
        open={messagesOpen}
        onClose={() => {
          setMessagesOpen(false);
          setMessagesTarget(null);
        }}
        initialUser={messagesTarget}
      />

      <AnnouncementsPanel
        open={announcementsOpen}
        onClose={() => setAnnouncementsOpen(false)}
      />

      <PrinterPanel open={printerOpen} onClose={() => setPrinterOpen(false)} />
    </>
  );
}

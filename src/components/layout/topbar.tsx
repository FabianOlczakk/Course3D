"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LogOut,
  MessageSquare,
  Users2,
  Printer,
  User as UserIcon,
  Shield,
  X,
} from "lucide-react";
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
}

type PanelKind = "messages" | "community" | null;

export function Topbar({ username, email, role, avatarUrl }: TopbarProps) {
  const initials = (username || email).slice(0, 2).toUpperCase();
  const [panel, setPanel] = useState<PanelKind>(null);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6">
        <h1 className="text-lg font-semibold text-text-primary md:hidden">
          Course3D
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            title="Wiadomości"
            aria-label="Wiadomości"
            className="glow-icon-btn"
            onClick={() => setPanel("messages")}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Społeczność"
            aria-label="Społeczność"
            className="glow-icon-btn"
            onClick={() => setPanel("community")}
          >
            <Users2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Sterowanie drukarką — Wkrótce"
            aria-label="Drukarka"
            className="glow-icon-btn opacity-70"
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

      {panel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setPanel(null)}
          />
          <div className="glow-card relative z-10 m-4 flex h-[calc(100%-2rem)] w-full max-w-sm flex-col rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                {panel === "messages" ? "Wiadomości" : "Społeczność"}
              </h2>
              <button
                type="button"
                aria-label="Zamknij"
                className="glow-icon-btn"
                onClick={() => setPanel(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              {panel === "messages" ? (
                <MessageSquare className="mb-3 h-10 w-10 text-text-muted" />
              ) : (
                <Users2 className="mb-3 h-10 w-10 text-text-muted" />
              )}
              <p className="text-text-secondary">
                Ta funkcja będzie dostępna wkrótce (Faza 3).
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

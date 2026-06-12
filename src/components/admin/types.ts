import type { Role } from "@prisma/client";

export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  pending: boolean;
}

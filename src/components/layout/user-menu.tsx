"use client";

import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";

export function UserMenu() {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <div className="text-right">
        <p className="text-sm font-medium">Super Admin</p>
        <p className="text-xs text-muted-foreground">admin@admin.com</p>
      </div>
      <Link href="/profile" className="text-xs text-primary hover:underline">
        Profil
      </Link>
      <LogoutButton />
    </div>
  );
}

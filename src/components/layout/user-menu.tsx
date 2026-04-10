"use client";

import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";

export function UserMenu() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2">
      <UserCircle2 className="h-5 w-5 text-primary" />
      <div className="hidden text-right md:block">
        <p className="text-sm font-medium">Compte administration</p>
        <p className="text-xs text-muted-foreground">admin@admin.com</p>
      </div>
      <Link href="/profile" className="text-xs text-primary hover:underline">
        Mon profil
      </Link>
      <LogoutButton />
    </div>
  );
}

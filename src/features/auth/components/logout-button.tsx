"use client";

import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/infrastructure/supabase/browser-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={onLogout}>
      Déconnexion
    </Button>
  );
}

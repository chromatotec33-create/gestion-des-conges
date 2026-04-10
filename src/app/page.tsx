import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Gestion des congés</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Fondation Phase 1 prête : architecture modulaire enterprise alignée DDD/Clean.
      </p>
      <div className="mt-6">
        <Link href="/login">
          <Button>Se connecter</Button>
        </Link>
      </div>
    </main>
  );
}

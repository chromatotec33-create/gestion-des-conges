import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Connexion sécurisée</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accédez à votre portail RH organisation.</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1 underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à l’accueil
          </Link>
        </p>
      </div>
    </main>
  );
}

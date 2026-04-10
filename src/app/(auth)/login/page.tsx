import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Gestion des congés</h1>
          <p className="mt-1 text-sm text-slate-500">Authentification sécurisée entreprise</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-slate-500">
          Retour à l’accueil : <Link href="/" className="underline">home</Link>
        </p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestion des congés - SaaS RH",
  description: "Plateforme enterprise de gestion des congés et absences"
};

type RootLayoutProps = {
  readonly children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

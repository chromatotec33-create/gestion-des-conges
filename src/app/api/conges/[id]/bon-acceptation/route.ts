import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const id = context.params.id;
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("conges")
    .select("id, user_id, type, date_debut, date_fin, nb_jours, statut, profiles!conges_user_id_fkey(nom, prenom, email)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Congé introuvable" }, { status: 404 });
  }

  if (data.statut !== "valide_direction") {
    return NextResponse.json({ error: "Bon disponible uniquement après validation direction" }, { status: 400 });
  }

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
  const content = [
    "BON D'ACCEPTATION DE CONGE",
    "-------------------------",
    `Demande: ${data.id}`,
    `Employé: ${profile?.prenom ?? ""} ${profile?.nom ?? ""}`,
    `Email: ${profile?.email ?? ""}`,
    `Type: ${data.type}`,
    `Période: ${data.date_debut} au ${data.date_fin}`,
    `Nombre de jours: ${data.nb_jours}`,
    `Statut: ${data.statut}`,
    `Date d'émission: ${new Date().toISOString()}`
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=bon_acceptation_${data.id}.txt`
    }
  });
}

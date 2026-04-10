import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

const workflowSchema = z.object({
  role: z.enum(["chef_service", "direction", "admin"]),
  decision: z.enum(["valider", "refuser"]),
  auteur_id: z.string().uuid(),
  commentaire: z.string().max(1000).optional()
});

const nextStatus: Record<string, Record<string, string>> = {
  chef_service: { valider: "valide_chef", refuser: "refuse_chef" },
  direction: { valider: "valide_direction", refuser: "refuse_direction" },
  admin: { valider: "valide_direction", refuser: "refuse_direction" }
};

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const body = await request.json();
  const parsed = workflowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = context.params.id;
  const payload = parsed.data;
  const status = nextStatus[payload.role]?.[payload.decision];
  if (!status) {
    return NextResponse.json({ error: "Transition de workflow invalide" }, { status: 400 });
  }
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("conges")
    .update({
      statut: status,
      commentaire_prive: payload.commentaire ?? null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("historiques").insert({
    conge_id: id,
    action: payload.decision === "valider" ? "validation" : "refus",
    auteur_id: payload.auteur_id,
    commentaire: payload.commentaire ?? null
  });

  return NextResponse.json({ data });
}

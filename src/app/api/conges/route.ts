import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

const createCongeSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(["cp", "sans_solde", "rtt"]),
  date_debut: z.string().date(),
  date_fin: z.string().date(),
  commentaire_public: z.string().max(1000).optional(),
  commentaire_prive: z.string().max(1000).optional()
});

export async function GET(request: NextRequest) {
  const supabase = createServiceRoleClient();
  const role = request.nextUrl.searchParams.get("role");
  const teamId = request.nextUrl.searchParams.get("team_id");
  const userId = request.nextUrl.searchParams.get("user_id");

  let query = supabase.from("conges").select("*, profiles!conges_user_id_fkey(id, nom, prenom, role, team_id)").order("created_at", { ascending: false });

  if (role === "employe" && userId) {
    query = query.eq("user_id", userId);
  }

  if (role === "chef_service" && teamId) {
    query = query.eq("profiles.team_id", teamId);
  }

  const { data, error } = await query.limit(100);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createCongeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const payload = parsed.data;
  const { data, error } = await supabase
    .from("conges")
    .insert({
      user_id: payload.user_id,
      type: payload.type,
      date_debut: payload.date_debut,
      date_fin: payload.date_fin,
      commentaire_public: payload.commentaire_public ?? null,
      commentaire_prive: payload.commentaire_prive ?? null
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

import { z } from "zod";
import { NextResponse } from "next/server";
import { getAuthenticatedUserFromBearerToken } from "@/infrastructure/auth/authenticated-user";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";

const propagationSchema = z.object({
  sourceCompanyId: z.string().uuid(),
  configKey: z.string().min(3),
  newValue: z.record(z.unknown()),
  applyMode: z.enum(["current_only", "all", "selected"]),
  targetCompanyIds: z.array(z.string().uuid())
});

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUserFromBearerToken(request.headers.get("authorization"));
    const payload = propagationSchema.parse(await request.json());

    const supabase = createServiceRoleClient();

    const { data: user } = await supabase.from("users").select("id").eq("id", authUser.userId).maybeSingle<{ id: string }>();

    if (!user?.id) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 403 });
    }

    const { data, error } = await supabase.rpc("propagate_group_configuration", {
      p_source_company_id: payload.sourceCompanyId,
      p_config_key: payload.configKey,
      p_new_value: payload.newValue,
      p_apply_mode: payload.applyMode,
      p_target_company_ids: payload.targetCompanyIds,
      p_initiated_by_user_id: user.id
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ propagationId: data, message: "Propagation exécutée avec succès." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Payload invalide", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ message: "Erreur inattendue" }, { status: 500 });
  }
}

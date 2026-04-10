import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/infrastructure/supabase/server-client";
import { getServerEnv } from "@/lib/env.server";

export async function GET() {
  try {
    const env = getServerEnv();
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("companies").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          checks: {
            env: "ok",
            database: "down"
          },
          reason: error.message
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        checks: {
          env: "ok",
          database: "ok"
        },
        appEnv: env.APP_ENV,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "down",
        checks: {
          env: "down",
          database: "unknown"
        },
        reason
      },
      { status: 503 }
    );
  }
}

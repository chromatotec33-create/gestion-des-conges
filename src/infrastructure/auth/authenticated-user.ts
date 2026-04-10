import { DomainError } from "@/domain/errors/domain-error";
import { createAnonServerClient } from "@/infrastructure/supabase/server-client";

export type AuthenticatedUser = {
  readonly userId: string;
  readonly email: string | null;
};

export async function getAuthenticatedUserFromBearerToken(authHeader: string | null): Promise<AuthenticatedUser> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new DomainError("Missing bearer token", "AUTH_REQUIRED");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const client = createAnonServerClient();
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    throw new DomainError("Invalid authentication token", "AUTH_INVALID_TOKEN", {
      reason: error?.message
    });
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? null
  };
}

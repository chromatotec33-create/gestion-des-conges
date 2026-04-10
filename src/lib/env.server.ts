import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  APP_ENV: z.enum(["development", "staging", "production"]).default("development")
}).superRefine((value, context) => {
  if (value.APP_ENV === "production" && value.APP_BASE_URL.includes("localhost")) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "APP_BASE_URL must be a public https URL in production"
    });
  }
});

export function getServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    APP_BASE_URL: process.env.APP_BASE_URL,
    APP_ENV: process.env.APP_ENV
  });
}

import { createAuth } from "./auth";

// Generation uses all plugins and isolated placeholders; it never loads deployment secrets.
export const auth = createAuth({
  POSTGRES_URL: "postgresql://schema:schema@localhost:5432/schema",
  BETTER_AUTH_URL: "http://localhost:3001",
  BETTER_AUTH_SECRET: "schema-generation-only-not-a-runtime-secret",
  BETTER_AUTH_API_KEY: "schema-generation-only",
  TRUSTED_ORIGINS: [],
  GOOGLE_CLIENT_ID: "schema-generation-only",
  GOOGLE_CLIENT_SECRET: "schema-generation-only",
  GITHUB_CLIENT_ID: "schema-generation-only",
  GITHUB_CLIENT_SECRET: "schema-generation-only",
  NODE_ENV: "test",
  STRIPE_SECRET_KEY: "sk_test_schema_generation_only",
  STRIPE_WEBHOOK_SECRET: "whsec_schema_generation_only",
  STRIPE_PLANS: [],
  SUPABASE_URL: "https://schema.example.com",
  SUPABASE_PUBLISHABLE_KEY: "schema-generation-only",
});

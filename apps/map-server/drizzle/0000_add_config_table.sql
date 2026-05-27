CREATE TABLE IF NOT EXISTS "config" (
  "user" text PRIMARY KEY NOT NULL,
  "credentials" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

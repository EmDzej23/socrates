import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Adding greeting_message column to characters...");
  await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS greeting_message TEXT`;
  console.log("Done!");
}

main().catch(console.error);

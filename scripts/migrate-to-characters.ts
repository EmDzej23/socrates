import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Starting migration to multi-character support...\n");

  // 1. Create characters table
  console.log("1. Creating characters table...");
  await sql`
    CREATE TABLE IF NOT EXISTS characters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      avatar_url TEXT,
      base_prompt TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("   ✓ Characters table created\n");

  // 2. Check if Socrates character exists, create if not
  console.log("2. Creating Socrates as default character...");
  const existingSocrates = await sql`SELECT id FROM characters WHERE slug = 'socrates'`;
  
  let socratesId: string;
  if (existingSocrates.length === 0) {
    const result = await sql`
      INSERT INTO characters (name, slug, description, base_prompt, sort_order)
      VALUES (
        'Socrates',
        'socrates',
        'The ancient Greek philosopher known for the Socratic method of questioning.',
        'You are a Socratic dialogue system based on curated ancient sources. You guide seekers toward wisdom through careful questioning, examining assumptions, and revealing contradictions.',
        0
      )
      RETURNING id
    `;
    socratesId = result[0].id;
    console.log(`   ✓ Created Socrates character with id: ${socratesId}\n`);
  } else {
    socratesId = existingSocrates[0].id;
    console.log(`   ✓ Socrates character already exists with id: ${socratesId}\n`);
  }

  // 3. Add character_id to documents if not exists
  console.log("3. Adding character_id to documents table...");
  try {
    await sql`ALTER TABLE documents ADD COLUMN IF NOT EXISTS character_id UUID REFERENCES characters(id) ON DELETE CASCADE`;
    console.log("   ✓ Added character_id column to documents\n");
  } catch (e) {
    console.log("   ✓ character_id column already exists in documents\n");
  }

  // 4. Update existing documents to belong to Socrates
  console.log("4. Assigning existing documents to Socrates...");
  const updatedDocs = await sql`
    UPDATE documents SET character_id = ${socratesId} WHERE character_id IS NULL
  `;
  console.log(`   ✓ Updated documents\n`);

  // 5. Add character_id to chat_sessions if not exists
  console.log("5. Adding character_id to chat_sessions table...");
  try {
    await sql`ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS character_id UUID REFERENCES characters(id) ON DELETE SET NULL`;
    console.log("   ✓ Added character_id column to chat_sessions\n");
  } catch (e) {
    console.log("   ✓ character_id column already exists in chat_sessions\n");
  }

  // 6. Update existing chat sessions to belong to Socrates
  console.log("6. Assigning existing chat sessions to Socrates...");
  await sql`
    UPDATE chat_sessions SET character_id = ${socratesId} WHERE character_id IS NULL
  `;
  console.log(`   ✓ Updated chat sessions\n`);

  // 7. Create new rules table if not exists
  console.log("7. Creating rules table...");
  await sql`
    CREATE TABLE IF NOT EXISTS rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true,
      always_include BOOLEAN NOT NULL DEFAULT true,
      priority INTEGER NOT NULL DEFAULT 100,
      embedding vector(1536),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("   ✓ Rules table created\n");

  // 8. Migrate data from socratic_rules to rules if socratic_rules exists
  console.log("8. Migrating data from socratic_rules to rules...");
  try {
    const existingRules = await sql`SELECT COUNT(*) as count FROM socratic_rules`;
    if (existingRules[0].count > 0) {
      await sql`
        INSERT INTO rules (id, character_id, title, content, active, always_include, priority, embedding, created_at, updated_at)
        SELECT id, ${socratesId}, title, content, active, always_include, priority, embedding, created_at, updated_at
        FROM socratic_rules
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`   ✓ Migrated ${existingRules[0].count} rules from socratic_rules\n`);
    } else {
      console.log("   ✓ No rules to migrate\n");
    }
  } catch (e) {
    console.log("   ✓ socratic_rules table doesn't exist or already migrated\n");
  }

  // 9. Create indexes
  console.log("9. Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS documents_character_id_idx ON documents(character_id)`;
  await sql`CREATE INDEX IF NOT EXISTS chat_sessions_character_id_idx ON chat_sessions(character_id)`;
  await sql`CREATE INDEX IF NOT EXISTS rules_character_id_idx ON rules(character_id)`;
  console.log("   ✓ Indexes created\n");

  console.log("Migration completed successfully!");
  console.log(`\nSocrates character ID: ${socratesId}`);
  console.log("\nYou can now optionally drop the old socratic_rules table:");
  console.log("  DROP TABLE IF EXISTS socratic_rules;");
}

migrate().catch(console.error);

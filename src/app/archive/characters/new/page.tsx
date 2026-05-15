import { CharacterForm } from "@/components/archive/CharacterForm";

export default function NewCharacterPage() {
  return (
    <div className="p-8" style={{ fontFamily: "var(--font-serif)" }}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">New Character</h1>
        <p className="mt-1 text-[var(--ink-light)] italic">
          Create a new philosopher or persona for dialogue.
        </p>
      </div>

      <div className="max-w-2xl">
        <CharacterForm />
      </div>
    </div>
  );
}

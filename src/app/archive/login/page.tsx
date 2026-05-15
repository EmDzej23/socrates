import { redirect } from "next/navigation";
import { verifyAdminSession, createAdminSession } from "@/lib/auth/session";

export const metadata = {
  title: "Enter the Archive — Σωκράτης",
};

async function loginAction(formData: FormData) {
  "use server";

  const password = formData.get("password") as string;

  if (password === process.env.ADMIN_PASSWORD) {
    await createAdminSession();
    redirect("/archive");
  }

  redirect("/archive/login?error=invalid");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const isAdmin = await verifyAdminSession();
  if (isAdmin) {
    redirect("/archive");
  }

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--parchment)] papyrus-texture">
      <div className="w-full max-w-sm">
        <div className="border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] p-8">
          <div className="text-center mb-6">
            <span className="text-4xl text-[var(--ink-light)]">🏛</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--ink)] text-center" style={{ fontFamily: 'var(--font-serif)' }}>
            Enter the Archive
          </h1>
          <p className="mt-2 text-center text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
            Speak the word of passage.
          </p>

          {error && (
            <div className="mt-6 border-l-4 border-[var(--terracotta)] bg-[var(--parchment-dark)] p-4 text-[var(--terracotta)]" style={{ fontFamily: 'var(--font-serif)' }}>
              The word is not recognized. Try again.
            </div>
          )}

          <form action={loginAction} className="mt-8">
            <label className="block text-sm text-[var(--ink-light)] uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="block w-full border-2 border-[var(--ink-light)] border-opacity-30 bg-[var(--parchment)] px-4 py-3 text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
              style={{ fontFamily: 'var(--font-serif)' }}
            />
            <button
              type="submit"
              className="mt-6 w-full bg-[var(--ink)] px-4 py-3 text-[var(--parchment)] hover:bg-[var(--ink-light)] transition-colors"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

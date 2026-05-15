import { redirect } from "next/navigation";
import { verifyAdminSession, createAdminSession } from "@/lib/auth/session";

export const metadata = {
  title: "Admin Login — Socrates Archive",
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
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-900">
          <h1 className="text-xl font-medium text-stone-800 dark:text-stone-200">
            Archive Login
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Enter the admin password to access the archive.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              Invalid password. Please try again.
            </div>
          )}

          <form action={loginAction} className="mt-6">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-light tracking-tight text-stone-800 dark:text-stone-200 sm:text-5xl">
          Socrates
        </h1>
        <p className="mt-6 text-lg leading-8 text-stone-600 dark:text-stone-400">
          A digital agora for questioning, reflection, and dialogue — built from
          a curated archive of Socratic sources.
        </p>
        <p className="mt-4 text-base text-stone-500 dark:text-stone-500">
          The examined life begins with a question.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/agora"
            className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            Enter the Agora
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-8 text-center text-sm text-stone-400 dark:text-stone-600">
        <p>
          Not the historical Socrates. A dialogue system based on curated
          sources.
        </p>
      </footer>
    </main>
  );
}

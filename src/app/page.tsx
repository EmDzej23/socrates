import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 papyrus-texture">
      <div className="max-w-2xl text-center">
        <div className="mb-8 text-6xl text-[var(--ink-light)]">☉</div>
        
        <h1 className="text-5xl font-semibold tracking-wide text-[var(--ink)] sm:text-6xl" style={{ fontFamily: 'var(--font-serif)' }}>
          TARKOS AGORA
        </h1>
        <p className="mt-2 text-xl text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
          Τάρκος Ἀγορά
        </p>
        
        <div className="mt-8 mx-auto w-32 border-t-2 border-[var(--ink-light)] opacity-30" />
        
        <p className="mt-8 text-xl leading-relaxed text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
          A digital agora for questioning, reflection, and dialogue — 
          built from a curated archive of ancient sources.
        </p>
        
        <p className="mt-6 text-lg text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
          "The unexamined life is not worth living."
        </p>
        
        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Link
            href="/agora"
            className="group relative px-8 py-4 text-lg font-medium text-[var(--parchment)] transition-all"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <span className="absolute inset-0 bg-[var(--ink)] transition-transform group-hover:scale-105" />
            <span className="relative">Enter the Agora</span>
          </Link>
        </div>
        
        <div className="mt-16 flex justify-center gap-8 text-[var(--ink-light)] text-2xl opacity-40">
          <span>☽</span>
          <span>✦</span>
          <span>☾</span>
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-center text-sm text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
        <p>
          A dialogue system based on curated sources.
        </p>
      </footer>
    </main>
  );
}

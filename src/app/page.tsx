import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-24 papyrus-texture">
      <div className="max-w-2xl text-center">
        <div className="mb-6 sm:mb-8 text-5xl sm:text-6xl text-[var(--ink-light)]">☉</div>
        
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-wide text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
          TARKOS AGORA
        </h1>
        <p className="mt-2 text-lg sm:text-xl text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
          Τάρκος Ἀγορά
        </p>
        
        <div className="mt-6 sm:mt-8 mx-auto w-24 sm:w-32 border-t-2 border-[var(--ink-light)] opacity-30" />
        
        <p className="mt-6 sm:mt-8 text-base sm:text-xl leading-relaxed text-[var(--ink)]" style={{ fontFamily: 'var(--font-serif)' }}>
          A digital agora for questioning, reflection, and dialogue — 
          built from a curated archive of ancient sources.
        </p>
        
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-[var(--ink-light)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
          "The unexamined life is not worth living."
        </p>
        
        <div className="mt-8 sm:mt-12 flex items-center justify-center">
          <Link
            href="/agora"
            className="group relative px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-medium text-[var(--parchment)] transition-all"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <span className="absolute inset-0 bg-[var(--ink)] transition-transform group-hover:scale-105" />
            <span className="relative">Enter the Agora</span>
          </Link>
        </div>
        
        <div className="mt-12 sm:mt-16 flex justify-center gap-6 sm:gap-8 text-[var(--ink-light)] text-xl sm:text-2xl opacity-40">
          <span>☽</span>
          <span>✦</span>
          <span>☾</span>
        </div>
      </div>
      
      <footer className="absolute bottom-4 sm:bottom-8 left-0 right-0 text-center text-xs sm:text-sm text-[var(--ink-light)] italic px-4" style={{ fontFamily: 'var(--font-serif)' }}>
        <p>
          A dialogue system based on curated sources.
        </p>
      </footer>
    </main>
  );
}

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <span className="text-[12px] font-medium text-accent-pink">AWI · Foundation</span>
        <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-tight text-text-primary">
          Design system de départ pour tes projets
        </h1>
        <p className="mt-4 text-[length:var(--text-body)] font-light leading-relaxed text-text-secondary">
          Tokens partagés, theming light/dark, échelles de typo et de motion. Customise{" "}
          <span className="font-mono text-text-primary">tokens-brand.css</span> pour adapter au client,
          puis builds dessus.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/style-guide"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-purple via-accent-pink via-[47%] to-accent-pink-light px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-accent-pink/20"
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            Ouvrir le style guide
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}

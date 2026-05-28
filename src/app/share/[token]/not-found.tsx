import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--text-muted)]">
        Lien expiré ou désactivé
      </p>
      <h1 className="mt-3 text-[32px] font-semibold tracking-tight text-[var(--text-primary)]">
        Ce partage n'est plus accessible
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--text-secondary)]">
        Le consultant qui vous a partagé ce lien l'a peut-être désactivé,
        ou le lien est arrivé à expiration. Contactez-le pour obtenir un nouveau lien.
      </p>
      <Link
        href="/"
        className="mt-8 text-[12px] font-medium text-[var(--text-muted)] underline transition-colors hover:text-[var(--text-primary)]"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}

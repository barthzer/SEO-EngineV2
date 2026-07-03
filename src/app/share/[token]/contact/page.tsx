import { notFound } from "next/navigation";
import { getSharedProject } from "@/data/sharedProjects";
import {
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { OwnerAvatar, SectionHeader } from "@/components/share/ClientPrimitives";

function formatMeetingDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(iso));
}

export default async function ClientContactPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = getSharedProject(token);
  if (!project) notFound();

  const c = project.consultant;

  return (
    <div className="mx-auto w-full max-w-[760px] px-8 py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          Mon consultant
        </h1>
        <p className="mt-2 max-w-[640px] text-[14px] leading-relaxed text-[var(--text-secondary)]">
          Une question, un blocage, un imprévu ? Votre consultant référent vous
          répond directement.
        </p>
      </div>

      {/* Carte consultant */}
      <section className="mb-10 rounded-2xl border border-[var(--border-subtle)] p-7">
        <div className="flex items-center gap-5">
          <OwnerAvatar photoSeed={c.photoSeed} name={c.name} size={72} />
          <div>
            <h2 className="text-[22px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              {c.name}
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">{c.role}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${c.email}`}
            className="group flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card-static)]">
              <EnvelopeIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Email
              </p>
              <p className="mt-0.5 truncate text-[13px] font-medium text-[var(--text-primary)]">
                {c.email}
              </p>
            </div>
          </a>

          <a
            href={`tel:${c.phone.replace(/\s/g, "")}`}
            className="group flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card-static)]">
              <PhoneIcon className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Téléphone
              </p>
              <p className="mt-0.5 truncate text-[13px] font-medium text-[var(--text-primary)]">
                {c.phone}
              </p>
            </div>
          </a>
        </div>
      </section>

      {/* Prochains rendez-vous */}
      {project.upcomingMeetings.length > 0 && (
        <section>
          <div className="mb-4">
            <SectionHeader title="Prochains rendez-vous" count={project.upcomingMeetings.length} />
          </div>

          <div className="flex flex-col gap-3">
            {project.upcomingMeetings.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] px-5 py-4"
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "var(--accent-primary-soft)" }}
                >
                  <CalendarDaysIcon className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    {m.topic}
                  </p>
                  <p className="mt-0.5 text-[12px] capitalize text-[var(--text-muted)]">
                    {formatMeetingDate(m.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

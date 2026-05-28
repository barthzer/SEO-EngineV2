import Link from "next/link";
import { notFound } from "next/navigation";
import { getSharedProject } from "@/data/sharedProjects";
import {
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  PencilSquareIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { TrafficChart } from "@/components/share/TrafficChart";
import { TopPagesChart, RisingKeywordsChart } from "@/components/share/DashboardCharts";
import { LinkButton } from "@/components/Button";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { HealthScoreBar } from "@/components/HealthScoreBar";
import { MeetingTile } from "@/components/MeetingTile";
import { ClientActionCard } from "@/components/share/ClientPrimitives";

/**
 * Tableau de bord client — 100% composants DS.
 *
 * Composants utilisés : Panel, KpiCard, ScoreGauges, MetricListRow,
 * RankingChange, Pill, IconBadge, LinkButton, ClientActionCard,
 * TrafficSparkline. ZÉRO inline composant.
 */
export default async function ClientDashboard({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = getSharedProject(token);
  if (!project) notFound();

  const trafficIsPositive = project.traffic.monthlyDelta >= 0;
  const bm = project.businessMetrics;
  /** Calcule le % d'évolution trafic à partir des valeurs absolues (pour cohérence avec le chiffre affiché). */
  const trafficDeltaPct = project.traffic.monthlyDelta === 0 || project.traffic.monthlyVisits - project.traffic.monthlyDelta === 0
    ? 0
    : (project.traffic.monthlyDelta / (project.traffic.monthlyVisits - project.traffic.monthlyDelta)) * 100;
  const formatPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")}%`;

  return (
    <div className="w-full px-8 py-6">

      {/* ── Greeting + CTA rapport ── */}
      <div className="mb-5 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[24px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
            Bonjour, {project.clientName}.
          </h1>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            Rapport {project.period}
          </p>
        </div>
        {project.reports[0] && (
          <LinkButton href={`/share/${token}/rapports`} variant="primary" size="sm">
            Télécharger le rapport
          </LinkButton>
        )}
      </div>

      {/* ── 4 KPIs business ── */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        <KpiCard
          label="Visites SEO"
          value={project.traffic.monthlyVisits.toLocaleString("fr-FR")}
          delta={formatPct(trafficDeltaPct)}
          deltaPositiveIsGood
          sub="ce mois"
        />
        <KpiCard
          label="Valeur du trafic"
          value={`${bm.trafficValue.amountEur.toLocaleString("fr-FR")} €`}
          delta={formatPct(bm.trafficValue.deltaPct)}
          deltaPositiveIsGood
          sub="équivalent budget Ads"
        />
        <KpiCard
          label={bm.conversions.label.charAt(0).toUpperCase() + bm.conversions.label.slice(1)}
          value={bm.conversions.count.toLocaleString("fr-FR")}
          delta={formatPct(bm.conversions.deltaPct)}
          deltaPositiveIsGood
          sub="via le SEO ce mois"
        />
        <KpiCard
          label="Mots-clés en top 10"
          value={bm.top10Keywords.count.toLocaleString("fr-FR")}
          delta={`${bm.top10Keywords.delta >= 0 ? "+" : ""}${bm.top10Keywords.delta}`}
          deltaPositiveIsGood
          sub="page 1 de Google"
        />
      </div>

      {/* ── Row : Chart trafic + Santé du site (Panel) ── */}
      <div
        className="mb-4 grid gap-3"
        style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}
      >
        <Panel
          fill
          title="Évolution du trafic SEO"
          subtitle="visites organiques · 6 derniers mois"
          action={
            <Pill
              color={trafficIsPositive ? "var(--color-success)" : "var(--color-danger)"}
              bg={trafficIsPositive ? "var(--color-success-bg)" : "var(--color-danger-bg)"}
            >
              {trafficIsPositive ? <ArrowTrendingUpIcon className="h-3 w-3" /> : <ArrowTrendingDownIcon className="h-3 w-3" />}
              {project.trafic}
            </Pill>
          }
        >
          <TrafficChart
            values={project.traffic.history}
            labels={project.traffic.historyLabels}
            fillHeight
          />
        </Panel>

        <Panel title="Santé de votre site" subtitle="3 axes mesurés indépendamment" gap="sm">
          <HealthScoreBar
            icon={BoltIcon}
            label="Technique"
            score={project.scoreTechnique}
            hint="Vitesse, structure, accessibilité"
          />
          <HealthScoreBar
            icon={PencilSquareIcon}
            label="Contenu"
            score={project.scoreContenu}
            hint="Qualité éditoriale, profondeur"
          />
          <HealthScoreBar
            icon={LinkIcon}
            label="Notoriété"
            score={project.scoreNetlinking}
            hint="Sites externes qui vous citent"
          />
        </Panel>
      </div>

      {/* ── Row : Top pages + Mots-clés (HorizontalBarChart) ── */}
      <div className="mb-4 grid grid-cols-2 gap-3">

        {project.topPages.length > 0 && (
          <Panel
            title="Vos pages préférées de Google"
            subtitle="celles qui amènent le plus de visites"
          >
            <TopPagesChart pages={project.topPages.slice(0, 5)} />
          </Panel>
        )}

        {project.risingKeywords.length > 0 && (
          <Panel
            title="Mots-clés en progression"
            subtitle="vous montez dans le classement Google"
          >
            <RisingKeywordsChart keywords={project.risingKeywords.slice(0, 5)} />
          </Panel>
        )}
      </div>

      {/* ── Row : Actions livrées + Prochain RDV ── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}
      >
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">
              Actions livrées récentes
            </h2>
            <LinkButton
              href={`/share/${token}/avancement`}
              variant="tertiary"
              size="sm"
            >
              Voir tout
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </LinkButton>
          </div>
          <div className="flex flex-col gap-2.5">
            {project.actionsDelivered.slice(0, 2).map((a) => (
              <ClientActionCard key={a.id} action={a} domain={project.domain} clientName={project.clientName} />
            ))}
          </div>
        </section>

        {project.upcomingMeetings[0] && (
          <MeetingTile
            date={project.upcomingMeetings[0].date}
            topic={project.upcomingMeetings[0].topic}
            action={
              <LinkButton
                href={`/share/${token}/contact`}
                variant="tertiary"
                size="sm"
              >
                Voir tous les RDV
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </LinkButton>
            }
          />
        )}
      </div>
    </div>
  );
}

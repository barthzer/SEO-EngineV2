/**
 * Modèle de domaine SEO Engine V2 — Postgres / Drizzle.
 *
 * Hiérarchie : Workspace (agence) ─┬─ Consultant[] (membres)
 *                                  └─ Client[]
 *                                      └─ Project[] (un client peut avoir plusieurs sites)
 *                                          ├─ ActionCard[]    → ImpactSnapshot[]  (T+0/30/60/90)
 *                                          │                  → ActionComment[]
 *                                          ├─ Brief[]
 *                                          ├─ Audit[]         → AuditIssue[]      → auto-génère ActionCard
 *                                          ├─ KeywordStudy[]
 *                                          ├─ Note[]          (journal vivant E2)
 *                                          └─ Report[]        (rapports mensuels C1)
 *
 * Multi-tenancy : tout est scopé à `workspace_id`. RLS Supabase à activer migration-time.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export const projectStatusEnum = pgEnum("project_status", ["actif", "archive"]);

export const consultantRoleEnum = pgEnum("consultant_role", [
  "owner",
  "admin",
  "consultant",
  "viewer",
]);

export const actionStatusEnum = pgEnum("action_status", [
  "todo",
  "in_progress",
  "blocked_client",
  "done",
  "abandoned",
]);

export const actionRecurrenceEnum = pgEnum("action_recurrence", [
  "none",
  "weekly",
  "monthly",
  "quarterly",
]);

export const actionPriorityEnum = pgEnum("action_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const actionCategoryEnum = pgEnum("action_category", [
  "technique",
  "contenu",
  "netlinking",
  "geo",
  "autre",
]);

export const briefStatusEnum = pgEnum("brief_status", [
  "draft",
  "ready",
  "assigned",
  "submitted",
  "approved",
  "published",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "published",
  "shared",
]);

export const auditSeverityEnum = pgEnum("audit_severity", [
  "critical",
  "warning",
  "info",
]);

// ─────────────────────────────────────────────────────────────────────────────
// CORE — Workspaces / Consultants / Clients / Projects
// ─────────────────────────────────────────────────────────────────────────────

/** Workspace = l'agence ou le freelance. Racine de la multi-tenancy. */
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  industry: text("industry"),
  teamSize: text("team_size"),
  /** White-label : logo + couleur primaire pour les rapports clients. */
  logoUrl: text("logo_url"),
  accentColor: text("accent_color"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Consultant = membre d'un workspace, lié à un user Supabase Auth. */
export const consultants = pgTable("consultants", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  /** FK vers `auth.users.id` (table managée par Supabase). */
  authUserId: uuid("auth_user_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull(),
  role: consultantRoleEnum("role").default("consultant").notNull(),
  seniority: text("seniority"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Client = l'entité business qui paie le consultant. Distinct de Project. */
export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  industry: text("industry"),
  /** Montant mensuel facturé en centimes EUR (évite les flottants). */
  monthlyFeeCents: integer("monthly_fee_cents"),
  contractStart: timestamp("contract_start", { withTimezone: true }),
  contractEnd: timestamp("contract_end", { withTimezone: true }),
  nextMeeting: timestamp("next_meeting", { withTimezone: true }),
  ownerConsultantId: uuid("owner_consultant_id").references(() => consultants.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Project = un site/domaine appartenant à un Client. Un client peut en avoir plusieurs. */
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  status: projectStatusEnum("status").default("actif").notNull(),

  // Connexions data sources
  gscPropertyId: text("gsc_property_id"),
  ga4PropertyId: text("ga4_property_id"),
  ahrefsProjectId: text("ahrefs_project_id"),

  // 3 jauges au lieu d'un score opaque (cf. F3)
  scoreTechnique: integer("score_technique"),
  scoreContenu: integer("score_contenu"),
  scoreNetlinking: integer("score_netlinking"),

  // Partage client read-only (cf. C2)
  clientShareEnabled: boolean("client_share_enabled").default(false).notNull(),
  clientShareToken: text("client_share_token").unique(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CYCLE DE REDEVABILITÉ — ActionCard + ImpactSnapshot + Comments
// ─────────────────────────────────────────────────────────────────────────────

/** ActionCard = l'unité économique : ce qu'on facture, ce qu'on mesure, ce qu'on prouve. */
export const actionCards = pgTable("action_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  description: text("description"),
  category: actionCategoryEnum("category"),
  priority: actionPriorityEnum("priority").default("medium").notNull(),
  status: actionStatusEnum("status").default("todo").notNull(),

  ownerConsultantId: uuid("owner_consultant_id").references(() => consultants.id),
  deadline: timestamp("deadline", { withTimezone: true }),

  /** Preuve d'implémentation : URL contrôlée + screenshot. */
  evidenceUrl: text("evidence_url"),
  evidenceScreenshotUrl: text("evidence_screenshot_url"),

  /** Narratif client business (pas technique) — pour les rapports. */
  clientNarrative: text("client_narrative"),

  /** Temps passé en minutes (pour packaging d'offre futur). */
  timeSpentMinutes: integer("time_spent_minutes"),

  /** Récurrence (cf. B3). */
  recurrence: actionRecurrenceEnum("recurrence").default("none").notNull(),
  recurrenceParentId: uuid("recurrence_parent_id"),

  /** Origine : auto-générée depuis une AuditIssue ? Depuis un template (D2) ? */
  sourceAuditIssueId: uuid("source_audit_issue_id"),
  sourceTemplateId: uuid("source_template_id"),

  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Snapshot pris à T+0, T+30, T+60, T+90 jours après le done d'une action. */
export const impactSnapshots = pgTable("impact_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  actionCardId: uuid("action_card_id")
    .notNull()
    .references(() => actionCards.id, { onDelete: "cascade" }),
  offsetDays: integer("offset_days").notNull(), // 0 | 30 | 60 | 90
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
  /** { position, impressions, clicks, ctr, backlinks?, drDelta? } */
  metrics: jsonb("metrics").notNull(),
});

/** Commentaires sur ActionCard — internes + client (cf. C3). */
export const actionComments = pgTable("action_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  actionCardId: uuid("action_card_id")
    .notNull()
    .references(() => actionCards.id, { onDelete: "cascade" }),
  authorConsultantId: uuid("author_consultant_id").references(() => consultants.id),
  /** true = commentaire posté depuis le share-link client (pas un consultant). */
  authorClient: boolean("author_client").default(false).notNull(),
  authorEmail: text("author_email"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT — boucle Audit → AuditIssue → auto-génère ActionCard
// ─────────────────────────────────────────────────────────────────────────────

export const audits = pgTable("audits", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  runAt: timestamp("run_at", { withTimezone: true }).defaultNow().notNull(),
  source: text("source").notNull(), // "ahrefs" | "internal" | "manual"
  /** { critical: N, warning: N, info: N } */
  summary: jsonb("summary"),
});

export const auditIssues = pgTable("audit_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  auditId: uuid("audit_id")
    .notNull()
    .references(() => audits.id, { onDelete: "cascade" }),
  severity: auditSeverityEnum("severity").notNull(),
  category: text("category"),
  title: text("title").notNull(),
  description: text("description"),
  affectedUrls: jsonb("affected_urls"), // string[]
  recommendation: text("recommendation"),
  resolved: boolean("resolved").default(false).notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// BRIEF — handoff rédacteur (cf. E1)
// ─────────────────────────────────────────────────────────────────────────────

export const briefs = pgTable("briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  targetKeyword: text("target_keyword"),
  status: briefStatusEnum("status").default("draft").notNull(),

  contentMarkdown: text("content_markdown"),
  ngrams: jsonb("ngrams"), // string[]
  internalLinks: jsonb("internal_links"), // { url, anchor }[]

  /** Lien public read-only pour le rédacteur externe. */
  shareToken: text("share_token").unique(),
  assignedWriterEmail: text("assigned_writer_email"),
  submittedUrl: text("submitted_url"),
  publishedUrl: text("published_url"),
  deadline: timestamp("deadline", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD STUDY
// ─────────────────────────────────────────────────────────────────────────────

export const keywordStudies = pgTable("keyword_studies", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  /** [{ kw, volume, kd, intent, cluster }] */
  keywords: jsonb("keywords").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// NOTE — journal vivant client/projet (cf. E2)
// ─────────────────────────────────────────────────────────────────────────────

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  /** Une note peut être attachée à un projet OU à un client (cross-projet). */
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  authorConsultantId: uuid("author_consultant_id").references(() => consultants.id),
  tag: text("tag"), // "call" | "decision" | "constraint" | "next_meeting"
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// REPORT — rapport mensuel white-label (cf. C1)
// ─────────────────────────────────────────────────────────────────────────────

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  periodMonth: integer("period_month").notNull(), // 1..12
  periodYear: integer("period_year").notNull(),
  status: reportStatusEnum("status").default("draft").notNull(),
  contentMarkdown: text("content_markdown"),
  pdfUrl: text("pdf_url"),
  shareToken: text("share_token").unique(),
  generatedAt: timestamp("generated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN TEMPLATE — bibliothèque réutilisable d'actions (cf. D2)
// ─────────────────────────────────────────────────────────────────────────────

export const patternTemplates = pgTable("pattern_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  authorConsultantId: uuid("author_consultant_id").references(() => consultants.id),
  title: text("title").notNull(),
  description: text("description"),
  category: actionCategoryEnum("category"),
  /** [{ order, label, detail }] */
  steps: jsonb("steps"),
  usageCount: integer("usage_count").default(0).notNull(),
  /** { avgPositionDelta, avgTrafficGrowthPct } */
  avgImpact: jsonb("avg_impact"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS (typed query helpers)
// ─────────────────────────────────────────────────────────────────────────────

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  consultants: many(consultants),
  clients: many(clients),
  projects: many(projects),
}));

export const consultantsRelations = relations(consultants, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [consultants.workspaceId],
    references: [workspaces.id],
  }),
  ownedClients: many(clients),
  ownedActions: many(actionCards),
  notesAuthored: many(notes),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  ownerConsultant: one(consultants, {
    fields: [clients.ownerConsultantId],
    references: [consultants.id],
  }),
  projects: many(projects),
  notes: many(notes),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  actionCards: many(actionCards),
  briefs: many(briefs),
  audits: many(audits),
  keywordStudies: many(keywordStudies),
  notes: many(notes),
  reports: many(reports),
}));

export const actionCardsRelations = relations(actionCards, ({ one, many }) => ({
  project: one(projects, {
    fields: [actionCards.projectId],
    references: [projects.id],
  }),
  owner: one(consultants, {
    fields: [actionCards.ownerConsultantId],
    references: [consultants.id],
  }),
  impactSnapshots: many(impactSnapshots),
  comments: many(actionComments),
}));

export const impactSnapshotsRelations = relations(impactSnapshots, ({ one }) => ({
  actionCard: one(actionCards, {
    fields: [impactSnapshots.actionCardId],
    references: [actionCards.id],
  }),
}));

export const actionCommentsRelations = relations(actionComments, ({ one }) => ({
  actionCard: one(actionCards, {
    fields: [actionComments.actionCardId],
    references: [actionCards.id],
  }),
  author: one(consultants, {
    fields: [actionComments.authorConsultantId],
    references: [consultants.id],
  }),
}));

export const keywordStudiesRelations = relations(keywordStudies, ({ one }) => ({
  project: one(projects, {
    fields: [keywordStudies.projectId],
    references: [projects.id],
  }),
}));

export const auditsRelations = relations(audits, ({ one, many }) => ({
  project: one(projects, { fields: [audits.projectId], references: [projects.id] }),
  issues: many(auditIssues),
}));

export const auditIssuesRelations = relations(auditIssues, ({ one }) => ({
  audit: one(audits, { fields: [auditIssues.auditId], references: [audits.id] }),
}));

export const briefsRelations = relations(briefs, ({ one }) => ({
  project: one(projects, { fields: [briefs.projectId], references: [projects.id] }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  project: one(projects, { fields: [notes.projectId], references: [projects.id] }),
  client: one(clients, { fields: [notes.clientId], references: [clients.id] }),
  author: one(consultants, {
    fields: [notes.authorConsultantId],
    references: [consultants.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  project: one(projects, { fields: [reports.projectId], references: [projects.id] }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// TYPES INFERRED (à importer partout dans l'app)
// ─────────────────────────────────────────────────────────────────────────────

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export type Consultant = typeof consultants.$inferSelect;
export type NewConsultant = typeof consultants.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type ActionCard = typeof actionCards.$inferSelect;
export type NewActionCard = typeof actionCards.$inferInsert;

export type ImpactSnapshot = typeof impactSnapshots.$inferSelect;
export type NewImpactSnapshot = typeof impactSnapshots.$inferInsert;

export type ActionComment = typeof actionComments.$inferSelect;

export type Audit = typeof audits.$inferSelect;
export type AuditIssue = typeof auditIssues.$inferSelect;

export type Brief = typeof briefs.$inferSelect;
export type NewBrief = typeof briefs.$inferInsert;

export type KeywordStudy = typeof keywordStudies.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type PatternTemplate = typeof patternTemplates.$inferSelect;

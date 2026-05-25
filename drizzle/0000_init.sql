CREATE TYPE "public"."action_category" AS ENUM('technique', 'contenu', 'netlinking', 'geo', 'autre');--> statement-breakpoint
CREATE TYPE "public"."action_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."action_recurrence" AS ENUM('none', 'weekly', 'monthly', 'quarterly');--> statement-breakpoint
CREATE TYPE "public"."action_status" AS ENUM('todo', 'in_progress', 'blocked_client', 'done', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."audit_severity" AS ENUM('critical', 'warning', 'info');--> statement-breakpoint
CREATE TYPE "public"."brief_status" AS ENUM('draft', 'ready', 'assigned', 'submitted', 'approved', 'published');--> statement-breakpoint
CREATE TYPE "public"."consultant_role" AS ENUM('owner', 'admin', 'consultant', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('actif', 'archive');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('draft', 'published', 'shared');--> statement-breakpoint
CREATE TABLE "action_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "action_category",
	"priority" "action_priority" DEFAULT 'medium' NOT NULL,
	"status" "action_status" DEFAULT 'todo' NOT NULL,
	"owner_consultant_id" uuid,
	"deadline" timestamp with time zone,
	"evidence_url" text,
	"evidence_screenshot_url" text,
	"client_narrative" text,
	"time_spent_minutes" integer,
	"recurrence" "action_recurrence" DEFAULT 'none' NOT NULL,
	"recurrence_parent_id" uuid,
	"source_audit_issue_id" uuid,
	"source_template_id" uuid,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "action_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_card_id" uuid NOT NULL,
	"author_consultant_id" uuid,
	"author_client" boolean DEFAULT false NOT NULL,
	"author_email" text,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" uuid NOT NULL,
	"severity" "audit_severity" NOT NULL,
	"category" text,
	"title" text NOT NULL,
	"description" text,
	"affected_urls" jsonb,
	"recommendation" text,
	"resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text NOT NULL,
	"summary" jsonb
);
--> statement-breakpoint
CREATE TABLE "briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"target_keyword" text,
	"status" "brief_status" DEFAULT 'draft' NOT NULL,
	"content_markdown" text,
	"ngrams" jsonb,
	"internal_links" jsonb,
	"share_token" text,
	"assigned_writer_email" text,
	"submitted_url" text,
	"published_url" text,
	"deadline" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "briefs_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"industry" text,
	"monthly_fee_cents" integer,
	"contract_start" timestamp with time zone,
	"contract_end" timestamp with time zone,
	"next_meeting" timestamp with time zone,
	"owner_consultant_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text,
	"email" text NOT NULL,
	"role" "consultant_role" DEFAULT 'consultant' NOT NULL,
	"seniority" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consultants_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "impact_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action_card_id" uuid NOT NULL,
	"offset_days" integer NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metrics" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keyword_studies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"keywords" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid,
	"client_id" uuid,
	"author_consultant_id" uuid,
	"tag" text,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pattern_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"author_consultant_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"category" "action_category",
	"steps" jsonb,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"avg_impact" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"status" "project_status" DEFAULT 'actif' NOT NULL,
	"gsc_property_id" text,
	"ga4_property_id" text,
	"ahrefs_project_id" text,
	"score_technique" integer,
	"score_contenu" integer,
	"score_netlinking" integer,
	"client_share_enabled" boolean DEFAULT false NOT NULL,
	"client_share_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_client_share_token_unique" UNIQUE("client_share_token")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"period_month" integer NOT NULL,
	"period_year" integer NOT NULL,
	"status" "report_status" DEFAULT 'draft' NOT NULL,
	"content_markdown" text,
	"pdf_url" text,
	"share_token" text,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"industry" text,
	"team_size" text,
	"logo_url" text,
	"accent_color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspaces_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "action_cards" ADD CONSTRAINT "action_cards_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_cards" ADD CONSTRAINT "action_cards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_cards" ADD CONSTRAINT "action_cards_owner_consultant_id_consultants_id_fk" FOREIGN KEY ("owner_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_comments" ADD CONSTRAINT "action_comments_action_card_id_action_cards_id_fk" FOREIGN KEY ("action_card_id") REFERENCES "public"."action_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_comments" ADD CONSTRAINT "action_comments_author_consultant_id_consultants_id_fk" FOREIGN KEY ("author_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_issues" ADD CONSTRAINT "audit_issues_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "briefs" ADD CONSTRAINT "briefs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_owner_consultant_id_consultants_id_fk" FOREIGN KEY ("owner_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_snapshots" ADD CONSTRAINT "impact_snapshots_action_card_id_action_cards_id_fk" FOREIGN KEY ("action_card_id") REFERENCES "public"."action_cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_studies" ADD CONSTRAINT "keyword_studies_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keyword_studies" ADD CONSTRAINT "keyword_studies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_consultant_id_consultants_id_fk" FOREIGN KEY ("author_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_templates" ADD CONSTRAINT "pattern_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_templates" ADD CONSTRAINT "pattern_templates_author_consultant_id_consultants_id_fk" FOREIGN KEY ("author_consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
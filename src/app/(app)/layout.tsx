import { AppShell } from "@/components/AppShell";
import { getProjectsClassic } from "@/db/queries/projects";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await getProjectsClassic();
  return <AppShell projects={projects}>{children}</AppShell>;
}

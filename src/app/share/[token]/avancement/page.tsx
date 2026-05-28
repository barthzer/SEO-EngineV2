import { notFound } from "next/navigation";
import { getSharedProject } from "@/data/sharedProjects";
import { AvancementClient } from "@/components/share/AvancementClient";

export default async function ClientAvancementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = getSharedProject(token);
  if (!project) notFound();

  return <AvancementClient project={project} />;
}

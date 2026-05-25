/**
 * Seed dev — populate la DB locale avec un workspace de démo + projets de l'ancienne data mockée.
 *
 * Usage : `npm run db:seed`
 * Prérequis : `npm run db:push` exécuté + .env.local rempli.
 */

// .env.local chargé via `--env-file` dans le npm script.
import { db } from "./client";
import {
  workspaces,
  consultants,
  clients,
  projects,
} from "./schema";

async function main() {
  console.log("🌱 Seeding…");

  // 1. Workspace de démo
  const [demoWorkspace] = await db
    .insert(workspaces)
    .values({
      name: "AWI Demo Agency",
      slug: "awi-demo",
      industry: "Digital Marketing",
      teamSize: "2-10",
      accentColor: "#6366F1",
    })
    .returning();

  console.log(`✓ Workspace "${demoWorkspace.name}" créé.`);

  // 2. Consultant fictif (sans auth — uniquement pour les seeds dev)
  //    En prod, le Consultant est créé par un trigger sur auth.users.
  const [demoConsultant] = await db
    .insert(consultants)
    .values({
      workspaceId: demoWorkspace.id,
      authUserId: "00000000-0000-0000-0000-000000000001",
      firstName: "Demo",
      lastName: "Consultant",
      email: "demo@awi.com",
      role: "owner",
      seniority: "senior",
    })
    .returning();

  console.log(`✓ Consultant "${demoConsultant.firstName}" créé.`);

  // 3. Clients + projets (depuis l'ancienne data mockée)
  const mockProjects = [
    { domain: "leboncoin.fr", tech: 84, contenu: 72, netlink: 88, status: "actif" as const },
    { domain: "doctolib.fr", tech: 61, contenu: 58, netlink: 65, status: "actif" as const },
    { domain: "backmarket.com", tech: 73, contenu: 70, netlink: 79, status: "actif" as const },
    { domain: "sephora.fr", tech: 91, contenu: 88, netlink: 94, status: "actif" as const },
    { domain: "fnac.com", tech: 78, contenu: 75, netlink: 82, status: "actif" as const },
    { domain: "decathlon.fr", tech: 87, contenu: 90, netlink: 84, status: "actif" as const },
    { domain: "lafourchette.com", tech: 66, contenu: 60, netlink: 70, status: "actif" as const },
    { domain: "boulanger.com", tech: 71, contenu: 68, netlink: 75, status: "actif" as const },
    { domain: "veepee.fr", tech: 58, contenu: 55, netlink: 62, status: "actif" as const },
    { domain: "blablacar.fr", tech: 79, contenu: 81, netlink: 76, status: "actif" as const },
    { domain: "mano-mano.fr", tech: 69, contenu: 65, netlink: 73, status: "archive" as const },
    { domain: "cdiscount.com", tech: 82, contenu: 78, netlink: 86, status: "archive" as const },
  ];

  for (const mp of mockProjects) {
    const clientName = mp.domain.split(".")[0].replace(/-/g, " ");
    const [client] = await db
      .insert(clients)
      .values({
        workspaceId: demoWorkspace.id,
        name: clientName.charAt(0).toUpperCase() + clientName.slice(1),
        industry: "E-commerce",
        ownerConsultantId: demoConsultant.id,
        monthlyFeeCents: 250000, // 2500€ / mois
      })
      .returning();

    await db.insert(projects).values({
      workspaceId: demoWorkspace.id,
      clientId: client.id,
      domain: mp.domain,
      status: mp.status,
      scoreTechnique: mp.tech,
      scoreContenu: mp.contenu,
      scoreNetlinking: mp.netlink,
    });
  }

  console.log(`✓ ${mockProjects.length} projets créés.`);
  console.log("\n✅ Seed terminé.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

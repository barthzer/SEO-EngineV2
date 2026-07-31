import { redirect } from "next/navigation";

/**
 * /parametres → redirige vers les paramètres du compte.
 * Les 3 périmètres sont désormais séparés :
 *   - /parametres/compte      (utilisateur)
 *   - /parametres/workspace   (agence, partagé par l'équipe)
 *   - /analyse/[domain]/parametres (un projet)
 */
export default function ParametresIndex() {
  redirect("/parametres/compte");
}

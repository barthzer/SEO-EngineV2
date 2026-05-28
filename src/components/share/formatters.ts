/**
 * Formatters purs pour les vues client — sans "use client" pour pouvoir être
 * appelés depuis des Server Components.
 */

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

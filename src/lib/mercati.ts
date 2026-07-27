/**
 * Etichette leggibili dei mercati. L'ambito è parte del significato: "UNDER 2.5"
 * della partita e "UNDER 2.5" della squadra ospite sono mercati diversi —
 * senza il prefisso la lista dei pronostici è ambigua (difetto emerso al collaudo).
 */

/** Etichetta completa di un mercato: prefisso d'ambito + tipo + selezione + linea. */
export function etichettaMercato(
  ambito: string | undefined,
  tipoMercato: string | undefined,
  selezione: string | undefined,
  linea: number | null | undefined,
): string {
  const prefisso =
    ambito === "SQUADRA_CASA" ? "Casa · " : ambito === "SQUADRA_TRASFERTA" ? "Ospite · " : "";
  const base = `${tipoMercato ?? ""} ${selezione ?? ""}`.trim();
  return `${prefisso}${base}${linea != null ? ` ${linea}` : ""}`;
}

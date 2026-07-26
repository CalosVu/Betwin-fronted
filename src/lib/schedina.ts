/**
 * Logica del carrello schedina, pura e testabile.
 *
 * La quota è FACOLTATIVA e inserita a mano dall'utente dal proprio bookmaker
 * (le quote correnti non sono a sistema — pivot 2026-07-25): la quota composta
 * si calcola solo se tutte le selezioni ce l'hanno.
 */

/** Selezione nel carrello, con le etichette già risolte per la UI. */
export interface VoceCarrello {
  partitaId: number;
  mercatoId: number;
  partita: string;
  kickoff: string;
  mercato: string;
  probabilita: number;
  confidenza: string;
  /** Quota decimale inserita dall'utente; stringa vuota = non inserita. */
  quota: string;
}

/** Quota composta della multipla: prodotto delle quote; null se una manca o non è valida. */
export function quotaComposta(voci: VoceCarrello[]): number | null {
  if (voci.length === 0) return null;
  let prodotto = 1;
  for (const voce of voci) {
    const quota = Number(voce.quota);
    if (!voce.quota || Number.isNaN(quota) || quota <= 1) return null;
    prodotto *= quota;
  }
  return prodotto;
}

/**
 * Probabilità composta indicativa: prodotto delle probabilità dei leg. Valida solo
 * fra partite DIVERSE (indipendenza); per leg sulla stessa partita il prodotto
 * ignora la correlazione (piano §6.3.2) — vedi {@link stessaPartita}.
 */
export function probabilitaComposta(voci: VoceCarrello[]): number {
  return voci.reduce((prodotto, voce) => prodotto * voce.probabilita, 1);
}

/**
 * True se il carrello contiene più leg della stessa partita: in quel caso la
 * probabilità composta come prodotto è SBAGLIATA (le gambe sono correlate,
 * §6.3.2) e la UI deve avvisare.
 */
export function stessaPartita(voci: VoceCarrello[]): boolean {
  return new Set(voci.map((voce) => voce.partitaId)).size < voci.length;
}

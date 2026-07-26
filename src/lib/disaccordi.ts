/**
 * Disaccordo modello ↔ AI (piano §7.1): "il disaccordo è il segnale più prezioso".
 * Confronta l'orientamento qualitativo dell'analisi AI con la selezione più
 * probabile del modello sullo stesso mercato.
 */

/** Previsione del modello come esposta dal dettaglio partita. */
export interface PrevisioneModello {
  tipoMercato: string;
  selezione: string;
  linea: number | null;
  probabilita: number;
}

/** Voce di orientamento dell'analisi AI (PROTOCOLLO §5). */
export interface OrientamentoAi {
  mercato: string;
  lean: string;
  fiducia: string;
}

/** Un disaccordo rilevato su un mercato. */
export interface Disaccordo {
  mercato: string;
  leanAi: string;
  sceltaModello: string;
}

/**
 * Trova i mercati in cui l'AI si discosta dalla selezione più probabile del modello.
 * Mercati confrontabili: 1X2, GG_NG e OVER_UNDER con linea nel nome AI
 * (es. "OVER_UNDER_2.5" — schema del protocollo §5).
 */
export function trovaDisaccordi(
  previsioni: PrevisioneModello[],
  orientamento: OrientamentoAi[],
): Disaccordo[] {
  const disaccordi: Disaccordo[] = [];
  for (const voce of orientamento) {
    const candidate = previsioniDelMercato(previsioni, voce.mercato);
    if (candidate.length === 0) continue;
    const migliore = candidate.reduce((a, b) => (b.probabilita > a.probabilita ? b : a));
    if (migliore.selezione !== voce.lean) {
      disaccordi.push({
        mercato: voce.mercato,
        leanAi: voce.lean,
        sceltaModello: migliore.selezione,
      });
    }
  }
  return disaccordi;
}

/** Le previsioni del modello che corrispondono al nome mercato dell'AI. */
function previsioniDelMercato(
  previsioni: PrevisioneModello[],
  mercatoAi: string,
): PrevisioneModello[] {
  // "OVER_UNDER_2.5" → tipo OVER_UNDER con linea 2.5
  const conLinea = mercatoAi.match(/^([A-Z_]+?)_(\d+(?:\.\d+)?)$/);
  if (conLinea) {
    const [, tipo, linea] = conLinea;
    return previsioni.filter(
      (previsione) =>
        previsione.tipoMercato === tipo && previsione.linea === Number(linea),
    );
  }
  return previsioni.filter((previsione) => previsione.tipoMercato === mercatoAi);
}

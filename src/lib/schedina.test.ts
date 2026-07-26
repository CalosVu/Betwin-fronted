import { describe, expect, it } from "vitest";
import { probabilitaComposta, quotaComposta, stessaPartita } from "./schedina";
import type { VoceCarrello } from "./schedina";

/** Fabbrica di una voce di carrello per i test. */
function voce(partitaId: number, quota: string, probabilita = 0.5): VoceCarrello {
  return {
    partitaId,
    mercatoId: partitaId * 10,
    partita: "A – B",
    kickoff: "2026-08-23T18:45:00Z",
    mercato: "1X2 1",
    probabilita,
    confidenza: "ALTO",
    quota,
  };
}

describe("quotaComposta", () => {
  it("è il prodotto delle quote quando ci sono tutte", () => {
    expect(quotaComposta([voce(1, "2.00"), voce(2, "1.50")])).toBeCloseTo(3.0, 10);
  });

  it("è null se una quota manca o non è valida (la quota è facoltativa)", () => {
    expect(quotaComposta([voce(1, "2.00"), voce(2, "")])).toBeNull();
    expect(quotaComposta([voce(1, "2.00"), voce(2, "abc")])).toBeNull();
    expect(quotaComposta([voce(1, "0.9")])).toBeNull(); // quota ≤ 1: non ha senso
    expect(quotaComposta([])).toBeNull();
  });
});

describe("probabilitaComposta", () => {
  it("è il prodotto delle probabilità dei leg", () => {
    expect(probabilitaComposta([voce(1, "", 0.8), voce(2, "", 0.5)])).toBeCloseTo(0.4, 10);
  });
});

describe("stessaPartita", () => {
  it("rileva più leg sulla stessa partita (correlazione, §6.3.2)", () => {
    expect(stessaPartita([voce(1, ""), voce(1, "")])).toBe(true);
    expect(stessaPartita([voce(1, ""), voce(2, "")])).toBe(false);
  });
});

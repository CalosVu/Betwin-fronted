import { describe, expect, it } from "vitest";
import { trovaDisaccordi } from "./disaccordi";

const previsioni = [
  { tipoMercato: "1X2", selezione: "1", linea: null, probabilita: 0.48 },
  { tipoMercato: "1X2", selezione: "X", linea: null, probabilita: 0.28 },
  { tipoMercato: "1X2", selezione: "2", linea: null, probabilita: 0.24 },
  { tipoMercato: "OVER_UNDER", selezione: "OVER", linea: 2.5, probabilita: 0.55 },
  { tipoMercato: "OVER_UNDER", selezione: "UNDER", linea: 2.5, probabilita: 0.45 },
];

describe("trovaDisaccordi (§7.1: il disaccordo è il segnale più prezioso)", () => {
  it("segnala quando l'AI si discosta dalla selezione più probabile del modello", () => {
    const disaccordi = trovaDisaccordi(previsioni, [
      { mercato: "1X2", lean: "2", fiducia: "media" },
    ]);
    expect(disaccordi).toEqual([{ mercato: "1X2", leanAi: "2", sceltaModello: "1" }]);
  });

  it("non segnala nulla quando modello e AI concordano", () => {
    expect(
      trovaDisaccordi(previsioni, [{ mercato: "1X2", lean: "1", fiducia: "alta" }]),
    ).toEqual([]);
  });

  it("aggancia i mercati con linea nel nome AI (OVER_UNDER_2.5)", () => {
    const disaccordi = trovaDisaccordi(previsioni, [
      { mercato: "OVER_UNDER_2.5", lean: "UNDER", fiducia: "bassa" },
    ]);
    expect(disaccordi).toEqual([
      { mercato: "OVER_UNDER_2.5", leanAi: "UNDER", sceltaModello: "OVER" },
    ]);
  });

  it("ignora i mercati che il modello non copre", () => {
    expect(
      trovaDisaccordi(previsioni, [{ mercato: "CARTELLINI", lean: "OVER", fiducia: "bassa" }]),
    ).toEqual([]);
  });
});

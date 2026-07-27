import { describe, expect, it } from "vitest";
import { etichettaMercato } from "./mercati";

describe("etichettaMercato (l'ambito è parte del significato)", () => {
  it("distingue partita, casa e ospite sullo stesso mercato", () => {
    expect(etichettaMercato("PARTITA", "OVER_UNDER", "UNDER", 2.5)).toBe("OVER_UNDER UNDER 2.5");
    expect(etichettaMercato("SQUADRA_CASA", "OVER_UNDER", "UNDER", 2.5)).toBe(
      "Casa · OVER_UNDER UNDER 2.5",
    );
    expect(etichettaMercato("SQUADRA_TRASFERTA", "OVER_UNDER", "UNDER", 2.5)).toBe(
      "Ospite · OVER_UNDER UNDER 2.5",
    );
  });

  it("omette la linea quando non pertinente", () => {
    expect(etichettaMercato("PARTITA", "1X2", "1", null)).toBe("1X2 1");
    expect(etichettaMercato(undefined, "GG_NG", "GG", undefined)).toBe("GG_NG GG");
  });
});

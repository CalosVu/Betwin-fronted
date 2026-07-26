import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CarrelloProvider, useCarrello } from "./carrello";
import type { ReactNode } from "react";

const involucro = ({ children }: { children: ReactNode }) => (
  <CarrelloProvider>{children}</CarrelloProvider>
);

const selezione = {
  partitaId: 1,
  mercatoId: 10,
  partita: "Inter – Milan",
  kickoff: "2026-08-23T18:45:00Z",
  mercato: "1X2 1",
  probabilita: 0.48,
  confidenza: "ALTO",
};

describe("carrello schedina", () => {
  it("aggiunge una selezione una sola volta (niente doppioni)", () => {
    const { result } = renderHook(() => useCarrello(), { wrapper: involucro });
    act(() => {
      result.current.aggiungi(selezione);
      result.current.aggiungi(selezione);
    });
    expect(result.current.voci).toHaveLength(1);
  });

  it("imposta la quota e rimuove la selezione giusta", () => {
    const { result } = renderHook(() => useCarrello(), { wrapper: involucro });
    act(() => {
      result.current.aggiungi(selezione);
      result.current.aggiungi({ ...selezione, mercatoId: 11, mercato: "GG_NG GG" });
      result.current.impostaQuota(1, 10, "1.95");
    });
    expect(result.current.voci.find((v) => v.mercatoId === 10)?.quota).toBe("1.95");

    act(() => result.current.rimuovi(1, 10));
    expect(result.current.voci).toHaveLength(1);
    expect(result.current.voci[0].mercatoId).toBe(11);
  });
});

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { VoceCarrello } from "@/lib/schedina";

/** Stato e azioni del carrello schedina, condivisi fra le pagine. */
interface StatoCarrello {
  voci: VoceCarrello[];
  aggiungi: (voce: Omit<VoceCarrello, "quota">) => void;
  rimuovi: (partitaId: number, mercatoId: number) => void;
  impostaQuota: (partitaId: number, mercatoId: number, quota: string) => void;
  svuota: () => void;
}

const ContestoCarrello = createContext<StatoCarrello | null>(null);

/**
 * Provider del carrello: vive in memoria per la sessione — la schedina confermata
 * finisce a DB, il carrello non ha bisogno di sopravvivere al refresh.
 */
export function CarrelloProvider({ children }: { children: ReactNode }) {
  const [voci, setVoci] = useState<VoceCarrello[]>([]);

  const aggiungi = useCallback((voce: Omit<VoceCarrello, "quota">) => {
    setVoci((correnti) => {
      const esiste = correnti.some(
        (v) => v.partitaId === voce.partitaId && v.mercatoId === voce.mercatoId,
      );
      return esiste ? correnti : [...correnti, { ...voce, quota: "" }];
    });
  }, []);

  const rimuovi = useCallback((partitaId: number, mercatoId: number) => {
    setVoci((correnti) =>
      correnti.filter((v) => !(v.partitaId === partitaId && v.mercatoId === mercatoId)),
    );
  }, []);

  const impostaQuota = useCallback((partitaId: number, mercatoId: number, quota: string) => {
    setVoci((correnti) =>
      correnti.map((v) =>
        v.partitaId === partitaId && v.mercatoId === mercatoId ? { ...v, quota } : v,
      ),
    );
  }, []);

  const svuota = useCallback(() => setVoci([]), []);

  const valore = useMemo(
    () => ({ voci, aggiungi, rimuovi, impostaQuota, svuota }),
    [voci, aggiungi, rimuovi, impostaQuota, svuota],
  );
  return <ContestoCarrello.Provider value={valore}>{children}</ContestoCarrello.Provider>;
}

/** Hook del carrello; fallisce chiaro se usato fuori dal provider. */
export function useCarrello(): StatoCarrello {
  const contesto = useContext(ContestoCarrello);
  if (!contesto) throw new Error("useCarrello va usato dentro CarrelloProvider");
  return contesto;
}

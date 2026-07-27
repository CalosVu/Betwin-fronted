import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { trovaDisaccordi } from "@/lib/disaccordi";
import { etichettaMercato } from "@/lib/mercati";
import type { OrientamentoAi } from "@/lib/disaccordi";
import { useCarrello } from "../carrello";

/** Struttura minima dell'analisi AI che la pagina mostra (schema PROTOCOLLO §5). */
interface AnalisiAi {
  orientamento?: OrientamentoAi[];
  dati_mancanti?: string[];
  note_incertezza?: string;
  passi?: {
    infortuni?: { giocatore?: string; stato?: string; peso?: string; fonte?: string }[];
    squalifiche?: { giocatore?: string; stato?: string; fonte?: string }[];
  };
}

/**
 * Dettaglio partita: i DUE analisti affiancati (piano §7.1) — i numeri del modello
 * a sinistra, l'analisi AI a destra, i disaccordi evidenziati (il segnale più prezioso).
 */
export default function DettaglioPartita() {
  const { id } = useParams();
  const { aggiungi } = useCarrello();

  const { data, isLoading } = useQuery({
    queryKey: ["partita", id],
    queryFn: async () => {
      const risposta = await api.GET("/api/partite/{id}", {
        params: { path: { id: Number(id) } },
      });
      return risposta.data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Caricamento…</p>;
  if (!data?.partita) return <p>Partita non trovata.</p>;

  const partita = data.partita;
  const previsioni = data.previsioni ?? [];
  const analisi = data.analisiAi as AnalisiAi | null | undefined;
  const disaccordi = analisi?.orientamento
    ? trovaDisaccordi(
        previsioni.map((previsione) => ({
          tipoMercato: previsione.tipoMercato!,
          selezione: previsione.selezione!,
          linea: previsione.linea ?? null,
          probabilita: previsione.probabilita!,
        })),
        analisi.orientamento,
      )
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {partita.casa} – {partita.trasferta}
        <span className="text-muted-foreground ml-3 text-base font-normal">
          {partita.lega}, {new Date(partita.kickoff!).toLocaleString("it-IT")}
        </span>
      </h1>

      {disaccordi.length > 0 && (
        <Card className="border-amber-500">
          <CardContent className="pt-4">
            ⚠️ <strong>Disaccordo modello ↔ AI</strong> (segnale da guardare, §7.1):{" "}
            {disaccordi
              .map((d) => `${d.mercato}: modello → ${d.sceltaModello}, AI → ${d.leanAi}`)
              .join(" · ")}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Modello statistico</CardTitle>
          </CardHeader>
          <CardContent>
            {previsioni.length === 0 && (
              <p className="text-muted-foreground">Nessuna previsione per questa partita.</p>
            )}
            {previsioni.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mercato</TableHead>
                    <TableHead className="text-right">Prob.</TableHead>
                    <TableHead>Conf.</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previsioni.map((previsione) => (
                    <TableRow key={previsione.mercatoId}>
                      <TableCell>
                        {etichettaMercato(previsione.ambito, previsione.tipoMercato,
                          previsione.selezione, previsione.linea)}
                        {previsione.datiMancanti && (
                          <span className="text-muted-foreground block text-xs">
                            {previsione.datiMancanti}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {(previsione.probabilita! * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={previsione.confidenza === "ALTO" ? "default" : "outline"}>
                          {previsione.confidenza}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            aggiungi({
                              partitaId: partita.id!,
                              mercatoId: previsione.mercatoId!,
                              partita: `${partita.casa} – ${partita.trasferta}`,
                              kickoff: partita.kickoff!,
                              mercato: etichettaMercato(previsione.ambito,
                                previsione.tipoMercato, previsione.selezione, previsione.linea),
                              probabilita: previsione.probabilita!,
                              confidenza: previsione.confidenza!,
                            })
                          }
                        >
                          + Schedina
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analisi AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!analisi && (
              <p className="text-muted-foreground">
                Nessuna analisi AI per questa partita (batch delle 07:00 o motore non attivo:
                il sistema funziona anche col solo modello, §7.6).
              </p>
            )}
            {analisi?.orientamento?.map((voce) => (
              <div key={voce.mercato} className="flex items-center gap-2">
                <Badge>{voce.mercato}</Badge>
                <span className="font-medium">{voce.lean}</span>
                <span className="text-muted-foreground text-sm">fiducia {voce.fiducia}</span>
              </div>
            ))}
            {analisi?.passi?.infortuni?.filter((infortunio) => infortunio.stato !== "NESSUNO_VERIFICATO")
              .map((infortunio) => (
                <p key={infortunio.giocatore} className="text-sm">
                  🩹 {infortunio.giocatore} — {infortunio.stato} ({infortunio.peso})
                  <span className="text-muted-foreground"> · fonte: {infortunio.fonte}</span>
                </p>
              ))}
            {analisi?.passi?.squalifiche?.map((squalifica) => (
              <p key={squalifica.giocatore} className="text-sm">
                🟥 {squalifica.giocatore} — {squalifica.stato}
                <span className="text-muted-foreground"> · fonte: {squalifica.fonte}</span>
              </p>
            ))}
            {analisi?.note_incertezza && (
              <p className="text-muted-foreground text-sm">Incertezza: {analisi.note_incertezza}</p>
            )}
            {analisi?.dati_mancanti && analisi.dati_mancanti.length > 0 && (
              <p className="text-muted-foreground text-sm">
                Dati mancanti: {analisi.dati_mancanti.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

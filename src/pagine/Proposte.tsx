import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { probabilitaComposta, quotaComposta, stessaPartita } from "@/lib/schedina";
import { useCarrello } from "../carrello";

/**
 * Proposte (pannello + regole, §6.4) e composizione della schedina (§2 punti 3–4):
 * l'utente seleziona, inserisce le quote del proprio bookmaker se vuole il
 * tracking, e conferma — lo snapshot viene congelato dal backend (§5.4).
 */
export default function Proposte() {
  const { voci, aggiungi, rimuovi, impostaQuota, svuota } = useCarrello();
  const clientQuery = useQueryClient();
  const [stake, setStake] = useState("");
  const [note, setNote] = useState("");
  const [errore, setErrore] = useState("");

  const { data: proposte, isLoading } = useQuery({
    queryKey: ["proposte"],
    queryFn: async () => (await api.GET("/api/proposte")).data ?? [],
  });

  const conferma = useMutation({
    mutationFn: async () => {
      const risposta = await api.POST("/api/schedine", {
        body: {
          selezioni: voci.map((voce) => ({
            partitaId: voce.partitaId,
            mercatoId: voce.mercatoId,
            quotaGiocata: voce.quota ? Number(voce.quota) : undefined,
          })),
          stake: stake ? Number(stake) : undefined,
          note: note || undefined,
        },
      });
      if (risposta.error) throw new Error((risposta.error as { errore?: string }).errore);
      return risposta.data;
    },
    onSuccess: () => {
      svuota();
      setStake("");
      setNote("");
      setErrore("");
      void clientQuery.invalidateQueries({ queryKey: ["schedine"] });
    },
    onError: (e: Error) => setErrore(e.message || "Errore nella conferma"),
  });

  const composta = quotaComposta(voci);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="mb-3 text-2xl font-bold">Proposte</h1>
        {isLoading && <p className="text-muted-foreground">Caricamento…</p>}
        {proposte && proposte.length === 0 && (
          <p className="text-muted-foreground">
            Nessuna proposta: niente partite in programma nella finestra, o nulla supera
            pannello e regole (un giorno senza valore è un esito legittimo, §2.1).
          </p>
        )}
        {proposte && proposte.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priorità</TableHead>
                <TableHead>Partita</TableHead>
                <TableHead>Mercato</TableHead>
                <TableHead className="text-right">Prob.</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposte.map((proposta) => (
                <TableRow key={`${proposta.partitaId}-${proposta.mercatoId}`}>
                  <TableCell>
                    <Badge variant={proposta.priorita === "ALTA" ? "default" : "secondary"}>
                      {proposta.priorita}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {proposta.casa} – {proposta.trasferta}
                    <span className="text-muted-foreground block text-xs">
                      {proposta.lega}, {new Date(proposta.kickoff!).toLocaleString("it-IT")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {proposta.tipoMercato} {proposta.selezione}
                    {proposta.linea != null && ` ${proposta.linea}`}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {(proposta.probabilita! * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{proposta.origine}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline"
                      onClick={() =>
                        aggiungi({
                          partitaId: proposta.partitaId!,
                          mercatoId: proposta.mercatoId!,
                          partita: `${proposta.casa} – ${proposta.trasferta}`,
                          kickoff: proposta.kickoff!,
                          mercato: `${proposta.tipoMercato} ${proposta.selezione}${
                            proposta.linea != null ? ` ${proposta.linea}` : ""
                          }`,
                          probabilita: proposta.probabilita!,
                          confidenza: proposta.confidenza!,
                        })
                      }>
                      +
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Schedina ({voci.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {voci.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Aggiungi selezioni dalle proposte o dal dettaglio partita.
            </p>
          )}
          {voci.map((voce) => (
            <div key={`${voce.partitaId}-${voce.mercatoId}`} className="border-b pb-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{voce.partita}</span>
                <Button size="sm" variant="ghost"
                        onClick={() => rimuovi(voce.partitaId, voce.mercatoId)}>
                  ✕
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>
                  {voce.mercato}
                  <span className="text-muted-foreground ml-2 font-mono">
                    {(voce.probabilita * 100).toFixed(1)}%
                  </span>
                </span>
                <Input
                  className="w-20"
                  placeholder="quota"
                  inputMode="decimal"
                  value={voce.quota}
                  onChange={(e) => impostaQuota(voce.partitaId, voce.mercatoId, e.target.value)}
                />
              </div>
            </div>
          ))}
          {voci.length > 0 && (
            <>
              {stessaPartita(voci) && (
                <p className="text-sm text-amber-600">
                  ⚠️ Più selezioni sulla stessa partita: le gambe sono correlate, la
                  probabilità composta come prodotto non è affidabile (§6.3.2).
                </p>
              )}
              <p className="text-sm">
                Probabilità composta (indicativa):{" "}
                <span className="font-mono">{(probabilitaComposta(voci) * 100).toFixed(1)}%</span>
              </p>
              <p className="text-sm">
                Quota composta:{" "}
                <span className="font-mono">
                  {composta ? composta.toFixed(2) : "— (inserisci tutte le quote)"}
                </span>
              </p>
              <div className="flex gap-2">
                <Input placeholder="stake (opz.)" className="w-28" inputMode="decimal"
                       value={stake} onChange={(e) => setStake(e.target.value)} />
                <Input placeholder="note" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              {errore && <p className="text-destructive text-sm">{errore}</p>}
              <Button className="w-full" disabled={conferma.isPending}
                      onClick={() => conferma.mutate()}>
                Conferma schedina
              </Button>
              <p className="text-muted-foreground text-xs">
                Alla conferma probabilità e criteri vengono congelati (§5.4). La quota è
                solo informativa: il criterio del sistema è la statistica, non il valore
                contro il bookmaker.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/** Colore del badge per l'esito di un leg. */
function varianteEsito(esito?: string): "default" | "secondary" | "destructive" | "outline" {
  if (esito === "PERSA") return "destructive";
  if (esito === "VINTA" || esito === "MEZZA_VINCITA") return "default";
  if (esito === "IN_ATTESA") return "outline";
  return "secondary";
}

/**
 * Storico schedine con esiti per-leg (§2 punto 6): una multipla persa dice QUALI
 * leg l'hanno persa. I numeri mostrati sono lo snapshot congelato alla conferma.
 */
export default function Schedine() {
  const clientQuery = useQueryClient();
  const { data: schedine, isLoading } = useQuery({
    queryKey: ["schedine"],
    queryFn: async () => (await api.GET("/api/schedine")).data ?? [],
  });

  const regola = useMutation({
    mutationFn: async () => (await api.POST("/api/schedine/regola")).data,
    onSuccess: () => void clientQuery.invalidateQueries({ queryKey: ["schedine"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedine</h1>
        <Button variant="outline" disabled={regola.isPending} onClick={() => regola.mutate()}>
          Regola adesso
        </Button>
      </div>
      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      {schedine && schedine.length === 0 && (
        <p className="text-muted-foreground">Nessuna schedina confermata finora.</p>
      )}
      {schedine?.map((schedina) => (
        <Card key={schedina.id}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">
              #{schedina.id} · {new Date(schedina.creataIl!).toLocaleString("it-IT")}
              {schedina.stake != null && (
                <span className="text-muted-foreground ml-2 font-normal">
                  stake {schedina.stake}
                </span>
              )}
              {schedina.note && (
                <span className="text-muted-foreground ml-2 font-normal">· {schedina.note}</span>
              )}
            </CardTitle>
            <Badge variant={varianteEsito(schedina.stato === "APERTA" ? "IN_ATTESA" : schedina.stato)}>
              {schedina.stato}
            </Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partita</TableHead>
                  <TableHead>Mercato</TableHead>
                  <TableHead className="text-right">Prob. alla giocata</TableHead>
                  <TableHead className="text-right">Quota</TableHead>
                  <TableHead>Esito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedina.selezioni?.map((selezione, indice) => (
                  <TableRow key={indice}>
                    <TableCell>
                      {selezione.partita}
                      <span className="text-muted-foreground block text-xs">
                        {new Date(selezione.kickoff!).toLocaleString("it-IT")}
                      </span>
                    </TableCell>
                    <TableCell>{selezione.mercato}</TableCell>
                    <TableCell className="text-right font-mono">
                      {(Number(selezione.probabilitaModello) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {selezione.quotaGiocata ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={varianteEsito(selezione.esito)}>{selezione.esito}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

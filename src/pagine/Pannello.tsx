import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/**
 * Pannello di controllo (§6.4): soglie base (probabilità e confidenza minime,
 * leghe e mercati abilitati, finestra) e gestione delle regole dichiarative.
 * Le regole vengono validate dal backend: una definizione malformata torna 400
 * con l'elenco dei problemi, mostrato qui.
 */
export default function Pannello() {
  const clientQuery = useQueryClient();
  const [probabilitaMinima, setProbabilitaMinima] = useState("");
  const [confidenzaMinima, setConfidenzaMinima] = useState("MEDIO");
  const [finestraGiorni, setFinestraGiorni] = useState("");
  const [legheAttive, setLegheAttive] = useState("");
  const [nomeRegola, setNomeRegola] = useState("");
  const [definizioneRegola, setDefinizioneRegola] = useState(esempioRegola);
  const [messaggio, setMessaggio] = useState("");

  const { data: pannello } = useQuery({
    queryKey: ["pannello"],
    queryFn: async () => (await api.GET("/api/pannello")).data,
  });

  useEffect(() => {
    if (pannello) {
      setProbabilitaMinima(String(pannello.probabilitaMinima ?? ""));
      setConfidenzaMinima(pannello.confidenzaMinima ?? "MEDIO");
      setFinestraGiorni(String(pannello.finestraGiorni ?? ""));
      setLegheAttive((pannello.legheAttive ?? []).join(", "));
    }
  }, [pannello]);

  const { data: regole } = useQuery({
    queryKey: ["regole"],
    queryFn: async () => (await api.GET("/api/regole")).data ?? [],
  });

  const salvaPannello = useMutation({
    mutationFn: async () => {
      const leghe = legheAttive.trim()
        ? legheAttive.split(",").map((nome) => nome.trim()).filter(Boolean)
        : null;
      const risposta = await api.PUT("/api/pannello", {
        body: {
          legheAttive: leghe,
          mercatiAbilitati: pannello?.mercatiAbilitati ?? null,
          probabilitaMinima: Number(probabilitaMinima),
          confidenzaMinima,
          finestraGiorni: Number(finestraGiorni),
        },
      });
      if (risposta.error) throw new Error((risposta.error as { errore?: string }).errore);
    },
    onSuccess: () => {
      setMessaggio("Pannello salvato.");
      void clientQuery.invalidateQueries({ queryKey: ["pannello"] });
      void clientQuery.invalidateQueries({ queryKey: ["proposte"] });
    },
    onError: (e: Error) => setMessaggio(e.message || "Errore nel salvataggio"),
  });

  const creaRegola = useMutation({
    mutationFn: async () => {
      let definizione: unknown;
      try {
        definizione = JSON.parse(definizioneRegola);
      } catch {
        throw new Error("La definizione non è JSON valido");
      }
      const risposta = await api.POST("/api/regole", {
        body: { nome: nomeRegola, attiva: true, definizione: definizione as Record<string, never> },
      });
      if (risposta.error) throw new Error((risposta.error as { errore?: string }).errore);
    },
    onSuccess: () => {
      setMessaggio("Regola creata.");
      setNomeRegola("");
      void clientQuery.invalidateQueries({ queryKey: ["regole"] });
      void clientQuery.invalidateQueries({ queryKey: ["proposte"] });
    },
    onError: (e: Error) => setMessaggio(e.message || "Errore nella creazione"),
  });

  const eliminaRegola = useMutation({
    mutationFn: async (id: number) =>
      api.DELETE("/api/regole/{id}", { params: { path: { id } } }),
    onSuccess: () => void clientQuery.invalidateQueries({ queryKey: ["regole"] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pannello di controllo</h1>
      <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Soglie del pannello</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm">
            Probabilità minima (0–1)
            <Input inputMode="decimal" value={probabilitaMinima}
                   onChange={(e) => setProbabilitaMinima(e.target.value)} />
          </label>
          <label className="block text-sm">
            Confidenza minima
            <select
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
              value={confidenzaMinima}
              onChange={(e) => setConfidenzaMinima(e.target.value)}
            >
              <option value="ALTO">ALTO</option>
              <option value="MEDIO">MEDIO</option>
              <option value="BASSO">BASSO</option>
            </select>
          </label>
          <label className="block text-sm">
            Finestra (giorni)
            <Input inputMode="numeric" value={finestraGiorni}
                   onChange={(e) => setFinestraGiorni(e.target.value)} />
          </label>
          <label className="block text-sm">
            Leghe attive (separate da virgola; vuoto = tutte)
            <Input value={legheAttive} onChange={(e) => setLegheAttive(e.target.value)}
                   placeholder="Serie A, Premier League" />
          </label>
          <Button onClick={() => salvaPannello.mutate()} disabled={salvaPannello.isPending}>
            Salva pannello
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regole dichiarative</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {regole?.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Nessuna regola: valgono le sole soglie del pannello. Una regola che copre un
              mercato ne diventa il filtro (§6.4).
            </p>
          )}
          {regole?.map((regola) => (
            <div key={regola.id} className="flex items-center justify-between border-b pb-2">
              <span>
                {regola.nome}{" "}
                <Badge variant={regola.attiva ? "default" : "outline"}>
                  {regola.attiva ? "attiva" : "spenta"}
                </Badge>
              </span>
              <Button size="sm" variant="ghost" onClick={() => eliminaRegola.mutate(regola.id!)}>
                Elimina
              </Button>
            </div>
          ))}
          <label className="block text-sm">
            Nome nuova regola
            <Input value={nomeRegola} onChange={(e) => setNomeRegola(e.target.value)} />
          </label>
          <label className="block text-sm">
            Definizione (JSON, schema §6.4)
            <textarea
              className="border-input bg-background min-h-40 w-full rounded-md border p-2 font-mono text-xs"
              value={definizioneRegola}
              onChange={(e) => setDefinizioneRegola(e.target.value)}
            />
          </label>
          <Button onClick={() => creaRegola.mutate()} disabled={creaRegola.isPending}>
            Crea regola
          </Button>
          {messaggio && <p className="text-sm">{messaggio}</p>}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

/** Esempio precompilato: la regola "GG solido" del piano §6.4. */
const esempioRegola = `{
  "mercato": { "tipo": "GG_NG", "selezione": "GG" },
  "condizioni": [
    { "campo": "casa.gg_ultime_10", "operatore": ">=", "valore": 7 },
    { "campo": "trasferta.gg_ultime_10", "operatore": ">=", "valore": 7 },
    { "campo": "modello.probabilita", "operatore": ">=", "valore": 0.65 }
  ],
  "azione": { "suggerisci": true, "priorita": "ALTA" }
}`;

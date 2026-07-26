import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/** Data odierna in formato ISO (per i default dei filtri). */
function oggiIso(giorniInPiu = 0): string {
  const data = new Date();
  data.setDate(data.getDate() + giorniInPiu);
  return data.toISOString().slice(0, 10);
}

/** Dashboard: partite del periodo con filtri per lega e intervallo di date (piano, Fase 10). */
export default function Dashboard() {
  const [da, setDa] = useState(oggiIso());
  const [a, setA] = useState(oggiIso(14));
  const [lega, setLega] = useState<string>("");

  const { data: partite, isLoading } = useQuery({
    queryKey: ["partite", da, a, lega],
    queryFn: async () => {
      const risposta = await api.GET("/api/partite", {
        params: { query: { da, a, ...(lega ? { lega } : {}) } },
      });
      return risposta.data ?? [];
    },
  });

  const leghe = useMemo(
    () => [...new Set((partite ?? []).map((partita) => partita.lega))].sort(),
    [partite],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          Dal
          <Input type="date" value={da} onChange={(e) => setDa(e.target.value)} />
        </label>
        <label className="text-sm">
          Al
          <Input type="date" value={a} onChange={(e) => setA(e.target.value)} />
        </label>
        <label className="text-sm">
          Lega
          <select
            className="border-input bg-background flex h-9 w-44 rounded-md border px-3 text-sm"
            value={lega}
            onChange={(e) => setLega(e.target.value)}
          >
            <option value="">Tutte</option>
            {leghe.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      {partite && partite.length === 0 && (
        <p className="text-muted-foreground">
          Nessuna partita nel periodo. Le partite future arrivano con l'import dei calendari
          (token football-data.org, vedi collaudo).
        </p>
      )}
      {partite && partite.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Lega</TableHead>
              <TableHead>Partita</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Analisi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partite.map((partita) => (
              <TableRow key={partita.id}>
                <TableCell>{new Date(partita.kickoff!).toLocaleString("it-IT")}</TableCell>
                <TableCell>{partita.lega}</TableCell>
                <TableCell>
                  <Link className="font-medium underline-offset-2 hover:underline"
                        to={`/partite/${partita.id}`}>
                    {partita.casa} – {partita.trasferta}
                  </Link>
                  {partita.stato === "CONCLUSA" && (
                    <span className="text-muted-foreground ml-2">
                      {partita.golCasa}-{partita.golTrasferta}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{partita.stato}</Badge>
                </TableCell>
                <TableCell className="space-x-1">
                  {partita.haPrevisioni && <Badge variant="secondary">Numeri</Badge>}
                  {partita.haAnalisiAi && <Badge variant="secondary">AI</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

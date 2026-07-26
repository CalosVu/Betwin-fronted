import { Link, NavLink, Route, Routes } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useCarrello } from "./carrello";
import Dashboard from "./pagine/Dashboard";
import DettaglioPartita from "./pagine/DettaglioPartita";
import Proposte from "./pagine/Proposte";
import Schedine from "./pagine/Schedine";
import Pannello from "./pagine/Pannello";

/** Layout dell'app: barra di navigazione + rotte delle cinque viste. */
export default function App() {
  const { voci } = useCarrello();
  const classeLink = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <span className="mr-4 text-lg font-bold">betwin</span>
          <NavLink to="/" className={classeLink} end>
            Partite
          </NavLink>
          <NavLink to="/proposte" className={classeLink}>
            Proposte
            {voci.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {voci.length}
              </Badge>
            )}
          </NavLink>
          <NavLink to="/schedine" className={classeLink}>
            Schedine
          </NavLink>
          <NavLink to="/pannello" className={classeLink}>
            Pannello
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/partite/:id" element={<DettaglioPartita />} />
          <Route path="/proposte" element={<Proposte />} />
          <Route path="/schedine" element={<Schedine />} />
          <Route path="/pannello" element={<Pannello />} />
          <Route
            path="*"
            element={
              <p>
                Pagina inesistente. <Link to="/">Torna alle partite</Link>.
              </p>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

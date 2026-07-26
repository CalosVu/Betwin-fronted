import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CarrelloProvider } from "./carrello";
import "./index.css";

// Radice dell'app: TanStack Query per i dati (piano, Fase 10), router, carrello.
const clientQuery = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={clientQuery}>
      <BrowserRouter>
        <CarrelloProvider>
          <App />
        </CarrelloProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);

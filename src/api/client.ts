import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Client API tipato end-to-end: i tipi vengono generati dal contratto OpenAPI del
 * backend (`npm run genera-tipi`) — una modifica al contratto che rompe il FE
 * fallisce in build, non a runtime (piano, Fase 9).
 */
export const api = createClient<paths>({ baseUrl: "/" });

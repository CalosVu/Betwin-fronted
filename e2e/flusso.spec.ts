import { expect, test } from "@playwright/test";

/**
 * E2E del flusso principale (piano §11.4 Frontend): navigazione fra le viste.
 * Il flusso completo con dati (filtro leghe → selezione → conferma schedina →
 * storico) si esercita al collaudo, quando il DB avrà partite future.
 */
test("le viste principali rispondono", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toContainText("Partite");

  await page.getByRole("link", { name: "Proposte" }).click();
  await expect(page.getByRole("heading", { name: "Proposte" })).toBeVisible();

  await page.getByRole("link", { name: "Schedine" }).click();
  await expect(page.getByRole("heading", { name: "Schedine" })).toBeVisible();

  await page.getByRole("link", { name: "Pannello" }).click();
  await expect(page.getByRole("heading", { name: "Pannello di controllo" })).toBeVisible();
});

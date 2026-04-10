import { expect, test } from "@playwright/test";

test("landing page redirects user to dashboard entrypoint", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Gestion des congés" })).toBeVisible();
  await page.getByRole("link", { name: "Accéder au dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Tableau de bord RH" })).toBeVisible();
});

test("dashboard navigation reaches calendar view", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Calendrier" }).click();
  await expect(page).toHaveURL(/\/calendar$/);
  await expect(page.getByRole("heading", { name: "Calendrier des absences" })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("the Compton detector moves around the arc from its own tab stop", async ({ page }) => {
  await page.goto("/?ea&screens=1");
  const detector = page.getByRole("application", { name: "Compton detector", exact: true });
  const angle = page.getByRole("slider", { name: "Scattering angle", exact: true });
  await detector.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(detector).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(angle).toHaveAttribute("aria-valuenow", "65");
  await page.keyboard.press("Shift+ArrowLeft");
  await expect(angle).toHaveAttribute("aria-valuenow", "64");
  await expect(detector).toBeFocused();
});

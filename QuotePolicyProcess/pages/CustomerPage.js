
import { log } from "../utils/logger.js";
import { expect } from "@playwright/test";

export class CustomerPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) { this.page = page; }

  async openRecommendPolicy(policyNumber) {
    log.step("Customer: My work → search → Recommend Policy ...");
    const myWork = this.page.getByRole("link", { name: "My work" });
    await expect(myWork).toBeVisible();
    await myWork.click();

    await this.page.waitForSelector("text=My work", { state: "visible" });

    const searchBtn = this.page.getByTestId(":list-toolbar:search-button");
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    const searchInput = this.page.getByTestId(":list-toolbar:search-input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill(policyNumber);
    await searchInput.press("Enter");

    const recommend = this.page.getByText("Recommend Policy").first();
    await expect(recommend).toBeVisible();
    await recommend.click();
  }

  async selectAnyAvailablePlan(planOptions = [
    "HealthSecureBasic",
    "MediCoreClassic",
    "MediPlusChronicCare",
    "StudySecurePremium",
    "StudentHealthEU",
  ]) {
    for (const plan of planOptions) {
      const fullName = `${plan} Select`;
      log.info(`🔍 Trying plan: '${fullName}'`);
      try {
        const cell = this.page.getByRole("cell", { name: fullName });
        await cell.waitFor({ state: "attached", timeout: 1500 });
        const clickableDiv = cell.locator("div").nth(1);
        await clickableDiv.waitFor({ state: "visible", timeout: 1500 });
        await clickableDiv.click();
        log.ok(`Clicked on: ${plan}`);
        return plan;
      } catch (e) {
        log.warn(`Could not find/click: ${plan} — ${e?.message || e}`);
      }
    }
    throw new Error("No listed plan options found to click.");
  }

  async submitAndAssertPendingUW() {
    const submit = this.page.getByRole("button", { name: "Submit" });
    await expect(submit).toBeVisible();
    await Promise.all([
      this.page.waitForLoadState("networkidle").catch(() => {}),
      submit.click(),
    ]);
    const status = this.page.getByText("Pending-Underwriting").first();
    await expect(status).toBeVisible();
    await expect(status).toContainText("Pending-Underwriting");
    log.ok("Policy is with Status: Pending-Underwriting.");
  }

  async logoutCustomer(displayName) {
    const banner = this.page.getByRole("banner");
     //await this.page.pause();
    // Escape displayName for use in RegExp
    const safe = displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const menuByName = banner.getByRole("button", { name: new RegExp(`^${safe}$`, "i") });

    // Try by display name; if not clickable, fall back to last button in banner
    const opened = await menuByName.click({ timeout: 1500 }).then(() => true).catch(async () => {
      const buttons = banner.getByRole("button");
      const count = await buttons.count();
      if (count > 0) {
        await buttons.nth(count - 1).click();
        return true;
      }
      return false;
    });

    if (!opened) throw new Error("Could not open user menu to log out.");

    await this.page.getByRole("menuitem", { name: /log\s*(off|out)/i }).click();
    log.ok("Logged out successfully as Customer.");
  }

}

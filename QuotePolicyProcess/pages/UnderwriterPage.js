
import { log } from "../utils/logger.js";
import { expect } from "@playwright/test";

export class UnderwriterPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) { this.page = page; }

  async openCase(policyNumber) {
    await this.page.getByTestId(":input:control").fill(policyNumber);
    await this.page.getByTestId(":input:control").press("Enter");
    await this.page.goto(`https://bluerosetech01.pegalabs.io/prweb/app/onboarding-ins/onboardings/${policyNumber}`);
  }

  async completeInitialAssignmentWith(text) {
    await this.page.getByTestId(":assignment:action").click();
    const frame = await (await this.page.locator('iframe[title="Rich Text Area"]').elementHandle()).contentFrame();
    await frame.locator("#tinymce").fill(text);
    await this.page.getByRole("button", { name: "Submit" }).click();
  }

  async selectAdditionalCoverageAndSubmit() {
    await this.page.getByRole("row", { name: "Preventive Screenings" }).getByTestId(":form-field:label").locator("div").click();
    await this.page.getByRole("row", { name: "Vision Care Vision Care USD" }).getByTestId(":form-field:label").locator("div").click();
    await this.page.getByRole("row", { name: "Dental Insurance Dental" }).getByTestId(":form-field:label").locator("div").click();

    const plan1 = (await this.page.getByRole("row", { name: "Preventive Screenings" }).textContent()).trim();
    const plan2 = (await this.page.getByRole("row", { name: "Vision Care Vision Care USD" }).textContent()).trim();
    const plan3 = (await this.page.getByRole("row", { name: "Dental Insurance Dental" }).textContent()).trim();
    log.info(`Selected Additional Plans are: ${plan1}, ${plan2}, ${plan3}.`);

    await this.page.getByRole("button", { name: "Submit" }).click();
  }

  async approveAndFinish() {
    await this.page.getByTestId(":assignment:action").click();
    const frame = await (await this.page.locator('iframe[title="Rich Text Area"]').elementHandle()).contentFrame();
    await frame.locator("#tinymce").fill("Final approval recorded — policy issued.");
    await this.page.getByRole("button", { name: "Submit" }).click();
  }

  async assertResolvedCompleted() {
    await expect(this.page.getByText("Resolved-Completed").first()).toBeVisible();
    log.ok("Policy is with Status: Resolved-Completed");
  }

  async logoutUnderwriter() {
    await this.page.getByRole("banner").getByRole("button", { name: /Underwriter Test/i }).click();
    await this.page.getByText("Log off").click();
    log.ok("Logged out successfully as Underwriter.");
  }
}

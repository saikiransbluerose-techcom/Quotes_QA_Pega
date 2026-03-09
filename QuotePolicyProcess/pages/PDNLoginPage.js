
import { log } from "../utils/logger.js";
import { PDN } from "../config/roles.js";

export class PDNLoginPage {
  constructor(page) { this.page = page; }
  async goto() { log.step("Navigating to PDN..."); await this.page.goto(PDN.url); }
  async login() {
    log.step("Logging into PDN account...");
    await this.page.locator("//input[@type='text']").fill(PDN.username);
    await this.page.locator("//input[@class='button button-primary']").click();
    await this.page.locator("//input[@type='password']").fill(PDN.password);
    await this.page.locator("//input[@class='button button-primary' and @value='Verify']").click();
    log.ok("PDN login submitted.");
  }
  async openAppPopup() {
    log.step("Opening app from PDN...");
    const openLink = this.page.getByRole('link', { name: /^Open$/ }).first();
    const popupPromise = this.page.waitForEvent('popup').catch(() => null);
    await openLink.click();
    const popup = await popupPromise;
    return popup || this.page;
  }
}

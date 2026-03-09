import { expect } from "@playwright/test";

export class AppLoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) { this.page = page; }

  async asUser(username, password) {
    console.log("Login to Application as:", username);

    // 1) Scope to the login form/container to avoid matching other password fields
    const form = this.page
      .locator('form:has(#txtPassword), #loginPanel, .login-form, form') // fallbacks
      .first();
    await expect(form).toBeVisible({ timeout: 15000 });

    await form.getByPlaceholder("User name").fill(username);

    // Use exact placeholder; still scoped to the form
    await form.getByPlaceholder("Password", { exact: true }).fill(password);

    // 2) Click and wait for navigation/network to settle (race-free)
    const submit = form.getByRole("button", { name: /log in/i });
    await expect(submit).toBeVisible();

    await Promise.all([
      this.page.waitForLoadState("networkidle").catch(() => {}),
      submit.click(),

      
    ]);


     // ✅ DO NOT return until Accept is dealt with and the home heading is visible
    await this._arriveAfterAdLogin();

    // // Your privacy-dialog handling (kept as-is, just scoped to page)
    // const btn = this.page.getByTestId(":privacy-dialog:accept");
    // const present = await btn
    //   .waitFor({ state: "attached", timeout: 2000 })
    //   .then(() => true, () => false);

    // if (present) {
    //   await btn.click({ timeout: 3000 });
    //   await this.page.waitForTimeout(500);
    //   await btn.waitFor({ state: "detached", timeout: 3000 }).catch(() => {});
    // }
  }



  async _arriveAfterAdLogin() {
    const p = this.page;
    const heading = p.getByRole('heading', { name: 'Onboarding Insurance' });

    // Accept button can have slightly different selectors across builds
    const byTestIdA = p.getByTestId('privacy-dialog:accept');
    const byTestIdB = p.getByTestId(':privacy-dialog:accept');   // keep if your DOM really uses leading ':'
    const byRole    = p.getByRole('button', { name: /^(accept|i agree|agree and continue|ok)$/i });

    const deadline = Date.now() + 30_000;

    while (Date.now() < deadline) {
      if (await heading.isVisible().catch(() => false)) break;

      const btn =
        (await byTestIdA.isVisible().catch(() => false)) ? byTestIdA :
        (await byTestIdB.isVisible().catch(() => false)) ? byTestIdB :
        (await byRole.isVisible().catch(() => false))    ? byRole :
        null;

      if (btn) {
        await Promise.all([
          p.waitForLoadState('domcontentloaded').catch(() => {}),
          btn.click(),
        ]);
        // loop back and re-check heading
        continue;
      }

      // small poll to let the UI attach either the dialog or the heading
      await p.waitForTimeout(250);
    }
  }
}

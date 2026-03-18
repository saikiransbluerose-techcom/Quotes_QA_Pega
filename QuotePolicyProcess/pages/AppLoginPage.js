import { expect } from "@playwright/test";

export class AppLoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) { this.page = page; }

  async asUser(username, password) {
    console.log("Login to Application as:", username);

    const form = this.page
      .locator('form:has(#txtPassword), #loginPanel, .login-form, form')
      .first();
    await expect(form).toBeVisible({ timeout: 15000 });

    await form.getByPlaceholder("User name").fill(username);
    await form.getByPlaceholder("Password", { exact: true }).fill(password);

    const submit = form.getByRole("button", { name: /log in/i });
    await expect(submit).toBeVisible();

    await Promise.all([
      this.page.waitForLoadState("networkidle").catch(() => {}),
      submit.click(),
    ]);

    // ✅ Wait for Accept dialog and home heading
    await this._arriveAfterAdLogin();
  }

  async _arriveAfterAdLogin() {
    const p = this.page;
    const heading = p.getByRole('heading', { name: 'Onboarding Insurance' });

    const deadline = Date.now() + 30_000;

    while (Date.now() < deadline) {
      // ✅ If heading is visible, we are done
      if (await heading.isVisible().catch(() => false)) {
        console.log("✅ Home heading visible. Login complete.");
        break;
      }

      // ✅ Try all possible Accept button selectors
      const acceptSelectors = [
        p.getByTestId('privacy-dialog:accept'),
        p.getByTestId(':privacy-dialog:accept'),
        p.getByRole('button', { name: /^(accept|i agree|agree and continue|ok)$/i }),
      ];

      let clicked = false;
      for (const btn of acceptSelectors) {
        try {
          // ✅ Check if visible first
          const isVisible = await btn.isVisible().catch(() => false);
          if (!isVisible) continue;

          // ✅ Wait for it to be stable before clicking
          await btn.waitFor({ state: 'visible', timeout: 3000 });

          // ✅ Use force: true to avoid detached DOM issues in Pega
          await btn.click({ force: true, timeout: 5000 });

          console.log("✅ Accepted privacy dialog.");

          // ✅ Wait for the dialog to disappear before looping again
          await btn.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});

          // ✅ Let the page settle after clicking
          await p.waitForLoadState('domcontentloaded').catch(() => {});
          await p.waitForTimeout(500);

          clicked = true;
          break; // stop trying other selectors once one worked
        } catch {
          // button disappeared mid-click, just continue the loop
          continue;
        }
      }

      if (!clicked) {
        // Nothing to click yet, poll again
        await p.waitForTimeout(250);
      }
    }

    // ✅ Final assertion — fail clearly if heading never appeared
    await expect(heading).toBeVisible({ timeout: 10000 });
  }
}

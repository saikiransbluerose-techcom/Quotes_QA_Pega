
// @ts-check
import 'dotenv/config';

import { test } from "@playwright/test";
import { PDNLoginPage } from "../pages/PDNLoginPage.js";
import { AppLoginPage } from "../pages/AppLoginPage.js";
import { CSRPage } from "../pages/CSRPage.js";
import { CustomerPage } from "../pages/CustomerPage.js";
import { UnderwriterPage } from "../pages/UnderwriterPage.js";
import { APP_USERS } from "../config/roles.js";
import { log } from "../utils/logger.js";


test("Quote & Policy E2E (Role-POM, JS)", async ({ browser }) => {
  test.setTimeout(600_000);
  /** @type {import('@playwright/test').BrowserContext} */

  const context = await browser.newContext();
  const pdnPage = await context.newPage();

  // -- PDN bootstrap: open PDN, authenticate, and launch the app in a new page
  const pdn = new PDNLoginPage(pdnPage);
  await pdn.goto();
  await pdn.login();
  const appPage = await pdn.openAppPopup();

  const auth = new AppLoginPage(appPage);

  // --- CSR flow ---
  await auth.asUser(APP_USERS.csr.username, APP_USERS.csr.password);
  const csr = new CSRPage(appPage);
  await csr.createQuote();
  await csr.fillApplicantBasics();
  await csr.fillAddress();
  await csr.submitApplicantAndAssert();
  await csr.decidePremiumApprove();
  await csr.fillSelfPartnerChildMedicalBillingAndSubmit();
  //await csr.assertQuoteResolvedCompleted();
  //const { quoteNumber, policyNumber } = await csr.captureNumbers();
  //await csr.openInsuranceIdCard(quoteNumber);
  await csr.logoutCSR();

});

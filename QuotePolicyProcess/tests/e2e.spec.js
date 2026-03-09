
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

   // PDN login and open app
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
  await csr.assertQuoteResolvedCompleted();
  const { quoteNumber, policyNumber } = await csr.captureNumbers();
  await csr.openInsuranceIdCard(quoteNumber);
  await csr.logoutCSR();


  // read the number from DATA_KEY (e.g. "Data Variant 2" or "2")
const variantNum = (process.env.DATA_KEY || '').match(/\d+/)?.[0] || '1';

/** Return env var with variant suffix when variant > 1
 *  @param {string} base
 */
const envForVariant = (base) =>
  process.env[variantNum === '1' ? base : `${base}${variantNum}`] ?? process.env[base];

// use variant-aware creds, fall back to APP_USERS if missing
const customerUsername = envForVariant('CUST_USER') ?? APP_USERS.customer.username;
const customerPassword = envForVariant('CUST_PASS') ?? APP_USERS.customer.password;


  // --- Customer flow ---
  await auth.asUser(customerUsername, customerPassword);
  const customer = new CustomerPage(appPage);
  await customer.openRecommendPolicy(policyNumber);
  await customer.selectAnyAvailablePlan();
  await customer.submitAndAssertPendingUW();

  // Build the display name from the dataset you used (works across variants)
const displayName = `${csr.data.applicant.firstName} ${csr.data.applicant.lastName}`;
await customer.logoutCustomer(displayName);


  // --- Underwriter flow ---
  await auth.asUser(APP_USERS.underwriter.username, APP_USERS.underwriter.password);
  const uw = new UnderwriterPage(appPage);
  await uw.openCase(policyNumber);
  await uw.completeInitialAssignmentWith("Approved — policy ready to issue.");
  await uw.selectAdditionalCoverageAndSubmit();
  await uw.approveAndFinish();
  await uw.assertResolvedCompleted();
  await uw.logoutUnderwriter();

  log.ok("E2E Role-based POM flow completed.");
});

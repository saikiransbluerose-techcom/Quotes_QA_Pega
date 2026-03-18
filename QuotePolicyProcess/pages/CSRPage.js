// pages/CSRPage.js
import { log } from "../utils/logger.js";
import { expect } from "@playwright/test";
import { getCSRData } from "../utils/dataProvider.js";

export class CSRPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    // Use env to pick the JSON dataset: "Data Variant 1/2/3"
    const key = process.env.DATA_KEY || "Data Variant 1";
    this.data = getCSRData(key);
    log.info(`CSR data variant: ${key}`);
  }

  async createQuote() {
    await expect(this.page.getByRole('heading', { name: 'Onboarding Insurance' })).
      toBeVisible({ timeout: 10_000 });
    await this.page.getByLabel("Create").click();
    //await this.page.getByText("Quote").first().click();
    await this.page.getByTestId(":menu-item:").getByText("Quote").click();

    log.ok("Quote creation started.");
  }

  async fillApplicantBasics() {
    const p = this.page;
    const a = this.data.applicant;
    log.step("CSR: Filling applicant basics (name, DOB, employment, contact)...");
    await p.getByTestId("First Name:input:control").fill(a.firstName);
    await p.getByTestId("Last Name:input:control").fill(a.lastName);
    await p.getByTestId(":date-input:control-month").fill(a.dob.month);
    await p.getByTestId(":date-input:control-day").fill(a.dob.day);
    await p.getByTestId(":date-input:control-year").fill(a.dob.year);
    await p.getByTestId("Employment Status:select:control").selectOption(a.employmentStatus);
    await p.getByTestId("Income:currency-input:control").fill(a.income);
    for (let i = 0; i < (a.dependentsPlusClicks ?? 0); i++) {
      await p.getByTestId("Dependents:number-input:plus").click();
    }
    await p.getByTestId("Coverage Type:select:control").selectOption(a.coverageType);
    await p.getByTestId("Phone Number:phone-input:control").fill(a.phone);
    await p.getByTestId("Email Address:input:control").fill(a.email);

    // Verify first name and Email address
    const expectedFirstName = a.firstName;
    await expect(p.getByTestId("First Name:input:control")).toHaveValue(expectedFirstName);
    console.log('\nAssertion Successful. First Name is correct. Expected Name:', a.firstName, '. Actual First Name:',
      (await p.getByTestId("First Name:input:control").inputValue()));

    const expectedEmailId = a.email;
    await expect(p.getByTestId("Email Address:input:control")).toHaveValue(expectedEmailId);
    console.log('\nAssertion Successful. Email ID is correct. Expected Email:', expectedEmailId, '. Actual Email:',
      (await p.getByTestId("Email Address:input:control").inputValue()));
  }

  async fillAddress() {
    const p = this.page;
    await p.getByRole('button', { name: 'Fill form with AI' }).click();
  }

  async submitApplicantAndAssert() {
    const p = this.page;
    // await p.pause();
    const a = this.data.applicant;
    await Promise.all([
      p.waitForLoadState("networkidle").catch(() => { }),
      p.getByRole("button", { name: "Submit" }).click(),
    ]);

    await p.getByRole("tab", { name: "Basic" }).click();
  }

  async decidePremiumApprove() {
    const p = this.page;
    log.step("CSR: Selecting Premium, providing suggestion, and Approving...");
    await p.getByRole("cell", { name: "Premium Select" }).locator("div").nth(1).click();
    const notes = p.getByTestId("202012100438090469459:text-area:control");
    await notes.click();
    await notes.fill("Suggested Premium");
    await p.locator('xpath=//button[@name="Approve"]').click();
  }

  async fillSelfPartnerChildMedicalBillingAndSubmit() {
    const p = this.page;
    const { self, partner, child1, medical, billing } = this.data;

    // Self
    log.step("CSR: Filling Self details...");
    await p.getByRole("tabpanel", { name: "Self" }).getByTestId("Gender:select:control").selectOption(self.gender || "");
    await p.getByRole("tabpanel", { name: "Self" }).getByTestId("Blood Group:select:control").selectOption(self.bloodGroup || "");
    await p.getByTestId("Marital Status:select:control").selectOption(self.maritalStatus || "");
    await p.getByTestId("Nationality:input:control").fill(self.nationality || "");
    await p.getByRole("spinbutton", { name: "month" }).fill(self.expiry?.month || "");
    await p.getByRole("spinbutton", { name: "day" }).fill(self.expiry?.day || "");
    await p.getByRole("spinbutton", { name: "year" }).fill(self.expiry?.year || "");

    // Partner
    log.step("CSR: Filling Partner details...");
    await p.getByRole("tab", { name: "Partner" }).click();
    await p.getByRole("textbox", { name: /Name/ }).fill(partner.name || "");
    await p.getByRole("spinbutton", { name: "month" }).fill(partner.dob?.month || "");
    await p.getByRole("spinbutton", { name: "day" }).fill(partner.dob?.day || "");
    await p.getByRole("spinbutton", { name: "year" }).fill(partner.dob?.year || "");
    await p.getByRole("textbox", { name: "Age." }).fill(partner.age || "");
    await p.getByTestId("Relationship:input:control").fill(partner.relationship || "");
    await p.getByRole("tabpanel", { name: "Partner" }).getByTestId("Gender:select:control").selectOption(partner.gender || "");
    await p.getByRole("tabpanel", { name: "Partner" }).getByTestId("Blood Group:select:control").selectOption(partner.bloodGroup || "");

    // Child 1
    log.step("CSR: Filling Child details...");
    await p.getByRole("tab", { name: "Child" }).click();
    await p.getByRole("textbox", { name: /Name/ }).fill(child1.name || "");
    await p.getByRole("spinbutton", { name: "month" }).fill(child1.dob?.month || "");
    await p.getByRole("spinbutton", { name: "day" }).fill(child1.dob?.day || "");
    await p.getByRole("spinbutton", { name: "year" }).fill(child1.dob?.year || "");
    await p.getByRole("textbox", { name: "Age." }).fill(child1.age || "");
    await p.getByLabel("Child 1").getByTestId("Gender:select:control").selectOption(child1.gender || "");
    await p.getByLabel("Child 1").getByTestId("Blood Group:select:control").selectOption(child1.bloodGroup || "");

    // Medical
    log.step("CSR: Filling Medical details...");
    await p.getByRole("tab", { name: "Medical" }).click();
    await p.locator('label:has-text("Do you have any pre-existing")').locator("div").click().catch(() => { });
    await p.getByTestId("If yes, please specify:text-area:control").fill(medical.preExistingNotes || "");
    await p.getByTestId("Primary Physician Name:input:control").fill(medical.primaryPhysician || "");
    await p.getByTestId("Primary Physician’s Contact:phone-input:control").fill(medical.primaryContact || "");
    await p.locator('label:has-text("Do you receive annual health")').locator("div").click().catch(() => { });
    await p.locator('label:has-text("Do you get routine")').locator("div").click().catch(() => { });
    await p.locator('label:has-text("Have you ever visited a")').locator("div").click().catch(() => { });
    await p.getByTestId("If yes, please specify:text-area:control").fill(medical.visitedNotes || "");
    await p.locator('label:has-text("Do you have a primary eye")').locator("div").click().catch(() => { });
    await p.getByTestId("Doctor Name:input:control").fill(medical.eyeDoctor || "");
    const vision = p.getByLabel("Vision Care");
    await vision.getByTestId(":date-input:control-month").fill(medical.visionDate?.month || "");
    await vision.getByTestId(":date-input:control-day").fill(medical.visionDate?.day || "");
    await vision.getByTestId(":date-input:control-year").fill(medical.visionDate?.year || "");

    // Billing
    log.step("CSR: Filling Billing details...");
    await p.getByRole("tab", { name: "Billing" }).click();
    await p.getByTestId("Payment Method:select:control").selectOption("Cash");
    await p.getByTestId("Country:combo-box:control").click();
    await p.getByTestId("Country:combo-box:control").fill("united");
    await p.getByTestId("USA:menu-item:").getByText("United States").click();

    const expectedAddress = "12 A";
    const address1 = p.getByTestId("Address Line 1:input:control");

    // make sure the correct field is ready, then fill and assert *now*
    await expect(address1).toBeEditable();
    await address1.fill(expectedAddress);
    await expect(address1).toHaveValue(expectedAddress, { timeout: 5000 });

    console.log('\nAssertion Successful. Billing Address is correct. Expected Address:', expectedAddress, '. Actual Address:',
      await address1.inputValue());

    await p.getByTestId("City / Town:input:control").fill("Chicago");
    await p.getByTestId("State:select:control").selectOption("IL");
    await p.getByTestId("Postal Code:input:control").fill("12345");

    await this.submitAndWait();
  }

  async submitAndWait() {
    const submit = this.page.getByRole("button", { name: "Submit" });
    await expect(submit).toBeVisible();
    await Promise.all([
      this.page.waitForLoadState("networkidle").catch(() => { }),
      submit.click(),
    ]);
  }

  async assertQuoteResolvedCompleted() {
    await expect(this.page.getByText("Resolved-Completed").first()).toBeVisible();
    log.ok("Quote Case closed with Status: Resolved-Completed");
  }

//  async captureNumbers() {
  //  const p = this.page;
  //  const quoteNumber = (await p.getByTestId(":case-view:subheading").textContent()).trim();
 //   const policyNumber = (await p.getByRole("link", { name: /^O-/ }).textContent()).trim();
//    log.info(`Quote Number: ${quoteNumber}`);
 //   log.info(`Policy Number: ${policyNumber}`);
 //   return { quoteNumber, policyNumber };
//  }

  async openInsuranceIdCard(quoteNumber) {
    await this.page.getByRole("button", { name: "Attachments" }).click();
    await this.page.getByRole("button", { name: `Insurance ID Card_${quoteNumber}.pdf`, exact: true }).click();
    await this.page.getByTestId(":lightbox:close").click();
  }

  
  async logoutCSR() {
    await this.page.getByRole("banner").getByRole("button", { name: /csr test/i }).click();
    await this.page.getByText("Log off").click();
    log.ok("Logged out successfully as CSR.");
  }
  
}

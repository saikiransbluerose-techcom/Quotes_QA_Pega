
# Quote & Policy — Role-based POM (Playwright JS) with Data Variants

CSR data (Applicant, Address, Self/Partner/Child, Medical, Billing) is read from JSON:
- `data/csr-variants.json` with keys: **"Data Variant 1"**, **"Data Variant 2"**, **"Data Variant 3"**.

The test code remains the same — only `CSRPage` reads JSON internally for minimal change.

## Choose a dataset
Set env var `DATA_KEY` (defaults to "Data Variant 1"). Examples:
```powershell
$env:DATA_KEY="Data Variant 2"; npm test
```
```bash
DATA_KEY="Data Variant 3" npm test
```

## Run
```bash
npm i
npx playwright install
cp .env.example .env   # fill PDN/app creds, optionally set DATA_KEY
npm test
```

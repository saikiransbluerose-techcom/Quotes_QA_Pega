
export const PDN = {
  url: process.env.PDN_URL || "https://pegalabs.pega.com/ui/system/cddd8f50-0220-47b5-9954-62beb8c85e1b",
  username: process.env.PDN_USER || "vineeti_hemdani@bluerose-tech.com",
  password: process.env.PDN_PASS || "****"
};

export const APP_USERS = {
  csr:         { username: process.env.CSR_USER || "csr_test",             password: process.env.CSR_PASS || "brt@1234" },
  customer:    { username: process.env.CUST_USER || "johndoe@example.com", password: process.env.CUST_PASS || "brt@12345" },
  underwriter: { username: process.env.UW_USER   || "underwriter_test",    password: process.env.UW_PASS   || "pega@123456" }
};

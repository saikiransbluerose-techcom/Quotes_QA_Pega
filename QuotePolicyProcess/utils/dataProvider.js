// utils/dataProvider.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "./logger.js";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VARIANTS_PATH = path.resolve(__dirname, "..", "data", "csr-variants.json");

// "2"  -> "Data Variant 2", or pass-through if already named
function normalizeVariant(v) {
  if (!v) return "Data Variant 1";
  const s = String(v).trim();
  const m = s.match(/(\d+)/);
  return m ? `Data Variant ${m[1]}` : s;
}

export function getCSRData(variantName) {
  // also read from env if caller passes nothing
  const key = normalizeVariant(variantName ?? process.env.DATA_KEY ?? "Data Variant 1");

  const defaults = {
    applicant: {
      firstName: "John",
      lastName: "Doe",
      dob: { month: "01", day: "01", year: "1990" },
      employmentStatus: "Employed Full-Time",
      income: "$10,0000",
      dependentsPlusClicks: 2,
      coverageType: "Employer-Sponsored",
      phone: "1 (234) 567-899",
      email: "johndoe@example.com"
    },
    address: {
      country: "United States",
      line1: "12 A",
      city: "Chicago",
      state: "IL",
      postal: "12345"
    },
    self: {
      gender: "Male",
      bloodGroup: "O+",
      maritalStatus: "Married",
      nationality: "American",
      expiry: { month: "01", day: "01", year: "2026" }
    },
    partner: {
      name: "Monica",
      dob: { month: "01", day: "01", year: "1992" },
      age: "33",
      relationship: "Spouse",
      gender: "Female",
      bloodGroup: "B+"
    },
    child1: {
      name: "Nick",
      dob: { month: "01", day: "01", year: "2020" },
      age: "5",
      gender: "Male",
      bloodGroup: "O+"
    },
    medical: {
      preExistingNotes: "Allergies",
      primaryPhysician: "Dr Ebeling",
      primaryContact: "1 (234) 567-8999",
      visitedNotes: "Dr XXX",
      eyeDoctor: "Dr YYY",
      visionDate: { month: "01", day: "01", year: "2024" }
    },
    billing: {
      paymentMethod: "Cash",
      country: "United States",
      line1: "12 A",
      city: "Chicago",
      state: "IL",
      postal: "12345"
    }
  };

  try {
    const raw = fs.readFileSync(VARIANTS_PATH, "utf8");
    const json = JSON.parse(raw);
    const sets = json?.datasets || {};

    // exact match first
    if (sets[key]) return { ...defaults, ...sets[key] };

    // case-insensitive fallback
    const found = Object.keys(sets).find(k => k.trim().toLowerCase() === key.toLowerCase());
    if (found) return { ...defaults, ...sets[found] };

    log.warn(`Variant "${key}" not found in ${VARIANTS_PATH} — using defaults.`);
    return defaults;
  } catch (e) {
    log.warn(`Could not load ${VARIANTS_PATH} (${e?.message}). Using defaults.`);
    return defaults;
  }
}


export const log = {
  info: (msg) => console.log(`ℹ️ ${msg}`),
  step: (msg) => console.log(`🧭 ${msg}`),
  ok:   (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️ ${msg}`),
  error:(msg) => console.error(`❌ ${msg}`),
};

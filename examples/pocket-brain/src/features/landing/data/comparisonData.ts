export interface ComparisonRow {
  criteria: string;
  browser: string;
  cloud: string;
  advantage: "browser" | "cloud";
}

export const comparisonRows: ComparisonRow[] = [
  {
    criteria: "Privacy",
    browser: "Data stays on your device",
    cloud: "Data sent to remote servers",
    advantage: "browser",
  },
  {
    criteria: "Compliance",
    browser: "No data transfer or third-party risks",
    cloud: "Complex vendor agreements & audits",
    advantage: "browser",
  },
  {
    criteria: "Setup",
    browser: "Zero setup, just open and start chatting",
    cloud: "Accounts, API keys, billing, quotas",
    advantage: "browser",
  },
  {
    criteria: "Availability",
    browser: "Works offline, unaffected by outages",
    cloud: "Requires internet, subject to outages",
    advantage: "browser",
  },
  {
    criteria: "Model Size",
    browser: "Optimized models (device constraints)",
    cloud: "Access to very large models",
    advantage: "cloud",
  },
  {
    criteria: "Cost",
    browser: "Free to use after model download",
    cloud: "Usage‑based billing can spike",
    advantage: "browser",
  },
];

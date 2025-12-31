export interface ComparisonStyling {
  icon: string;
  background: string;
  badgeText: string;
  badgeBackground: string;
}

export function getComparisonStyling(
  type: "browser" | "cloud",
  advantage: "browser" | "cloud",
): ComparisonStyling {
  const hasAdvantage = type === advantage;
  return {
    icon: hasAdvantage ? "✅" : "❌",
    background: hasAdvantage ? "rgba(76, 175, 80, 0.06)" : "rgba(244, 67, 54, 0.06)",
    badgeText: hasAdvantage ? "Advantage" : "Trade‑offs",
    badgeBackground: hasAdvantage ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
  };
}

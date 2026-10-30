module.exports = {
  maxGrowthPercent: 5,
  measurement: "consumer-imports-gzip-v2",
  reportOnly: ["Core exports"],
  defaultCoreBudget: 10_000,
  componentBudgets: {
    CARD_BRAND_LOGOS: 19_456,
  },
  // This export already exceeded 10 kB in published 0.10.1. New exports
  // cannot use a legacy exception without a matching published measurement.
  legacyComponentBudgets: {
    CARD_BRAND_LOGOS: 19 * 1024,
  },
};

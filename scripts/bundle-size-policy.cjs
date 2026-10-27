module.exports = {
  maxGrowthPercent: 5,
  measurement: "consumer-imports-gzip-v2",
  reportOnly: ["Core exports"],
  componentBudgets: require("./core-component-budgets.json"),
  // These exports already exceeded 10 kB in published 0.10.1. New exports
  // cannot use a legacy exception without a matching published measurement.
  legacyComponentBudgets: {
    CreditCardNumber: 24 * 1024,
    CARD_BRAND_LOGOS: 19 * 1024,
  },
};

/**
 * The buyer's multi-step purchase flow. Lives outside the layout file so
 * Next.js's app-router type-checker doesn't reject the layout for having
 * non-default exports.
 */
export const PURCHASE_STEPS = [
  { id: "personal-details",  label: "Personal details",  duration: "About 3 minutes" },
  { id: "trade-in",          label: "Trade-in",          duration: "About 4 minutes" },
  { id: "finance",           label: "Finance",           duration: "About 5 minutes" },
  { id: "delivery-options",  label: "Delivery options",  duration: "About 1 minute" },
  { id: "protection",        label: "iAutoMotive protection", duration: "About 1 minute" },
  { id: "drivers-license",   label: "Driver's licence",  duration: "About 4 minutes" },
  { id: "payment-method",    label: "Payment method",    duration: "About 3 minutes" },
  { id: "review-order",      label: "Review order",      duration: "About 2 minutes" },
] as const;

export type PurchaseStepId = typeof PURCHASE_STEPS[number]["id"];

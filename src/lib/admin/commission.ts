/**
 * Sales-rep commission scheme (Schedule 1 of the Sales Manager contract).
 *
 * Commission is a flat amount per qualifying Deal, banded by the Deal Value
 * (the agreed retail sale price of the vehicle). Per the contract:
 *   • a Deal Value on the boundary between two tiers falls to the LOWER tier;
 *   • a Deal Value below £10,000 or above £250,000 earns no commission.
 *
 * Note: this is the per-Deal commission. The contract only treats commission
 * as *earned* once a Deal completes, funds clear, and the cancellation period
 * expires (clause 7.3). For open/pipeline deals this is therefore a projection.
 */

export interface CommissionTier {
  tier: number;
  /** Inclusive lower bound, in £ (pounds). */
  min: number;
  /** Inclusive upper bound, in £ (pounds). Boundary values fall to this tier. */
  max: number;
  /** Flat commission for a deal in this band, in £ (pounds). */
  commission: number;
}

export const COMMISSION_TIERS: CommissionTier[] = [
  { tier: 1, min: 10_000, max: 20_000, commission: 500 },
  { tier: 2, min: 20_000, max: 30_000, commission: 1_000 },
  { tier: 3, min: 30_000, max: 50_000, commission: 2_000 },
  { tier: 4, min: 50_000, max: 80_000, commission: 3_500 },
  { tier: 5, min: 80_000, max: 120_000, commission: 5_000 },
  { tier: 6, min: 120_000, max: 250_000, commission: 10_000 },
];

/**
 * Commission (£) for a single deal given its Deal Value in £.
 *
 * Tiers are tested low→high and the first match wins, which implements the
 * "boundary falls to the lower tier" rule (e.g. exactly £20,000 → Tier 1).
 * Values outside £10,000–£250,000 earn £0.
 */
export function commissionForDealValue(dealValueGbp: number | null | undefined): number {
  if (dealValueGbp == null || !Number.isFinite(dealValueGbp)) return 0;
  for (const t of COMMISSION_TIERS) {
    if (dealValueGbp >= t.min && dealValueGbp <= t.max) return t.commission;
  }
  return 0;
}

/** Total commission (£) across a set of deal values (in £). */
export function totalCommission(dealValuesGbp: Array<number | null | undefined>): number {
  return dealValuesGbp.reduce<number>((sum, v) => sum + commissionForDealValue(v), 0);
}

export type PunchXCommissionTier = {
  maxServiceValue: number;
  rate: number;
};

/**
 * PunchX commercial rules agreed for the current MVP/test build.
 * Commission is earned from the professional side; the citizen sees the
 * separate PunchX platform/protection fee.
 */
export const PUNCHX_COMMERCE = {
  customerPlatformFee: 10,
  lowValueCustomerFee: 10,
  lowValueCustomerFeeThreshold: 0,
  currency: 'INR',
  commissionTiers: [
    { maxServiceValue: 49, rate: 0.05 },
    { maxServiceValue: 300, rate: 0.08 },
    { maxServiceValue: 800, rate: 0.10 },
    { maxServiceValue: 1500, rate: 0.12 },
    { maxServiceValue: 3000, rate: 0.15 },
    { maxServiceValue: 5000, rate: 0.18 },
    { maxServiceValue: 10000, rate: 0.20 },
    { maxServiceValue: Number.POSITIVE_INFINITY, rate: 0.23 },
  ] as PunchXCommissionTier[],
  warranty: {
    enabled: true,
    defaultDays: 30,
    warrantyRebookingFeeCovered: 59,
  },
  paymentGateway: {
    configured: false,
    estimatedDomesticGatewayRate: 0.02,
    note: 'Planning estimate only. Replace with the signed gateway rate before production accounting.',
  },
} as const;

export function getPunchXCommissionRate(serviceValue: number): number {
  const value = Math.max(0, Number(serviceValue) || 0);
  return PUNCHX_COMMERCE.commissionTiers.find(tier => value <= tier.maxServiceValue)?.rate ?? 0.23;
}

export function calculatePunchXPricing(serviceValue: number, customerFee = PUNCHX_COMMERCE.customerPlatformFee) {
  const value = Math.max(0, Number(serviceValue) || 0);
  const rate = getPunchXCommissionRate(value);
  const commission = Math.round(value * rate * 100) / 100;
  const professionalPayout = Math.max(0, Math.round((value - commission) * 100) / 100);
  const citizenPlatformFee = Math.max(0, Number(customerFee) || 0);
  const customerTotal = Math.round((value + citizenPlatformFee) * 100) / 100;

  return {
    serviceValue: value,
    commissionRate: rate,
    platformCommission: commission,
    professionalPayout,
    customerPlatformFee: citizenPlatformFee,
    customerTotal,
    punchXGrossRevenue: Math.round((commission + citizenPlatformFee) * 100) / 100,
  };
}

export function formatINR(value: number): string {
  return `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;
}

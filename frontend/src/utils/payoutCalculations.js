// Constants for calculations
export const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee
export const GST_RATE = 18; // 18% GST
export const TDS_RATE = 10; // 10% TDS (if applicable)

export const calculatePayout = (sessions, options = {}) => {
  const {
    applyPlatformFee = true,
    applyGST = true,
    applyTDS = false,
    customDeductions = [],
    manualOverride = null
  } = options;

  // Calculate subtotal from sessions
  const subtotal = sessions.reduce((sum, session) => sum + session.calculatedAmount, 0);

  // If manual override is provided, use it as the base amount
  const baseAmount = manualOverride !== null ? manualOverride : subtotal;

  // Calculate platform fee
  const platformFee = applyPlatformFee
    ? (baseAmount * PLATFORM_FEE_PERCENTAGE) / 100
    : 0;

  // Calculate GST on platform fee
  const gstAmount = applyGST
    ? (platformFee * GST_RATE) / 100
    : 0;

  // Calculate TDS if applicable
  const tdsAmount = applyTDS
    ? (baseAmount * TDS_RATE) / 100
    : 0;

  // Calculate custom deductions
  const totalCustomDeductions = customDeductions.reduce(
    (sum, deduction) => sum + deduction.amount,
    0
  );

  // Calculate final amount
  const finalAmount = baseAmount - platformFee - gstAmount - tdsAmount - totalCustomDeductions;

  return {
    subtotal: baseAmount,
    breakdown: {
      platformFee,
      gstAmount,
      tdsAmount,
      customDeductions: totalCustomDeductions
    },
    finalAmount,
    currency: 'INR'
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const generatePayoutSummary = (payout) => {
  return {
    subtotal: formatCurrency(payout.subtotal),
    platformFee: formatCurrency(payout.breakdown.platformFee),
    gstAmount: formatCurrency(payout.breakdown.gstAmount),
    tdsAmount: formatCurrency(payout.breakdown.tdsAmount),
    customDeductions: formatCurrency(payout.breakdown.customDeductions),
    finalAmount: formatCurrency(payout.finalAmount)
  };
}; 
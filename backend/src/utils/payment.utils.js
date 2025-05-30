// Constants for calculations
const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee
const TAX_RATE = 0.15; // 15% tax rate

/**
 * Calculate platform fee based on subtotal amount
 * @param {number} subtotal - The total amount before fees
 * @returns {number} The calculated platform fee
 */
const calculatePlatformFee = (subtotal) => {
  if (typeof subtotal !== 'number' || subtotal < 0) {
    throw new Error('Invalid subtotal amount');
  }
  return (subtotal * PLATFORM_FEE_PERCENTAGE) / 100;
};

/**
 * Calculate tax amount based on amount after platform fee
 * @param {number} amountAfterPlatformFee - The amount after platform fee deduction
 * @returns {number} The calculated tax amount
 */
const calculateTax = (amountAfterPlatformFee) => {
  if (typeof amountAfterPlatformFee !== 'number' || amountAfterPlatformFee < 0) {
    throw new Error('Invalid amount for tax calculation');
  }
  return amountAfterPlatformFee * TAX_RATE;
};

/**
 * Calculate total amount after all deductions
 * @param {number} subtotal - The total amount before fees
 * @returns {Object} Object containing all calculated amounts
 */
const calculateTotalAmount = (subtotal) => {
  const platformFee = calculatePlatformFee(subtotal);
  const amountAfterPlatformFee = subtotal - platformFee;
  const taxAmount = calculateTax(amountAfterPlatformFee);
  const totalAmount = amountAfterPlatformFee - taxAmount;

  return {
    subtotal,
    platformFee,
    taxAmount,
    totalAmount,
    currency: 'USD'
  };
};

/**
 * Format amount to 2 decimal places
 * @param {number} amount - The amount to format
 * @returns {number} Formatted amount
 */
const formatAmount = (amount) => {
  return Number(amount.toFixed(2));
};

/**
 * Validate payment amount
 * @param {number} amount - The amount to validate
 * @returns {boolean} Whether the amount is valid
 */
const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount >= 0 && !isNaN(amount);
};

module.exports = {
  calculatePlatformFee,
  calculateTax,
  calculateTotalAmount,
  formatAmount,
  isValidAmount,
  PLATFORM_FEE_PERCENTAGE,
  TAX_RATE
};
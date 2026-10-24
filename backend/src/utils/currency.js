'use strict';

/**
 * Currency utilities for CineBook.
 * All amounts stored as integers in paise (1 INR = 100 paise).
 */

/**
 * Format paise amount to INR display string.
 * @param {number} paise - Amount in paise
 * @returns {string} e.g. "₹150.00"
 */
function formatINR(paise) {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Convert rupees to paise (safe integer).
 * @param {number} rupees
 * @returns {number} paise
 */
function rupeesToPaise(rupees) {
  return Math.round(rupees * 100);
}

/**
 * Calculate convenience fee.
 * Fee: 2% of subtotal, minimum ₹15, maximum ₹200, in paise.
 * @param {number} subtotalPaise
 * @returns {number} feePaise
 */
function calculateConvenienceFee(subtotalPaise) {
  const twoPercent = Math.round(subtotalPaise * 0.02);
  const minPaise = 1500;  // ₹15
  const maxPaise = 20000; // ₹200
  return Math.min(Math.max(twoPercent, minPaise), maxPaise);
}

/**
 * Generate booking reference.
 * @returns {string} e.g. "CB-20261019-A3F2"
 */
function generateBookingRef() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `CB-${date}-${random}`;
}

/**
 * Generate a mock payment transaction ID.
 */
function generatePaymentId() {
  return `PAY-${Date.now()}-${Math.random().toString(36).toUpperCase().slice(2, 6)}`;
}

module.exports = {
  formatINR,
  rupeesToPaise,
  calculateConvenienceFee,
  generateBookingRef,
  generatePaymentId,
};

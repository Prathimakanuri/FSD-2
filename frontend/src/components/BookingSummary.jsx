import React from 'react';
import { formatINR } from '../utils/formatters';

function BookingSummary({ seats, subtotalPaise, convenienceFeePaise, totalPaise, holdDurationMinutes }) {
  if (!seats || seats.length === 0) {
    return (
      <div className="booking-summary">
        <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)' }}>
          Select seats to see the summary
        </p>
      </div>
    );
  }

  return (
    <div className="booking-summary" style={{
      background: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      marginTop: 'var(--space-4)',
    }}>
      <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>
        Booking Summary
      </h3>
      <div style={{ marginBottom: 'var(--space-2)' }}>
        <strong>Seats:</strong>{' '}
        {seats.map((s) => `${s.row || ''}${s.number || s.seatId}`).join(', ')}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
        <span>Subtotal</span>
        <span>{formatINR(subtotalPaise)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
        <span>Convenience Fee</span>
        <span>{formatINR(convenienceFeePaise)}</span>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider)', margin: 'var(--space-2) 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
        <span>Total</span>
        <span>{formatINR(totalPaise)}</span>
      </div>
      {holdDurationMinutes && (
        <p style={{ color: 'var(--color-warning)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
          Seats held for {holdDurationMinutes} minutes
        </p>
      )}
    </div>
  );
}

export default BookingSummary;

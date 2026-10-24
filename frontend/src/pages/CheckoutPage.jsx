// CheckoutPage.jsx – Demo checkout / booking confirmation page
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmBooking } from '../api/index';
import { formatINR, formatDateTime } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';

function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const holdData = location.state?.holdData;
  const movieId = location.state?.movieId;

  const [confirming, setConfirming] = useState(false);
  const [booking, setBooking] = useState(null);

  // If navigated here without hold data, send user back
  if (!holdData) {
    return (
      <div className="container py-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">No booking in progress</h2>
        <p className="mb-4 text-text-secondary">
          Please select a movie and seats first.
        </p>
        <Button onClick={() => navigate('/movies')} variant="primary">
          Browse Movies
        </Button>
      </div>
    );
  }

  const {
    holdToken,
    showtimeId,
    selectedSeats,
    subtotalPaise,
    convenienceFeePaise,
    totalAmountPaise,
    holdDurationMinutes,
    expiresAt,
  } = holdData;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const idempotencyKey = `${showtimeId}-${holdToken}-${Date.now()}`;
      const res = await confirmBooking({
        showtimeId,
        seatIds: selectedSeats.map((s) => s.seatId),
        holdToken,
        paymentMethod: 'mock_payment',
        idempotencyKey,
      });
      setBooking(res.data.data);
      addToast('Booking confirmed! 🎉', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Booking failed';
      addToast(msg, 'error');
    } finally {
      setConfirming(false);
    }
  };

  // ─── Booking Confirmed View ───────────────────────────────────────────────
  if (booking) {
    return (
      <div className="container py-8">
        <div
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🎟️</div>
          <h2
            className="text-2xl font-bold text-gradient mb-2"
          >
            Booking Confirmed!
          </h2>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-4)',
              padding: '4px 12px',
              background: 'rgba(147,51,234,0.1)',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-block',
            }}
          >
            ⚠️ Demo booking — no real payment processed
          </p>

          <div
            style={{
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Booking ID:</strong>{' '}
              <span style={{ color: 'var(--color-violet-light)', fontFamily: 'monospace' }}>
                {booking.bookingRef}
              </span>
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Movie:</strong> {booking.movie?.title || '—'}
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Theatre:</strong> {booking.theatre?.name || '—'}
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Screen:</strong> {booking.screen?.name || '—'}
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Showtime:</strong>{' '}
              {formatDateTime(booking.showtime?.startTime)}
            </div>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong>Seats:</strong>{' '}
              {booking.seats?.map((s) => `${s.row}${s.number}`).join(', ') || '—'}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider)', margin: 'var(--space-2) 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Total Paid</strong>
              <strong style={{ color: 'var(--color-success)' }}>
                {formatINR(booking.totalAmountPaise)}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Button onClick={() => navigate('/my-bookings')} variant="primary">
              View My Bookings
            </Button>
            <Button onClick={() => navigate('/movies')} variant="secondary">
              Book More
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Checkout Form ────────────────────────────────────────────────────────
  return (
    <div className="container py-8">
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>

        {/* Demo payment notice */}
        <div
          style={{
            background: 'rgba(234,179,8,0.1)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-warning)',
          }}
        >
          ⚠️ <strong>Demo Mode:</strong> No real payment is processed. Clicking "Confirm Booking"
          will create a demo booking saved to the database.
        </div>

        {/* Hold expiry info */}
        {expiresAt && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
            🕐 Seats held for {holdDurationMinutes} min — expires at{' '}
            {new Date(expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {/* Order Summary */}
        <div
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-3)', fontWeight: 'var(--font-semibold)' }}>
            Order Summary
          </h3>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <strong>Seats:</strong>{' '}
            {selectedSeats.map((s) => `${s.row}${s.number}`).join(', ')}
          </div>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <strong>Categories:</strong>{' '}
            {[...new Set(selectedSeats.map((s) => s.category))].join(', ')}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider)', margin: 'var(--space-3) 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span>Subtotal</span>
            <span>{formatINR(subtotalPaise)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span>Convenience Fee</span>
            <span>{formatINR(convenienceFeePaise)}</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider)', margin: 'var(--space-2) 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'var(--font-bold)',
              fontSize: 'var(--text-lg)',
            }}
          >
            <span>Total</span>
            <span>{formatINR(totalAmountPaise)}</span>
          </div>
        </div>

        {/* Payment Method (mock) */}
        <div
          style={{
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-3)', fontWeight: 'var(--font-semibold)' }}>
            Payment Method
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
            <input type="radio" defaultChecked readOnly />
            <span>💳 Demo Payment (no real charge)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate(-1)} variant="secondary" disabled={confirming}>
            Back
          </Button>
          <Button onClick={handleConfirm} variant="primary" disabled={confirming}>
            {confirming ? 'Confirming…' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

// MyBookingsPage.jsx – displays the logged-in user's bookings
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { formatINR, formatDateTime } from '../utils/formatters';

const STATUS_COLORS = {
  confirmed: 'var(--color-success)',
  pending_payment: 'var(--color-warning)',
  cancelled: 'var(--color-error)',
  failed: 'var(--color-error)',
};

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/api/bookings/my');
        // Backend returns paginated: { data: [...] } or { bookings: [...] }
        const list = res.data.data || res.data.bookings || [];
        setBookings(list);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <LoadingSkeleton rows={3} cols={1} />;
  if (error) return <ErrorState message={error} retry={() => window.location.reload()} />;

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>

      {bookings.length === 0 ? (
        <EmptyState message="You have no bookings yet." />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {bookings.map((b) => {
            const seats = b.seats || [];
            const seatLabels = seats.map((s) => `${s.row}${s.number}`).join(', ');
            const movieTitle = b.movie?.title || '—';
            const theatreName = b.theatre?.name || '—';
            const screenName = b.screen?.name || '—';
            const showtime = b.showtime?.startTime;
            const statusColor = STATUS_COLORS[b.status] || 'var(--color-text-muted)';

            return (
              <li
                key={b._id}
                style={{
                  background: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <h3 style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>
                      {movieTitle}
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      {theatreName} · {screenName}
                    </p>
                    {showtime && (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                        {formatDateTime(showtime)}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: `${statusColor}22`,
                        color: statusColor,
                        fontWeight: 'var(--font-semibold)',
                        fontSize: 'var(--text-sm)',
                        textTransform: 'capitalize',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      {b.status?.replace('_', ' ')}
                    </span>
                    <p style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
                      {formatINR(b.totalAmountPaise)}
                    </p>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider)', margin: 'var(--space-3) 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                  <div>
                    <strong>Booking ID:</strong>{' '}
                    <span style={{ fontFamily: 'monospace', color: 'var(--color-violet-light)' }}>
                      {b.bookingRef}
                    </span>
                  </div>
                  <div>
                    <strong>Seats:</strong> {seatLabels || '—'}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default MyBookingsPage;

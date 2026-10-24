import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSeatAvailability, holdSeats } from '../api/index';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import SeatMap from '../components/SeatMap';
import BookingSummary from '../components/BookingSummary';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';

function SeatSelectionPage() {
  const { id: movieId, showtimeId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [seatData, setSeatData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [holding, setHolding] = useState(false);

  // Load seats
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await getSeatAvailability(showtimeId);
        setSeatData(res.data.data);
      } catch (err) {
        setError(err.message || 'Failed to load seats');
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showtimeId]);

  const handleToggleSeat = (seat) => {
    const already = selected.find((s) => s.seatId === seat.seatId);
    if (already) {
      setSelected(selected.filter((s) => s.seatId !== seat.seatId));
    } else {
      if (selected.length >= 8) {
        addToast('Maximum 8 seats per booking', 'warning');
        return;
      }
      setSelected([...selected, seat]);
    }
  };

  const handleProceed = async () => {
    if (selected.length === 0) {
      addToast('Select at least one seat', 'warning');
      return;
    }
    setHolding(true);
    try {
      const seatIds = selected.map((s) => s.seatId);
      const res = await holdSeats(showtimeId, seatIds);
      // Pass hold data via navigation state
      navigate('/checkout', { state: { holdData: res.data.data, movieId, showtimeId } });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to hold seats';
      addToast(msg, 'error');
      // Refresh seats in case of conflict
      const refreshed = await getSeatAvailability(showtimeId);
      setSeatData(refreshed.data.data);
    } finally {
      setHolding(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={2} cols={1} />;
  if (error) return <ErrorState message={error} retry={() => window.location.reload()} />;
  if (!seatData) return <EmptyState message="No seat data available" />;

  const { seats, pricing, screen, holdDurationMinutes } = seatData;

  // Calculate price breakdown for selected seats based on pricing data
  const selectedSeats = selected.map((s) => ({
    ...s,
    pricePaise: pricing.find((p) => p.category === s.category)?.pricePaise || 0,
  }));
  const subtotalPaise = selectedSeats.reduce((sum, s) => sum + s.pricePaise, 0);
  const convenienceFeePaise = Math.max(Math.round(subtotalPaise * 0.02), 1500); // 2% min ₹15
  const totalPaise = subtotalPaise + convenienceFeePaise;

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-semibold mb-4">Select Seats – {screen.name}</h2>
      <SeatMap seats={seats} selected={selected} onToggle={handleToggleSeat} />
      <BookingSummary
        seats={selectedSeats}
        subtotalPaise={subtotalPaise}
        convenienceFeePaise={convenienceFeePaise}
        totalPaise={totalPaise}
        holdDurationMinutes={holdDurationMinutes}
      />
      <div className="flex justify-end mt-4">
        <Button onClick={handleProceed} variant="primary" disabled={holding}>
          {holding ? 'Holding...' : 'Proceed to Checkout'}
        </Button>
      </div>
    </div>
  );
}

export default SeatSelectionPage;

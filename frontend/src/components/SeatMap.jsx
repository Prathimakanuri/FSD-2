import React from 'react';
import './SeatMap.css'; // We'll rely on CSS vars for colors

function SeatMap({ seats, selected, onToggle }) {
  // Group seats by row for visual layout
  const rows = {};
  seats.forEach((seat) => {
    const rowKey = seat.row || 'A';
    rows[rowKey] = rows[rowKey] || [];
    rows[rowKey].push(seat);
  });

  const getStatusClass = (seat) => {
    if (selected.find((s) => s.seatId === seat.seatId)) return 'seat-selected';
    switch (seat.status) {
      case 'available':
        return 'seat-available';
      case 'booked':
        return 'seat-booked';
      case 'held':
        return 'seat-held';
      case 'own_hold':
        return 'seat-own-hold';
      case 'premium':
        return 'seat-premium';
      case 'accessible':
        return 'seat-accessible';
      default:
        return 'seat-available';
    }
  };

  return (
    <div className="seat-map">
      <div className="screen-indicator" aria-label="Screen">
        SCREEN
      </div>
      <div className="seats-grid">
        {Object.entries(rows).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="seat-row" aria-label={`Row ${rowLabel}`}>
            <span className="row-label" aria-hidden="true">{rowLabel}</span>
            {rowSeats.map((seat) => (
              <button
                key={seat.seatId}
                type="button"
                className={`seat ${getStatusClass(seat)}`}
                disabled={seat.status === 'booked' || seat.status === 'held'}
                aria-pressed={!!selected.find((s) => s.seatId === seat.seatId)}
                aria-label={`Seat ${seat.row}${seat.number}, ${seat.category}, ${seat.status}`}
                onClick={() => onToggle(seat)}
              >
                {seat.number}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="legend mt-4 flex flex-wrap gap-4">
        <div className="flex items-center"><span className="seat seat-available mr-2" />Available</div>
        <div className="flex items-center"><span className="seat seat-selected mr-2" />Selected</div>
        <div className="flex items-center"><span className="seat seat-booked mr-2" />Booked</div>
        <div className="flex items-center"><span className="seat seat-held mr-2" />Held by others</div>
        <div className="flex items-center"><span className="seat seat-premium mr-2" />Premium</div>
        <div className="flex items-center"><span className="seat seat-accessible mr-2" />Accessible</div>
      </div>
    </div>
  );
}

export default SeatMap;

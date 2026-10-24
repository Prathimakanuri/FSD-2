import React from 'react';

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center py-12 text-text-muted">
      <p>{message || 'No data available.'}</p>
    </div>
  );
}

export default EmptyState;

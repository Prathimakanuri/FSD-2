import React from 'react';

function LoadingSkeleton({ rows = 1, cols = 1 }) {
  const cells = [];
  for (let i = 0; i < rows * cols; i++) {
    cells.push(
      <div key={i} className="skeleton h-24 w-full mb-4" />
    );
  }
  return <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>{cells}</div>;
}

export default LoadingSkeleton;

import React from 'react';
import { Link } from 'react-router-dom';

function ErrorState({ message, retry }) {
  return (
    <div className="flex flex-col items-center py-12">
      <p className="text-red-500 mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="bg-violet text-white px-4 py-2 rounded-md hover:bg-violet-light"
        >
          Retry
        </button>
      )}
      <Link to="/" className="mt-4 text-violet-light hover:underline">
        Back to Home
      </Link>
    </div>
  );
}

export default ErrorState;

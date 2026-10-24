import { useState } from 'react';
import { getMoviePoster } from '../utils/formatters';

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23161933'/%3E%3Ctext x='150' y='220' text-anchor='middle' fill='%236272a4' font-family='sans-serif' font-size='14'%3ENo Poster%3C/text%3E%3C/svg%3E";

export function MovieImage({ movie, className = '', style = {}, size = 'w500' }) {
  const [errored, setErrored] = useState(false);
  const src = errored ? PLACEHOLDER : (getMoviePoster(movie) || PLACEHOLDER);

  return (
    <img
      src={src}
      alt={movie?.title ? `${movie.title} poster` : 'Movie poster'}
      className={className}
      style={style}
      onError={() => setErrored(true)}
      loading="lazy"
    />
  );
}

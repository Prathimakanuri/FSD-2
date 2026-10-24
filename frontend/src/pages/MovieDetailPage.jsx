import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovie, getShowtimes } from '../api/index';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { formatINR, formatDateTime, getMoviePoster, getMovieBackdrop } from '../utils/formatters';

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, showRes] = await Promise.all([
          getMovie(id),
          getShowtimes(id),
        ]);
        setMovie(movieRes.data.data || movieRes.data.movie || movieRes.data);
        setShowtimes(showRes.data.data || showRes.data.showtimes || []);
      } catch (err) {
        setError(err.message || 'Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSelectShowtime = (show) => {
    navigate(`/movies/${id}/showtime/${show._id}/seats`);
  };

  if (loading) return <LoadingSkeleton rows={2} cols={1} />;
  if (error) return <ErrorState message={error} retry={() => window.location.reload()} />;
  if (!movie) return <EmptyState message="Movie not found" />;

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-video rounded-md overflow-hidden shadow-lg">
          <img
            src={getMovieBackdrop(movie) || getMoviePoster(movie)}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">{movie.title}</h1>
          <p className="mb-4">{movie.overview || movie.synopsis}</p>
          <ul className="space-y-1 mb-4">
            <li><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} min` : 'N/A'}</li>
            <li><strong>Release:</strong> {formatDateTime(movie.releaseDate)}</li>
            <li><strong>Rating:</strong> {movie.rating ? `${movie.rating}/10` : 'N/A'}</li>
            <li><strong>Genres:</strong> {movie.genres?.join(', ') || 'N/A'}</li>
          </ul>
          <Button onClick={() => navigate('/')} variant="secondary">Back to Home</Button>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Available Showtimes</h2>
        {showtimes.length === 0 ? (
          <EmptyState message="No showtimes scheduled for this movie" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {showtimes.map((show) => (
              <div key={show._id} className="bg-bg-card p-4 rounded-md shadow-sm">
                <p><strong>Theatre:</strong> {show.theatre?.name || 'N/A'}</p>
                <p><strong>Screen:</strong> {show.screen?.name || 'N/A'}</p>
                <p><strong>When:</strong> {formatDateTime(show.startTime)}</p>
                <Button
                  onClick={() => handleSelectShowtime(show)}
                  variant="primary"
                  className="mt-2"
                >
                  Choose Seats
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MovieDetailPage;

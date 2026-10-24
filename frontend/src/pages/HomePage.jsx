import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/api/movies?limit=6');
        setFeatured(res.data.data || res.data.movies || []);
      } catch (err) {
        setError(err.message || 'Failed to load featured movies');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="container py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gradient">Welcome to CineBook</h1>
        <p className="text-lg mb-6">Book your tickets for the latest blockbusters.</p>
        {/* Hero placeholder - use first movie backdrop if available */}
        {featured[0] && (
          <div
            className="relative h-64 rounded-md overflow-hidden shadow-lg"
            style={{
              backgroundImage: `url(${featured[0].backdropUrl || (import.meta.env.VITE_TMDB_IMAGE_BASE + '/w1280' + featured[0].backdropPath)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-bg-overlay flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-semibold text-text-primary mb-2">
                  {featured[0].title}
                </h2>
                <Button variant="primary" onClick={() => {}}>
                  Browse Showtimes
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured Movies</h2>
        {loading && <LoadingSkeleton rows={2} cols={5} />}
        {error && <ErrorState message={error} retry={() => window.location.reload()} />}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {featured.length === 0 ? (
              <EmptyState message="No featured movies available." />
            ) : (
              featured.map((movie) => (
                <Link key={movie._id} to={`/movies/${movie._id}`} className="group">
                  <div className="bg-bg-card rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                    <img
                      src={movie.posterUrl || `${import.meta.env.VITE_TMDB_IMAGE_BASE}/w300${movie.posterPath}`}
                      alt={movie.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { e.target.src = '/placeholder-poster.png'; }}
                    />
                    <div className="p-2">
                      <h3 className="text-sm font-medium text-text-primary truncate">{movie.title}</h3>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;

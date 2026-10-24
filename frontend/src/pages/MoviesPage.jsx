// MoviesPage.jsx – lists all movies with basic pagination
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = 12; // per page

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get(`/api/movies?limit=${limit}&page=${page}`);
        setMovies(res.data.data || res.data.movies || []);
      } catch (err) {
        setError(err.message || 'Failed to load movies');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page]);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-semibold mb-4">All Movies</h2>
      {loading && <LoadingSkeleton rows={2} cols={4} />}
      {error && <ErrorState message={error} retry={() => window.location.reload()} />}
      {!loading && !error && (
        <> 
          {movies.length === 0 ? (
            <EmptyState message="No movies found." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <Link key={movie._id} to={`/movies/${movie._id}`} className="group">
                  <div className="bg-bg-card rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
              ))}
            </div>
          )}
          <div className="flex justify-center mt-6 space-x-4">
            <button onClick={prevPage} disabled={page === 1} className="px-4 py-2 bg-bg-card text-text-primary rounded disabled:opacity-50">
              Previous
            </button>
            <span className="self-center">Page {page}</span>
            <button onClick={nextPage} className="px-4 py-2 bg-bg-card text-text-primary rounded">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MoviesPage;

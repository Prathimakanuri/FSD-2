/**
 * Format paise to INR display string
 * @param {number} paise
 * @returns {string} e.g. "₹250.00"
 */
export function formatINR(paise) {
  if (paise == null || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format date to readable string
 * @param {string|Date} date
 * @returns {string} e.g. "Mon, 19 Oct 2026"
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format datetime to readable string
 * @param {string|Date} date
 * @returns {string} e.g. "Mon, 19 Oct 2026 at 3:30 PM"
 */
export function formatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format time only
 * @param {string|Date} date
 * @returns {string} e.g. "3:30 PM"
 */
export function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format runtime in minutes to human readable
 * @param {number} minutes
 * @returns {string} e.g. "2h 48m"
 */
export function formatRuntime(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Get star rating display from 0-10 scale
 * @param {number} rating
 * @returns {string} e.g. "8.1"
 */
export function formatRating(rating) {
  if (rating == null) return 'N/A';
  return Number(rating).toFixed(1);
}

/**
 * Get TMDB image URL
 * @param {string} path - TMDB path e.g. /abc.jpg
 * @param {string} size - e.g. w500, w780, original
 */
export function getTMDBImageUrl(path, size = 'w500') {
  if (!path) return null;
  const base = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';
  return `${base}/${size}${path}`;
}

/**
 * Get movie poster URL with fallback
 */
export function getMoviePoster(movie) {
  if (movie?.posterUrl) return movie.posterUrl;
  if (movie?.posterPath) return getTMDBImageUrl(movie.posterPath, 'w500');
  return '/placeholder-poster.svg';
}

/**
 * Get movie backdrop URL with fallback
 */
export function getMovieBackdrop(movie) {
  if (movie?.backdropUrl) return movie.backdropUrl;
  if (movie?.backdropPath) return getTMDBImageUrl(movie.backdropPath, 'original');
  return null;
}

/**
 * Truncate text
 */
export function truncate(text, maxLength = 150) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}

/**
 * Extract error message from axios error
 */
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

/**
 * Get certification badge color
 */
export function getCertificationColor(cert) {
  switch (cert?.toUpperCase()) {
    case 'U': return 'var(--color-success)';
    case 'UA': return 'var(--color-gold)';
    case 'A': return 'var(--color-error)';
    default: return 'var(--color-text-muted)';
  }
}

/**
 * Group array of objects by a key
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

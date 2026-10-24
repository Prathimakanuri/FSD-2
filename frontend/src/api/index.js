import api from './axios';

export const getMovies = (params) => api.get('/api/movies', { params });
export const getMovie = (id) => api.get(`/api/movies/${id}`);
export const getShowtimes = (movieId) => api.get('/api/showtimes', { params: { movieId } });
export const getSeatAvailability = (showtimeId) => api.get(`/api/showtimes/${showtimeId}/seats`);
// Backend expects { showtimeId, seatIds: [...] }
export const holdSeats = (showtimeId, seatIds) => api.post('/api/bookings/hold', { showtimeId, seatIds });
// Backend expects { showtimeId, seatIds, holdToken, paymentMethod, idempotencyKey }
export const confirmBooking = (payload) => api.post('/api/bookings/confirm', payload);
export const getMyBookings = () => api.get('/api/bookings/my');
export const getBooking = (bookingId) => api.get(`/api/bookings/${bookingId}`);
export const cancelBooking = (bookingId) => api.post(`/api/bookings/${bookingId}/cancel`);

// ProfilePage.jsx – displays user profile (placeholder)
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/users/me');
        setUser(res.data.user);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
      {loading && <LoadingSkeleton rows={3} cols={1} />}
      {error && <ErrorState message={error} retry={() => window.location.reload()} />}
      {!loading && !error && (
        user ? (
          <div className="p-4 bg-bg-card rounded-md shadow-sm">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        ) : (
          <EmptyState message="User data not available." />
        )
      )}
    </div>
  );
}

export default ProfilePage;

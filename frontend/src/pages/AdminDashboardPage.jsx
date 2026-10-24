// AdminDashboardPage.jsx – admin overview (placeholder)
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      {loading && <LoadingSkeleton rows={3} cols={1} />}
      {error && <ErrorState message={error} retry={() => window.location.reload()} />}
      {!loading && !error && (
        stats ? (
          <pre className="bg-bg-card p-4 rounded-md overflow-auto">{JSON.stringify(stats, null, 2)}</pre>
        ) : (
          <EmptyState message="No statistics available." />
        )
      )}
    </div>
  );
}

export default AdminDashboardPage;

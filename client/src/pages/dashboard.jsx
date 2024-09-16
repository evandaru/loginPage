import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, isSessionExpired } from '../api'; // Import fungsi session management

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('user'));

    if (!session || isSessionExpired()) {
      clearSession(); // Hapus sesi jika expired atau tidak ada
      navigate('/'); // Redirect ke halaman login jika sesi tidak valid
    } else {
      setUser(session); // Set user jika sesi valid
    }
  }, [navigate]);

  const handleLogout = () => {
    clearSession(); // Hapus sesi saat logout
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 bg-black shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Dashboard</h2>
        {user && (
          <p className="text-center mb-4">Welcome, {user.name}!</p> // Tampilkan nama pengguna
        )}
        <button
          onClick={handleLogout}
          className="btn btn-primary w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

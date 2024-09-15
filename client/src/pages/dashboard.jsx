import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Proses logout atau pengalihan
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 bg-black shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Dashboard</h2>
        <p className="text-center mb-4">Welcome to your dashboard!</p>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, TrendingUp, Landmark } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(username);
      login(res.data);
      navigate('/home');
    } catch (err) {
      setError('Failed to login. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F7F7] p-6">

      <div className="mb-12 flex space-x-4 text-duo-green">
        <ShieldCheck size={48} />
        <TrendingUp size={48} />
        <Landmark size={48} />
      </div>

      <h1 className="text-4xl font-bold text-[#3C3C3C] mb-2 text-center">Viksit Bharat</h1>
      <p className="text-gray-500 mb-8 text-center text-lg">Learn to Earn. Grow the Nation.</p>

      <div className="w-full max-w-sm">
        {error && <p className="text-red-500 mb-4 text-center font-semibold">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-duo-green focus:bg-blue-50 transition-all font-semibold text-gray-700"
          />
          <button
            type="submit"
            className="bg-duo-green text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_0_#58a700] hover:translate-y-[2px] hover:shadow-[0_2px_0_#58a700] active:translate-y-[4px] active:shadow-none transition-all"
          >
            START LEARNING
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

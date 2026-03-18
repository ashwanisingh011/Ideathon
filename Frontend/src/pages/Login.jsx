import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, TrendingUp, Landmark, LineChart, Wallet } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        // Use either username or email field map to username for the backend
        const res = await loginUser({ username: formData.email || formData.username, password: formData.password });
        login(res.data);
        navigate('/home');
      } else {
        const res = await registerUser({ username: formData.username, password: formData.password });
        login(res.data);
        navigate('/home');
      }
    } catch (err) {
      setError(isLogin ? 'Failed to login. Try again.' : 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4FBF4] font-sans">
      
      {/* LEFT SIDE: App Info */}
      <div className="w-full md:w-[70%] bg-[#064E3B] text-white p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#047857] rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#059669] rounded-full opacity-30 blur-3xl"></div>
        
        <div className="z-10 max-w-4xl mx-auto md:mx-0">
          <div className="mb-8 flex space-x-4 sm:space-x-6 text-[#34D399]">
            <Landmark size={56} className="animate-pulse" />
            <TrendingUp size={56} />
            <Wallet size={56} />
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 tracking-tight">
            Viksit Bharat
          </h1>
          <h2 className="text-2xl sm:text-4xl font-bold mb-8 text-[#6EE7B7]">
            Learn to Earn. Grow the Nation.
          </h2>
          
          <p className="text-lg sm:text-xl text-green-50 mb-8 leading-relaxed max-w-2xl font-medium">
            A gamified finance learning app designed specifically for high school students. 
            Level up your financial literacy and prepare for the real world.
          </p>

          <div className="space-y-6 text-green-100 text-lg">
            <div className="flex items-start">
              <ShieldCheck className="mr-4 text-[#34D399] shrink-0 mt-1" size={28} />
              <p>Master the secure use of <strong>UPI</strong> and everyday digital transactions.</p>
            </div>
            <div className="flex items-start">
              <Landmark className="mr-4 text-[#34D399] shrink-0 mt-1" size={28} />
              <p>Demystify complex <strong>taxation terms</strong> into simple, bite-sized lessons.</p>
            </div>
            <div className="flex items-start bg-[#047857] p-4 rounded-2xl border border-[#10B981]">
              <LineChart className="mr-4 text-white shrink-0 mt-1" size={28} />
              <p className="text-white font-semibold">
                Coming Soon: Live Dummy Market! Build and track your own portfolio risk-free with virtual money.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="w-full md:w-[30%] flex flex-col justify-center items-center bg-white p-8 sm:p-12 shadow-2xl z-20 rounded-t-3xl md:rounded-none -mt-8 md:mt-0 relative">
        
        {/* Segment Control (Login vs Register) */}
        <div className="w-full max-w-sm flex bg-green-50 rounded-2xl p-1 mb-8 shadow-inner">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              isLogin 
                ? 'bg-white shadow-md text-[#064E3B]' 
                : 'text-gray-500 hover:text-green-700'
            }`}
          >
            LOG IN
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              !isLogin 
                ? 'bg-white shadow-md text-[#064E3B]' 
                : 'text-gray-500 hover:text-green-700'
            }`}
          >
            REGISTER
          </button>
        </div>

        <div className="w-full max-w-sm">
          {error && <p className="text-red-500 mb-4 text-center font-bold bg-red-50 py-2 rounded-lg">{error}</p>}
          
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            
            {/* Username field (Register only) */}
            {!isLogin && (
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-duo-green focus:bg-[#F4FBF4] transition-all font-semibold text-gray-700 placeholder-gray-400"
              />
            )}

            {/* Email field (Both, acts as username proxy for login to keep UI) */}
            <input
              type="text"
              name="email"
              placeholder={isLogin ? "Enter your username or email" : "Enter your email"}
              value={formData.email}
              onChange={handleInputChange}
              required
              className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-duo-green focus:bg-[#F4FBF4] transition-all font-semibold text-gray-700 placeholder-gray-400"
            />

            {/* Password field (Both) */}
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-duo-green focus:bg-[#F4FBF4] transition-all font-semibold text-gray-700 placeholder-gray-400"
            />

            <button
              type="submit"
              className="mt-4 bg-duo-green text-white font-bold py-4 px-4 rounded-xl shadow-[0_4px_0_#58a700] hover:translate-y-[2px] hover:shadow-[0_2px_0_#58a700] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wide text-lg"
            >
              {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
            </button>
          </form>
          
          <p className="text-center text-gray-400 text-sm mt-6 font-medium">
            By continuing, you agree to Viksit Bharat's Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
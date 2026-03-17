import { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    fetch('http://localhost:5001/')
      .then(res => res.json())
      .then(data => setBackendStatus(data.message))
      .catch(err => setBackendStatus('Backend not running or unreachable'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform transition-all hover:scale-105 duration-300">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-6 shadow-inner">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Setup Complete!</h1>
          <p className="text-gray-500 mb-8 text-sm">Your MERN stack application with Vite and Tailwind CSS is ready to go.</p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-sm">
              <span className="text-sm font-semibold text-gray-700">Frontend (Vite + React)</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide">Running</span>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between shadow-sm">
              <span className="text-sm font-semibold text-gray-700">Backend (Express)</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${backendStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {backendStatus.includes('successfully') ? 'Connected' : 'Error'}
              </span>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-gray-400">
            <p>Backend Message: <span className="font-mono text-indigo-500">{backendStatus}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

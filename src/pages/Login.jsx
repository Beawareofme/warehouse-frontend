// src/pages/Login.jsx
import { useState } from "react";
import { API_BASE } from "../utils/api";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaWarehouse,
  FaArrowLeft,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// ⬇️ CHANGED: use shared API + AuthContext
import { loginUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // calls AuthContext.login -> saveAuth under the hood

  useEffect(() => {
    // keep your existing cleanup
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Use shared API helper (hits /api/auth/login) and persists to {token, auth_user}
      const payload = await loginUser({ email, password });

      // ✅ Hydrate AuthContext so NavBar/guards have user immediately
      login(payload);

      // ✅ Your requirement: land on Home after login
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        err?.message?.includes('Failed to fetch')
          ? `Cannot reach the server. Check that the backend is running on ${API_BASE}.`
          : err?.message || 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/owner-bg.jpg')",
        backgroundColor: '#0f172a',
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

      {/* back to home */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-white text-xl hover:text-yellow-400 z-10"
        aria-label="Back"
      >
        <FaArrowLeft />
      </button>

      {/* card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-5xl text-white animate-fade-in overflow-hidden">
        {/* sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine pointer-events-none" />

        <div className="grid md:grid-cols-2 gap-8">
          {/* left: login form */}
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-500 text-black rounded-full flex items-center justify-center text-3xl shadow-md">
                <FaWarehouse />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2 text-center text-yellow-400 drop-shadow">
              Sign in to Warehouse Exchange
            </h1>
            <p className="text-center text-sm text-gray-300 mb-6 italic">
              “One login — role-based access for everyone.”
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                  required
                />
              </div>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white/20 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
                  required
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center text-sm text-gray-300 mt-4">
                Forgot your password?{' '}
                <span className="underline cursor-pointer">Reset</span>
              </div>
            </form>
          </div>

          {/* right: new users / CTA */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-semibold mb-2">New here?</h2>
            <p className="text-gray-300 mb-6">
              Create your account as a <span className="text-yellow-400">Merchant</span> or{' '}
              <span className="text-yellow-400">Warehouse Owner</span> and get started in minutes.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-transparent border border-yellow-500 hover:bg-yellow-500/20 text-yellow-400 font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Create an account
            </button>
            <ul className="mt-6 space-y-2 text-sm text-gray-300 list-disc list-inside">
              <li>Role is fetched automatically after login</li>
              <li>Role-based dashboards & features</li>
              <li>Secure token authentication</li>
            </ul>
          </div>
        </div>
      </div>

      {/* animations */}
      <style>
        {`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shine {
            animation: shine 2.5s infinite linear;
          }
        `}
      </style>
    </div>
  );
}

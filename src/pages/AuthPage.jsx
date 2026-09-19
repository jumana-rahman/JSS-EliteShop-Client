import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

export default function AuthPage({ mode: initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email || !email.includes('@')) e.email = 'Please enter a valid email address';
    if (mode !== 'forgot' && password.length < 6) e.password = 'Password must be at least 6 characters';
    if (mode === 'register' && !name) e.name = 'Please enter your name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    if (mode === 'forgot') {
      setForgotSent(true);
      setLoading(false);
      return;
    }

    login(email, password);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#831843] rounded-xl flex items-center justify-center font-bold text-white font-display">
              JSS
            </div>
            <span className="font-display font-bold text-xl text-[#17211D]">Elite<span className="text-[#831843]">Shop</span></span>
          </Link>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          {forgotSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#9F1239]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📧</div>
              <h2 className="font-display font-bold text-xl text-[#17211D] mb-2">Check Your Email</h2>
              <p className="text-[#6B756F] text-sm mb-6">We've sent a password reset link to {email}.</p>
              <button onClick={() => { setMode('login'); setForgotSent(false); }} className="text-[#831843] font-medium text-sm hover:underline">
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl text-[#17211D] mb-1">
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-[#6B756F] text-sm mb-7">
                {mode === 'login' ? 'Sign in to your JSS EliteShop account' :
                 mode === 'register' ? 'Join thousands of happy shoppers' :
                 'Enter your email to receive a reset link'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Sarah Johnson"
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide">Password</label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => setMode('forgot')} className="text-xs text-[#9F1239] font-medium hover:underline">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#831843] text-white rounded-2xl font-display font-bold hover:bg-[#9F1239] transition-all duration-200 disabled:opacity-80 flex items-center justify-center gap-3 mt-2"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</>
                  ) : (
                    mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-[#6B756F]">
                {mode === 'login' ? (
                  <>Don't have an account? <button onClick={() => setMode('register')} className="text-[#831843] font-semibold hover:underline">Sign Up</button></>
                ) : mode === 'register' ? (
                  <>Already have an account? <button onClick={() => setMode('login')} className="text-[#831843] font-semibold hover:underline">Sign In</button></>
                ) : (
                  <button onClick={() => setMode('login')} className="text-[#831843] font-medium hover:underline">← Back to Login</button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
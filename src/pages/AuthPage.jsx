import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

export default function AuthPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const { user, login, register, authBusy } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.pathname === '/register' ? 'register' : 'login';
  const from = location.state?.from || '/dashboard';
  const destination = user?.role === 'admin' ? '/admin' : from;

  useEffect(() => {
    setFormError('');
    setErrors({});
  }, [mode]);

  if (user) {
    return <Navigate to={destination} replace />;
  }

  const validate = () => {
    const next = {};

    if (!email || !email.includes('@')) next.email = 'Please enter a valid email address';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';

    if (mode === 'register') {
      if (name.trim().length < 2) next.name = 'Please enter your full name';
      if (phone.trim().length < 6) next.phone = 'Please enter a valid phone number';
      if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) return;

    try {
      const signedInUser =
        mode === 'login'
          ? await login(email, password, rememberMe)
          : await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });

      navigate(signedInUser?.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Something went wrong. Please try again.');
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors ${
      errors[field] ? 'border-red-400' : 'border-gray-200'
    }`;

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
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[#6B756F] text-sm mb-7">
            {mode === 'login'
              ? 'Sign in to your JSS EliteShop account'
              : 'Join thousands of happy shoppers'}
          </p>

          {formError && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sarah Johnson"
                  className={inputClass('name')}
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
                className={inputClass('email')}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                  className={inputClass('phone')}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                className={inputClass('password')}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={inputClass('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === 'login' && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 accent-[#831843]"
                />
                <span className="text-sm text-[#6B756F]">Remember me on this device</span>
              </label>
            )}

            <button
              type="submit"
              disabled={authBusy}
              className="w-full py-4 bg-[#831843] text-white rounded-2xl font-display font-bold hover:bg-[#9F1239] transition-all duration-200 disabled:opacity-80 flex items-center justify-center gap-3 mt-2"
            >
              {authBusy ? (
                <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Processing...</>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#6B756F]">
            {mode === 'login' ? (
              <>Don't have an account? <Link to="/register" state={location.state} className="text-[#831843] font-semibold hover:underline">Sign Up</Link></>
            ) : (
              <>Already have an account? <Link to="/login" state={location.state} className="text-[#831843] font-semibold hover:underline">Sign In</Link></>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

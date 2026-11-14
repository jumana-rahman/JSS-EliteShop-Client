import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const socialLinks = [
  {
    label: 'X (Twitter)',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (event) => {
    event.preventDefault();

    const value = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showToast('Enter a valid email address.', 'error');
      return;
    }

    showToast('Thanks for subscribing! Watch your inbox for offers.', 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#17211D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#BE185D] rounded-lg flex items-center justify-center font-bold text-white text-sm">
                JSS
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                Elite<span className="text-[#BE185D]">Shop</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Premium e-commerce powered by AI. Shop smarter, live better with curated products from the world's finest brands.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#BE185D] hover:text-white transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', path: '/products' },
                { label: 'Electronics', path: '/products?category=electronics' },
                { label: 'Fashion', path: '/products?category=fashion' },
                { label: 'Home & Living', path: '/products?category=home' },
                { label: 'Beauty & Care', path: '/products?category=beauty' },
                { label: 'Sports & Fitness', path: '/products?category=sports' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Customer</h4>
            <ul className="space-y-3">
              {[
                { label: 'My Account', path: '/dashboard' },
                { label: 'Order Tracking', path: '/dashboard/orders' },
                { label: 'Wishlist', path: '/wishlist' },
                { label: 'Returns & Refunds', path: '/contact' },
                { label: 'Help Center', path: '/contact' },
                { label: 'Contact Us', path: '/contact' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Company</h4>
            <ul className="space-y-3 mb-6">
              {[
                { label: 'About JSS', path: '/about' },
                { label: 'Privacy Policy', path: '/about' },
                { label: 'Terms of Service', path: '/about' },
                { label: 'Careers', path: '/about' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#BE185D] hover:text-[#E14E8B] transition-colors mb-6"
            >
              <LockKeyhole className="w-4 h-4" /> Admin Login
            </Link>
            <div>
              <p className="text-sm font-medium mb-2">Stay updated</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 outline-none focus:border-[#BE185D] transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#BE185D] text-white rounded-lg text-sm font-semibold hover:bg-[#E14E8B] transition-colors"
                >
                  Go
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 JSS EliteShop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Cash on Delivery', 'Secure Checkout', 'Easy Returns'].map(method => (
              <span key={method} className="px-2.5 py-1 bg-white/10 rounded text-xs text-white/50 font-medium">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

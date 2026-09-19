import { Link } from 'react-router-dom';

export default function Footer() {
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
              {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map(social => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#BE185D] hover:text-white transition-all duration-200"
                  aria-label={social}
                >
                  <span className="text-xs font-bold">{social[0]}</span>
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
            <div>
              <p className="text-sm font-medium mb-2">Stay updated</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 outline-none focus:border-[#BE185D] transition-colors"
                />
                <button className="px-3 py-2 bg-[#BE185D] text-white rounded-lg text-sm font-semibold hover:bg-[#E14E8B] transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 JSS EliteShop. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Visa', 'Mastercard', 'Stripe', 'PayPal'].map(method => (
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

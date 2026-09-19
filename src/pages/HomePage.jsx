import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products, categories, reviews } from '../data/products';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { useApp } from '../contexts/AppContext';
import { StarRating } from '../components/ProductCard';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const { setAiChatOpen } = useApp();
  const navigate = useNavigate();

  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const trending = products.filter(p => p.isTrending).slice(0, 4);

  const handleAiSearch = (e) => {
    e.preventDefault();
    setAiChatOpen(true);
  };

  return (
    <div className="bg-[#FAFAF7]">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#831843] via-[#6B1036] to-[#9F1239]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        {/* Decorative orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#BE185D]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#BE185D]/20 border border-[#BE185D]/30 rounded-full mb-6">
              <span className="text-[#FAFAF7] text-xs">✨</span>
              <span className="text-[#FAFAF7] text-xs font-semibold tracking-wide uppercase">AI-Powered Shopping</span>
            </div>

            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] tracking-tight mb-6">
              Shop Smarter.<br />
              <span className="text-[#BE185D]">Live Better.</span>
            </h1>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-md">
              Discover premium products curated by AI. From electronics to fashion, we bring you the best at unbeatable prices.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="px-8 py-4 bg-[#BE185D] text-white rounded-2xl font-display font-bold text-base hover:bg-[#E14E8B] transition-all duration-200 hover:shadow-lg hover:shadow-[#BE185D]/30 active:scale-95"
              >
                Shop Now →
              </Link>
              <button
                onClick={() => setAiChatOpen(true)}
                className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-display font-semibold text-base hover:bg-white/20 transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
              >
                <span>✨</span> Try AI Shopping
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm">
              {[
                { value: '50K+', label: 'Products' },
                { value: '4.9★', label: 'Rating' },
                { value: '2M+', label: 'Customers' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-display font-bold text-2xl text-white">{stat.value}</p>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/10" />
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop&auto=format"
                alt="Premium shopping experience"
                className="w-full h-full object-cover rounded-3xl opacity-80"
              />
              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-8 bg-white rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#831843]/10 rounded-xl flex items-center justify-center">🛡️</div>
                  <div>
                    <p className="font-display font-bold text-[#17211D] text-sm">Secure & Fast</p>
                    <p className="text-[#6B756F] text-xs">SSL encrypted checkout</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -top-6 -right-8 bg-white rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#BE185D]/10 rounded-xl flex items-center justify-center">⚡</div>
                  <div>
                    <p className="font-display font-bold text-[#17211D] text-sm">Fast Delivery</p>
                    <p className="text-[#6B756F] text-xs">2-day shipping</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-2">Browse</p>
          <h2 className="font-display font-bold text-4xl text-[#17211D]">Shop by Category</h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                to={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 hover:border-[#831843]/20 hover:shadow-lg hover:shadow-[#831843]/8 transition-all duration-300 group text-center"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <span className="font-display font-semibold text-xs text-[#17211D] leading-tight">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-2">Handpicked</p>
            <h2 className="font-display font-bold text-4xl text-[#17211D]">Featured Products</h2>
          </div>
          <Link to="/products" className="text-[#831843] font-semibold text-sm hover:text-[#9F1239] transition-colors hidden sm:block">
            View all →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* AI Showcase */}
      <section className="py-20 bg-gradient-to-br from-[#831843] to-[#9F1239] overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#BE185D]/20 border border-[#BE185D]/30 rounded-full mb-6">
              <span className="text-[#FAFAF7] text-xs font-semibold tracking-wide uppercase">✨ AI-Powered</span>
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
              Not Sure What to Buy?<br />
              <span className="text-[#BE185D]">Let AI Help.</span>
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Describe what you're looking for in plain English and our AI assistant will find the perfect product for you.
            </p>

            <form onSubmit={handleAiSearch} className="flex gap-3 max-w-xl mx-auto">
              <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-xl">
                <span className="text-lg">✨</span>
                <input
                  type="text"
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  placeholder='Try "wireless headphones under $300"...'
                  className="flex-1 text-[#17211D] text-sm outline-none placeholder:text-[#6B756F]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-[#BE185D] text-white rounded-2xl font-bold hover:bg-[#E14E8B] transition-colors shadow-xl shrink-0"
              >
                Ask AI
              </button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Best laptop for students', 'Skincare for dry skin', 'Gift for a 10-year-old', 'Running shoes for beginners'].map(q => (
                <button
                  key={q}
                  onClick={() => { setAiQuery(q); setAiChatOpen(true); }}
                  className="px-3 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-full text-xs hover:bg-white/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-2">What's Hot</p>
            <h2 className="font-display font-bold text-4xl text-[#17211D]">Trending Now</h2>
          </div>
          <Link to="/products" className="text-[#831843] font-semibold text-sm hover:text-[#9F1239] transition-colors hidden sm:block">
            View all →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map(product => (
            <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
          ))}
        </div>
      </section>

      {/* Why JSS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-2">Our Promise</p>
            <h2 className="font-display font-bold text-4xl text-[#17211D]">Why JSS EliteShop?</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🔒', title: 'Secure Payment', desc: '256-bit SSL encryption on every transaction. Your data is always safe.' },
              { icon: '⚡', title: 'Fast Delivery', desc: '2-day shipping nationwide. Free delivery on orders over $50.' },
              { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns on all products, no questions asked.' },
              { icon: '✨', title: 'AI-Powered', desc: 'Smart recommendations tailored to your taste and budget.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#FAFAF7] border border-gray-100 hover:border-[#831843]/15 hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#831843]/8 rounded-2xl flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-[#17211D] text-lg mb-2">{feature.title}</h3>
                <p className="text-[#6B756F] text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="font-display font-bold text-4xl text-[#17211D]">What Our Customers Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                <StarRating rating={review.rating} />
              </div>
              <p className="text-[#17211D] text-sm leading-relaxed mb-5">"{review.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-display font-semibold text-[#17211D] text-sm">{review.name}</p>
                  <p className="text-[#6B756F] text-xs">{review.product} · {review.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeUp}
          className="max-w-4xl mx-auto bg-gradient-to-br from-[#17211D] to-[#831843] rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#BE185D]/10 rounded-full blur-3xl" />
          <p className="text-[#BE185D] text-sm font-semibold uppercase tracking-widest mb-3">Limited Time</p>
          <h2 className="font-display font-bold text-4xl text-white mb-4">Up to 40% Off<br />Selected Items</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">Don't miss our biggest sale of the season. Premium products at prices that make sense.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#BE185D] text-white rounded-2xl font-bold hover:bg-[#E14E8B] transition-all duration-200 hover:shadow-lg hover:shadow-[#BE185D]/30"
          >
            Shop the Sale →
          </Link>
        </motion.div>
      </section>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
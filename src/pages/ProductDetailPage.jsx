import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import { useApp } from '../contexts/AppContext';
import { StarRating } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-2">Product Not Found</h2>
          <Link to="/products" className="text-[#831843] font-medium hover:underline">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6B756F] mb-8">
          <Link to="/" className="hover:text-[#831843] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#831843] transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category.toLowerCase()}`} className="hover:text-[#831843] transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-[#17211D] font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100"
            >
              <img
                src={product.images[activeImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-[#831843]' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-[#9F1239] text-xs font-semibold uppercase tracking-wider">{product.category} · {product.brand}</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#17211D] mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <StarRating rating={product.rating} />
              <span className="text-sm text-[#6B756F]">{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-display font-bold text-4xl text-[#17211D]">${product.price}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-[#6B756F] text-xl line-through">${product.originalPrice}</span>
                  <span className="px-2.5 py-1 bg-[#BE185D]/15 text-[#BE185D] text-sm font-bold rounded-full">
                    -{product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${
              product.inStock ? 'bg-[#9F1239]/10 text-[#9F1239]' : 'bg-red-50 text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#9F1239]' : 'bg-red-400'}`} />
              {product.inStock ? `In Stock · ${product.stockCount} remaining` : 'Out of Stock'}
            </div>

            {/* Quantity */}
            {product.inStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-[#17211D]">Quantity:</span>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#17211D] hover:bg-gray-50 transition-colors rounded-l-xl"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-[#17211D]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stockCount, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#17211D] hover:bg-gray-50 transition-colors rounded-r-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => product.inStock && addToCart(product, quantity)}
                disabled={!product.inStock}
                className="flex-1 py-4 bg-[#831843] text-white rounded-2xl font-display font-bold text-base hover:bg-[#9F1239] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {product.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isWishlisted(product.id) ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-[#6B756F] hover:border-red-300 hover:text-red-400'
                }`}
              >
                <svg className="w-6 h-6" fill={isWishlisted(product.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-gray-100">
              {[
                { icon: '🚚', text: 'Free shipping over $50' },
                { icon: '↩️', text: '30-day returns' },
                { icon: '🔒', text: 'Secure checkout' },
              ].map(badge => (
                <div key={badge.text} className="text-center">
                  <div className="text-xl mb-1">{badge.icon}</div>
                  <p className="text-xs text-[#6B756F] leading-tight">{badge.text}</p>
                </div>
              ))}
            </div>

            {/* Complete My Look */}
            {product.category === 'Fashion' && (
              <div className="mt-4 p-4 bg-gradient-to-r from-[#831843]/5 to-[#9F1239]/5 border border-[#831843]/10 rounded-2xl">
                <p className="text-sm font-semibold text-[#831843] mb-1">✨ Complete My Look</p>
                <p className="text-xs text-[#6B756F]">Let our AI stylist suggest matching items for this piece.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-1 p-1 bg-white rounded-xl border border-gray-100 w-fit mb-8">
            {['description', 'specs', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  activeTab === tab ? 'bg-[#831843] text-white shadow-sm' : 'text-[#6B756F] hover:text-[#17211D]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <p className="text-[#17211D] leading-relaxed text-base">{product.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-[#831843]/8 text-[#831843] text-xs font-medium rounded-full capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="grid sm:grid-cols-2 gap-0">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <div key={key} className={`flex gap-4 py-3.5 ${i < Object.keys(product.specs).length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-[#6B756F] text-sm w-36 shrink-0">{key}</span>
                    <span className="text-[#17211D] text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                <div className="text-center">
                  <p className="font-display font-bold text-5xl text-[#17211D]">{product.rating}</p>
                  <StarRating rating={product.rating} />
                  <p className="text-xs text-[#6B756F] mt-1">{product.reviews.toLocaleString()} reviews</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 6 : star === 2 ? 3 : 1;
                    return (
                      <div key={star} className="flex items-center gap-3 mb-1">
                        <span className="text-xs text-[#6B756F] w-4">{star}★</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-[#BE185D] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-[#6B756F] w-8">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="text-[#6B756F] text-sm text-center">Reviews coming from verified purchases. <span className="text-[#831843] font-medium cursor-pointer hover:underline">Write a review</span></p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display font-bold text-2xl text-[#17211D] mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
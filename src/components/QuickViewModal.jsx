import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StarRating } from './ProductCard';
import { Link } from 'react-router-dom';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square bg-gray-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 px-2.5 py-1 bg-[#BE185D] text-white text-xs font-bold rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-8 flex flex-col">
                <button onClick={onClose} className="self-end mb-4 p-2 rounded-xl hover:bg-gray-100 text-[#6B756F] transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <p className="text-[#9F1239] text-xs font-semibold uppercase tracking-wide mb-1">{product.category} · {product.brand}</p>
                <h2 className="font-display font-bold text-2xl text-[#17211D] mb-3">{product.name}</h2>

                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={product.rating} />
                  <span className="text-sm text-[#6B756F]">({product.reviews.toLocaleString()} reviews)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-display font-bold text-3xl text-[#17211D]">${product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-[#6B756F] line-through">${product.originalPrice}</span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-xs text-[#9F1239] font-semibold bg-[#9F1239]/10 px-2 py-0.5 rounded-full">
                      Save ${product.originalPrice - product.price}
                    </span>
                  )}
                </div>

                <p className="text-[#6B756F] text-sm leading-relaxed mb-6 line-clamp-3">{product.description}</p>

                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#9F1239]' : 'bg-red-400'}`} />
                  <span className={`text-sm font-medium ${product.inStock ? 'text-[#9F1239]' : 'text-red-600'}`}>
                    {product.inStock ? `In Stock (${product.stockCount} left)` : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => { product.inStock && addToCart(product); onClose(); }}
                    disabled={!product.inStock}
                    className="flex-1 py-3.5 bg-[#831843] text-white rounded-2xl font-display font-semibold hover:bg-[#9F1239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {product.inStock ? 'Add to Cart' : 'Sold Out'}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                      isWishlisted(product.id) ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-[#6B756F] hover:border-red-300 hover:text-red-400'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={isWishlisted(product.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <Link
                  to={`/products/${product.id}`}
                  onClick={onClose}
                  className="mt-3 text-center text-sm text-[#831843] font-medium hover:underline"
                >
                  View full details →
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

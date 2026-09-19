import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-[#BE185D]' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export { StarRating };

export default function ProductCard({ product, onQuickView }) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const [imageLoaded, setImageLoaded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#831843]/20 hover:shadow-xl hover:shadow-[#831843]/8 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {!imageLoaded && <div className="skeleton absolute inset-0" />}
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount > 0 && (
            <span className="px-2 py-0.5 bg-[#BE185D] text-white text-xs font-bold rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.isNew && (
            <span className="px-2 py-0.5 bg-[#831843] text-white text-xs font-bold rounded-full">
              NEW
            </span>
          )}
          {!product.inStock && (
            <span className="px-2 py-0.5 bg-gray-800 text-white text-xs font-medium rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            wishlisted
              ? 'bg-red-50 text-red-500 scale-110'
              : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500'
          } shadow-sm`}
        >
          <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick View */}
        {onQuickView && (
          <button
            onClick={() => onQuickView(product)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-[#831843] rounded-full text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap"
          >
            Quick View
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-[#9F1239] font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display font-semibold text-[#17211D] text-sm line-clamp-2 hover:text-[#831843] transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs text-[#6B756F]">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-[#17211D] text-lg">${product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#6B756F] line-through">${product.originalPrice}</span>
            )}
          </div>

          <button
            onClick={() => product.inStock && addToCart(product)}
            disabled={!product.inStock}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              product.inStock
                ? 'bg-[#831843] text-white hover:bg-[#9F1239] active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

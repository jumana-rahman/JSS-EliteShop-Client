import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StarRating } from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🤍</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-3">Your wishlist is empty</h2>
          <p className="text-[#6B756F] mb-8">Save items you love and revisit them anytime.</p>
          <Link to="/products" className="px-8 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors inline-block">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-[#17211D]">My Wishlist</h1>
          <p className="text-[#6B756F] text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishlist.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-square bg-gray-50">
                  <Link to={`/products/${product.id}`}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  {product.discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#BE185D] text-white text-xs font-bold rounded-full">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-[#9F1239] font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-display font-semibold text-[#17211D] text-sm line-clamp-2 hover:text-[#831843] transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-3">
                    <StarRating rating={product.rating} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display font-bold text-[#17211D] text-lg">${product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-[#6B756F] line-through ml-2">${product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="flex-1 py-2.5 bg-[#831843] text-white rounded-xl text-xs font-semibold hover:bg-[#9F1239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.inStock ? 'Add to Cart' : 'Sold Out'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="px-3 py-2.5 bg-gray-100 text-[#6B756F] rounded-xl text-xs hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
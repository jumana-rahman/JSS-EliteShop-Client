import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StarRating } from './ProductCard';
import { Link } from 'react-router-dom';
import { completeLook } from '../services/ai';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [lookProducts, setLookProducts] = useState([]);
  const [lookReply, setLookReply] = useState('');
  const [lookLoading, setLookLoading] = useState(false);
  const [lookError, setLookError] = useState('');

  useEffect(() => {
    setQuantity(1);
    setLookProducts([]);
    setLookReply('');
    setLookError('');
    setLookLoading(false);
  }, [product?.id]);

  if (!product) return null;

  const maxQuantity = Math.max(1, Number(product.stockCount ?? 1));
  const canAdd = product.inStock && quantity > 0;

  const handleAddToCart = async () => {
    if (!canAdd) return;

    const added = await addToCart(product, quantity);

    if (added) onClose();
  };

  const handleCompleteLook = async () => {
    if (!product.id || lookLoading) return;

    setLookLoading(true);
    setLookError('');
    setLookProducts([]);
    setLookReply('');

    try {
      const data = await completeLook(product.id);
      setLookProducts(data.products || []);
      setLookReply(data.reply || '');
    } catch (error) {
      setLookError(error.message || 'Unable to fetch styling suggestions right now.');
    } finally {
      setLookLoading(false);
    }
  };

  return (
    <AnimatePresence>
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

              <p className="text-[#6B756F] text-sm leading-relaxed mb-4 line-clamp-3">{product.description}</p>

              <div className="flex items-center gap-2 mb-5">
                <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-[#9F1239]' : 'bg-red-400'}`} />
                <span className={`text-sm font-medium ${product.inStock ? 'text-[#9F1239]' : 'text-red-600'}`}>
                  {product.inStock ? `In Stock (${product.stockCount} left)` : 'Out of Stock'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-medium text-[#17211D]">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(value => Math.max(1, value - 1))}
                    disabled={!product.inStock || quantity <= 1}
                    className="w-9 h-9 flex items-center justify-center text-[#17211D] hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold text-[#17211D] border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(value => Math.min(maxQuantity, value + 1))}
                    disabled={!product.inStock || quantity >= maxQuantity}
                    className="w-9 h-9 flex items-center justify-center text-[#17211D] hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAdd}
                  className="flex-1 py-3.5 bg-[#831843] text-white rounded-2xl font-display font-semibold hover:bg-[#9F1239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.inStock ? 'Add to Cart' : 'Sold Out'}
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                    isWishlisted(product.id) ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-[#6B756F] hover:border-red-300 hover:text-red-400'
                  }`}
                  aria-label="Toggle wishlist"
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

              {/* Complete My Look */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#831843] mb-0.5">✨ Complete My Look</p>
                    <p className="text-xs text-[#6B756F]">Let AI suggest matching pieces.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCompleteLook}
                    disabled={lookLoading}
                    className="shrink-0 px-3 py-2 bg-[#831843]/10 text-[#831843] rounded-xl text-xs font-semibold hover:bg-[#831843]/15 disabled:opacity-50 transition-colors"
                  >
                    {lookLoading ? 'Thinking...' : 'Suggest'}
                  </button>
                </div>

                {lookError && (
                  <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {lookError}
                  </p>
                )}

                {!lookLoading && (lookReply || lookProducts.length > 0) && (
                  <div className="mt-3 space-y-2">
                    {lookReply && (
                      <p className="text-xs text-[#6B756F] leading-relaxed">{lookReply}</p>
                    )}
                    {lookProducts.slice(0, 3).map(item => (
                      <Link
                        key={item.id}
                        to={`/products/${item.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:border-[#831843]/20 hover:bg-[#FAFAF7] transition-colors"
                      >
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#17211D] truncate">{item.name}</p>
                          <p className="text-xs text-[#6B756F]">${item.price}</p>
                        </div>
                        <span className="text-[#831843] text-xs">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

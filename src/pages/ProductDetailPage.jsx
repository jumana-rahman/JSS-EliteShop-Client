import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { StarRating } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';
import { getProduct, getRelatedProducts } from '../services/products';
import {
  listProductReviews,
  getReviewEligibility,
  createReview,
  deleteReview,
} from '../services/reviews';
import { completeLook } from '../services/ai';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isWishlisted, user, isLoggedIn, showToast } = useApp();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0, breakdown: {} });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', text: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewDeleting, setReviewDeleting] = useState('');
  const [lookProducts, setLookProducts] = useState([]);
  const [lookReply, setLookReply] = useState('');
  const [lookLoading, setLookLoading] = useState(false);
  const [lookError, setLookError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    setProduct(null);
    setRelated([]);
    setQuantity(1);
    setActiveImage(0);
    setActiveTab('description');
    setLookProducts([]);
    setLookReply('');
    setLookError('');
    setLookLoading(false);

    (async () => {
      try {
        const data = await getProduct(id);
        if (!active) return;
        setProduct(data.product);

        getRelatedProducts(id, 4)
          .then(relatedData => {
            if (active) setRelated(relatedData.products || []);
          })
          .catch(() => {
            if (active) setRelated([]);
          });
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Unable to load this product.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!product?.id) return undefined;

    let active = true;

    setReviewsLoading(true);
    setReviews([]);
    setReviewSummary({ average: 0, count: 0, breakdown: {} });
    setReviewFormOpen(false);
    setReviewForm({ rating: 5, title: '', text: '' });
    setReviewError('');

    listProductReviews(product.id, { limit: 20 })
      .then(data => {
        if (!active) return;
        setReviews(data.reviews || []);
        setReviewSummary(data.summary || { average: 0, count: 0, breakdown: {} });
      })
      .catch(err => {
        if (active) showToast(err.message || 'Unable to load reviews.', 'error');
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });

    return () => { active = false; };
  }, [product?.id]);

  useEffect(() => {
    if (!isLoggedIn || !product?.id) {
      setEligibility(null);
      return undefined;
    }

    let active = true;

    getReviewEligibility(product.id)
      .then(data => {
        if (active) setEligibility(data.eligibility);
      })
      .catch(() => {
        if (active) setEligibility(null);
      });

    return () => { active = false; };
  }, [isLoggedIn, product?.id]);

  const refreshReviewData = async () => {
    if (!product?.id) return;

    const [reviewData, eligibilityData] = await Promise.all([
      listProductReviews(product.id, { limit: 20 }),
      isLoggedIn ? getReviewEligibility(product.id).catch(() => null) : Promise.resolve(null),
    ]);

    setReviews(reviewData.reviews || []);
    setReviewSummary(reviewData.summary || { average: 0, count: 0, breakdown: {} });
    setProduct(previous => previous ? {
      ...previous,
      rating: reviewData.summary?.average || 0,
      reviews: reviewData.summary?.count || 0,
    } : previous);

    if (eligibilityData?.eligibility) setEligibility(eligibilityData.eligibility);
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewError('');

    if (reviewForm.text.trim().length < 10) {
      setReviewError('Please write at least 10 characters.');
      return;
    }

    setReviewSubmitting(true);

    try {
      await createReview({
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        text: reviewForm.text,
      });
      await refreshReviewData();
      setReviewForm({ rating: 5, title: '', text: '' });
      setReviewFormOpen(false);
      showToast('Review posted. Thank you!', 'success');
    } catch (err) {
      setReviewError(err.message || 'Unable to post your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewDelete = async (review) => {
    setReviewDeleting(review.id);

    try {
      await deleteReview(review.id);
      await refreshReviewData();
      showToast('Review deleted.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to delete the review.', 'error');
    } finally {
      setReviewDeleting('');
    }
  };

  const handleCompleteLook = async () => {
    if (!product?.id || lookLoading) return;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-4 w-72 rounded mb-8" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="skeleton aspect-square rounded-3xl" />
            <div className="space-y-4">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-10 w-4/5 rounded" />
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-12 w-2/5 rounded" />
              <div className="skeleton h-10 w-40 rounded-full" />
              <div className="skeleton h-14 w-full rounded-2xl" />
              <div className="skeleton h-24 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-2">
            {error ? 'Could Not Load Product' : 'Product Not Found'}
          </h2>
          {error && <p className="text-[#6B756F] text-sm mb-4">{error}</p>}
          <Link to="/products" className="text-[#831843] font-medium hover:underline">← Back to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6B756F] mb-8">
          <Link to="/" className="hover:text-[#831843] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#831843] transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${encodeURIComponent(product.categorySlug || product.category.toLowerCase())}`} className="hover:text-[#831843] transition-colors">{product.category}</Link>
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
              {product.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#831843]/8 text-[#831843] text-xs font-medium rounded-full capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              {Object.keys(product.specs).length === 0 ? (
                <p className="text-sm text-[#6B756F]">No specifications have been listed for this product yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-0">
                  {Object.entries(product.specs).map(([key, value], i) => (
                    <div key={key} className={`flex gap-4 py-3.5 ${i < Object.keys(product.specs).length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <span className="text-[#6B756F] text-sm w-36 shrink-0">{key}</span>
                      <span className="text-[#17211D] text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 pb-8 border-b border-gray-100">
                <div className="text-center sm:text-left shrink-0">
                  <p className="font-display font-bold text-5xl text-[#17211D]">{reviewSummary.average || 0}</p>
                  <StarRating rating={reviewSummary.average || 0} />
                  <p className="text-xs text-[#6B756F] mt-1">
                    {reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex-1 w-full">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviewSummary.breakdown?.[star] || 0;
                    const pct = reviewSummary.count
                      ? Math.round((count / reviewSummary.count) * 100)
                      : 0;
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#17211D]">Customer Reviews</h3>
                  <p className="text-xs text-[#6B756F] mt-0.5">Only verified buyers with a delivered order can review.</p>
                </div>

                <div className="shrink-0">
                  {!isLoggedIn ? (
                    <Link to="/login" className="inline-block px-4 py-2 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                      Sign in to review
                    </Link>
                  ) : eligibility?.canReview ? (
                    <button
                      onClick={() => { setReviewFormOpen(open => !open); setReviewError(''); }}
                      className="px-4 py-2 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors"
                    >
                      {reviewFormOpen ? 'Cancel' : 'Write a review'}
                    </button>
                  ) : eligibility?.hasReviewed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9F1239]/10 text-[#9F1239] rounded-full text-xs font-semibold">
                      ✓ You reviewed this product
                    </span>
                  ) : eligibility ? (
                    <span className="text-xs text-[#6B756F] max-w-56 text-right block">{eligibility.reason}</span>
                  ) : null}
                </div>
              </div>

              {reviewFormOpen && eligibility?.canReview && (
                <form onSubmit={handleReviewSubmit} className="mb-8 p-5 bg-[#FAFAF7] rounded-2xl border border-gray-100">
                  <p className="text-sm font-semibold text-[#17211D] mb-2">Your rating</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(previous => ({ ...previous, rating: star }))}
                        className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-[#BE185D]' : 'text-gray-300'}`}
                        aria-label={`${star} star${star === 1 ? '' : 's'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <input
                    value={reviewForm.title}
                    onChange={event => setReviewForm(previous => ({ ...previous, title: event.target.value }))}
                    placeholder="Title (optional)"
                    maxLength={120}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors mb-3"
                  />
                  <textarea
                    value={reviewForm.text}
                    onChange={event => setReviewForm(previous => ({ ...previous, text: event.target.value }))}
                    placeholder="What did you like or dislike about this product?"
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <p className={`text-xs ${reviewError ? 'text-red-600' : 'text-[#6B756F]'}`}>
                      {reviewError || `${reviewForm.text.length}/1000 characters`}
                    </p>
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
                    >
                      {reviewSubmitting ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>
                </form>
              )}

              {reviewsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="skeleton h-28 rounded-2xl" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="font-display font-semibold text-[#17211D]">No reviews yet</p>
                  <p className="text-sm text-[#6B756F] mt-1">Be the first to share your experience.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border border-gray-100 rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        {review.user.avatar ? (
                          <img src={review.user.avatar} alt={review.user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#831843]/10 text-[#831843] flex items-center justify-center font-bold shrink-0">
                            {review.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#17211D]">{review.user.name}</p>
                          <p className="text-xs text-[#6B756F]">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {review.verifiedPurchase && (
                              <span className="ml-2 text-[#9F1239] font-semibold">✓ Verified purchase</span>
                            )}
                          </p>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.title && <p className="font-semibold text-[#17211D] mt-3">{review.title}</p>}
                      <p className="text-sm text-[#6B756F] leading-relaxed mt-2">{review.text}</p>
                      {user?.id === review.user.id && (
                        <button
                          onClick={() => handleReviewDelete(review)}
                          disabled={reviewDeleting === review.id}
                          className="mt-3 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                        >
                          {reviewDeleting === review.id ? 'Deleting...' : 'Delete my review'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Complete My Look */}
        <section className="mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#831843] via-[#6B1036] to-[#9F1239] p-8 text-white">
            <div className="absolute -top-16 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/60 font-semibold">AI Stylist</p>
                <h2 className="font-display font-bold text-2xl mt-1">Complete My Look ✨</h2>
                <p className="text-white/70 text-sm mt-1 max-w-lg">
                  Let AI suggest complementary pieces from our catalog that pair with this product.
                </p>
              </div>
              <button
                onClick={handleCompleteLook}
                disabled={lookLoading}
                className="shrink-0 px-5 py-3 bg-white text-[#831843] rounded-xl text-sm font-bold hover:bg-[#FAFAF7] disabled:opacity-60 transition-colors"
              >
                {lookLoading
                  ? 'Styling...'
                  : lookProducts.length > 0
                    ? 'Refresh suggestions'
                    : 'Style this for me'}
              </button>
            </div>

            {lookError && (
              <p className="relative mt-4 text-sm text-white/80">{lookError}</p>
            )}
            {lookReply && !lookError && (
              <p className="relative mt-4 text-sm text-white/80">{lookReply}</p>
            )}
          </div>

          {lookProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {lookProducts.map(item => <ProductCard key={item.id} product={item} />)}
            </div>
          )}
        </section>

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
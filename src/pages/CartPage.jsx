import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { computePricing, FREE_SHIPPING_THRESHOLD } from '../lib/pricing';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isLoggedIn,
    showToast,
  } = useApp();
  const [coupon, setCoupon] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const navigate = useNavigate();

  const pricing = computePricing(cartTotal, appliedCoupon);
  const { shipping, discount, total } = pricing;
  const hasStockIssue = cart.some(
    (item) =>
      !item.product.inStock ||
      item.quantity > Number(item.product.stockCount ?? 0)
  );

  const handleApplyCoupon = async (event) => {
    event.preventDefault();

    const code = coupon.trim();
    if (!code || couponBusy) return;

    if (!isLoggedIn) {
      showToast('Please sign in to use a coupon.', 'error');
      return;
    }

    setCouponBusy(true);

    try {
      await applyCoupon(code);
      setCoupon('');
      showToast('Coupon applied!', 'success');
    } catch (error) {
      showToast(error.message || 'Invalid coupon code.', 'error');
    } finally {
      setCouponBusy(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    showToast('Coupon removed.', 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🛒</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-3">Your cart is empty</h2>
          <p className="text-[#6B756F] mb-8">Looks like you haven't added anything yet. Let's change that!</p>
          <Link to="/products" className="px-8 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors inline-block">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-[#17211D]">Shopping Cart</h1>
            <p className="text-[#6B756F] text-sm mt-1">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-5"
                >
                  <Link to={`/products/${item.product.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-xl bg-gray-50 shrink-0"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#9F1239] font-semibold mb-0.5">{item.product.category}</p>
                        <Link to={`/products/${item.product.id}`}>
                          <h3 className="font-display font-semibold text-[#17211D] text-sm line-clamp-2 hover:text-[#831843] transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B756F] hover:text-red-500 transition-all shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {!item.product.inStock && (
                      <p className="text-xs text-red-500 font-medium mt-1">⚠️ This item is out of stock</p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#17211D] hover:bg-gray-100 rounded-l-xl transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-[#17211D]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= Number(item.product.stockCount ?? 0)}
                          className="w-8 h-8 flex items-center justify-center text-[#17211D] hover:bg-gray-100 rounded-r-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-[#17211D]">${(item.product.price * item.quantity).toFixed(2)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-[#6B756F]">${item.product.price} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-display font-semibold text-[#17211D] mb-3">Coupon Code</h3>

              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#9F1239]/5 border border-[#9F1239]/20 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#831843]">{appliedCoupon.code}</p>
                    <p className="text-xs text-[#6B756F] truncate">
                      {appliedCoupon.description ||
                        (appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% off`
                          : `$${appliedCoupon.discountValue} off`)}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="shrink-0 text-xs font-medium text-[#6B756F] hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="ELITE10"
                    disabled={couponBusy}
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors disabled:bg-gray-50 disabled:text-[#6B756F]"
                  />
                  <button
                    type="submit"
                    disabled={couponBusy || !coupon.trim()}
                    className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponBusy ? '...' : 'Apply'}
                  </button>
                </form>
              )}

              <p className="text-xs text-[#6B756F] mt-2">
                {isLoggedIn ? 'Try code: ELITE10' : 'Sign in to apply coupon codes.'}
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-display font-semibold text-[#17211D] mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[#6B756F]">
                  <span>Subtotal</span>
                  <span className="text-[#17211D] font-medium">${pricing.subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#9F1239]">
                    <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B756F]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-[#9F1239] font-medium' : 'text-[#17211D] font-medium'}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-[#9F1239]">
                    Add ${(FREE_SHIPPING_THRESHOLD - pricing.subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="font-display font-bold text-[#17211D]">Total</span>
                  <span className="font-display font-bold text-xl text-[#17211D]">${total.toFixed(2)}</span>
                </div>
              </div>

              {hasStockIssue && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  Some items are out of stock or exceed available quantity. Adjust your cart to continue.
                </p>
              )}

              <button
                onClick={() => navigate('/checkout')}
                disabled={hasStockIssue}
                className="w-full mt-5 py-4 bg-[#831843] text-white rounded-2xl font-display font-bold hover:bg-[#9F1239] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout →
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6B756F]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secured by SSL encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
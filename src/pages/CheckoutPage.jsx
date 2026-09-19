import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

const steps = ['address', 'summary', 'payment'];
const stepLabels = ['Address', 'Order Summary', 'Payment'];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useApp();
  const [currentStep, setCurrentStep] = useState('address');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', state: '', zip: '', country: 'United States',
  });

  const stepIndex = steps.indexOf(currentStep);

  const shipping = cartTotal > 50 ? 0 : 9.99;
  const total = cartTotal + shipping;

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      clearCart();
      navigate('/order-confirmation', { state: { total, orderId: `JSS-${Date.now().toString().slice(-6)}` } });
    }, 2000);
  };

  const canProceedAddress = address.firstName && address.email && address.street && address.city;

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display font-bold text-3xl text-[#17211D] mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i < stepIndex && setCurrentStep(step)}
                className={`flex items-center gap-2 ${i < stepIndex ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < stepIndex ? 'bg-[#9F1239] text-white' :
                  i === stepIndex ? 'bg-[#831843] text-white' :
                  'bg-gray-200 text-[#6B756F]'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === stepIndex ? 'text-[#17211D]' : 'text-[#6B756F]'}`}>
                  {stepLabels[i]}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < stepIndex ? 'bg-[#BE185D]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 'address' && (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="font-display font-bold text-xl text-[#17211D] mb-5">Delivery Address</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'firstName', label: 'First Name', span: 1 },
                        { key: 'lastName', label: 'Last Name', span: 1 },
                        { key: 'email', label: 'Email Address', span: 2, type: 'email' },
                        { key: 'phone', label: 'Phone Number', span: 1, type: 'tel' },
                        { key: 'zip', label: 'ZIP Code', span: 1 },
                        { key: 'street', label: 'Street Address', span: 2 },
                        { key: 'city', label: 'City', span: 1 },
                        { key: 'state', label: 'State', span: 1 },
                      ].map(field => (
                        <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
                          <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">{field.label}</label>
                          <input
                            type={field.type || 'text'}
                            value={address[field.key]}
                            onChange={e => setAddress(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentStep('summary')}
                      disabled={!canProceedAddress}
                      className="w-full mt-6 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Order Summary →
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'summary' && (
                <motion.div key="summary" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="font-display font-bold text-xl text-[#17211D] mb-5">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4">
                          <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-[#17211D] line-clamp-2">{item.product.name}</p>
                            <p className="text-xs text-[#6B756F]">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-[#17211D] shrink-0">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <div className="flex items-center gap-2 p-3 bg-[#831843]/5 rounded-xl text-sm">
                        <span>📍</span>
                        <p className="text-[#17211D]">
                          {address.firstName} {address.lastName} · {address.street}, {address.city}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStep('payment')}
                      className="w-full py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="font-display font-bold text-xl text-[#17211D] mb-2">Payment</h2>
                    <div className="flex items-center gap-2 mb-5">
                      <svg className="w-4 h-4 text-[#9F1239]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-xs text-[#6B756F]">Secured by Stripe · 256-bit SSL</p>
                    </div>

                    {/* Stripe-like UI */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Card Number</label>
                        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl flex items-center gap-3">
                          <span className="text-lg">💳</span>
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            defaultValue="4242 4242 4242 4242"
                            className="flex-1 text-sm text-[#17211D] outline-none"
                          />
                          <span className="text-xs text-[#6B756F] font-medium">VISA</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Expiry</label>
                          <input type="text" placeholder="MM / YY" defaultValue="12 / 28" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#831843] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">CVC</label>
                          <input type="text" placeholder="CVC" defaultValue="123" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#831843] transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Name on Card</label>
                        <input type="text" placeholder="Full name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#831843] transition-colors" />
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full mt-6 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-all duration-200 disabled:opacity-80 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay $${total.toFixed(2)} →`
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Total */}
          <div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
              <h3 className="font-display font-semibold text-[#17211D] mb-4">Order Total</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#6B756F]">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="text-[#17211D]">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6B756F]">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-[#9F1239] font-medium' : 'text-[#17211D]'}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="font-display font-bold text-[#17211D]">Total</span>
                  <span className="font-display font-bold text-xl text-[#17211D]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
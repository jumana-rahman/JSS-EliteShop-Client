import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { listAddresses } from '../services/addresses';
import { createOrder } from '../services/orders';

const steps = ['address', 'summary', 'payment'];
const stepLabels = ['Address', 'Order Summary', 'Payment'];

const emptyForm = {
  name: '',
  phone: '',
  addressLine: '',
  city: '',
  postalCode: '',
};

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, showToast, user } = useApp();
  const [currentStep, setCurrentStep] = useState('address');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [form, setForm] = useState(emptyForm);
  const [saveAddress, setSaveAddress] = useState(true);
  const navigate = useNavigate();

  const stepIndex = steps.indexOf(currentStep);
  const shipping = cartTotal >= 50 ? 0 : 9.99;
  const total = cartTotal + shipping;

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await listAddresses();
        if (!active) return;

        const list = data.addresses || [];
        setAddresses(list);
        setSelectedAddressId(list[0]?.id || 'new');
      } catch (err) {
        if (active) {
          showToast(err.message || 'Unable to load your saved addresses.', 'error');
        }
      } finally {
        if (active) setAddressesLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  const selectedAddress = addresses.find((entry) => entry.id === selectedAddressId);
  const isNewAddress = selectedAddressId === 'new';

  const newAddressValid =
    form.name.trim().length >= 2 &&
    form.phone.trim().length >= 6 &&
    form.addressLine.trim().length >= 5 &&
    form.city.trim().length >= 2 &&
    form.postalCode.trim().length >= 3;

  const canProceedAddress = isNewAddress ? newAddressValid : Boolean(selectedAddress);

  const deliveryAddress = isNewAddress
    ? {
        name: form.name.trim(),
        phone: form.phone.trim(),
        addressLine: form.addressLine.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
      }
    : selectedAddress;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    try {
      const payload = isNewAddress
        ? {
            address: {
              name: form.name.trim(),
              phone: form.phone.trim(),
              addressLine: form.addressLine.trim(),
              city: form.city.trim(),
              postalCode: form.postalCode.trim(),
            },
            saveAddress,
          }
        : { addressId: selectedAddressId };

      const data = await createOrder(payload);
      await clearCart();
      showToast('Order placed! Pay cash when it arrives.', 'success');
      navigate(`/order-confirmation/${data.order.id}`, {
        replace: true,
        state: { order: data.order },
      });
    } catch (err) {
      setError(err.message || 'Unable to place your order. Please try again.');
      showToast(err.message || 'Unable to place your order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">🛒</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-3">Your cart is empty</h2>
          <p className="text-[#6B756F] mb-8">Add a product before heading to checkout.</p>
          <Link to="/products" className="px-8 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-display font-bold text-3xl text-[#17211D] mb-8">Checkout</h1>

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
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 'address' && (
                <motion.div key="address" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="font-display font-bold text-xl text-[#17211D] mb-1">Delivery Address</h2>
                    <p className="text-sm text-[#6B756F] mb-5">Choose a saved address or enter a new one.</p>

                    {addressesLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, index) => (
                          <div key={index} className="skeleton h-24 rounded-xl" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((address) => {
                          const active = selectedAddressId === address.id;

                          return (
                            <button
                              key={address.id}
                              type="button"
                              onClick={() => setSelectedAddressId(address.id)}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${
                                active
                                  ? 'border-[#831843] bg-[#831843]/5'
                                  : 'border-gray-200 hover:border-[#831843]/30'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  active ? 'border-[#831843]' : 'border-gray-300'
                                }`}>
                                  {active && <span className="w-2 h-2 rounded-full bg-[#831843]" />}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-[#17211D] text-sm">{address.name}</p>
                                    {address.isDefault && (
                                      <span className="px-2 py-0.5 bg-[#BE185D]/15 text-[#BE185D] text-xs font-semibold rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-[#6B756F] mt-0.5">{address.phone}</p>
                                  <p className="text-sm text-[#6B756F] mt-1">
                                    {address.addressLine}, {address.city} {address.postalCode}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => setSelectedAddressId('new')}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            isNewAddress
                              ? 'border-[#831843] bg-[#831843]/5'
                              : 'border-gray-200 hover:border-[#831843]/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isNewAddress ? 'border-[#831843]' : 'border-gray-300'
                            }`}>
                              {isNewAddress && <span className="w-2 h-2 rounded-full bg-[#831843]" />}
                            </span>
                            <div>
                              <p className="font-semibold text-[#17211D] text-sm">
                                {addresses.length ? 'Use a new address' : 'Enter your delivery address'}
                              </p>
                              <p className="text-xs text-[#6B756F] mt-0.5">Deliver to a different location.</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}

                    {isNewAddress && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-5 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Full Name</label>
                            <input
                              type="text"
                              value={form.name}
                              onChange={(e) => updateField('name', e.target.value)}
                              placeholder="Your full name"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Phone Number</label>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) => updateField('phone', e.target.value)}
                              placeholder="+1 (555) 000-0000"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Street Address</label>
                            <input
                              type="text"
                              value={form.addressLine}
                              onChange={(e) => updateField('addressLine', e.target.value)}
                              placeholder="House, street, area"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">City</label>
                            <input
                              type="text"
                              value={form.city}
                              onChange={(e) => updateField('city', e.target.value)}
                              placeholder="City"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Postal Code</label>
                            <input
                              type="text"
                              value={form.postalCode}
                              onChange={(e) => updateField('postalCode', e.target.value)}
                              placeholder="Postal code"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2.5 cursor-pointer select-none mt-4">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="w-4 h-4 accent-[#831843]"
                          />
                          <span className="text-sm text-[#6B756F]">Save this address for next time</span>
                        </label>
                      </motion.div>
                    )}

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
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex gap-4">
                          <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[#17211D] line-clamp-2">{item.product.name}</p>
                            <p className="text-xs text-[#6B756F]">Qty: {item.quantity} · ${item.product.price} each</p>
                          </div>
                          <p className="font-bold text-[#17211D] shrink-0">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 mb-4">
                      <div className="flex items-start gap-2 p-3 bg-[#831843]/5 rounded-xl text-sm">
                        <span>📍</span>
                        <div>
                          <p className="text-[#17211D] font-medium">{deliveryAddress?.name} · {deliveryAddress?.phone}</p>
                          <p className="text-[#6B756F]">
                            {deliveryAddress?.addressLine}, {deliveryAddress?.city} {deliveryAddress?.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCurrentStep('address')}
                        className="px-5 py-4 bg-white border border-gray-200 text-[#17211D] rounded-2xl font-semibold hover:border-[#831843]/30 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentStep('payment')}
                        className="flex-1 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors"
                      >
                        Continue to Payment →
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h2 className="font-display font-bold text-xl text-[#17211D] mb-2">Payment</h2>
                    <p className="text-sm text-[#6B756F] mb-5">No online payment needed. Pay in cash when your order is delivered.</p>

                    <div className="p-4 rounded-xl border-2 border-[#831843] bg-[#831843]/5 flex items-start gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="font-semibold text-[#17211D]">Cash on Delivery</p>
                        <p className="text-sm text-[#6B756F] mt-0.5">
                          Pay the delivery agent when your package arrives.
                        </p>
                      </div>
                      <span className="ml-auto mt-1 w-4 h-4 rounded-full border-2 border-[#831843] flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#831843]" />
                      </span>
                    </div>

                    {error && (
                      <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                        {error}
                      </div>
                    )}

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => setCurrentStep('summary')}
                        disabled={loading}
                        className="px-5 py-4 bg-white border border-gray-200 text-[#17211D] rounded-2xl font-semibold hover:border-[#831843]/30 transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="flex-1 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-all duration-200 disabled:opacity-80 flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Placing order...
                          </>
                        ) : (
                          `Place Order · $${total.toFixed(2)}`
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 sticky top-24">
              <h3 className="font-display font-semibold text-[#17211D] mb-4">Order Total</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#6B756F]">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
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
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6B756F]">
                <span>💵</span>
                Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

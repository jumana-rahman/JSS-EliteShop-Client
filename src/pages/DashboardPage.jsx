import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { authClient } from '../lib/authClient';
import { listOrders, downloadInvoice } from '../services/orders';
import { listMyReviews, deleteReview } from '../services/reviews';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../services/addresses';
import { StarRating } from '../components/ProductCard';
import OrderTimeline, { formatShortDate } from '../components/OrderTimeline';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'orders', label: 'My Orders', icon: '📦' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'addresses', label: 'Addresses', icon: '📍' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const statusColors = {
  Placed: 'bg-[#831843]/10 text-[#831843]',
  'Payment Confirmed': 'bg-[#BE185D]/10 text-[#BE185D]',
  Processing: 'bg-[#E14E8B]/10 text-[#E14E8B]',
  Shipped: 'bg-blue-50 text-blue-600',
  Delivered: 'bg-[#9F1239]/10 text-[#9F1239]',
  Cancelled: 'bg-red-50 text-red-600',
};

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function DashboardPage() {
  const { user, isLoggedIn, logout, wishlist, showToast, toggleWishlist, moveToCart, refreshSession } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeSection = pathname.split('/')[2] || 'overview';

  const [activeSection, setActiveSection] = useState(routeSection);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [invoiceBusy, setInvoiceBusy] = useState('');
  const [myReviews, setMyReviews] = useState([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(true);
  const [myReviewsError, setMyReviewsError] = useState('');
  const [reviewDeleting, setReviewDeleting] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressError, setAddressError] = useState('');
  const [addressForm, setAddressForm] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressDeleting, setAddressDeleting] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', image: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    setActiveSection(routeSection);
  }, [routeSection]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let active = true;

    (async () => {
      setOrdersLoading(true);
      setOrdersError('');

      try {
        const data = await listOrders();
        if (active) setOrders(data.orders || []);
      } catch (error) {
        if (active) setOrdersError(error.message || 'Unable to load your orders.');
      } finally {
        if (active) setOrdersLoading(false);
      }
    })();

    return () => { active = false; };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let active = true;

    (async () => {
      setMyReviewsLoading(true);
      setMyReviewsError('');

      try {
        const data = await listMyReviews();
        if (active) setMyReviews(data.reviews || []);
      } catch (error) {
        if (active) setMyReviewsError(error.message || 'Unable to load your reviews.');
      } finally {
        if (active) setMyReviewsLoading(false);
      }
    })();

    return () => { active = false; };
  }, [isLoggedIn]);

  const handleDeleteReview = async (review) => {
    setReviewDeleting(review.id);

    try {
      await deleteReview(review.id);
      setMyReviews(previous => previous.filter(item => item.id !== review.id));
      showToast('Review deleted.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to delete the review.', 'error');
    } finally {
      setReviewDeleting('');
    }
  };

  const goToSection = (id) => {
    setActiveSection(id);
    navigate(id === 'overview' ? '/dashboard' : `/dashboard/${id}`);
  };

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      image: user.image || '',
    });
  }, [user?.id, user?.name, user?.phone, user?.image]);

  const loadAddresses = async () => {
    setAddressesLoading(true);
    setAddressError('');

    try {
      const data = await listAddresses();
      setAddresses(data.addresses || []);
    } catch (error) {
      setAddressError(error.message || 'Unable to load your addresses.');
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || activeSection !== 'addresses') return undefined;

    let active = true;

    (async () => {
      setAddressesLoading(true);
      setAddressError('');

      try {
        const data = await listAddresses();
        if (active) setAddresses(data.addresses || []);
      } catch (error) {
        if (active) setAddressError(error.message || 'Unable to load your addresses.');
      } finally {
        if (active) setAddressesLoading(false);
      }
    })();

    return () => { active = false; };
  }, [isLoggedIn, activeSection]);

  const openAddressForm = (address = null) => {
    setAddressForm(
      address
        ? {
            id: address.id,
            name: address.name || '',
            phone: address.phone || '',
            addressLine: address.addressLine || '',
            city: address.city || '',
            postalCode: address.postalCode || '',
            isDefault: Boolean(address.isDefault),
          }
        : {
            id: null,
            name: user?.name || '',
            phone: user?.phone || '',
            addressLine: '',
            city: '',
            postalCode: '',
            isDefault: addresses.length === 0,
          }
    );
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();

    if (!addressForm) return;

    if (
      addressForm.name.trim().length < 2 ||
      addressForm.phone.trim().length < 6 ||
      addressForm.addressLine.trim().length < 5 ||
      addressForm.city.trim().length < 2 ||
      addressForm.postalCode.trim().length < 3
    ) {
      showToast('Please fill in all address fields.', 'error');
      return;
    }

    setAddressSaving(true);

    const payload = {
      name: addressForm.name.trim(),
      phone: addressForm.phone.trim(),
      addressLine: addressForm.addressLine.trim(),
      city: addressForm.city.trim(),
      postalCode: addressForm.postalCode.trim(),
      isDefault: addressForm.isDefault,
    };

    try {
      if (addressForm.id) {
        await updateAddress(addressForm.id, payload);
        showToast('Address updated.', 'success');
      } else {
        await createAddress(payload);
        showToast('Address saved.', 'success');
      }

      setAddressForm(null);
      await loadAddresses();
    } catch (error) {
      showToast(error.message || 'Unable to save this address.', 'error');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleAddressDelete = async (address) => {
    setAddressDeleting(address.id);

    try {
      await deleteAddress(address.id);
      showToast('Address deleted.', 'success');
      await loadAddresses();
    } catch (error) {
      showToast(error.message || 'Unable to delete this address.', 'error');
    } finally {
      setAddressDeleting('');
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (profileForm.name.trim().length < 2) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    if (profileForm.phone.trim().length < 6) {
      showToast('Please enter a valid phone number.', 'error');
      return;
    }

    setProfileSaving(true);

    try {
      const { error } = await authClient.updateUser({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        image: profileForm.image.trim(),
      });

      if (error) throw new Error(error.message || 'Unable to update your profile.');

      await refreshSession?.();
      showToast('Profile updated.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to update your profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        revokeOtherSessions: true,
      });

      if (error) throw new Error(error.message || 'Unable to change your password.');

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed.', 'success');
    } catch (error) {
      setPasswordError(error.message || 'Unable to change your password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleInvoice = async (order) => {
    const key = order.id || order.orderNumber;
    setInvoiceBusy(key);

    try {
      await downloadInvoice(key);
    } catch (error) {
      showToast(error.message || 'Could not download the invoice.', 'error');
    } finally {
      setInvoiceBusy('');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center px-4 text-center">
        <div>
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-3">Please Sign In</h2>
          <p className="text-[#6B756F] mb-6">Access your account to view orders and more.</p>
          <Link to="/login" className="px-8 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(order =>
    ['Placed', 'Payment Confirmed', 'Processing'].includes(order.status)
  ).length;
  const completedOrders = orders.filter(order => order.status === 'Delivered').length;
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#831843]/10 rounded-xl flex items-center justify-center text-xl font-bold text-[#831843]">
                    {user?.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-[#17211D] text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-[#6B756F] truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => goToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? 'bg-[#831843] text-white'
                        : 'text-[#6B756F] hover:bg-gray-50 hover:text-[#17211D]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-1"
                >
                  <span>🚪</span> Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Mobile section picker */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30 bg-[#17211D] rounded-2xl p-1.5 flex gap-1 overflow-x-auto shadow-lg">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => goToSection(item.id)}
                className={`flex-1 min-w-fit px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === item.id ? 'bg-[#831843] text-white' : 'text-white/70'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display font-bold text-2xl text-[#17211D]">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
                    <p className="text-sm text-[#6B756F] mt-1">Here is what is happening with your account.</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Orders', value: orders.length, icon: '📦', color: 'bg-[#831843]/8 text-[#831843]' },
                      { label: 'In Progress', value: pendingOrders, icon: '⏳', color: 'bg-[#E14E8B]/10 text-[#E14E8B]' },
                      { label: 'Delivered', value: completedOrders, icon: '✅', color: 'bg-[#9F1239]/10 text-[#9F1239]' },
                      { label: 'Wishlist', value: wishlist.length, icon: '❤️', color: 'bg-red-50 text-red-600' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-lg mb-3`}>{stat.icon}</div>
                        <p className="font-display font-bold text-2xl text-[#17211D]">
                          {ordersLoading ? '—' : stat.value}
                        </p>
                        <p className="text-xs text-[#6B756F]">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <h3 className="font-display font-bold text-[#17211D]">Recent Orders</h3>
                      <button onClick={() => goToSection('orders')} className="text-xs text-[#9F1239] font-medium hover:underline">View all</button>
                    </div>

                    {ordersLoading ? (
                      <div className="p-6 space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="skeleton h-14 rounded-xl" />
                        ))}
                      </div>
                    ) : ordersError ? (
                      <div className="px-6 py-10 text-center">
                        <p className="text-sm text-red-600 mb-3">{ordersError}</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                          Try Again
                        </button>
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <div className="text-4xl mb-3">📦</div>
                        <p className="font-display font-semibold text-[#17211D]">No orders yet</p>
                        <p className="text-sm text-[#6B756F] mt-1 mb-4">Your orders will show up here once you check out.</p>
                        <Link to="/products" className="inline-block px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {recentOrders.map(order => (
                          <button
                            key={order.id}
                            onClick={() => navigate(`/order-confirmation/${order.id}`)}
                            className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex -space-x-2 shrink-0">
                              {order.items.slice(0, 2).map((item, index) => (
                                <img
                                  key={`${item.productId}-${index}`}
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-9 h-9 rounded-lg object-cover border-2 border-white bg-gray-50"
                                />
                              ))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[#17211D]">{order.orderNumber}</p>
                              <p className="text-xs text-[#6B756F]">{formatShortDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                            </div>
                            <span className={`hidden sm:inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {order.status}
                            </span>
                            <p className="font-bold text-[#17211D] text-sm">{formatMoney(order.total)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-[#17211D]">My Orders</h2>
                      <p className="text-sm text-[#6B756F] mt-1">
                        {ordersLoading ? 'Loading your orders...' : `${orders.length} order${orders.length === 1 ? '' : 's'} in total`}
                      </p>
                    </div>
                  </div>

                  {ordersLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="skeleton h-56 rounded-2xl" />
                      ))}
                    </div>
                  ) : ordersError ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                      <div className="text-4xl mb-3">⚠️</div>
                      <p className="text-[#6B756F] mb-4">{ordersError}</p>
                      <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                        Try Again
                      </button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <div className="text-5xl mb-3">📦</div>
                      <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">No orders yet</h3>
                      <p className="text-sm text-[#6B756F] mb-5">Place your first order to see it here with live tracking.</p>
                      <Link to="/products" className="inline-block px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-gray-100">
                            <div>
                              <p className="font-bold text-[#17211D] text-sm">{order.orderNumber}</p>
                              <p className="text-xs text-[#6B756F]">
                                {formatShortDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                {order.status}
                              </span>
                              <p className="font-bold text-[#17211D]">{formatMoney(order.total)}</p>
                            </div>
                          </div>

                          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
                            <OrderTimeline order={order} variant="horizontal" />
                          </div>

                          <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex gap-4 overflow-x-auto flex-1">
                              {order.items.map((item, index) => (
                                <div key={`${item.productId}-${index}`} className="flex items-center gap-3 shrink-0">
                                  <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-lg bg-gray-50" />
                                  <div className="min-w-0">
                                    <p className="text-sm text-[#17211D] line-clamp-1 max-w-44">{item.productName}</p>
                                    <p className="text-xs text-[#6B756F]">Qty {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleInvoice(order)}
                                disabled={invoiceBusy === (order.id || order.orderNumber)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#17211D] hover:border-[#831843]/30 disabled:opacity-50 transition-colors"
                              >
                                {invoiceBusy === (order.id || order.orderNumber) ? 'Preparing...' : 'Invoice'}
                              </button>
                              <button
                                onClick={() => navigate(`/order-confirmation/${order.id}`)}
                                className="px-4 py-2 bg-[#831843]/8 text-[#831843] rounded-xl text-xs font-semibold hover:bg-[#831843]/15 transition-colors"
                              >
                                View details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'reviews' && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-display font-bold text-2xl text-[#17211D]">My Reviews</h2>
                    <p className="text-sm text-[#6B756F] mt-1">
                      Reviews you have written for delivered purchases.
                    </p>
                  </div>

                  {myReviewsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="skeleton h-32 rounded-2xl" />
                      ))}
                    </div>
                  ) : myReviewsError ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                      <div className="text-4xl mb-3">⚠️</div>
                      <p className="text-[#6B756F]">{myReviewsError}</p>
                    </div>
                  ) : myReviews.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <div className="text-5xl mb-3">⭐</div>
                      <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">No reviews yet</h3>
                      <p className="text-sm text-[#6B756F] mb-5 max-w-md mx-auto">
                        Once an order is delivered, open the product page to share your experience.
                      </p>
                      <Link to="/products" className="inline-block px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myReviews.map(review => (
                        <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="flex gap-4">
                            <Link to={`/products/${review.productId}`} className="shrink-0">
                              <img
                                src={review.product?.image}
                                alt={review.product?.name || 'Product'}
                                className="w-16 h-16 rounded-xl object-cover bg-gray-50"
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <Link to={`/products/${review.productId}`} className="font-semibold text-sm text-[#17211D] hover:text-[#831843] transition-colors line-clamp-1">
                                    {review.product?.name || 'Product'}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-1">
                                    <StarRating rating={review.rating} />
                                    <span className="text-xs text-[#6B756F]">{formatShortDate(review.createdAt)}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteReview(review)}
                                  disabled={reviewDeleting === review.id}
                                  className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors shrink-0"
                                >
                                  {reviewDeleting === review.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                              {review.title && <p className="font-medium text-sm text-[#17211D] mt-2">{review.title}</p>}
                              <p className="text-sm text-[#6B756F] mt-1 leading-relaxed">{review.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'profile' && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-display font-bold text-2xl text-[#17211D]">My Profile</h2>
                    <p className="text-sm text-[#6B756F] mt-1">Update your account details and profile photo.</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 max-w-2xl">
                    <div className="flex items-center gap-5">
                      {profileForm.image ? (
                        <img
                          src={profileForm.image}
                          alt={profileForm.name || 'Profile'}
                          className="w-16 h-16 rounded-2xl object-cover bg-gray-50"
                          onError={event => { event.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[#831843]/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#831843] font-display">
                          {profileForm.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-display font-bold text-xl text-[#17211D] truncate">{user?.name}</p>
                        <p className="text-sm text-[#6B756F] truncate">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#BE185D]/15 text-[#BE185D] text-xs font-semibold rounded-full mt-1">
                          ✨ {user?.role === 'admin' ? 'Admin' : 'Elite Member'}
                        </span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Full Name</label>
                        <input
                          value={profileForm.name}
                          onChange={event => setProfileForm(previous => ({ ...previous, name: event.target.value }))}
                          required
                          minLength={2}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Phone</label>
                        <input
                          value={profileForm.phone}
                          onChange={event => setProfileForm(previous => ({ ...previous, phone: event.target.value }))}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Email Address</label>
                        <input
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#6B756F] bg-gray-50 outline-none cursor-not-allowed"
                        />
                        <p className="text-xs text-[#6B756F] mt-1">
                          Your email is used for sign-in and cannot be changed here.
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Profile Photo URL</label>
                        <input
                          value={profileForm.image}
                          onChange={event => setProfileForm(previous => ({ ...previous, image: event.target.value }))}
                          placeholder="https://..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-6 py-3 bg-[#831843] text-white rounded-xl font-semibold text-sm hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeSection === 'wishlist' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-[#17211D]">My Wishlist</h2>
                      <p className="text-sm text-[#6B756F] mt-1">
                        {wishlist.length} saved item{wishlist.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Link to="/products" className="text-sm text-[#831843] font-medium hover:underline">
                      Browse products →
                    </Link>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <div className="text-5xl mb-3">🤍</div>
                      <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">Your wishlist is empty</h3>
                      <p className="text-sm text-[#6B756F] mb-5">Save items you love and revisit them anytime.</p>
                      <Link to="/products" className="inline-block px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                        Explore Products
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wishlist.map(product => (
                        <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                          <Link to={`/products/${product.id}`} className="shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-20 h-20 rounded-xl object-cover bg-gray-50"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#9F1239] font-semibold uppercase tracking-wide">
                              {product.category}
                            </p>
                            <Link to={`/products/${product.id}`} className="font-semibold text-sm text-[#17211D] hover:text-[#831843] transition-colors line-clamp-1">
                              {product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={product.rating} />
                              <span className="text-xs text-[#6B756F]">
                                {product.inStock ? `${product.stock ?? product.stockCount ?? 0} in stock` : 'Sold out'}
                              </span>
                            </div>
                            <p className="font-display font-bold text-[#17211D] mt-1">{formatMoney(product.price)}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => moveToCart(product)}
                              disabled={!product.inStock}
                              className="px-4 py-2 bg-[#831843] text-white rounded-xl text-xs font-semibold hover:bg-[#9F1239] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => toggleWishlist(product)}
                              className="px-4 py-2 bg-gray-100 text-[#6B756F] rounded-xl text-xs font-medium hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-display font-bold text-2xl text-[#17211D]">Saved Addresses</h2>
                      <p className="text-sm text-[#6B756F] mt-1">Manage your delivery addresses.</p>
                    </div>
                    <button
                      onClick={() => openAddressForm()}
                      className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors"
                    >
                      + Add address
                    </button>
                  </div>

                  {addressForm && (
                    <form onSubmit={handleAddressSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-semibold text-[#17211D]">
                          {addressForm.id ? 'Edit address' : 'New address'}
                        </h3>
                        <button type="button" onClick={() => setAddressForm(null)} className="text-xs text-[#6B756F] hover:text-[#17211D]">
                          Cancel
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <input
                          value={addressForm.name}
                          onChange={event => setAddressForm(previous => ({ ...previous, name: event.target.value }))}
                          placeholder="Full name"
                          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                        <input
                          value={addressForm.phone}
                          onChange={event => setAddressForm(previous => ({ ...previous, phone: event.target.value }))}
                          placeholder="Phone number"
                          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                        <input
                          value={addressForm.addressLine}
                          onChange={event => setAddressForm(previous => ({ ...previous, addressLine: event.target.value }))}
                          placeholder="Street address"
                          className="sm:col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                        <input
                          value={addressForm.city}
                          onChange={event => setAddressForm(previous => ({ ...previous, city: event.target.value }))}
                          placeholder="City"
                          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                        <input
                          value={addressForm.postalCode}
                          onChange={event => setAddressForm(previous => ({ ...previous, postalCode: event.target.value }))}
                          placeholder="Postal code"
                          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                        <label className="flex items-center gap-2 text-sm text-[#6B756F]">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={event => setAddressForm(previous => ({ ...previous, isDefault: event.target.checked }))}
                            className="w-4 h-4 accent-[#831843]"
                          />
                          Use as default address
                        </label>
                        <button
                          type="submit"
                          disabled={addressSaving}
                          className="px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
                        >
                          {addressSaving ? 'Saving...' : 'Save address'}
                        </button>
                      </div>
                    </form>
                  )}

                  {addressesLoading ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="skeleton h-40 rounded-2xl" />
                      ))}
                    </div>
                  ) : addressError ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                      <div className="text-4xl mb-3">⚠️</div>
                      <p className="text-[#6B756F] mb-4">{addressError}</p>
                      <button onClick={loadAddresses} className="px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                        Try Again
                      </button>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <div className="text-5xl mb-3">📍</div>
                      <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">No saved addresses</h3>
                      <p className="text-sm text-[#6B756F] mb-5">Add an address to speed up checkout.</p>
                      <button onClick={() => openAddressForm()} className="px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                        Add your first address
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map(address => (
                        <div key={address.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[#17211D]">{address.name}</p>
                              <p className="text-xs text-[#6B756F]">{address.phone}</p>
                            </div>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-[#9F1239]/10 text-[#9F1239] text-xs font-semibold rounded-full shrink-0">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#6B756F] mt-3 leading-relaxed">
                            {address.addressLine}<br />
                            {address.city} {address.postalCode}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-4">
                            <button
                              onClick={() => openAddressForm(address)}
                              className="px-3 py-1.5 bg-gray-50 text-[#17211D] rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                            >
                              Edit
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={async () => {
                                  try {
                                    await updateAddress(address.id, { isDefault: true });
                                    showToast('Default address updated.', 'success');
                                    await loadAddresses();
                                  } catch (error) {
                                    showToast(error.message || 'Unable to update the address.', 'error');
                                  }
                                }}
                                className="px-3 py-1.5 bg-gray-50 text-[#17211D] rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                              >
                                Set default
                              </button>
                            )}
                            <button
                              onClick={() => handleAddressDelete(address)}
                              disabled={addressDeleting === address.id}
                              className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                              {addressDeleting === address.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'settings' && (
                <div>
                  <div className="mb-6">
                    <h2 className="font-display font-bold text-2xl text-[#17211D]">Settings</h2>
                    <p className="text-sm text-[#6B756F] mt-1">Change the password for your account.</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={event => setPasswordForm(previous => ({ ...previous, currentPassword: event.target.value }))}
                        required
                        autoComplete="current-password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={event => setPasswordForm(previous => ({ ...previous, newPassword: event.target.value }))}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={event => setPasswordForm(previous => ({ ...previous, confirmPassword: event.target.value }))}
                        required
                        autoComplete="new-password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                      />
                    </div>

                    {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

                    <p className="text-xs text-[#6B756F]">
                      Passwords must be at least 8 characters. Other devices will be signed out after the change.
                    </p>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-6 py-3 bg-[#831843] text-white rounded-xl font-semibold text-sm hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
                    >
                      {passwordSaving ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}

            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

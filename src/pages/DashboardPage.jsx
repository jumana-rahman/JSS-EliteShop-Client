import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { listOrders, downloadInvoice } from '../services/orders';
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
  const { user, isLoggedIn, logout, wishlist, showToast } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const routeSection = pathname.split('/')[2] || 'overview';

  const [activeSection, setActiveSection] = useState(routeSection);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [invoiceBusy, setInvoiceBusy] = useState('');

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

  const goToSection = (id) => {
    setActiveSection(id);
    navigate(id === 'overview' ? '/dashboard' : `/dashboard/${id}`);
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
            {sidebarItems.slice(0, 4).map(item => (
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

              {activeSection === 'profile' && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-[#17211D] mb-6">My Profile</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-[#831843]/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#831843] font-display">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-display font-bold text-xl text-[#17211D]">{user?.name}</p>
                        <p className="text-sm text-[#6B756F]">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#BE185D]/15 text-[#BE185D] text-xs font-semibold rounded-full mt-1">
                          ✨ Elite Member
                        </span>
                      </div>
                    </div>

                    {[
                      { label: 'Full Name', value: user?.name || '' },
                      { label: 'Email Address', value: user?.email || '' },
                      { label: 'Phone', value: user?.phone || '+1 (555) 000-0000' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">{field.label}</label>
                        <input defaultValue={field.value} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors" />
                      </div>
                    ))}

                    <button className="px-6 py-3 bg-[#831843] text-white rounded-xl font-semibold text-sm hover:bg-[#9F1239] transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {['wishlist', 'reviews', 'addresses', 'settings'].includes(activeSection) && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-[#17211D] mb-6 capitalize">{activeSection}</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="text-4xl mb-3">🚧</div>
                    <p className="text-[#6B756F]">This section is coming soon.</p>
                    {activeSection === 'wishlist' && (
                      <Link to="/wishlist" className="mt-4 inline-block text-[#831843] font-medium text-sm hover:underline">Go to Wishlist →</Link>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

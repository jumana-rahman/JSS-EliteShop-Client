import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { products } from '../data/products';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'orders', label: 'My Orders', icon: '📦' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
  { id: 'addresses', label: 'Addresses', icon: '📍' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const mockOrders = [
  { id: 'JSS-219834', date: 'Sep 15, 2026', status: 'Delivered', total: 558, items: [products[0], products[2]] },
  { id: 'JSS-219105', date: 'Sep 8, 2026', status: 'Shipped', total: 1099, items: [products[1]] },
  { id: 'JSS-218743', date: 'Aug 28, 2026', status: 'Processing', total: 312, items: [products[3], products[7]] },
];

const statusColors = {
  Delivered: 'bg-[#9F1239]/10 text-[#9F1239]',
  Shipped: 'bg-[#BE185D]/10 text-[#BE185D]',
  Processing: 'bg-[#E14E8B]/10 text-[#E14E8B]',
  Cancelled: 'bg-red-50 text-red-600',
};

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoggedIn, logout, wishlist } = useApp();
  const navigate = useNavigate();

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
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display font-bold text-[#17211D] text-sm">{user?.name}</p>
                    <p className="text-xs text-[#6B756F]">{user?.email}</p>
                  </div>
                </div>
              </div>
              <nav className="p-2">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
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

          {/* Content */}
          <main className="flex-1 min-w-0">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

              {activeSection === 'overview' && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-2xl text-[#17211D]">Welcome back, {user?.name.split(' ')[0]}! 👋</h2>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Orders', value: mockOrders.length, icon: '📦', color: 'bg-[#831843]/8 text-[#831843]' },
                      { label: 'Pending', value: 1, icon: '⏳', color: 'bg-[#E14E8B]/10 text-[#E14E8B]' },
                      { label: 'Completed', value: 1, icon: '✅', color: 'bg-[#9F1239]/10 text-[#9F1239]' },
                      { label: 'Wishlist', value: wishlist.length, icon: '❤️', color: 'bg-red-50 text-red-600' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-lg mb-3`}>{stat.icon}</div>
                        <p className="font-display font-bold text-2xl text-[#17211D]">{stat.value}</p>
                        <p className="text-xs text-[#6B756F]">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <h3 className="font-display font-bold text-[#17211D]">Recent Orders</h3>
                      <button onClick={() => setActiveSection('orders')} className="text-xs text-[#9F1239] font-medium hover:underline">View all</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {mockOrders.slice(0, 3).map(order => (
                        <div key={order.id} className="px-6 py-4 flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 2).map(p => (
                              <img key={p.id} src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border-2 border-white" />
                            ))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[#17211D]">{order.id}</p>
                            <p className="text-xs text-[#6B756F]">{order.date}</p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                          <p className="font-bold text-[#17211D] text-sm">${order.total}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'orders' && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-[#17211D] mb-6">My Orders</h2>
                  <div className="space-y-4">
                    {mockOrders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                          <div>
                            <p className="font-bold text-[#17211D] text-sm">{order.id}</p>
                            <p className="text-xs text-[#6B756F]">{order.date} · {order.items.length} items</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                            <p className="font-bold text-[#17211D]">${order.total}</p>
                          </div>
                        </div>
                        <div className="px-6 py-4 flex gap-4 overflow-x-auto">
                          {order.items.map(p => (
                            <div key={p.id} className="flex items-center gap-3 shrink-0">
                              <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg bg-gray-50" />
                              <p className="text-sm text-[#17211D] line-clamp-2 max-w-40">{p.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'profile' && (
                <div>
                  <h2 className="font-display font-bold text-2xl text-[#17211D] mb-6">My Profile</h2>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-[#831843]/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#831843] font-display">
                        {user?.name.charAt(0)}
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
                      { label: 'Phone', value: '+1 (555) 000-0000' },
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
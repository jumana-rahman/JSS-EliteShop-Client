import { useState } from 'react';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';

const adminSections = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'products', label: 'Products', icon: '🛍️' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
];

const mockOrdersAdmin = [
  { id: 'JSS-219834', customer: 'Sarah M.', amount: 558, status: 'Delivered', date: 'Sep 15, 2026' },
  { id: 'JSS-219105', customer: 'James K.', amount: 1099, status: 'Shipped', date: 'Sep 8, 2026' },
  { id: 'JSS-218743', customer: 'Priya R.', amount: 312, status: 'Processing', date: 'Aug 28, 2026' },
  { id: 'JSS-218290', customer: 'Alex T.', amount: 89, status: 'Delivered', date: 'Aug 20, 2026' },
];

const statusColors = {
  Delivered: 'bg-[#9F1239]/10 text-[#9F1239]',
  Shipped: 'bg-[#BE185D]/10 text-[#BE185D]',
  Processing: 'bg-[#E14E8B]/10 text-[#E14E8B]',
};

export default function AdminPage() {
  const [section, setSection] = useState('dashboard');
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-3">Admin Access Required</h2>
          <Link to="/login" className="px-6 py-3 bg-[#831843] text-white rounded-xl font-semibold inline-block hover:bg-[#9F1239] transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-[#17211D] min-h-[calc(100vh-64px)] p-4 hidden lg:block sticky top-16">
          <div className="mb-6">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
          </div>
          <nav className="space-y-1">
            {adminSections.map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === item.id
                    ? 'bg-[#831843] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden w-full overflow-x-auto bg-[#17211D] flex gap-1 p-2">
          {adminSections.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                section === item.id ? 'bg-[#831843] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-8 min-w-0">
          <motion.div key={section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {section === 'dashboard' && (
              <div className="space-y-6">
                <h1 className="font-display font-bold text-2xl text-[#17211D]">Admin Dashboard</h1>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Revenue', value: '$48,392', change: '+12%', icon: '💰', green: true },
                    { label: 'Total Orders', value: '1,847', change: '+8%', icon: '📦', green: true },
                    { label: 'Total Users', value: '12,403', change: '+23%', icon: '👥', green: true },
                    { label: 'Products', value: String(products.length), change: '+2', icon: '🛍️', green: true },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.green ? 'bg-[#9F1239]/10 text-[#9F1239]' : 'bg-red-50 text-red-600'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="font-display font-bold text-2xl text-[#17211D]">{stat.value}</p>
                      <p className="text-xs text-[#6B756F]">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-display font-bold text-[#17211D]">Recent Orders</h3>
                    <button onClick={() => setSection('orders')} className="text-xs text-[#9F1239] font-medium">View all</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                            <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[#6B756F] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {mockOrdersAdmin.map(o => (
                          <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-[#17211D]">{o.id}</td>
                            <td className="px-6 py-4 text-[#6B756F]">{o.customer}</td>
                            <td className="px-6 py-4 font-bold text-[#17211D]">${o.amount}</td>
                            <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[o.status]}`}>{o.status}</span></td>
                            <td className="px-6 py-4 text-[#6B756F]">{o.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-display font-bold text-[#17211D]">⚠️ Low Stock Alert</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {products.filter(p => p.stockCount < 15 && p.inStock).slice(0, 4).map(p => (
                      <div key={p.id} className="px-6 py-3 flex items-center gap-4">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#17211D] truncate">{p.name}</p>
                          <p className="text-xs text-[#6B756F]">{p.category}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full">
                          {p.stockCount} left
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="font-display font-bold text-2xl text-[#17211D]">Products</h1>
                  <button className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors flex items-center gap-2">
                    <span>+</span> Add Product
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#6B756F] uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50 shrink-0" />
                                <p className="font-medium text-[#17211D] line-clamp-1 max-w-48">{p.name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-[#6B756F]">{p.category}</td>
                            <td className="px-5 py-3 font-bold text-[#17211D]">${p.price}</td>
                            <td className="px-5 py-3">
                              <span className={p.stockCount < 15 ? 'text-orange-600 font-semibold' : 'text-[#17211D]'}>{p.stockCount}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${p.inStock ? 'bg-[#9F1239]/10 text-[#9F1239]' : 'bg-red-50 text-red-600'}`}>
                                {p.inStock ? 'Active' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-[#831843]/8 text-[#831843] rounded-lg text-xs font-medium hover:bg-[#831843]/15 transition-colors">Edit</button>
                                <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {(section === 'orders' || section === 'users' || section === 'reviews') && (
              <div>
                <h1 className="font-display font-bold text-2xl text-[#17211D] mb-6 capitalize">{section}</h1>
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <div className="text-4xl mb-3">🚧</div>
                  <p className="text-[#6B756F]">Full {section} management panel coming soon.</p>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
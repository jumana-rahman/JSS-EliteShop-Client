import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  listProducts,
  deleteProduct,
  bulkUpdateStock,
  getAdminStats,
} from '../services/products';
import {
  listCategories,
  deleteCategory,
  deleteSubcategory,
} from '../services/categories';
import ProductFormModal from '../components/admin/ProductFormModal';
import CategoryFormModal from '../components/admin/CategoryFormModal';
import SubcategoryFormModal from '../components/admin/SubcategoryFormModal';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import OrderTimeline, { formatShortDate } from '../components/OrderTimeline';
import {
  listAdminOrders,
  getAdminOrder,
  updateAdminOrder,
} from '../services/adminOrders';
import { downloadInvoice } from '../services/orders';

const ORDER_STATUSES = ['Placed', 'Payment Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];
const DELIVERY_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const adminSections = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'products', label: 'Products', icon: '🛍️' },
  { id: 'categories', label: 'Categories', icon: '🗂️' },
  { id: 'inventory', label: 'Inventory', icon: '📦' },
  { id: 'orders', label: 'Orders', icon: '🧾' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'reviews', label: 'Reviews', icon: '⭐' },
];

export default function AdminPage() {
  const { isLoggedIn, showToast } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const section = pathname.split('/')[2] || 'dashboard';

  const goToSection = (id) => {
    navigate(id === 'dashboard' ? '/admin' : `/admin/${id}`);
  };

  const [stats, setStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [lowStock, setLowStock] = useState([]);
  const [statsVersion, setStatsVersion] = useState(0);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryVersion, setCategoryVersion] = useState(0);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productVersion, setProductVersion] = useState(0);
  const [productSearch, setProductSearch] = useState('');

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryVersion, setInventoryVersion] = useState(0);
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [stockDrafts, setStockDrafts] = useState({});
  const [savingStock, setSavingStock] = useState(false);

  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [subcategoryModal, setSubcategoryModal] = useState({ open: false, category: null, subcategory: null });
  const [confirmState, setConfirmState] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      setCategoriesLoading(true);

      try {
        const data = await listCategories();
        if (active) setCategories(data.categories || []);
      } catch (error) {
        if (active) showToast(error.message || 'Unable to load categories.', 'error');
      } finally {
        if (active) setCategoriesLoading(false);
      }
    })();

    return () => { active = false; };
  }, [categoryVersion]);

  useEffect(() => {
    if (section !== 'dashboard') return undefined;

    let active = true;

    (async () => {
      setDashboardLoading(true);

      try {
        const [statsData, lowStockData] = await Promise.all([
          getAdminStats(),
          listProducts({ stockStatus: 'low', limit: 5, sort: 'stock-low' }),
        ]);

        if (!active) return;

        setStats(statsData.stats);
        setLowStock(lowStockData.products || []);
      } catch (error) {
        if (active) showToast(error.message || 'Unable to load the dashboard.', 'error');
      } finally {
        if (active) setDashboardLoading(false);
      }
    })();

    return () => { active = false; };
  }, [section, statsVersion]);

  useEffect(() => {
    if (section !== 'products') return undefined;

    let active = true;
    const timer = setTimeout(async () => {
      setProductsLoading(true);

      try {
        const data = await listProducts({
          search: productSearch || undefined,
          limit: 100,
          sort: 'newest',
        });

        if (active) setProducts(data.products || []);
      } catch (error) {
        if (active) showToast(error.message || 'Unable to load products.', 'error');
      } finally {
        if (active) setProductsLoading(false);
      }
    }, productSearch ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [section, productVersion, productSearch]);

  useEffect(() => {
    if (section !== 'inventory') return undefined;

    let active = true;

    (async () => {
      setInventoryLoading(true);

      try {
        const data = await listProducts({
          limit: 100,
          sort: 'stock-low',
          stockStatus: inventoryFilter !== 'all' ? inventoryFilter : undefined,
        });

        if (!active) return;

        const list = data.products || [];
        setInventory(list);
        setStockDrafts(Object.fromEntries(list.map(product => [product.id, String(product.stockCount)])));
      } catch (error) {
        if (active) showToast(error.message || 'Unable to load inventory.', 'error');
      } finally {
        if (active) setInventoryLoading(false);
      }
    })();

    return () => { active = false; };
  }, [section, inventoryVersion, inventoryFilter]);

  const refreshProducts = () => {
    setProductVersion(version => version + 1);
    setInventoryVersion(version => version + 1);
    setStatsVersion(version => version + 1);
  };

  const refreshCategories = () => {
    setCategoryVersion(version => version + 1);
    setProductVersion(version => version + 1);
    setInventoryVersion(version => version + 1);
    setStatsVersion(version => version + 1);
  };

  const stockChanges = inventory
    .map(product => ({ product, draft: stockDrafts[product.id] }))
    .filter(({ product, draft }) => draft !== undefined && draft !== '' && Number(draft) !== product.stockCount)
    .map(({ product, draft }) => ({ id: product.id, stock: Number(draft) }));

  const stockInvalid = inventory.some(product => {
    const draft = stockDrafts[product.id];
    if (draft === undefined || draft === '') return false;
    const value = Number(draft);
    return !Number.isInteger(value) || value < 0;
  });

  const saveStock = async () => {
    if (stockInvalid) {
      showToast('Stock values must be whole numbers of 0 or more.', 'error');
      return;
    }

    if (stockChanges.length === 0) {
      showToast('No stock changes to save.', 'info');
      return;
    }

    setSavingStock(true);

    try {
      const data = await bulkUpdateStock(stockChanges);
      showToast(`Stock updated for ${data.updated} product${data.updated === 1 ? '' : 's'}.`, 'success');
      refreshProducts();
    } catch (error) {
      showToast(error.message || 'Unable to update stock.', 'error');
    } finally {
      setSavingStock(false);
    }
  };

  const handleProductSaved = () => {
    const wasEditing = Boolean(productModal.product);
    setProductModal({ open: false, product: null });
    refreshProducts();
    showToast(wasEditing ? 'Product updated.' : 'Product created.', 'success');
  };

  const handleCategorySaved = () => {
    const wasEditing = Boolean(categoryModal.category);
    setCategoryModal({ open: false, category: null });
    refreshCategories();
    showToast(wasEditing ? 'Category updated.' : 'Category created.', 'success');
  };

  const handleSubcategorySaved = () => {
    const wasEditing = Boolean(subcategoryModal.subcategory);
    setSubcategoryModal({ open: false, category: null, subcategory: null });
    refreshCategories();
    showToast(wasEditing ? 'Subcategory updated.' : 'Subcategory created.', 'success');
  };

  const requestDeleteProduct = (product) => {
    setConfirmState({
      type: 'product',
      title: 'Delete product?',
      message: `"${product.name}" will be permanently removed from your catalog.`,
      target: product,
    });
  };

  const requestDeleteCategory = (category) => {
    setConfirmState({
      type: 'category',
      title: 'Delete category?',
      message: `Delete "${category.name}" and its subcategories? Products in this category must be moved or deleted first.`,
      target: category,
    });
  };

  const requestDeleteSubcategory = (category, subcategory) => {
    setConfirmState({
      type: 'subcategory',
      title: 'Delete subcategory?',
      message: `Delete "${subcategory.name}" from ${category.name}? Products using it must be moved or deleted first.`,
      target: { category, subcategory },
    });
  };

  const handleConfirm = async () => {
    if (!confirmState) return;

    setConfirmBusy(true);

    try {
      if (confirmState.type === 'product') {
        await deleteProduct(confirmState.target.id);
        showToast('Product deleted.', 'success');
        refreshProducts();
      } else if (confirmState.type === 'category') {
        await deleteCategory(confirmState.target.id);
        showToast('Category deleted.', 'success');
        refreshCategories();
      } else if (confirmState.type === 'subcategory') {
        await deleteSubcategory(confirmState.target.category.id, confirmState.target.subcategory.id);
        showToast('Subcategory deleted.', 'success');
        refreshCategories();
      }

      setConfirmState(null);
    } catch (error) {
      showToast(error.message || 'Unable to delete. Please try again.', 'error');
    } finally {
      setConfirmBusy(false);
    }
  };

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
      <div className="flex flex-col lg:flex-row">
        <aside className="w-56 shrink-0 bg-[#17211D] min-h-[calc(100vh-64px)] p-4 hidden lg:block sticky top-16 self-start">
          <div className="mb-6">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
          </div>
          <nav className="space-y-1">
            {adminSections.map(item => (
              <Link
                key={item.id}
                to={item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  section === item.id
                    ? 'bg-[#831843] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="lg:hidden w-full overflow-x-auto bg-[#17211D] flex gap-1 p-2">
          {adminSections.map(item => (
            <Link
              key={item.id}
              to={item.id === 'dashboard' ? '/admin' : `/admin/${item.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                section === item.id ? 'bg-[#831843] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <motion.div key={section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {section === 'dashboard' && (
              <DashboardSection
                stats={stats}
                loading={dashboardLoading}
                lowStock={lowStock}
                onRefresh={() => setStatsVersion(version => version + 1)}
                onManageInventory={() => goToSection('inventory')}
                onManageOrders={() => goToSection('orders')}
              />
            )}

            {section === 'products' && (
              <ProductsSection
                products={products}
                loading={productsLoading}
                search={productSearch}
                onSearch={setProductSearch}
                categories={categories}
                categoriesLoading={categoriesLoading}
                onAdd={() => setProductModal({ open: true, product: null })}
                onEdit={product => setProductModal({ open: true, product })}
                onDelete={requestDeleteProduct}
                onGoToCategories={() => goToSection('categories')}
              />
            )}

            {section === 'categories' && (
              <CategoriesSection
                categories={categories}
                loading={categoriesLoading}
                onAdd={() => setCategoryModal({ open: true, category: null })}
                onEdit={category => setCategoryModal({ open: true, category })}
                onDelete={requestDeleteCategory}
                onAddSubcategory={category => setSubcategoryModal({ open: true, category, subcategory: null })}
                onEditSubcategory={(category, subcategory) => setSubcategoryModal({ open: true, category, subcategory })}
                onDeleteSubcategory={requestDeleteSubcategory}
              />
            )}

            {section === 'inventory' && (
              <InventorySection
                products={inventory}
                loading={inventoryLoading}
                drafts={stockDrafts}
                changesCount={stockChanges.length}
                filter={inventoryFilter}
                saving={savingStock}
                onFilterChange={setInventoryFilter}
                onDraftChange={(id, value) => setStockDrafts(prev => ({ ...prev, [id]: value }))}
                onSave={saveStock}
                onRefresh={() => setInventoryVersion(version => version + 1)}
              />
            )}

            {section === 'orders' && <OrdersSection />}

            {['users', 'reviews'].includes(section) && (
              <PlaceholderSection section={section} />
            )}
          </motion.div>
        </main>
      </div>

      <ProductFormModal
        open={productModal.open}
        product={productModal.product}
        categories={categories}
        onClose={() => setProductModal({ open: false, product: null })}
        onSaved={handleProductSaved}
      />

      <CategoryFormModal
        open={categoryModal.open}
        category={categoryModal.category}
        onClose={() => setCategoryModal({ open: false, category: null })}
        onSaved={handleCategorySaved}
      />

      <SubcategoryFormModal
        open={subcategoryModal.open}
        category={subcategoryModal.category}
        subcategory={subcategoryModal.subcategory}
        onClose={() => setSubcategoryModal({ open: false, category: null, subcategory: null })}
        onSaved={handleSubcategorySaved}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel="Delete"
        busy={confirmBusy}
        onConfirm={handleConfirm}
        onClose={() => setConfirmState(null)}
      />
    </div>
  );
}

function DashboardSection({ stats, loading, lowStock, onRefresh, onManageInventory, onManageOrders }) {
  const primaryCards = [
    { label: 'Total Products', value: stats?.totalProducts, icon: '🛍️', hint: 'In catalog' },
    { label: 'Categories', value: stats?.totalCategories, icon: '🗂️', hint: `${stats?.totalSubcategories ?? 0} subcategories` },
    { label: 'Low Stock', value: stats?.lowStock, icon: '⚠️', hint: 'Under 10 units', tone: 'warning' },
    { label: 'Out of Stock', value: stats?.outOfStock, icon: '🚫', hint: 'Needs restocking', tone: 'danger' },
  ];

  const secondaryCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: '👥' },
    { label: 'Total Orders', value: stats?.totalOrders, icon: '🧾' },
    { label: 'Pending Orders', value: stats?.pendingOrders, icon: '⏳' },
    { label: 'Revenue', value: stats ? formatMoney(stats.totalRevenue) : undefined, icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#17211D]">Admin Dashboard</h1>
          <p className="text-sm text-[#6B756F] mt-1">A quick look at your catalog, users and inventory.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#17211D] hover:bg-gray-50 disabled:opacity-50 transition-colors self-start"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && !stats ? (
        <SkeletonCards />
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryCards.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryCards.map(card => (
              <StatCard key={card.label} {...card} compact />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-[#6B756F] mb-4">Dashboard data could not be loaded.</p>
          <button onClick={onRefresh} className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
            Try Again
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-[#17211D]">⚠️ Low Stock Alert</h3>
          <button onClick={onManageInventory} className="text-xs text-[#9F1239] font-medium hover:underline">
            Manage inventory
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : lowStock.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-[#6B756F]">No low-stock products right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {lowStock.map(product => (
              <div key={product.id} className="px-6 py-3 flex items-center gap-4">
                <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#17211D] truncate">{product.name}</p>
                  <p className="text-xs text-[#6B756F]">{product.category}</p>
                </div>
                <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-full">
                  {product.stockCount} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#831843]/8 flex items-center justify-center text-lg">🧾</div>
            <div>
              <h3 className="font-display font-bold text-[#17211D]">Orders</h3>
              <p className="text-sm text-[#6B756F] mt-1">
                Review orders, update delivery status, add notes and download invoices.
              </p>
            </div>
          </div>
          <button onClick={onManageOrders} className="text-sm font-semibold text-[#831843] hover:underline self-start sm:self-center shrink-0">
            Manage orders →
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsSection({ products, loading, search, onSearch, categories, categoriesLoading, onAdd, onEdit, onDelete, onGoToCategories }) {
  const hasCategories = categories.length > 0;
  const canAdd = hasCategories && !categoriesLoading;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#17211D]">Products</h1>
          <p className="text-sm text-[#6B756F] mt-1">
            {loading ? 'Loading products...' : `${products.length} product${products.length === 1 ? '' : 's'}${search ? ' matching your search' : ''}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={search}
            onChange={event => onSearch(event.target.value)}
            placeholder="Search products..."
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          />
          <button
            onClick={onAdd}
            disabled={!canAdd}
            title={categoriesLoading ? 'Loading categories...' : !hasCategories ? 'Create a category first' : undefined}
            className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <span>+</span> Add Product
          </button>
        </div>
      </div>

      {!categoriesLoading && !hasCategories && (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-[#831843]/5 border border-[#831843]/10 rounded-2xl">
          <p className="text-sm text-[#17211D]">
            You need at least one category before adding products.
          </p>
          <button onClick={onGoToCategories} className="text-sm font-semibold text-[#831843] hover:underline self-start">
            Create a category →
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(header => (
                  <th key={header} className="text-left px-5 py-3 text-xs font-semibold text-[#6B756F] uppercase tracking-wide">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={6} className="px-5 py-3">
                      <div className="skeleton h-10 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="text-4xl mb-3">🛍️</div>
                    <p className="font-display font-semibold text-[#17211D]">
                      {search ? 'No products match your search' : 'No products yet'}
                    </p>
                    <p className="text-sm text-[#6B756F] mt-1">
                      {search ? 'Try a different search term.' : hasCategories ? 'Add your first product to get started.' : 'Create a category first.'}
                    </p>
                    {!search && canAdd && (
                      <button onClick={onAdd} className="mt-4 px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
                        + Add Product
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-[#17211D] line-clamp-1 max-w-56">{product.name}</p>
                          {product.brand && <p className="text-xs text-[#6B756F]">{product.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#6B756F]">
                      <p>{product.category}</p>
                      {product.subcategory && <p className="text-xs text-[#6B756F]/80">{product.subcategory}</p>}
                    </td>
                    <td className="px-5 py-3 font-bold text-[#17211D]">
                      ${Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={product.stockCount === 0 ? 'text-red-600 font-semibold' : product.stockCount < 10 ? 'text-orange-600 font-semibold' : 'text-[#17211D]'}>
                        {product.stockCount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${product.inStock ? 'bg-[#9F1239]/10 text-[#9F1239]' : 'bg-red-50 text-red-600'}`}>
                        {product.inStock ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(product)} className="px-3 py-1.5 bg-[#831843]/8 text-[#831843] rounded-lg text-xs font-medium hover:bg-[#831843]/15 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => onDelete(product)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CategoriesSection({ categories, loading, onAdd, onEdit, onDelete, onAddSubcategory, onEditSubcategory, onDeleteSubcategory }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#17211D]">Categories</h1>
          <p className="text-sm text-[#6B756F] mt-1">
            Organize products into categories and subcategories.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors flex items-center justify-center gap-2 self-start"
        >
          <span>+</span> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">No categories yet</h3>
          <p className="text-sm text-[#6B756F] mb-5">Create your first category to start building your catalog.</p>
          <button onClick={onAdd} className="px-5 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] transition-colors">
            + Add Category
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: category.color || '#831843' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[#17211D] truncate">{category.name}</p>
                  <p className="text-xs text-[#6B756F] truncate">/{category.slug}</p>
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-[#6B756F] mt-3 line-clamp-2">{category.description}</p>
              )}

              <div className="mt-4 flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide">Subcategories</p>
                  <button onClick={() => onAddSubcategory(category)} className="text-xs font-semibold text-[#831843] hover:underline">
                    + Add
                  </button>
                </div>

                {category.subcategories?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map(subcategory => (
                      <span key={subcategory.id} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full bg-[#FAFAF7] border border-gray-200 text-xs text-[#17211D]">
                        {subcategory.name}
                        <button
                          onClick={() => onEditSubcategory(category, subcategory)}
                          className="p-1 rounded-full hover:bg-gray-200 text-[#6B756F] transition-colors"
                          aria-label={`Edit ${subcategory.name}`}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => onDeleteSubcategory(category, subcategory)}
                          className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                          aria-label={`Delete ${subcategory.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B756F]">No subcategories yet.</p>
                )}
              </div>

              <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                <button onClick={() => onEdit(category)} className="px-3 py-1.5 bg-[#831843]/8 text-[#831843] rounded-lg text-xs font-medium hover:bg-[#831843]/15 transition-colors">
                  Edit
                </button>
                <button onClick={() => onDelete(category)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InventorySection({ products, loading, drafts, changesCount, filter, saving, onFilterChange, onDraftChange, onSave, onRefresh }) {
  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#17211D]">Inventory</h1>
          <p className="text-sm text-[#6B756F] mt-1">
            {loading ? 'Loading inventory...' : `${products.length} product${products.length === 1 ? '' : 's'} shown${changesCount > 0 ? ` · ${changesCount} unsaved change${changesCount === 1 ? '' : 's'}` : ''}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={event => onFilterChange(event.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          >
            <option value="all">All stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#17211D] hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={onSave}
            disabled={saving || changesCount === 0}
            className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Product', 'Category', 'Current Stock', 'New Stock', 'Status'].map(header => (
                  <th key={header} className="text-left px-5 py-3 text-xs font-semibold text-[#6B756F] uppercase tracking-wide">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={5} className="px-5 py-3">
                      <div className="skeleton h-10 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-display font-semibold text-[#17211D]">No products found</p>
                    <p className="text-sm text-[#6B756F] mt-1">
                      {filter === 'all' ? 'Add products to start tracking inventory.' : 'No products match this stock filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                products.map(product => {
                  const draft = drafts[product.id] ?? '';
                  const nextStock = draft === '' ? product.stockCount : Number(draft);
                  const dirty = draft !== '' && Number(draft) !== product.stockCount;

                  return (
                    <tr key={product.id} className={dirty ? 'bg-[#831843]/5' : 'hover:bg-gray-50 transition-colors'}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg bg-gray-50 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-[#17211D] line-clamp-1 max-w-56">{product.name}</p>
                            <p className="text-xs text-[#6B756F]">{product.brand || product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#6B756F]">{product.category}</td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${product.stockCount === 0 ? 'text-red-600' : product.stockCount < 10 ? 'text-orange-600' : 'text-[#17211D]'}`}>
                          {product.stockCount}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={draft}
                          onChange={event => onDraftChange(product.id, event.target.value)}
                          className={`w-24 px-3 py-2 rounded-lg border text-sm text-[#17211D] outline-none ${dirty ? 'border-[#831843]/40 bg-white' : 'border-gray-200 bg-white focus:border-[#831843]/40'}`}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          nextStock === 0
                            ? 'bg-red-50 text-red-600'
                            : nextStock < 10
                              ? 'bg-orange-50 text-orange-700'
                              : 'bg-[#9F1239]/10 text-[#9F1239]'
                        }`}>
                          {nextStock === 0 ? 'Out of stock' : nextStock < 10 ? 'Low stock' : 'In stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && products.length > 0 && (
        <p className="text-xs text-[#6B756F] mt-3">
          Edit the new stock values and click Save All Changes. Products with stock below 10 are marked as low stock.
        </p>
      )}
    </div>
  );
}

function orderStatusClass(status) {
  switch (status) {
    case 'Delivered':
      return 'bg-[#9F1239]/10 text-[#9F1239]';
    case 'Shipped':
      return 'bg-blue-50 text-blue-600';
    case 'Processing':
      return 'bg-orange-50 text-orange-700';
    case 'Payment Confirmed':
      return 'bg-[#BE185D]/10 text-[#BE185D]';
    case 'Cancelled':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-[#831843]/8 text-[#831843]';
  }
}

function OrdersSection() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    deliveryStatus: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [form, setForm] = useState({ status: '', paymentStatus: '', deliveryStatus: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [invoiceBusy, setInvoiceBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await listAdminOrders({ ...filters, page, limit: 10 });
        if (!active) return;
        setOrders(data.orders || []);
        setMeta({ total: data.total || 0, pages: data.pages || 1 });
      } catch (error) {
        if (active) showToast(error.message || 'Unable to load orders.', 'error');
      } finally {
        if (active) setLoading(false);
      }
    }, filters.search ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters, page, version]);

  const updateFilter = (key, value) => {
    setFilters(previous => ({ ...previous, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', paymentStatus: '', deliveryStatus: '', search: '', dateFrom: '', dateTo: '' });
    setPage(1);
  };

  const openOrder = async (order) => {
    setDetailLoading(true);
    setDetail(order);
    setForm({
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      note: '',
    });

    try {
      const data = await getAdminOrder(order.id);
      setDetail(data.order);
      setForm({
        status: data.order.status,
        paymentStatus: data.order.paymentStatus,
        deliveryStatus: data.order.deliveryStatus,
        note: '',
      });
    } catch (error) {
      showToast(error.message || 'Unable to load the order.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setSaving(false);
  };

  const saveOrder = async () => {
    if (!detail) return;

    const payload = {};

    if (form.status !== detail.status) payload.status = form.status;
    if (form.paymentStatus !== detail.paymentStatus) payload.paymentStatus = form.paymentStatus;
    if (form.deliveryStatus !== detail.deliveryStatus) payload.deliveryStatus = form.deliveryStatus;
    if (form.note.trim()) payload.note = form.note.trim();

    if (!payload.status && !payload.paymentStatus && !payload.deliveryStatus) {
      showToast('Change the status, payment or delivery first.', 'info');
      return;
    }

    setSaving(true);

    try {
      const data = await updateAdminOrder(detail.id, payload);
      setDetail(data.order);
      setForm({
        status: data.order.status,
        paymentStatus: data.order.paymentStatus,
        deliveryStatus: data.order.deliveryStatus,
        note: '',
      });
      setVersion(value => value + 1);
      showToast('Order updated.', 'success');
    } catch (error) {
      showToast(error.message || 'Unable to update the order.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const downloadOrderInvoice = async () => {
    if (!detail) return;

    setInvoiceBusy(true);

    try {
      await downloadInvoice(detail.id || detail.orderNumber);
    } catch (error) {
      showToast(error.message || 'Could not download the invoice.', 'error');
    } finally {
      setInvoiceBusy(false);
    }
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#17211D]">Orders</h1>
          <p className="text-sm text-[#6B756F] mt-1">
            {loading ? 'Loading orders...' : `${meta.total} order${meta.total === 1 ? '' : 's'} found`}
          </p>
        </div>
        <button
          onClick={() => setVersion(value => value + 1)}
          disabled={loading}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#17211D] hover:bg-gray-50 disabled:opacity-50 transition-colors self-start"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
        <div className="grid sm:grid-cols-2 xl:grid-cols-6 gap-3">
          <input
            value={filters.search}
            onChange={event => updateFilter('search', event.target.value)}
            placeholder="Search order or customer..."
            className="xl:col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          />
          <select
            value={filters.status}
            onChange={event => updateFilter('status', event.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <select
            value={filters.paymentStatus}
            onChange={event => updateFilter('paymentStatus', event.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          >
            <option value="">All payments</option>
            {PAYMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <select
            value={filters.deliveryStatus}
            onChange={event => updateFilter('deliveryStatus', event.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          >
            <option value="">All deliveries</option>
            {DELIVERY_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={event => updateFilter('dateFrom', event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
              title="From date"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateTo}
              onChange={event => updateFilter('dateTo', event.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
              title="To date"
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#6B756F] hover:bg-gray-100 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order', 'Customer', 'Date', 'Total', 'Status', 'Payment', 'Delivery', ''].map(header => (
                  <th key={header} className="text-left px-5 py-3 text-xs font-semibold text-[#6B756F] uppercase tracking-wide whitespace-nowrap">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={8} className="px-5 py-3">
                      <div className="skeleton h-12 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="text-4xl mb-3">🧾</div>
                    <p className="font-display font-semibold text-[#17211D]">
                      {hasFilters ? 'No orders match these filters' : 'No orders yet'}
                    </p>
                    <p className="text-sm text-[#6B756F] mt-1">
                      {hasFilters ? 'Try clearing a filter or searching for a different order.' : 'Orders placed at checkout will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <button onClick={() => openOrder(order)} className="font-semibold text-[#831843] hover:underline">
                        {order.orderNumber}
                      </button>
                      <p className="text-xs text-[#6B756F]">{order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[#17211D]">{order.customer?.name || order.address?.name || '—'}</p>
                      <p className="text-xs text-[#6B756F]">{order.customer?.email || order.address?.phone || ''}</p>
                    </td>
                    <td className="px-5 py-3 text-[#6B756F] whitespace-nowrap">{formatShortDate(order.createdAt)}</td>
                    <td className="px-5 py-3 font-bold text-[#17211D] whitespace-nowrap">{formatMoney(order.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${orderStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 capitalize text-[#6B756F]">{order.paymentStatus}</td>
                    <td className="px-5 py-3 text-[#6B756F] whitespace-nowrap">{order.deliveryStatus}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => openOrder(order)} className="px-3 py-1.5 bg-[#831843]/8 text-[#831843] rounded-lg text-xs font-medium hover:bg-[#831843]/15 transition-colors whitespace-nowrap">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[#6B756F]">Page {page} of {meta.pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(value => Math.max(1, value - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-[#17211D] hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(value => Math.min(meta.pages, value + 1))}
              disabled={page >= meta.pages || loading}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-[#17211D] hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto" onClick={closeDetail}>
          <div
            className="bg-white rounded-2xl w-full max-w-3xl my-4 overflow-hidden"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-display font-bold text-lg text-[#17211D]">{detail.orderNumber}</p>
                <p className="text-xs text-[#6B756F]">
                  {formatShortDate(detail.createdAt)} · {detail.items.length} item{detail.items.length === 1 ? '' : 's'} · {formatMoney(detail.total)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadOrderInvoice}
                  disabled={invoiceBusy}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#17211D] hover:border-[#831843]/30 disabled:opacity-50 transition-colors"
                >
                  {invoiceBusy ? 'Preparing...' : 'Invoice'}
                </button>
                <button onClick={closeDetail} className="p-2 rounded-lg text-[#6B756F] hover:bg-gray-100 transition-colors" aria-label="Close">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {detailLoading && (
                <div className="skeleton h-20 rounded-xl" />
              )}

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1">Customer</p>
                  <p className="font-medium text-[#17211D]">{detail.customer?.name || detail.address?.name || '—'}</p>
                  {detail.customer?.email && <p className="text-[#6B756F]">{detail.customer.email}</p>}
                  {detail.customer?.phone && <p className="text-[#6B756F]">{detail.customer.phone}</p>}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1">Delivering to</p>
                  <p className="font-medium text-[#17211D]">{detail.address?.name} · {detail.address?.phone}</p>
                  <p className="text-[#6B756F]">
                    {detail.address?.addressLine}, {detail.address?.city} {detail.address?.postalCode}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-3">Tracking</p>
                <OrderTimeline order={detail} variant="horizontal" />
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-3">Items</p>
                <div className="space-y-2">
                  {detail.items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="flex items-center gap-3">
                      <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg bg-gray-50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#17211D] line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-[#6B756F]">Qty {item.quantity} × {formatMoney(item.unitPrice)}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#17211D]">{formatMoney(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
                  <div className="flex justify-between text-[#6B756F]"><span>Subtotal</span><span>{formatMoney(detail.subtotal)}</span></div>
                  <div className="flex justify-between text-[#6B756F]"><span>Shipping</span><span>{Number(detail.shipping) === 0 ? 'Free' : formatMoney(detail.shipping)}</span></div>
                  {Number(detail.discount) > 0 && (
                    <div className="flex justify-between text-[#9F1239]"><span>Discount</span><span>-{formatMoney(detail.discount)}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-[#17211D] pt-1"><span>Total</span><span>{formatMoney(detail.total)}</span></div>
                </div>
              </div>

              {detail.notes && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1">Customer note</p>
                  <p className="text-sm text-[#17211D] bg-[#FAFAF7] rounded-xl p-3">{detail.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-3">Status history</p>
                <div className="space-y-2">
                  {(detail.statusHistory || []).slice().reverse().map((entry, index) => (
                    <div key={`${entry.status}-${index}`} className="flex items-start gap-3 text-sm">
                      <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${entry.status === 'Cancelled' ? 'bg-red-500' : 'bg-[#831843]'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#17211D]">{entry.status}</p>
                        {entry.note && <p className="text-xs text-[#6B756F]">{entry.note}</p>}
                      </div>
                      <span className="text-xs text-[#6B756F] whitespace-nowrap">{formatShortDate(entry.changedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-3">Update order</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="block">
                    <span className="block text-xs text-[#6B756F] mb-1">Status</span>
                    <select
                      value={form.status}
                      onChange={event => setForm(previous => ({ ...previous, status: event.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
                    >
                      {ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[#6B756F] mb-1">Payment</span>
                    <select
                      value={form.paymentStatus}
                      onChange={event => setForm(previous => ({ ...previous, paymentStatus: event.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40 capitalize"
                    >
                      {PAYMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[#6B756F] mb-1">Delivery</span>
                    <select
                      value={form.deliveryStatus}
                      onChange={event => setForm(previous => ({ ...previous, deliveryStatus: event.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
                    >
                      {DELIVERY_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
                <input
                  value={form.note}
                  onChange={event => setForm(previous => ({ ...previous, note: event.target.value }))}
                  placeholder="Optional note for the status history..."
                  className="w-full mt-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={closeDetail}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#17211D] hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={saveOrder}
                    disabled={saving || detailLoading}
                    className="px-4 py-2.5 bg-[#831843] text-white rounded-xl text-sm font-semibold hover:bg-[#9F1239] disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceholderSection({ section }) {
  const titles = { orders: 'Orders', users: 'Users', reviews: 'Reviews' };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-[#17211D] mb-6">{titles[section]}</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <div className="text-4xl mb-3">🚧</div>
        <p className="text-[#6B756F]">Full {section} management is coming in a later phase.</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, hint, tone = 'default', compact = false }) {
  const toneClass = tone === 'danger' ? 'text-red-600' : tone === 'warning' ? 'text-orange-600' : 'text-[#17211D]';

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`rounded-xl bg-[#831843]/8 flex items-center justify-center ${compact ? 'w-9 h-9 text-lg' : 'w-10 h-10 text-xl'}`}>
          {icon}
        </span>
        {hint && <span className="text-xs text-[#6B756F] text-right">{hint}</span>}
      </div>
      <p className={`font-display font-bold ${compact ? 'text-xl' : 'text-2xl'} ${toneClass}`}>
        {value === undefined ? '—' : value}
      </p>
      <p className="text-xs text-[#6B756F] mt-0.5">{label}</p>
    </div>
  );
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="skeleton h-32 rounded-2xl" />
      ))}
    </div>
  );
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

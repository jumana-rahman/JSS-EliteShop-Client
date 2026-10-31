import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { listProducts } from '../services/products';
import { listCategories } from '../services/categories';

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'discount', label: 'Biggest Discount' },
];

const MAX_PRICE = 2000;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickView, setQuickView] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 0, brands: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || 'all';
  const activeSubcategory = searchParams.get('subcategory') || 'all';
  const activeBrand = searchParams.get('brand') || 'all';
  const sort = searchParams.get('sort') || 'popular';
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || MAX_PRICE);
  const minRating = Number(searchParams.get('rating') || 0);
  const minDiscount = Number(searchParams.get('discount') || 0);
  const inStockOnly = searchParams.get('inStock') === 'true';
  const page = Math.max(1, Number(searchParams.get('page') || 1));

  const selectedCategory = categories.find(c => c.slug === activeCategory || c.id === activeCategory);
  const subcategories = selectedCategory?.subcategories || [];

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await listCategories();
        if (active) setCategories(data.categories || []);
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setCategoriesLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const data = await listProducts({
          search: searchQuery || undefined,
          category: activeCategory !== 'all' ? activeCategory : undefined,
          subcategory: activeSubcategory !== 'all' ? activeSubcategory : undefined,
          brand: activeBrand !== 'all' ? activeBrand : undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < MAX_PRICE ? maxPrice : undefined,
          rating: minRating > 0 ? minRating : undefined,
          discount: minDiscount > 0 ? minDiscount : undefined,
          inStock: inStockOnly ? true : undefined,
          sort,
          page,
          limit: 12,
        });

        if (!active) return;

        setProducts(data.products || []);
        setMeta({
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.totalPages || 0,
          brands: data.brands || [],
        });
      } catch (err) {
        if (!active) return;
        setProducts([]);
        setMeta({ total: 0, page: 1, totalPages: 0, brands: [] });
        setError(err.message || 'Unable to load products. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }, searchQuery ? 300 : 0);

    return () => { active = false; clearTimeout(timer); };
  }, [searchQuery, activeCategory, activeSubcategory, activeBrand, sort, minPrice, maxPrice, minRating, minDiscount, inStockOnly, page, reloadKey]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p, { replace: true });
  };

  const changeCategory = (value) => {
    const p = new URLSearchParams(searchParams);
    if (value === 'all') p.delete('category'); else p.set('category', value);
    p.delete('subcategory');
    p.delete('page');
    setSearchParams(p, { replace: true });
  };

  const changeSubcategory = (value) => {
    const p = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === activeSubcategory) p.delete('subcategory'); else p.set('subcategory', value);
    p.delete('page');
    setSearchParams(p, { replace: true });
  };

  const changeBrand = (value) => {
    const p = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === activeBrand) p.delete('brand'); else p.set('brand', value);
    p.delete('page');
    setSearchParams(p, { replace: true });
  };

  const changeDiscount = (value) => {
    const p = new URLSearchParams(searchParams);
    if (!value || value === minDiscount) p.delete('discount'); else p.set('discount', String(value));
    p.delete('page');
    setSearchParams(p, { replace: true });
  };

  const goToPage = (nextPage) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', String(nextPage));
    setSearchParams(p, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : activeCategory !== 'all'
      ? (selectedCategory?.label || selectedCategory?.name || 'Products')
      : 'All Products';

  const resetAll = () => {
    setSearchParams({});
    setFilterOpen(false);
  };

  const filterProps = {
    categories,
    categoriesLoading,
    brands: meta.brands,
    activeCategory,
    activeSubcategory,
    activeBrand,
    subcategories,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStockOnly,
    onCategoryChange: changeCategory,
    onSubcategoryChange: changeSubcategory,
    onBrandChange: changeBrand,
    onMinPrice: value => setParam('minPrice', value > 0 ? String(value) : ''),
    onMaxPrice: value => setParam('maxPrice', value < MAX_PRICE ? String(value) : ''),
    onRating: value => setParam('rating', value > 0 ? String(value) : ''),
    onDiscount: changeDiscount,
    onInStock: value => setParam('inStock', value ? 'true' : ''),
    onReset: resetAll,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="bg-gradient-to-r from-[#831843] to-[#9F1239] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-3xl text-white mb-2">{pageTitle}</h1>
          <p className="text-white/70 text-sm">
            {loading ? 'Loading products...' : `${meta.total} product${meta.total === 1 ? '' : 's'} found`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-64 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-[#6B756F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setParam('search', e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-sm outline-none text-[#17211D] placeholder:text-[#6B756F] bg-transparent"
            />
          </div>

          <select
            value={sort}
            onChange={e => setParam('sort', e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#17211D] outline-none cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#17211D] hover:border-[#831843]/30 transition-colors lg:hidden"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterPanel {...filterProps} />
          </aside>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setFilterOpen(false)}
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-6"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-lg text-[#17211D]">Filters</h3>
                    <button onClick={() => setFilterOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <FilterPanel {...filterProps} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mb-4">⚠️</div>
                <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">Could not load products</h3>
                <p className="text-[#6B756F] text-sm mb-6">{error}</p>
                <button
                  onClick={() => setReloadKey(key => key + 1)}
                  className="px-6 py-3 bg-[#831843] text-white rounded-xl font-semibold text-sm hover:bg-[#9F1239] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                    <div className="skeleton aspect-square" />
                    <div className="p-4 space-y-3">
                      <div className="skeleton h-3 w-1/3 rounded" />
                      <div className="skeleton h-4 w-4/5 rounded" />
                      <div className="skeleton h-3 w-2/3 rounded" />
                      <div className="skeleton h-8 w-full rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">No products found</h3>
                <p className="text-[#6B756F] text-sm mb-6">Try adjusting your filters or search query</p>
                <button onClick={resetAll} className="px-6 py-3 bg-[#831843] text-white rounded-xl font-semibold text-sm hover:bg-[#9F1239] transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
                  ))}
                </div>

                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => goToPage(meta.page - 1)}
                      disabled={meta.page <= 1}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#17211D] hover:border-[#831843]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="text-sm text-[#6B756F]">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(meta.page + 1)}
                      disabled={meta.page >= meta.totalPages}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#17211D] hover:border-[#831843]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}

function FilterPanel({
  categories,
  categoriesLoading,
  brands,
  activeCategory,
  activeSubcategory,
  activeBrand,
  subcategories,
  minPrice,
  maxPrice,
  minRating,
  minDiscount,
  inStockOnly,
  onCategoryChange,
  onSubcategoryChange,
  onBrandChange,
  onMinPrice,
  onMaxPrice,
  onRating,
  onDiscount,
  onInStock,
  onReset,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display font-bold text-base text-[#17211D]">Filters</h3>
        <button onClick={onReset} className="text-xs text-[#9F1239] font-medium hover:underline">Reset all</button>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-[#17211D] mb-3">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === 'all' ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
          >
            All Categories
          </button>

          {categoriesLoading && (
            <div className="space-y-2 pt-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-9 rounded-lg" />
              ))}
            </div>
          )}

          {!categoriesLoading && categories.map(cat => {
            const isActive = activeCategory === cat.slug || activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.slug || cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
              >
                <span>{cat.icon || '📦'}</span>
                {cat.label || cat.name}
              </button>
            );
          })}

          {!categoriesLoading && categories.length === 0 && (
            <p className="text-xs text-[#6B756F] px-3 py-2">No categories yet.</p>
          )}
        </div>
      </div>

      {subcategories.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-[#17211D] mb-3">Subcategory</h4>
          <div className="space-y-1">
            <button
              onClick={() => onSubcategoryChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSubcategory === 'all' ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
            >
              All Subcategories
            </button>
            {subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => onSubcategoryChange(sub.slug || sub.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSubcategory === sub.slug || activeSubcategory === sub.id ? 'bg-[#831843]/10 text-[#831843] font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {brands.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-[#17211D] mb-3">Brand</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onBrandChange('all')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeBrand === 'all' ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
            >
              All Brands
            </button>
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => onBrandChange(brand)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeBrand === brand ? 'bg-[#831843]/10 text-[#831843] font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-sm text-[#17211D] mb-3">Price Range</h4>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            min="0"
            value={minPrice || ''}
            onChange={e => onMinPrice(e.target.value === '' ? 0 : Number(e.target.value))}
            placeholder="Min"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          />
          <span className="text-xs text-[#6B756F]">to</span>
          <input
            type="number"
            min="0"
            value={maxPrice >= MAX_PRICE ? '' : maxPrice}
            onChange={e => onMaxPrice(e.target.value === '' ? MAX_PRICE : Number(e.target.value))}
            placeholder="Max"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#17211D] outline-none focus:border-[#831843]/40"
          />
        </div>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={50}
          value={maxPrice}
          onChange={e => onMaxPrice(Number(e.target.value))}
          className="w-full accent-[#831843]"
        />
        <div className="flex justify-between text-xs text-[#6B756F] mt-1">
          <span>$0</span>
          <span>$2,000+</span>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-[#17211D] mb-3">Minimum Rating</h4>
        <div className="space-y-1">
          {[0, 3, 4, 4.5].map(r => (
            <button
              key={r}
              onClick={() => onRating(r)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${minRating === r ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
            >
              {r === 0 ? 'All Ratings' : `${r}★ & above`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-[#17211D] mb-3">Discount</h4>
        <div className="space-y-1">
          {[0, 10, 25, 50].map(value => (
            <button
              key={value}
              onClick={() => onDiscount(value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${minDiscount === value ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
            >
              {value === 0 ? 'Any Discount' : `${value}% & above`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm text-[#17211D] mb-3">Availability</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => onInStock(!inStockOnly)}
            className={`w-10 h-6 rounded-full transition-colors relative ${inStockOnly ? 'bg-[#831843]' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm text-[#17211D]">In Stock Only</span>
        </label>
      </div>
    </div>
  );
}

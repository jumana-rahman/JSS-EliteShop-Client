import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, categories } from '../data/products';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'discount', label: 'Biggest Discount' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickView, setQuickView] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const activeCategory = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'popular';
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 2000);
  const minRating = Number(searchParams.get('rating') || 0);
  const inStockOnly = searchParams.get('inStock') === 'true';

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }

    if (activeCategory !== 'all') {
      const cat = categories.find(c => c.id === activeCategory);
      if (cat) list = list.filter(p => p.category === cat.label);
    }

    list = list.filter(p => p.price >= minPrice && p.price <= (maxPrice || 9999));
    if (minRating) list = list.filter(p => p.rating >= minRating);
    if (inStockOnly) list = list.filter(p => p.inStock);

    switch (sort) {
      case 'price-low': list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'discount': list.sort((a, b) => b.discount - a.discount); break;
      case 'newest': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: list.sort((a, b) => b.reviews - a.reviews);
    }

    return list;
  }, [searchQuery, activeCategory, sort, minPrice, maxPrice, minRating, inStockOnly]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#831843] to-[#9F1239] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            {searchQuery ? `Results for "${searchQuery}"` : activeCategory !== 'all' ? categories.find(c => c.id === activeCategory)?.label || 'Products' : 'All Products'}
          </h1>
          <p className="text-white/70 text-sm">{filteredProducts.length} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Sort bar */}
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
          {/* Sidebar Filters */}
          <AnimatePresence>
            {(filterOpen || true) && (
              <motion.aside
                initial={false}
                className="hidden lg:block w-64 shrink-0"
              >
                <FilterPanel
                  activeCategory={activeCategory}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  minRating={minRating}
                  inStockOnly={inStockOnly}
                  onCategoryChange={v => setParam('category', v)}
                  onMinPrice={v => setParam('minPrice', String(v))}
                  onMaxPrice={v => setParam('maxPrice', String(v))}
                  onRating={v => setParam('rating', String(v))}
                  onInStock={v => setParam('inStock', v ? 'true' : '')}
                  onReset={() => setSearchParams({})}
                />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Mobile filter drawer */}
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
                  <FilterPanel
                    activeCategory={activeCategory}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    minRating={minRating}
                    inStockOnly={inStockOnly}
                    onCategoryChange={v => setParam('category', v)}
                    onMinPrice={v => setParam('minPrice', String(v))}
                    onMaxPrice={v => setParam('maxPrice', String(v))}
                    onRating={v => setParam('rating', String(v))}
                    onInStock={v => setParam('inStock', v ? 'true' : '')}
                    onReset={() => { setSearchParams({}); setFilterOpen(false); }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
                <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">No products found</h3>
                <p className="text-[#6B756F] text-sm mb-6">Try adjusting your filters or search query</p>
                <button onClick={() => setSearchParams({})} className="px-6 py-3 bg-[#831843] text-white rounded-xl font-semibold text-sm hover:bg-[#9F1239] transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickView} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}

function FilterPanel({ activeCategory, maxPrice, minRating, inStockOnly, onCategoryChange, onMaxPrice, onRating, onInStock, onReset }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display font-bold text-base text-[#17211D]">Filters</h3>
        <button onClick={onReset} className="text-xs text-[#9F1239] font-medium hover:underline">Reset all</button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold text-sm text-[#17211D] mb-3">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === 'all' ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${activeCategory === cat.id ? 'bg-[#831843] text-white font-medium' : 'text-[#6B756F] hover:bg-gray-100'}`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm text-[#17211D] mb-3">Max Price: ${maxPrice || 2000}</h4>
        <input
          type="range"
          min={0}
          max={2000}
          step={50}
          value={maxPrice || 2000}
          onChange={e => onMaxPrice(Number(e.target.value))}
          className="w-full accent-[#831843]"
        />
        <div className="flex justify-between text-xs text-[#6B756F] mt-1">
          <span>$0</span>
          <span>$2,000+</span>
        </div>
      </div>

      {/* Rating */}
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

      {/* Availability */}
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
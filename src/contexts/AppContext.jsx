import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('jss_cart');
    const savedWishlist = localStorage.getItem('jss_wishlist');
    const savedUser = localStorage.getItem('jss_user');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => { localStorage.setItem('jss_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('jss_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, quantity }];
    });
    showToast(`${product.name} added to cart`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const isIn = prev.find(p => p.id === product.id);
      if (isIn) {
        showToast('Removed from wishlist', 'info');
        return prev.filter(p => p.id !== product.id);
      }
      showToast(`${product.name} added to wishlist`, 'success');
      return [...prev, product];
    });
  };

  const isWishlisted = (productId) => wishlist.some(p => p.id === productId);

  const login = (email) => {
    const newUser = {
      name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&auto=format`,
    };
    setUser(newUser);
    localStorage.setItem('jss_user', JSON.stringify(newUser));
    showToast('Welcome back! You are now logged in.', 'success');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jss_user');
    showToast('You have been logged out.', 'info');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
      wishlist, toggleWishlist, isWishlisted,
      user, isLoggedIn: !!user, login, logout,
      toast, showToast,
      aiChatOpen, setAiChatOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
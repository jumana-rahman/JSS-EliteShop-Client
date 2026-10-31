import { createContext, useContext, useState, useEffect } from 'react';
import { authClient } from '../lib/authClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  // Load guest cart/wishlist
  useEffect(() => {
    const savedCart = localStorage.getItem('jss_cart');
    const savedWishlist = localStorage.getItem('jss_wishlist');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
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

  const login = async (email, password, rememberMe = true) => {
    setAuthBusy(true);
    try {
      const { data, error } = await authClient.signIn.email({ email, password, rememberMe });
      if (error) throw new Error(error.message || 'Unable to sign in. Please try again.');
      showToast('Welcome back! You are now logged in.', 'success');
      return data?.user ?? null;
    } finally {
      setAuthBusy(false);
    }
  };

  const register = async ({ name, email, password, phone }) => {
    setAuthBusy(true);
    try {
      const { data, error } = await authClient.signUp.email({ name, email, password, phone });
      if (error) throw new Error(error.message || 'Unable to create your account.');
      showToast('Account created. Welcome to JSS EliteShop!', 'success');
      return data?.user ?? null;
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setAuthBusy(true);
    try {
      await authClient.signOut();
      showToast('You have been logged out.', 'info');
    } finally {
      setAuthBusy(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
      wishlist, toggleWishlist, isWishlisted,
      user, isLoggedIn: !!user, isAdmin: user?.role === 'admin',
      authLoading: isPending, authBusy, login, register, logout,
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

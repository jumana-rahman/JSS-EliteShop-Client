import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authClient } from '../lib/authClient';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearRemoteCart,
  mergeCart,
} from '../services/cart';
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  mergeWishlist,
} from '../services/wishlist';
import { validateCoupon as validateCouponCode } from '../services/coupons';

const AppContext = createContext(null);

const GUEST_CART_KEY = 'jss_cart';
const GUEST_WISHLIST_KEY = 'jss_wishlist';
const COUPON_STORAGE_KEY = 'jss_coupon';

function readStoredCoupon() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(COUPON_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredCoupon(coupon) {
  if (typeof window === 'undefined') return;

  try {
    if (coupon) {
      window.sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
    }
  } catch {
    return;
  }
}

function readGuestCollection(key) {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCollection(key, value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function removeGuestCollection(key) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

export function AppProvider({ children }) {
  const { data: session, isPending, refetch: refreshSession } = authClient.useSession();
  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  const [cart, setCart] = useState(() => readGuestCollection(GUEST_CART_KEY));
  const [wishlist, setWishlist] = useState(() => readGuestCollection(GUEST_WISHLIST_KEY));
  const [guestMode, setGuestMode] = useState(true);
  const [toast, setToast] = useState(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiChatSeed, setAiChatSeed] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => readStoredCoupon());
  const [authBusy, setAuthBusy] = useState(false);

  const cartRef = useRef(cart);
  const wishlistRef = useRef(wishlist);
  const syncUserRef = useRef(undefined);
  const syncRequestRef = useRef(0);

  cartRef.current = cart;
  wishlistRef.current = wishlist;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!guestMode) return;
    writeGuestCollection(GUEST_CART_KEY, cart);
  }, [cart, guestMode]);

  useEffect(() => {
    if (!guestMode) return;
    writeGuestCollection(GUEST_WISHLIST_KEY, wishlist);
  }, [wishlist, guestMode]);

  useEffect(() => {
    if (isPending) return;

    const nextUserId = userId || null;
    const previousUserId = syncUserRef.current;
    if (previousUserId === nextUserId && previousUserId !== undefined) return;

    syncUserRef.current = nextUserId;
    const requestId = ++syncRequestRef.current;

    if (!nextUserId) {
      if (previousUserId) {
        setGuestMode(true);
        setCart([]);
        setWishlist([]);
      }
      return;
    }

    setGuestMode(false);

    const guestCart = readGuestCollection(GUEST_CART_KEY);
    const guestWishlist = readGuestCollection(GUEST_WISHLIST_KEY);
    const guestCartItems = guestCart
      .map((item) => ({
        productId: item.product?.id,
        quantity: item.quantity,
      }))
      .filter((item) => item.productId);
    const guestWishlistIds = [
      ...new Set(guestWishlist.map((product) => product?.id).filter(Boolean)),
    ];

    (async () => {
      try {
        const [cartResult, wishlistResult] = await Promise.all([
          guestCartItems.length ? mergeCart(guestCartItems) : getCart(),
          guestWishlistIds.length
            ? mergeWishlist(guestWishlistIds)
            : getWishlist(),
        ]);

        if (requestId !== syncRequestRef.current) return;

        setCart(cartResult.cart?.items || []);
        setWishlist(wishlistResult.wishlist?.items || []);
        removeGuestCollection(GUEST_CART_KEY);
        removeGuestCollection(GUEST_WISHLIST_KEY);
      } catch (error) {
        if (requestId !== syncRequestRef.current) return;
        showToast(
          error.message || 'Unable to sync your cart and wishlist.',
          'error'
        );
      }
    })();
  }, [userId, isPending]);

  const addToCart = async (product, quantity = 1) => {
    if (!product?.id) return false;

    if (userId) {
      try {
        const data = await addCartItem(product.id, quantity);
        setCart(data.cart?.items || []);
        showToast(`${product.name} added to cart`, 'success');
        return true;
      } catch (error) {
        showToast(
          error.message || 'Unable to add this item to your cart.',
          'error'
        );
        return false;
      }
    }

    const existing = cartRef.current.find((item) => item.product.id === product.id);
    const nextQuantity = (existing?.quantity || 0) + quantity;
    const stock = Number(product.stockCount ?? product.stock ?? Infinity);

    if (stock <= 0) {
      showToast('This product is out of stock.', 'error');
      return false;
    }

    if (nextQuantity > stock) {
      showToast(
        `Only ${stock} item${stock === 1 ? '' : 's'} available in stock.`,
        'error'
      );
      return false;
    }

    setCart((prev) => {
      const item = prev.find((entry) => entry.product.id === product.id);
      if (item) {
        return prev.map((entry) =>
          entry.product.id === product.id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast(`${product.name} added to cart`, 'success');
    return true;
  };

  const removeFromCart = async (productId) => {
    if (userId) {
      try {
        const data = await removeCartItem(productId);
        setCart(data.cart?.items || []);
      } catch (error) {
        showToast(error.message || 'Unable to remove this item.', 'error');
      }
      return;
    }

    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (userId) {
      try {
        const data = await updateCartItem(productId, quantity);
        setCart(data.cart?.items || []);
      } catch (error) {
        showToast(error.message || 'Unable to update this item.', 'error');
      }
      return;
    }

    const item = cartRef.current.find((entry) => entry.product.id === productId);
    if (!item) return;

    const stock = Number(
      item.product.stockCount ?? item.product.stock ?? Infinity
    );

    if (quantity > stock) {
      showToast(
        `Only ${stock} item${stock === 1 ? '' : 's'} available in stock.`,
        'error'
      );
      return;
    }

    setCart((prev) =>
      prev.map((entry) =>
        entry.product.id === productId ? { ...entry, quantity } : entry
      )
    );
  };

  const applyCoupon = async (code) => {
    const data = await validateCouponCode(code);
    setAppliedCoupon(data.coupon);
    writeStoredCoupon(data.coupon);
    return data;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    writeStoredCoupon(null);
  };

  const clearCart = async () => {
    if (userId) {
      try {
        const data = await clearRemoteCart();
        setCart(data.cart?.items || []);
      } catch (error) {
        showToast(error.message || 'Unable to clear your cart.', 'error');
      }
    } else {
      setCart([]);
    }

    setAppliedCoupon(null);
    writeStoredCoupon(null);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartCount = cart.length;

  const toggleWishlist = async (product) => {
    if (!product?.id) return;

    const isInWishlist = wishlistRef.current.some(
      (item) => item.id === product.id
    );

    if (userId) {
      try {
        const data = isInWishlist
          ? await removeWishlistItem(product.id)
          : await addWishlistItem(product.id);
        setWishlist(data.wishlist?.items || []);
        showToast(
          isInWishlist ? 'Removed from wishlist' : `${product.name} added to wishlist`,
          isInWishlist ? 'info' : 'success'
        );
      } catch (error) {
        showToast(
          error.message || 'Unable to update your wishlist.',
          'error'
        );
      }
      return;
    }

    if (isInWishlist) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast('Removed from wishlist', 'info');
      return;
    }

    setWishlist((prev) => [...prev, product]);
    showToast(`${product.name} added to wishlist`, 'success');
  };

  const moveToCart = async (product) => {
    if (!product?.id) return false;

    const isInWishlist = wishlistRef.current.some(
      (item) => item.id === product.id
    );

    if (userId) {
      let cartResult;

      try {
        cartResult = await addCartItem(product.id, 1);
        setCart(cartResult.cart?.items || []);
      } catch (error) {
        showToast(error.message || 'Unable to move this item to your cart.', 'error');
        return false;
      }

      if (isInWishlist) {
        try {
          const wishlistResult = await removeWishlistItem(product.id);
          setWishlist(wishlistResult.wishlist?.items || []);
        } catch {
          showToast('Added to cart, but could not remove it from your wishlist.', 'info');
        }
      }

      showToast(`${product.name} moved to cart`, 'success');
      return true;
    }

    const existing = cartRef.current.find((item) => item.product.id === product.id);
    const nextQuantity = (existing?.quantity || 0) + 1;
    const stock = Number(product.stockCount ?? product.stock ?? Infinity);

    if (stock <= 0) {
      showToast('This product is out of stock.', 'error');
      return false;
    }

    if (nextQuantity > stock) {
      showToast(
        `Only ${stock} item${stock === 1 ? '' : 's'} available in stock.`,
        'error'
      );
      return false;
    }

    setCart((prev) => {
      const item = prev.find((entry) => entry.product.id === product.id);
      if (item) {
        return prev.map((entry) =>
          entry.product.id === product.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    if (isInWishlist) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
    }

    showToast(`${product.name} moved to cart`, 'success');
    return true;
  };

  const isWishlisted = (productId) =>
    wishlist.some((product) => product.id === productId);

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

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
      appliedCoupon, applyCoupon, removeCoupon,
      wishlist, wishlistCount: wishlist.length, toggleWishlist, moveToCart, isWishlisted,
      user, isLoggedIn: !!user, isAdmin: user?.role === 'admin',
      authLoading: isPending, authBusy, login, register, logout, refreshSession,
      toast, showToast,
      aiChatOpen, setAiChatOpen,
      aiChatSeed, setAiChatSeed,
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

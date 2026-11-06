import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AIChat from './components/AIChat';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { ProtectedRoute, CustomerRoute, AdminRoute } from './routes/Guards';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const noFooterRoutes = ['/checkout', '/admin'];

function AppShell() {
  const { pathname } = useLocation();
  const showFooter = !noFooterRoutes.some(r => pathname.startsWith(r));

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={<CustomerRoute><DashboardPage /></CustomerRoute>} />
        <Route path="/dashboard/orders" element={<CustomerRoute><DashboardPage /></CustomerRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      {showFooter && <Footer />}
      <AIChat />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
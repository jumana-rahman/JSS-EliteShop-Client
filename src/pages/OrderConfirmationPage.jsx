import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrder, downloadInvoice } from '../services/orders';
import { useApp } from '../contexts/AppContext';
import OrderTimeline from '../components/OrderTimeline';

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const { showToast } = useApp();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');
  const [invoiceBusy, setInvoiceBusy] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getOrder(id);
        if (active) setOrder(data.order);
      } catch (err) {
        if (active) setError(err.message || 'Order not found.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [id]);

  const handleInvoice = async () => {
    setInvoiceBusy(true);

    try {
      await downloadInvoice(order.id || order.orderNumber);
    } catch (error) {
      showToast(error.message || 'Could not download the invoice.', 'error');
    } finally {
      setInvoiceBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-24">
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
          <div className="skeleton h-20 w-20 rounded-full mx-auto" />
          <div className="skeleton h-8 w-64 mx-auto" />
          <div className="skeleton h-52 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] pt-32 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📦</div>
          <h2 className="font-display font-bold text-2xl text-[#17211D] mb-3">Order not found</h2>
          <p className="text-[#6B756F] mb-8">{error || 'We could not find this order.'}</p>
          <Link to="/dashboard/orders" className="px-8 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors inline-block">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const paymentLabel = order.paymentStatus === 'paid' ? 'Paid' : 'Cash on Delivery';

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="w-20 h-20 bg-[#9F1239]/10 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-[#9F1239]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="font-display font-bold text-3xl text-[#17211D] mb-2">Order Confirmed!</h1>
          <p className="text-[#6B756F] mb-8">Thank you for your order. Pay cash when it arrives.</p>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6B756F] mb-1">Order Number</p>
                <p className="font-display font-bold text-[#17211D] text-lg">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-[#6B756F] mb-1">Order Date</p>
                <p className="font-semibold text-[#17211D]">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-[#6B756F] mb-1">Total Amount</p>
                <p className="font-display font-bold text-[#17211D] text-xl">${Number(order.total).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#6B756F] mb-1">Payment</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#9F1239]/10 text-[#9F1239] text-xs font-semibold rounded-full">
                  <span className="w-1.5 h-1.5 bg-[#9F1239] rounded-full" />
                  {paymentLabel}
                </span>
              </div>
            </div>

            {order.address?.addressLine && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[#6B756F] text-xs mb-1">Delivering to</p>
                <p className="text-sm font-medium text-[#17211D]">{order.address.name} · {order.address.phone}</p>
                <p className="text-sm text-[#6B756F]">
                  {order.address.addressLine}, {order.address.city} {order.address.postalCode}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 text-left">
            <h3 className="font-display font-bold text-[#17211D] mb-4">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex items-center gap-3">
                  <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-lg bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#17211D] line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-[#6B756F]">Qty {item.quantity} × ${Number(item.unitPrice).toFixed(2)}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#17211D]">${Number(item.totalPrice).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-[#6B756F]">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6B756F]">
                <span>Shipping</span>
                <span>{Number(order.shipping) === 0 ? 'Free' : `$${Number(order.shipping).toFixed(2)}`}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-[#9F1239]">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#17211D] pt-1">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 text-left">
            <h3 className="font-display font-bold text-[#17211D] mb-5">Order Tracking</h3>
            <OrderTimeline order={order} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleInvoice}
              disabled={invoiceBusy}
              className="px-6 py-3 bg-white border border-gray-200 text-[#17211D] rounded-2xl font-semibold hover:border-[#831843]/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {invoiceBusy ? 'Preparing...' : 'Download Invoice'}
            </button>
            <Link
              to="/dashboard/orders"
              className="px-6 py-3 bg-[#831843] text-white rounded-2xl font-semibold hover:bg-[#9F1239] transition-colors"
            >
              View My Orders
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 bg-white border border-gray-200 text-[#17211D] rounded-2xl font-semibold hover:border-[#831843]/30 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

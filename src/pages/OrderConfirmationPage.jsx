import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const timeline = [
  { label: 'Order Placed', done: true, date: 'Sep 19, 2026' },
  { label: 'Payment Confirmed', done: true, date: 'Sep 19, 2026' },
  { label: 'Processing', done: false },
  { label: 'Shipped', done: false },
  { label: 'Delivered', done: false, date: 'Est. Sep 24, 2026' },
];

export default function OrderConfirmationPage() {
  const location = useLocation();
  const { total, orderId } = location.state || { total: 0, orderId: 'JSS-000000' };

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
          <h1 className="font-display font-bold text-3xl text-[#17211D] mb-2">Order Confirmed! 🎉</h1>
          <p className="text-[#6B756F] mb-8">Thank you for your purchase. We'll send you a confirmation email shortly.</p>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#6B756F] mb-1">Order Number</p>
                <p className="font-display font-bold text-[#17211D] text-lg">{orderId}</p>
              </div>
              <div>
                <p className="text-[#6B756F] mb-1">Order Date</p>
                <p className="font-semibold text-[#17211D]">Sep 19, 2026</p>
              </div>
              <div>
                <p className="text-[#6B756F] mb-1">Total Amount</p>
                <p className="font-display font-bold text-[#17211D] text-xl">${total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#6B756F] mb-1">Payment Status</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#9F1239]/10 text-[#9F1239] text-xs font-semibold rounded-full">
                  <div className="w-1.5 h-1.5 bg-[#9F1239] rounded-full" />
                  Paid
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-[#9F1239]">
              <span>🚚</span>
              <span className="font-medium">Estimated delivery: Sep 24, 2026</span>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 text-left">
            <h3 className="font-display font-bold text-[#17211D] mb-5">Order Tracking</h3>
            <div className="relative">
              {timeline.map((step, i) => (
                <div key={step.label} className={`flex gap-4 ${i < timeline.length - 1 ? 'mb-6' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-[#831843]' : 'bg-gray-100'}`}>
                      {step.done ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 ${step.done && timeline[i + 1].done ? 'bg-[#831843]' : 'bg-gray-200'}`} style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={`font-medium text-sm ${step.done ? 'text-[#17211D]' : 'text-[#6B756F]'}`}>{step.label}</p>
                    {step.date && <p className="text-xs text-[#6B756F] mt-0.5">{step.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
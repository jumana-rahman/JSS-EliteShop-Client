import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

const faqs = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express shipping (1-2 days) is available at checkout.' },
  { q: 'What is your return policy?', a: 'We offer 30-day hassle-free returns on all items. Simply initiate a return from your dashboard.' },
  { q: 'Are all products authentic?', a: 'Absolutely. All products are sourced directly from brands or authorized distributors. We have a zero-tolerance policy for counterfeits.' },
  { q: 'How does the AI shopping assistant work?', a: 'Our AI learns from your browsing patterns and preferences to suggest products you\'ll love. You can also chat with it directly using the ✨ button.' },
  { q: 'Can I track my order?', a: 'Yes! Once your order ships, you\'ll receive a tracking link. You can also track orders from My Account → Orders.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { showToast } = useApp();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
    showToast('Message sent! We\'ll reply within 24 hours.', 'success');
  };

  return (
    <div className="bg-[#FAFAF7] pt-16">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#831843] to-[#9F1239] py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display font-bold text-5xl text-white mb-3">Get in Touch</h1>
          <p className="text-white/70 text-lg">We're here to help. Reach out anytime.</p>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="font-display font-bold text-2xl text-[#17211D] mb-6">Send Us a Message</h2>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-[#9F1239]/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
                <h3 className="font-display font-bold text-xl text-[#17211D] mb-2">Message Sent!</h3>
                <p className="text-[#6B756F] text-sm">We'll get back to you within 24 hours at {form.email}.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="mt-5 text-sm text-[#831843] font-medium hover:underline">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Full Name', placeholder: 'Sarah Johnson' },
                    { key: 'email', label: 'Email Address', placeholder: 'sarah@example.com', type: 'email' },
                    { key: 'phone', label: 'Phone (optional)', placeholder: '+1 (555) 000-0000', type: 'tel' },
                    { key: 'subject', label: 'Subject', placeholder: 'Order question, return, ...' },
                  ].map(field => (
                    <div key={field.key} className="col-span-1">
                      <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">{field.label}</label>
                      <input
                        type={field.type || 'text'}
                        value={form[field.key]}
                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        required={field.key !== 'phone'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell us how we can help..."
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#17211D] outline-none focus:border-[#831843] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-all duration-200 disabled:opacity-80 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending...</>
                  ) : 'Send Message →'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info + FAQ */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div>
              <h2 className="font-display font-bold text-2xl text-[#17211D] mb-6">Contact Information</h2>
              <div className="space-y-4">
                {[
                  { icon: '📧', label: 'Email', value: 'support@jsseliteshop.com' },
                  { icon: '📞', label: 'Phone', value: '+1 (800) JSS-SHOP' },
                  { icon: '📍', label: 'Address', value: '123 Elite Avenue, San Francisco, CA 94105' },
                  { icon: '🕒', label: 'Hours', value: 'Mon–Fri 9am–7pm PST · Weekends 10am–5pm' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-0.5">{item.label}</p>
                      <p className="text-sm text-[#17211D] font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                {['Twitter', 'Instagram', 'Facebook'].map(s => (
                  <a key={s} href="#" className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#17211D] hover:border-[#831843]/30 transition-colors">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="font-display font-bold text-2xl text-[#17211D] mb-4">FAQ</h2>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-[#17211D] text-sm">{faq.q}</span>
                      <svg
                        className={`w-4 h-4 text-[#6B756F] shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-4"
                      >
                        <p className="text-[#6B756F] text-sm leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
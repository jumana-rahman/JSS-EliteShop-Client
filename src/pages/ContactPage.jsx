import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { sendContactMessage } from '../services/contact';

const faqs = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days. Express shipping (1-2 days) is available at checkout.' },
  { q: 'What is your return policy?', a: 'We offer 30-day hassle-free returns on all items. Simply initiate a return from your dashboard.' },
  { q: 'Are all products authentic?', a: 'Absolutely. All products are sourced directly from brands or authorized distributors. We have a zero-tolerance policy for counterfeits.' },
  { q: 'How does the AI shopping assistant work?', a: 'Our AI learns from your browsing patterns and preferences to suggest products you\'ll love. You can also chat with it directly using the ✨ button.' },
  { q: 'Can I track my order?', a: 'Yes! Once your order ships, you\'ll receive a tracking link. You can also track orders from My Account → Orders.' },
];

const subjects = [
  'General Inquiry',
  'Order Issue',
  'Return & Refund',
  'Payment Problem',
  'Product Question',
  'Other',
];

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

function validateForm(form) {
  const errors = {};

  if (form.name.trim().length < 2) errors.name = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.subject) errors.subject = 'Please choose a subject.';
  if (form.message.trim().length < 20) {
    errors.message = 'Please write at least 20 characters.';
  }

  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const { showToast } = useApp();

  const updateField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    setLoading(true);

    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });

      setSent(true);
      setForm(emptyForm);
      setErrors({});
      showToast('Your message has been sent! We\'ll reply within 24 hours.', 'success');
    } catch (error) {
      const fieldErrors = {};
      const issues = Array.isArray(error.details)
        ? error.details
        : Array.isArray(error.errors)
          ? error.errors
          : [];

      issues.forEach(issue => {
        if (issue.path) fieldErrors[issue.path] = issue.message;
      });

      setErrors(fieldErrors);
      showToast(error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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
                <p className="text-[#6B756F] text-sm">We'll get back to you within 24 hours at the email you provided.</p>
                <button onClick={() => setSent(false)} className="mt-5 text-sm text-[#831843] font-medium hover:underline">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={event => updateField('name', event.target.value)}
                      placeholder="Sarah Johnson"
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none transition-colors ${errors.name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#831843]'}`}
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={event => updateField('email', event.target.value)}
                      placeholder="sarah@example.com"
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none transition-colors ${errors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#831843]'}`}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={event => updateField('phone', event.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none transition-colors ${errors.phone ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#831843]'}`}
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Subject</label>
                    <select
                      value={form.subject}
                      onChange={event => updateField('subject', event.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none transition-colors bg-white ${errors.subject ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#831843]'}`}
                    >
                      <option value="">Choose a subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B756F] uppercase tracking-wide mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={event => updateField('message', event.target.value)}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-xl text-sm text-[#17211D] outline-none transition-colors resize-none ${errors.message ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#831843]'}`}
                  />
                  <div className="flex items-center justify-between gap-3 mt-1">
                    {errors.message ? (
                      <p className="text-xs text-red-600">{errors.message}</p>
                    ) : (
                      <span />
                    )}
                    <p className="text-xs text-[#6B756F]">{form.message.length}/2000</p>
                  </div>
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

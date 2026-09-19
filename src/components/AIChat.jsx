import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

const quickActions = [
  { icon: '🔍', label: 'Find a product' },
  { icon: '👗', label: 'Create an outfit' },
  { icon: '📦', label: 'Track my order' },
  { icon: '💳', label: 'Payment help' },
];

const aiResponses = {
  default: "I'm here to help you shop smarter! Try asking me about products, outfit ideas, or order status.",
  headphones: "I'd recommend the **Sony WH-1000XM5** — it's our top-rated headphone with 30-hour battery and industry-leading noise cancellation. Currently 30% off at $279! 🎧",
  laptop: "The **Apple MacBook Air M3** is excellent for most users — fast, thin, 18-hour battery. Starting at $1,099. For Windows users, I'd suggest checking our Electronics section for alternatives.",
  outfit: "For a smart casual look, try pairing the **Premium Linen Blazer** in sage green with dark slim-cut trousers and clean white sneakers. Very on-trend for 2026! 🌿",
  order: "You can track your orders in **My Account → Orders**. Orders typically ship within 1-2 business days, and delivery takes 3-5 days. Need help with a specific order number?",
  payment: "We accept Visa, Mastercard, and Stripe payments. All transactions are secured with 256-bit SSL encryption. You can also apply coupon codes at checkout! 💳",
};

function getAIResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('headphone') || lower.includes('audio')) return aiResponses.headphones;
  if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('computer')) return aiResponses.laptop;
  if (lower.includes('outfit') || lower.includes('style') || lower.includes('wear')) return aiResponses.outfit;
  if (lower.includes('order') || lower.includes('track') || lower.includes('delivery')) return aiResponses.order;
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('card')) return aiResponses.payment;
  return aiResponses.default;
}

export default function AIChat() {
  const { aiChatOpen, setAiChatOpen } = useApp();
  const [messages, setMessages] = useState([
    { id: 0, role: 'assistant', text: 'Hi! I\'m your JSS AI Shopping Assistant. I can help you find products, create outfits, or answer any questions. What can I do for you today? ✨' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  let nextId = messages.length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: nextId++, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply = getAIResponse(text);
      setMessages(prev => [...prev, { id: nextId++, role: 'assistant', text: reply }]);
      setTyping(false);
    }, 1200 + Math.random() * 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setAiChatOpen(!aiChatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#831843] to-[#9F1239] rounded-2xl shadow-lg shadow-[#831843]/40 flex items-center justify-center text-white hover:shadow-xl hover:shadow-[#831843]/50 transition-shadow"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={aiChatOpen ? {} : { y: [0, -4, 0] }}
        transition={aiChatOpen ? {} : { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        <AnimatePresence mode="wait">
          {aiChatOpen ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.span key="sparkle" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }} className="text-xl">
              ✨
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {aiChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl shadow-black/20 overflow-hidden border border-gray-100 flex flex-col"
            style={{ maxHeight: 'calc(100vh - 120px)', height: 560 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#831843] to-[#9F1239] px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">✨</div>
              <div>
                <h3 className="font-display font-bold text-white text-sm">JSS AI Assistant</h3>
                <p className="text-white/70 text-xs">Always here to help</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#BE185D] rounded-full animate-pulse" />
                <span className="text-white/70 text-xs">Online</span>
              </div>
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pt-3 pb-1 grid grid-cols-2 gap-2">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.label)}
                    className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-[#831843]/5 border border-gray-200 hover:border-[#831843]/20 rounded-xl text-xs font-medium text-[#17211D] transition-all duration-200"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#831843] to-[#9F1239] rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5 shrink-0">
                      ✨
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#831843] text-white rounded-br-sm'
                        : 'bg-gray-100 text-[#17211D] rounded-bl-sm'
                    }`}
                  >
                    {msg.text.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#831843] to-[#9F1239] rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5 shrink-0">✨</div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-[#6B756F] rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-100">
              <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 text-sm bg-transparent outline-none text-[#17211D] placeholder:text-[#6B756F]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-7 h-7 bg-[#831843] text-white rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-[#9F1239] transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

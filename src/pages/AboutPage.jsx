import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

const team = [
  { name: 'Jonathan S.', role: 'CEO & Founder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format' },
  { name: 'Amara L.', role: 'Head of Product', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c8?w=200&h=200&fit=crop&auto=format' },
  { name: 'Marcus K.', role: 'AI Lead Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format' },
  { name: 'Priya N.', role: 'Design Director', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format' },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAF7] pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#831843] to-[#9F1239] py-24 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex px-3 py-1.5 bg-[#BE185D]/20 border border-[#BE185D]/30 text-[#BE185D] text-xs font-semibold rounded-full mb-5 uppercase tracking-widest">
            Our Story
          </span>
          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-5">About JSS EliteShop</h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto leading-relaxed">
            We're on a mission to make premium shopping accessible to everyone, powered by the most advanced AI technology.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="font-display font-bold text-4xl text-[#17211D] mb-6">Built for the Modern Shopper</h2>
            <p className="text-[#6B756F] leading-relaxed mb-4">
              JSS EliteShop was founded in 2022 with a simple belief: shopping should be intelligent, effortless, and joyful. We noticed that people spent too much time searching for products and not enough time enjoying them.
            </p>
            <p className="text-[#6B756F] leading-relaxed">
              So we built an AI-powered platform that understands what you really want — not just what you type. Our technology learns your preferences, suggests complementary items, and helps you make smarter buying decisions.
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=700&h=700&fit=crop&auto=format"
                alt="Our team at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#BE185D] text-white rounded-2xl p-4 shadow-xl">
              <p className="font-display font-bold text-3xl">4.9★</p>
              <p className="text-xs font-semibold">Customer Rating</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '2M+', label: 'Happy Customers' },
              { value: '50K+', label: 'Products Listed' },
              { value: '99.8%', label: 'Uptime' },
              { value: '$240M', label: 'Annual GMV' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display font-bold text-5xl text-[#831843] mb-2">{stat.value}</p>
                <p className="text-[#6B756F] text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-2">What We Stand For</p>
          <h2 className="font-display font-bold text-4xl text-[#17211D]">Our Mission & Values</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🎯', title: 'Customer First', desc: 'Every decision we make is centered around creating the best possible shopping experience.' },
            { icon: '🤖', title: 'AI Innovation', desc: 'We push the boundaries of AI to give you personalized recommendations and smarter search.' },
            { icon: '🌱', title: 'Sustainability', desc: 'Partnering with eco-conscious brands and offsetting our carbon footprint for every order.' },
            { icon: '🛡️', title: 'Trust & Safety', desc: 'Rigorous seller vetting, authentic products, and bank-grade security on every transaction.' },
            { icon: '🌍', title: 'Inclusivity', desc: "Premium shopping shouldn't be exclusive. We offer fair prices and serve customers worldwide." },
            { icon: '💡', title: 'Transparency', desc: 'Honest pricing, clear policies, and no hidden fees. Ever.' },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#831843]/20 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-[#831843]/8 rounded-2xl flex items-center justify-center text-2xl mb-4">{v.icon}</div>
              <h3 className="font-display font-bold text-[#17211D] mb-2">{v.title}</h3>
              <p className="text-[#6B756F] text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <p className="text-[#9F1239] text-sm font-semibold uppercase tracking-widest mb-2">The People</p>
            <h2 className="font-display font-bold text-4xl text-[#17211D]">Meet the Team</h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3" />
                <p className="font-display font-bold text-[#17211D] text-sm">{member.name}</p>
                <p className="text-[#6B756F] text-xs">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <motion.div {...fadeUp}>
          <h2 className="font-display font-bold text-4xl text-[#17211D] mb-5">Ready to Shop Smarter?</h2>
          <p className="text-[#6B756F] mb-8">Join over 2 million customers who trust JSS EliteShop.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="px-8 py-4 bg-[#831843] text-white rounded-2xl font-bold hover:bg-[#9F1239] transition-colors">
              Start Shopping
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-white border border-gray-200 text-[#17211D] rounded-2xl font-semibold hover:border-[#831843]/30 transition-colors">
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
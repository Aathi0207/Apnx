import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Truck, RotateCcw } from 'lucide-react'
import ProductGrid from '../../components/customer/ProductGrid'
import { productService } from '../../services/productService'
import { categoryService } from '../../services/categoryService'

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
      <Icon size={24} color="var(--primary)" />
    </div>
    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-2)' }}>{title}</h3>
    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', lineHeight: 1.6 }}>{desc}</p>
  </div>
)

const Home = () => {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [latest, setLatest] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingLatest, setLoadingLatest] = useState(true)
  const [loadingBest, setLoadingBest] = useState(true)

  useEffect(() => {
    productService.getFeaturedProducts(8).then(d => { setFeatured(d); setLoadingFeatured(false) }).catch(() => setLoadingFeatured(false))
    productService.getProducts({ sortBy: 'created_at', sortOrder: 'desc', limit: 8 }).then(d => { setLatest(d.data); setLoadingLatest(false) }).catch(() => setLoadingLatest(false))
    productService.getBestSellers(8).then(d => { setBestSellers(d); setLoadingBest(false) }).catch(() => setLoadingBest(false))
    categoryService.getCategories().then(d => setCategories(d)).catch(() => {})
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge"><Zap size={14} /> New Arrivals Every Week</div>
            <h1>Discover <span>Amazing</span> Products at Unbeatable Prices</h1>
            <p>Shop from thousands of products across electronics, fashion, accessories, and more. Fast delivery, easy returns.</p>
            <div className="hero-actions">
              <button className="hero-btn-primary" onClick={() => navigate('/products')}>Shop Now <ArrowRight size={18} style={{ display: 'inline', marginLeft: 6 }} /></button>
              <button className="hero-btn-secondary" onClick={() => navigate('/register')}>Join Free</button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="hero-stat-number">10K+</div><div className="hero-stat-label">Products</div></div>
              <div className="hero-stat"><div className="hero-stat-number">50K+</div><div className="hero-stat-label">Customers</div></div>
              <div className="hero-stat"><div className="hero-stat-number">99%</div><div className="hero-stat-label">Satisfaction</div></div>
            </div>
          </div>
          <div className="hero-image-side">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80" alt="Shopping" className="hero-img" />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-sm" style={{ background: '#fff', borderBottom: '1px solid var(--gray-100)' }}>
          <div className="container">
            <div className="section-header">
              <div><h2 className="section-title">Shop by Category</h2></div>
              <Link to="/products" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 'var(--space-4)' }}>
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}
                  style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--gray-100)', transition: 'var(--transition)', textDecoration: 'none', color: 'var(--gray-800)', fontWeight: 600, fontSize: 'var(--text-sm)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(99,102,241,.05)'; e.currentTarget.style.color = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-100)'; e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-800)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>
                    {cat.name === 'Electronics' ? '📱' : cat.name === 'Fashion' ? '👗' : cat.name === 'Accessories' ? '💎' : cat.name === 'Home' ? '🏠' : cat.name === 'Beauty' ? '💄' : '🛍️'}
                  </div>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <div><h2 className="section-title">Featured Products</h2><p className="section-subtitle">Handpicked just for you</p></div>
            <Link to="/products" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          <ProductGrid products={featured} loading={loadingFeatured} />
        </div>
      </section>

      {/* Features */}
      <section className="section-sm" style={{ background: '#fff', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))' }}>
            <FeatureCard icon={Truck} title="Free Shipping" desc="On orders over ₹499. Fast and reliable delivery to your door." />
            <FeatureCard icon={RotateCcw} title="Easy Returns" desc="30-day hassle-free return policy for all products." />
            <FeatureCard icon={Shield} title="Secure Payment" desc="Your payment information is always safe and encrypted." />
            <FeatureCard icon={Zap} title="24/7 Support" desc="Our team is ready to help you any time, day or night." />
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="section" style={{ background: 'var(--gray-50)' }}>
        <div className="container">
          <div className="section-header">
            <div><h2 className="section-title">Latest Products</h2><p className="section-subtitle">Fresh arrivals this week</p></div>
            <Link to="/products?sort=newest" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          <ProductGrid products={latest} loading={loadingLatest} />
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <div><h2 className="section-title">Best Sellers</h2><p className="section-subtitle">Most popular picks</p></div>
            <Link to="/products" className="btn btn-outline btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          <ProductGrid products={bestSellers} loading={loadingBest} />
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: 'var(--space-16) 0', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Ready to Start Shopping?</h2>
          <p style={{ opacity: 0.85, marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>Join thousands of happy customers today.</p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="hero-btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
            <button className="hero-btn-secondary" onClick={() => navigate('/register')}>Create Account</button>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home

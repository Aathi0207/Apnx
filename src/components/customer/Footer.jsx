import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">ShopSphere</div>
          <p>Your ultimate shopping destination. Discover thousands of products across all categories, delivered right to your door.</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" style={{ color: 'var(--gray-400)', transition: 'var(--transition)' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}>
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/products?sort=newest">New Arrivals</Link></li>
            <li><Link to="/products?sort=popular">Best Sellers</Link></li>
            <li><Link to="/products?minPrice=0&maxPrice=50">Under $50</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/profile">My Profile</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/admin/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Admin Portal</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>
              <Mail size={14} /> support@shopsphere.com
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>
              <Phone size={14} /> +1 (555) 000-0000
            </li>
            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} /> 123 Commerce St, New York, NY
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <a href="#" style={{ color: 'var(--gray-500)' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--gray-500)' }}>Terms</a>
          <a href="#" style={{ color: 'var(--gray-500)' }}>Cookies</a>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, LogOut, Package, ChevronDown, Menu, X, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleSignOut = async () => {
    await signOut()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-logo">ShopSphere</span>
        </Link>

        <form className={`navbar-search ${searchOpen ? 'open' : ''}`} onSubmit={handleSearch}>
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="navbar-actions">
          <button className="navbar-icon-btn mobile-menu-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link to="/cart" className="navbar-icon-btn" aria-label="Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </Link>

          {user ? (
            <div className="user-wrapper" ref={dropdownRef}>
              <button className="navbar-user-btn signed-in" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <User size={16} />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <Link to="/profile" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/orders" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Package size={16} /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      <ShieldCheck size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item" onClick={handleSignOut} style={{ color: 'var(--danger)' }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-user-btn guest">
              <User size={16} /> Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar

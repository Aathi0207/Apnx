import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ShoppingBag, Users, LogOut, Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Toaster } from 'react-hot-toast'

import { isSupabaseConfigured } from '../services/supabase'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
]

const AdminLayout = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-text">ShopSphere</div>
          <div className="admin-sidebar-logo-sub">Admin Dashboard</div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section-title">Main Menu</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <item.icon size={18} className="admin-nav-link-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #818cf8, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
              {(profile?.full_name || 'A')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="admin-sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Admin'}</div>
              <div className="admin-sidebar-user-role">Administrator</div>
            </div>
            <button onClick={handleSignOut} title="Sign Out" style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'var(--transition)' }}
              onMouseEnter={e => e.target.style.color = '#f87171'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 49 }} />}

      {/* Main */}
      <main className="admin-main">
        {!isSupabaseConfigured && (
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #fde68a' }}>
            ⚠️ Supabase is not connected yet. Please update <code>.env</code> with your Supabase URL & Anon Key, and run <code>supabase-schema.sql</code> in your Supabase SQL Editor.
          </div>
        )}
        <header className="admin-header">
          <div className="admin-header-left">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-600)', display: 'none' }} className="admin-sidebar-toggle-btn">
              <Menu size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Admin Panel</span>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
              {(profile?.full_name || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile toggle */}
      <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </div>
  )
}

export default AdminLayout

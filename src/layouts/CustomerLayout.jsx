import { Outlet } from 'react-router-dom'
import Navbar from '../components/customer/Navbar'
import Footer from '../components/customer/Footer'
import { Toaster } from 'react-hot-toast'
import { isSupabaseConfigured } from '../services/supabase'

const CustomerLayout = () => (
  <>
    {!isSupabaseConfigured && (
      <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, borderBottom: '1px solid #fde68a' }}>
        ⚠️ Supabase is not connected yet. Please update <code>.env</code> with your Supabase URL & Anon Key, and run <code>supabase-schema.sql</code> in your Supabase SQL Editor.
      </div>
    )}
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Outlet />
    </main>
    <Footer />
    <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', fontSize: '14px' } }} />
  </>
)

export default CustomerLayout

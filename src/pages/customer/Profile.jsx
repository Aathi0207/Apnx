import { useState } from 'react'
import { User, Package, Settings, Save, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
]

const Profile = () => {
  const { user, profile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ fullName: profile?.full_name || '', phone: profile?.phone || '' })
  const [pwForm, setPwForm] = useState({ password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.fullName.trim()) { toast.error('Full name is required'); return }
    setSaving(true)
    try {
      await updateProfile({ full_name: profileForm.fullName, phone: profileForm.phone })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (!pwForm.password || pwForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (pwForm.password !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return }
    setPwSaving(true)
    try {
      await authService.updatePassword(pwForm.password)
      toast.success('Password updated!')
      setPwForm({ password: '', confirmPassword: '' })
    } catch (err) {
      toast.error('Failed to update password')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="section-title">My Account</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>{user?.email}</p>
      </div>

      <div className="profile-layout">
        {/* Nav */}
        <div className="profile-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={`profile-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <User size={18} color="var(--primary)" /> Profile Information
              </div>
              <div className="card-body">
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 'var(--text-2xl)', fontWeight: 800, flexShrink: 0 }}>
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{profile?.full_name || 'User'}</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>{user?.email}</div>
                    <span className="badge badge-active" style={{ marginTop: 'var(--space-1)' }}>Active Account</span>
                  </div>
                </div>

                <form onSubmit={handleProfileSave}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={profileForm.fullName} onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Your full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 000 0000" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" value={user?.email || ''} readOnly style={{ background: 'var(--gray-50)', color: 'var(--gray-500)' }} />
                    <div className="form-error" style={{ color: 'var(--gray-400)' }}>Email cannot be changed here.</div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <><span className="spinner spinner-sm" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Lock size={18} color="var(--primary)" /> Change Password
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSave} style={{ maxWidth: 400 }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-input" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                    {pwSaving ? <><span className="spinner spinner-sm" /> Updating...</> : <><Lock size={16} /> Update Password</>}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

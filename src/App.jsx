import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import AdminPortal from './pages/AdminPortal'
import ClientPortal from './pages/ClientPortal'

export default function App() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const stored = sessionStorage.getItem('sc_user')
    if (stored) try { setUser(JSON.parse(stored)) } catch {}
  }, [])
  const logout = () => { sessionStorage.removeItem('sc_user'); setUser(null) }
  if (!user) return <LoginPage onLogin={u => { sessionStorage.setItem('sc_user', JSON.stringify(u)); setUser(u) }} />
  if (user.rol === 'admin' || user.rol === 'macro') return <AdminPortal user={user} onLogout={logout} />
  return <ClientPortal user={user} onLogout={logout} />
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@lyra.ci')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      localStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch (e: any) {
      setError(e.message || 'Erreur réseau')
    } finally { setLoading(false) }
  }

  // AUTO-LOGIN au chargement
  useEffect(() => { login() }, [])

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0f0a',color:'#fff',fontFamily:'sans-serif'}}>
      <div>
        <h1 style={{textAlign:'center',marginBottom:16}}>Connexion automatique...</h1>
        {loading && <p style={{textAlign:'center',color:'#d4af37'}}>Connexion en cours...</p>}
        {error && <p style={{textAlign:'center',color:'#ef4444'}}>Erreur: {error}</p>}
        {!loading && !error && (
          <div style={{textAlign:'center'}}>
            <p>Cliquez pour vous connecter :</p>
            <button onClick={login} style={{marginTop:12,padding:'12px 32px',background:'#d4af37',border:'none',borderRadius:8,color:'#000',fontSize:16,cursor:'pointer'}}>
              Se connecter
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

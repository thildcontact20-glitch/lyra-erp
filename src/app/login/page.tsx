'use client'
import { useEffect } from 'react'

export default function LoginPage() {
  useEffect(() => {
    window.location.href = '/api/auto-login'
  }, [])
  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0f0a',color:'#d4af37',fontFamily:'sans-serif'}}>
      <p>Redirection...</p>
    </main>
  )
}

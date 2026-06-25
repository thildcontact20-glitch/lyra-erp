'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  useEffect(() => {
    window.location.href = '/api/auto-login'
  }, [])
  return (
    <main style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#0a0f0a',color:'#d4af37',fontFamily:'sans-serif'}}>
      <motion.img
        src="/img/coris.png"
        alt="Coris"
        style={{width:120,marginBottom:24}}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      <p>Redirection...</p>
    </main>
  )
}

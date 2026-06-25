'use client'
import { motion } from 'framer-motion'
import AppShell from '@/components/layout/AppShell'

export default function AdminSpace() {
  return (
    <AppShell>
      <main style={{minHeight:'100vh',background:'#0a0f0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'sans-serif',padding:24}}>
        {/* Logo Coris qui tourne */}
        <motion.img
          src="/img/coris.png"
          alt="Coris"
          style={{width:160,height:'auto',marginBottom:32}}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        <h1 style={{fontSize:28,color:'#d4af37',marginBottom:16}}>🛡️ Espace Administrateur</h1>
        <p style={{color:'rgba(255,255,255,0.5)',marginBottom:32}}>Panneau de contrôle LYRA by Vivalys</p>

        <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',maxWidth:600}}>
          <Card title="👥 Utilisateurs" desc="Gérer les comptes" />
          <Card title="📊 Abonnements" desc="Plans et souscriptions" />
          <Card title="📦 Société" desc="Configurer l'entreprise" />
          <Card title="🔐 Sécurité" desc="Logs et permissions" />
          <Card title="📧 Emails" desc="Resend & notifications" />
          <Card title="⚙️ Système" desc="Base de données & logs" />
        </div>

        <div style={{marginTop:48,padding:'24px 32px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(212,175,55,0.2)',borderRadius:16}}>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:12,marginBottom:8}}>IDENTIFIANTS ADMIN</p>
          <p style={{color:'#d4af37'}}>📧 admin@lyra.ci</p>
          <p style={{color:'#d4af37'}}>🔑 admin123</p>
        </div>
      </main>
    </AppShell>
  )
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div
      style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:'20px 24px',width:200,cursor:'pointer'}}
      whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.3)' }}
      whileTap={{ scale: 0.97 }}
    >
      <h3 style={{fontSize:16,color:'#f5f0e8',marginBottom:4}}>{title}</h3>
      <p style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{desc}</p>
    </motion.div>
  )
}

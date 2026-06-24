'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Plus, Building2, Mail } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageTransition from '@/components/animations/PageTransition'
import CardFinance from '@/components/ui/CardFinance'

interface SubInfo { plan: { name: string }; status: string; paymentPeriod: string }
interface Company { id: string; name: string; email: string; subscription: SubInfo | null }

const PLANS = ['starter', 'business', 'enterprise'] as const

const FALLBACK: Company[] = [
  { id: 'c1', name: 'KONE Conseil SARL', email: 'contact@kone-conseil.ci', subscription: { plan: { name: 'Business' }, status: 'active', paymentPeriod: 'monthly' } },
  { id: 'c2', name: 'DIAKITE & Freres', email: 'info@diakite-freres.ci', subscription: { plan: { name: 'Starter' }, status: 'active', paymentPeriod: 'annual' } },
  { id: 'c3', name: 'TRAORE Logistics', email: 'admin@traorelogistics.ci', subscription: { plan: { name: 'Enterprise' }, status: 'active', paymentPeriod: 'monthly' } },
  { id: 'c4', name: 'SOW Distribution', email: 'info@sow-dist.ci', subscription: { plan: { name: 'Starter' }, status: 'trial', paymentPeriod: 'monthly' } },
  { id: 'c5', name: 'ZONGO Tech', email: 'hello@zongo-tech.ci', subscription: null },
]

export default function AdminSubPage() {
  const [companies, setCompanies] = useState<Company[]>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [selCompany, setSelCompany] = useState('')
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [plan, setPlan] = useState('business')
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    fetch('/api/admin/companies').then(r => r.ok ? r.json() : Promise.reject(''))
      .then(res => { if (res.data) setCompanies(res.data) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setMsg(null)
    const body: any = { planCode: plan, paymentPeriod: period }
    if (selCompany) { body.companyId = selCompany }
    else {
      if (!newName.trim()) { setMsg({ ok: false, text: 'Nom requis' }); setSubmitting(false); return }
      body.companyName = newName.trim(); body.companyEmail = newEmail.trim()
    }
    try {
      const res = await fetch('/api/admin/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (res.ok) {
        setMsg({ ok: true, text: 'Abonnement ' + plan + ' active' })
        fetch('/api/admin/companies').then(r => r.json()).then(d => { if (d.data) setCompanies(d.data) })
        setSelCompany(''); setNewName(''); setNewEmail('')
      } else { setMsg({ ok: false, text: data.error || 'Erreur' }) }
    } catch { setMsg({ ok: false, text: 'Erreur serveur' }) }
    finally { setSubmitting(false) }
  }

  const badge = (s: string | null | undefined) => {
    if (!s) return <span className="text-xs text-white/30">---</span>
    if (s === 'active') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Actif</span>
    if (s === 'trial') return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Essai</span>
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{s}</span>
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-lyra-cream">Gestion des Abonnements</h1>
            <p className="text-sm text-white/40 mt-1">Gerer les plans Starter / Business / Enterprise</p>
          </motion.div>
          <AnimatePresence>{msg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className={'px-4 py-3 rounded-xl flex items-center gap-2 text-sm ' + (msg.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
              {msg.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}{msg.text}
            </motion.div>
          )}</AnimatePresence>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardFinance className="p-5">
                <h2 className="text-sm font-semibold text-lyra-cream flex items-center gap-2 mb-4"><Building2 className="w-4 h-4 text-lyra-gold" /> Societes</h2>
                {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-lyra-gold animate-spin" /></div> : (
                  <div className="overflow-x-auto"><table className="w-full text-sm">
                    <thead><tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                      <th className="pb-3 pr-4">Societe</th><th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Plan</th><th className="pb-3 pr-4">Statut</th><th className="pb-3">Periode</th>
                    </tr></thead>
                    <tbody>{companies.map((c, i) => (
                      <motion.tr key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 pr-4 text-lyra-cream font-medium">{c.name}</td>
                        <td className="py-3 pr-4 text-white/50">{c.email}</td>
                        <td className="py-3 pr-4"><span className="text-lyra-gold">{c.subscription?.plan?.name || '---'}</span></td>
                        <td className="py-3 pr-4">{badge(c.subscription?.status)}</td>
                        <td className="py-3 text-white/40">{c.subscription?.paymentPeriod || '---'}</td>
                      </motion.tr>
                    ))}</tbody>
                  </table></div>
                )}
              </CardFinance>
            </div>
            <div>
              <CardFinance className="p-5">
                <h2 className="text-sm font-semibold text-lyra-cream flex items-center gap-2 mb-4"><Plus className="w-4 h-4 text-lyra-gold" /> Activer</h2>
                <form onSubmit={submit} className="space-y-4">
                  <div><label className="block text-xs text-white/50 mb-1.5 uppercase">Societe</label>
                    <select value={selCompany} onChange={e => { setSelCompany(e.target.value); if (e.target.value) { setNewName(''); setNewEmail('') } }}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-lyra-cream focus:outline-none focus:border-lyra-gold/40">
                      <option value="">--- Nouvelle ---</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <p className="text-[10px] text-white/30 uppercase">Ou nouvelle societe</p>
                    <input type="text" value={newName} onChange={e => { setNewName(e.target.value); if (e.target.value) setSelCompany('') }}
                      placeholder="Nom" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40" />
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                      placeholder="Email" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40" />
                  </div>
                  <div><label className="block text-xs text-white/50 mb-1.5 uppercase">Plan</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLANS.map(p => (
                        <button key={p} type="button" onClick={() => setPlan(p)}
                          className={'px-3 py-2 rounded-lg text-xs font-medium border ' + (plan === p ? 'bg-lyra-gold/15 border-lyra-gold/40 text-lyra-gold' : 'bg-white/5 border-white/10 text-white/50')}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-xs text-white/50 mb-1.5 uppercase">Periode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setPeriod('monthly')}
                        className={'px-3 py-2 rounded-lg text-xs font-medium border ' + (period === 'monthly' ? 'bg-lyra-gold/15 border-lyra-gold/40 text-lyra-gold' : 'bg-white/5 border-white/10 text-white/50')}>Mensuel</button>
                      <button type="button" onClick={() => setPeriod('annual')}
                        className={'px-3 py-2 rounded-lg text-xs font-medium border ' + (period === 'annual' ? 'bg-lyra-gold/15 border-lyra-gold/40 text-lyra-gold' : 'bg-white/5 border-white/10 text-white/50')}>Annuel</button>
                    </div>
                  </div>
                  <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-lyra-gold to-amber-600 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {submitting ? '...' : 'Activer'}
                  </motion.button>
                </form>
              </CardFinance>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  )
}

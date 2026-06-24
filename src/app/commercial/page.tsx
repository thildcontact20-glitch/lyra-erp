'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Users, FileText, Plus, X, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageTransition from '@/components/animations/PageTransition'
import StaggerContainer from '@/components/animations/StaggerContainer'
import CardFinance from '@/components/ui/CardFinance'
import ButtonElegant from '@/components/ui/ButtonElegant'
import { fadeUpVariants, listItemVariants } from '@/lib/framerVariants'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface Customer {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
}

interface Invoice {
  id: string
  number: string
  customer?: { name: string }
  customerId: string
  date: string
  dueDate: string
  totalHT: number
  totalTVA: number
  totalTTC: number
  status: string
}

/* ───────────────────────────────────────────────────────────────
   Fallback Data
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'KONE Ibrahim', contact: 'Directeur', email: 'i.kone@example.ci', phone: '+225 01 02 03 04', address: 'Abidjan Cocody' },
  { id: 'c2', name: 'DIAKIT\u00e9 Fatoumata', contact: 'Comptable', email: 'f.diakite@example.ci', phone: '+225 05 06 07 08', address: 'Abidjan Plateau' },
  { id: 'c3', name: 'SODECI SA', contact: 'Service Facturation', email: 'factures@sodeci.ci', phone: '+225 20 30 40 50', address: 'Abidjan Treichville' },
  { id: 'c4', name: 'BICICI Bank', contact: 'Direction', email: 'compta@bicici.ci', phone: '+225 21 22 23 24', address: 'Abidjan Plateau' },
  { id: 'c5', name: 'Orange CI', contact: 'Service Achats', email: 'achats@orange.ci', phone: '+225 07 08 09 10', address: 'Abidjan Marcory' },
]

const FALLBACK_INVOICES: Invoice[] = [
  { id: 'i1', number: 'FAC-2024-0456', customerId: 'c3', customer: { name: 'SODECI SA' }, date: '2024-05-30', dueDate: '2024-06-29', totalHT: 1567797, totalTVA: 282203, totalTTC: 1850000, status: 'OVERDUE' },
  { id: 'i2', number: 'FAC-2024-0457', customerId: 'c4', customer: { name: 'BICICI Bank' }, date: '2024-06-05', dueDate: '2024-07-05', totalHT: 2711864, totalTVA: 488136, totalTTC: 3200000, status: 'PENDING' },
  { id: 'i3', number: 'FAC-2024-0458', customerId: 'c5', customer: { name: 'Orange CI' }, date: '2024-05-10', dueDate: '2024-06-09', totalHT: 826271, totalTVA: 148729, totalTTC: 975000, status: 'OVERDUE' },
  { id: 'i4', number: 'FAC-2024-0459', customerId: 'c1', customer: { name: 'KONE Ibrahim' }, date: '2024-06-15', dueDate: '2024-07-15', totalHT: 3474576, totalTVA: 625424, totalTTC: 4100000, status: 'PAID' },
  { id: 'i5', number: 'FAC-2024-0460', customerId: 'c2', customer: { name: 'DIAKIT\u00e9 Fatoumata' }, date: '2024-06-20', dueDate: '2024-07-20', totalHT: 1271186, totalTVA: 228814, totalTTC: 1500000, status: 'PENDING' },
]

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const statusCfg: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PAID: { label: 'Pay\u00e9e', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle },
  PENDING: { label: '\u00c0 \u00e9choir', color: 'text-lyra-gold bg-lyra-gold/10', icon: Clock },
  OVERDUE: { label: 'En retard', color: 'text-red-400 bg-red-500/10', icon: AlertCircle },
}

export default function CommercialPage() {
  const [tab, setTab] = useState<'customers' | 'invoices'>('customers')
  const [customers, setCustomers] = useState<Customer[]>(FALLBACK_CUSTOMERS)
  const [invoices, setInvoices] = useState<Invoice[]>(FALLBACK_INVOICES)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showAddInvoice, setShowAddInvoice] = useState(false)
  const [searchC, setSearchC] = useState('')
  const [searchI, setSearchI] = useState('')

  // Add customer form state
  const [newCust, setNewCust] = useState({ name: '', contact: '', email: '', phone: '', address: '' })
  // Add invoice form state
  const [newInv, setNewInv] = useState({ customerId: '', number: '', totalHT: 0 })

  useEffect(() => {
    fetch('/api/commercial/customers').then(r => r.ok ? r.json() : Promise.reject()).then(d => setCustomers(d.data)).catch(() => {})
    fetch('/api/commercial/invoices').then(r => r.ok ? r.json() : Promise.reject()).then(d => setInvoices(d.data)).catch(() => {})
  }, [])

  const addCustomer = () => {
    if (!newCust.name) return
    const c: Customer = { id: `c${Date.now()}`, ...newCust }
    setCustomers(prev => [c, ...prev])
    setNewCust({ name: '', contact: '', email: '', phone: '', address: '' })
    setShowAddCustomer(false)
  }

  const addInvoice = () => {
    if (!newInv.customerId || !newInv.number || !newInv.totalHT) return
    const cust = customers.find(c => c.id === newInv.customerId)
    const ttc = newInv.totalHT * 1.18
    const inv: Invoice = {
      id: `i${Date.now()}`, number: newInv.number, customerId: newInv.customerId,
      customer: cust ? { name: cust.name } : undefined,
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
      totalHT: newInv.totalHT, totalTVA: newInv.totalHT * 0.18, totalTTC: ttc, status: 'PENDING',
    }
    setInvoices(prev => [inv, ...prev])
    setNewInv({ customerId: '', number: '', totalHT: 0 })
    setShowAddInvoice(false)
  }

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchC.toLowerCase()) || c.contact.toLowerCase().includes(searchC.toLowerCase()))
  const filteredInvoices = invoices.filter(i => (i.number.toLowerCase().includes(searchI.toLowerCase()) || (i.customer?.name || '').toLowerCase().includes(searchI.toLowerCase())))

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-lyra-cream">Gestion Commerciale</h1>
              <p className="text-sm text-white/40 mt-1">Clients &mdash; Factures &mdash; Relances</p>
            </div>
          </motion.div>

          {/* KPI */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Clients</span>
                <Users className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{customers.length}</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Factures</span>
                <FileText className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{invoices.length}</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Impay&eacute;es</span>
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xl font-bold text-red-400 mt-2">{invoices.filter(i => i.status === 'OVERDUE').length}</p>
            </CardFinance>
          </StaggerContainer>

          {/* Tabs + actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
              <button onClick={() => setTab('customers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'customers' ? 'bg-lyra-gold/15 text-lyra-gold shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              ><Users className="w-4 h-4" />Clients</button>
              <button onClick={() => setTab('invoices')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'invoices' ? 'bg-lyra-gold/15 text-lyra-gold shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              ><FileText className="w-4 h-4" />Factures</button>
            </div>
            <ButtonElegant size="sm" onClick={() => tab === 'customers' ? setShowAddCustomer(true) : setShowAddInvoice(true)}>
              <Plus className="w-4 h-4 mr-1" />{tab === 'customers' ? 'Client' : 'Facture'}
            </ButtonElegant>
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <input type="text"
              placeholder={tab === 'customers' ? 'Rechercher un client...' : 'Rechercher une facture...'}
              value={tab === 'customers' ? searchC : searchI}
              onChange={e => tab === 'customers' ? setSearchC(e.target.value) : setSearchI(e.target.value)}
              className="w-full pl-3 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40 transition-colors"
            />
          </div>

          <AnimatePresence mode="wait">
            {/* CUSTOMERS TAB */}
            {tab === 'customers' && (
              <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCustomers.map((c, i) => (
                    <motion.div key={c.id} variants={fadeUpVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}>
                      <CardFinance>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-lyra-gold/10 border border-lyra-gold/20 flex items-center justify-center text-lyra-gold font-bold text-sm">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-lyra-cream">{c.name}</p>
                              <p className="text-xs text-white/40">{c.contact}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-white/50">
                          {c.email && <p>\u2709 {c.email}</p>}
                          {c.phone && <p>\u260E {c.phone}</p>}
                          {c.address && <p>\u2302 {c.address}</p>}
                        </div>
                      </CardFinance>
                    </motion.div>
                  ))}
                </StaggerContainer>
              </motion.div>
            )}

            {/* INVOICES TAB */}
            {tab === 'invoices' && (
              <motion.div key="invoices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="space-y-3">
                  {filteredInvoices.map((inv, i) => {
                    const cfg = statusCfg[inv.status] || statusCfg.PENDING
                    const Icon = cfg.icon
                    return (
                      <motion.div key={inv.id} variants={listItemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.04 }}>
                        <CardFinance className="!p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-lyra-gold" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-lyra-cream">{inv.number}</p>
                                <p className="text-xs text-white/50">{inv.customer?.name || 'Client'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-lyra-cream">{fmt(inv.totalTTC)} FCFA</p>
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                                <Icon className="w-3 h-3" />{cfg.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-2 text-[10px] text-white/30">
                            <span>Facture: {inv.date}</span>
                            <span>\u00c9ch\u00e9ance: {inv.dueDate}</span>
                          </div>
                        </CardFinance>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ADD CUSTOMER MODAL */}
          <AnimatePresence>
            {showAddCustomer && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAddCustomer(false)}
              >
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-lyra-navy border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-lyra-cream">Nouveau Client</h3>
                    <button onClick={() => setShowAddCustomer(false)} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-3">
                    {(['name', 'contact', 'email', 'phone', 'address'] as const).map(f => (
                      <input key={f} type={f === 'email' ? 'email' : 'text'} placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                        value={newCust[f]} onChange={e => setNewCust(p => ({ ...p, [f]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40"
                      />
                    ))}
                    <ButtonElegant className="w-full mt-2" onClick={addCustomer}>Ajouter le client</ButtonElegant>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ADD INVOICE MODAL */}
            {showAddInvoice && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAddInvoice(false)}
              >
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-lyra-navy border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-lyra-cream">Nouvelle Facture</h3>
                    <button onClick={() => setShowAddInvoice(false)} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-3">
                    <select value={newInv.customerId} onChange={e => setNewInv(p => ({ ...p, customerId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream focus:outline-none focus:border-lyra-gold/40"
                    >
                      <option value="" className="bg-lyra-navy">S\u00e9lectionner un client</option>
                      {customers.map(c => <option key={c.id} value={c.id} className="bg-lyra-navy">{c.name}</option>)}
                    </select>
                    <input type="text" placeholder="Num\u00e9ro de facture"
                      value={newInv.number} onChange={e => setNewInv(p => ({ ...p, number: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40"
                    />
                    <input type="number" placeholder="Montant HT (FCFA)"
                      value={newInv.totalHT || ''} onChange={e => setNewInv(p => ({ ...p, totalHT: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40"
                    />
                    <ButtonElegant className="w-full mt-2" onClick={addInvoice}>Cr\u00e9er la facture</ButtonElegant>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </AppShell>
  )
}

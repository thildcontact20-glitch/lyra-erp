'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Warehouse, ArrowUpDown, AlertTriangle, Search, Plus } from 'lucide-react'
import AppShell from '../../components/layout/AppShell'
import PageTransition from '../../components/animations/PageTransition'
import StaggerContainer from '../../components/animations/StaggerContainer'
import CardFinance from '../../components/ui/CardFinance'
import CloseButton from '../../components/ui/CloseButton'
import ButtonElegant from '../../components/ui/ButtonElegant'
import { fadeUpVariants, listItemVariants } from '../../lib/framerVariants'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface StockItem {
  id: string
  code: string
  label: string
  unit: string
  price: number
  stock: number
  warehouseId?: string
}

interface Warehouse {
  id: string
  label: string
  location: string
}

interface Movement {
  id: string
  type: 'IN' | 'OUT' | 'TRANSFER'
  quantity: number
  date: string
  note?: string
  warehouse?: { label: string }
  itemId: string
}

/* ───────────────────────────────────────────────────────────────
   Fallback Data
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_ITEMS: StockItem[] = [
  { id: 's1', code: 'ART-001', label: 'Ordinateurs Portables Dell', unit: 'U', price: 650000, stock: 12 },
  { id: 's2', code: 'ART-002', label: "Cartouches d'encre HP", unit: 'U', price: 25000, stock: 3 },
  { id: 's3', code: 'ART-003', label: 'Mobilier de bureau', unit: 'U', price: 350000, stock: 8 },
  { id: 's4', code: 'ART-004', label: 'Fournitures de papeterie', unit: 'Lot', price: 15000, stock: 45 },
  { id: 's5', code: 'ART-005', label: 'Climatiseurs split', unit: 'U', price: 450000, stock: 2 },
  { id: 's6', code: 'ART-006', label: 'Imprimante Laser Canon', unit: 'U', price: 185000, stock: 5 },
  { id: 's7', code: 'ART-007', label: 'C\u00e2bles RJ45 (bo\u00eete)', unit: 'Lot', price: 8500, stock: 1 },
  { id: 's8', code: 'ART-008', label: 'Tables de conf\u00e9rence', unit: 'U', price: 520000, stock: 4 },
]

const FALLBACK_WAREHOUSES: Warehouse[] = [
  { id: 'w1', label: 'Entrep\u00f4t Central Abidjan', location: 'Abidjan Zone 4' },
  { id: 'w2', label: 'D\u00e9p\u00f4t Plateau', location: 'Abidjan Plateau' },
  { id: 'w3', label: 'Entrep\u00f4t Bouak\u00e9', location: 'Bouak\u00e9 Centre' },
]

const FALLBACK_MOVEMENTS: Movement[] = [
  { id: 'm1', type: 'IN', quantity: 10, date: '2024-06-20', note: 'R\u00e9approvisionnement Dell', warehouse: { label: 'Entrep\u00f4t Central Abidjan' }, itemId: 's1' },
  { id: 'm2', type: 'OUT', quantity: 2, date: '2024-06-19', note: 'Livraison client KONE', warehouse: { label: 'Entrep\u00f4t Central Abidjan' }, itemId: 's1' },
  { id: 'm3', type: 'IN', quantity: 50, date: '2024-06-18', note: 'Stock papeterie', warehouse: { label: 'D\u00e9p\u00f4t Plateau' }, itemId: 's4' },
  { id: 'm4', type: 'OUT', quantity: 1, date: '2024-06-17', note: 'Installation si\u00e8ge social', warehouse: { label: 'Entrep\u00f4t Central Abidjan' }, itemId: 's5' },
  { id: 'm5', type: 'IN', quantity: 5, date: '2024-06-15', note: 'Nouvelle commande Canon', warehouse: { label: 'Entrep\u00f4t Bouak\u00e9' }, itemId: 's6' },
]

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const tabs = [
  { id: 'items', label: 'Articles', icon: Package },
  { id: 'warehouses', label: 'Entrep\u00f4ts', icon: Warehouse },
  { id: 'movements', label: 'Mouvements', icon: ArrowUpDown },
] as const
type TabId = typeof tabs[number]['id']

export default function StocksPage() {
  const [activeTab, setActiveTab] = useState<TabId>('items')
  const [items, setItems] = useState<StockItem[]>(FALLBACK_ITEMS)
  const [warehouses, setWarehouses] = useState<Warehouse[]>(FALLBACK_WAREHOUSES)
  const [movements, setMovements] = useState<Movement[]>(FALLBACK_MOVEMENTS)
  const [showAddItem, setShowAddItem] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [newItem, setNewItem] = useState({ code: '', label: '', unit: 'U', price: 0, stock: 0 })

  useEffect(() => {
    fetch('/api/stocks/items').then(r => r.ok ? r.json() : Promise.reject()).then(d => setItems(d.data)).catch(() => {})
    fetch('/api/stocks/warehouses').then(r => r.ok ? r.json() : Promise.reject()).then(d => setWarehouses(d.data)).catch(() => {})
    fetch('/api/stocks/movements').then(r => r.ok ? r.json() : Promise.reject()).then(d => setMovements(d.data)).catch(() => {})
  }, [])

  const addItem = () => {
    if (!newItem.code || !newItem.label) return
    const item: StockItem = { id: `s${Date.now()}`, code: newItem.code, label: newItem.label, unit: newItem.unit, price: newItem.price, stock: newItem.stock }
    setItems(prev => [item, ...prev])
    setNewItem({ code: '', label: '', unit: 'U', price: 0, stock: 0 })
    setShowAddItem(false)
  }

  const filteredItems = items.filter(i => i.code.toLowerCase().includes(searchQ.toLowerCase()) || i.label.toLowerCase().includes(searchQ.toLowerCase()))
  const filteredMovements = movements.filter(m => m.note?.toLowerCase().includes(searchQ.toLowerCase()) || m.type.toLowerCase().includes(searchQ.toLowerCase()))
  const totalValue = items.reduce((s, i) => s + i.price * i.stock, 0)
  const lowStockItems = items.filter(i => i.stock < 5)

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-lyra-cream">Gestion des Stocks</h1>
              <p className="text-sm text-white/40 mt-1">Articles &mdash; Entrep&ocirc;ts &mdash; Mouvements</p>
            </div>
            {lowStockItems.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">{lowStockItems.length} article(s) sous seuil</span>
              </div>
            )}
          </motion.div>

          {/* KPI */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Articles</span>
                <Package className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{items.length}</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Entrep&ocirc;ts</span>
                <Warehouse className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{warehouses.length}</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Valeur Stock</span>
                <Package className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{fmt(totalValue)} FCFA</p>
            </CardFinance>
            <CardFinance className={lowStockItems.length > 0 ? 'border-red-500/30' : ''}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Alertes</span>
                <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
              </div>
              <p className={`text-xl font-bold mt-2 ${lowStockItems.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {lowStockItems.length > 0 ? lowStockItems.length : 'OK'}
              </p>
            </CardFinance>
          </StaggerContainer>

          <div className="flex items-center justify-between">
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-lyra-gold/15 text-lyra-gold shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
                ><tab.icon className="w-4 h-4" />{tab.label}</button>
              ))}
            </div>
            {activeTab === 'items' && (
              <ButtonElegant size="sm" onClick={() => setShowAddItem(true)}><Plus className="w-4 h-4 mr-1" />Article</ButtonElegant>
            )}
          </div>

          <div className="relative max-w-xs">
            <input type="text"
              placeholder={activeTab === 'items' ? 'Rechercher un article...' : activeTab === 'warehouses' ? 'Rechercher un entrep\u00f4t...' : 'Rechercher un mouvement...'}
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full pl-3 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40 transition-colors"
            />
          </div>

          <AnimatePresence mode="wait">
            {/* ITEMS */}
            {activeTab === 'items' && (
              <motion.div key="items" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item, i) => {
                    const isLow = item.stock < 5
                    return (
                      <motion.div key={item.id} variants={fadeUpVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.04 }}>
                        <CardFinance className={isLow ? 'border-red-500/30 !p-4' : '!p-4'}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-lyra-cream">{item.label}</p>
                              <p className="text-xs font-mono text-lyra-gold mt-0.5">{item.code}</p>
                            </div>
                            {isLow && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <div>
                              <span className="text-[10px] text-white/40 uppercase">Stock</span>
                              <p className={`text-lg font-bold ${isLow ? 'text-red-400' : 'text-emerald-400'}`}>
                                {item.stock} <span className="text-xs text-white/40">{item.unit}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-white/40 uppercase">Prix U.</span>
                              <p className="text-sm font-medium text-lyra-cream">{fmt(item.price)} FCFA</p>
                            </div>
                          </div>
                          {isLow && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              className="mt-2 px-2 py-1 rounded-lg bg-red-500/10 text-[10px] text-red-400 font-medium flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> Stock critique - R\u00e9approvisionnement n\u00e9cessaire
                            </motion.div>
                          )}
                        </CardFinance>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* WAREHOUSES */}
            {activeTab === 'warehouses' && (
              <motion.div key="warehouses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {warehouses.map((w, i) => (
                    <motion.div key={w.id} variants={fadeUpVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}>
                      <CardFinance>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-lyra-gold/10 border border-lyra-gold/20 flex items-center justify-center">
                            <Warehouse className="w-5 h-5 text-lyra-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-lyra-cream">{w.label}</p>
                            <p className="text-xs text-white/40">{w.location}</p>
                          </div>
                        </div>
                      </CardFinance>
                    </motion.div>
                  ))}
                </StaggerContainer>
              </motion.div>
            )}

            {/* MOVEMENTS */}
            {activeTab === 'movements' && (
              <motion.div key="movements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="space-y-3">
                  {filteredMovements.map((m, i) => (
                    <motion.div key={m.id} variants={listItemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.04 }}>
                      <CardFinance className="!p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              m.type === 'IN' ? 'bg-emerald-500/10 text-emerald-400' : m.type === 'OUT' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              <ArrowUpDown className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-lyra-cream">
                                <span className={`font-semibold ${m.type === 'IN' ? 'text-emerald-400' : m.type === 'OUT' ? 'text-red-400' : 'text-amber-400'}`}>
                                  {m.type === 'IN' ? 'ENTR\u00c9E' : m.type === 'OUT' ? 'SORTIE' : 'TRANSFERT'}
                                </span>
                                {' '}&mdash; {m.quantity} unit\u00e9s
                              </p>
                              <p className="text-xs text-white/50">{m.note || 'Aucune note'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/50">{m.warehouse?.label || '-'}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">{m.date}</p>
                          </div>
                        </div>
                      </CardFinance>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ADD ITEM MODAL */}
          <AnimatePresence>
            {showAddItem && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAddItem(false)}
              >
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-lyra-navy border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-lyra-cream">Nouvel Article</h3>
                    <button onClick={() => setShowAddItem(false)} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Code article" value={newItem.code}
                      onChange={e => setNewItem(p => ({ ...p, code: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40"
                    />
                    <input type="text" placeholder="Libell\u00e9" value={newItem.label}
                      onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40"
                    />
                    <div className="flex gap-3">
                      <input type="number" placeholder="Prix unitaire" value={newItem.price || ''}
                        onChange={e => setNewItem(p => ({ ...p, price: Number(e.target.value) }))}
                        className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40"
                      />
                      <input type="number" placeholder="Stock initial" value={newItem.stock || ''}
                        onChange={e => setNewItem(p => ({ ...p, stock: Number(e.target.value) }))}
                        className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40"
                      />
                    </div>
                    <ButtonElegant className="w-full mt-2" onClick={addItem}>Ajouter l'article</ButtonElegant>
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

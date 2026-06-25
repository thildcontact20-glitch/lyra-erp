'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, FileText, Scale, Search, DollarSign, Wallet, RefreshCw } from 'lucide-react'
import AppShell from '../../components/layout/AppShell'
import PageTransition from '../../components/animations/PageTransition'
import StaggerContainer from '../../components/animations/StaggerContainer'
import CardFinance from '../../components/ui/CardFinance'
import { fadeUpVariants, listItemVariants } from '../../lib/framerVariants'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface ChartAccount {
  id: string
  code: string
  label: string
  type: string
}

interface EntryLine {
  id: string
  accountCode: string
  accountLabel: string
  debit: number
  credit: number
}

interface Entry {
  id: string
  reference: string
  label: string
  date: string
  lines: EntryLine[]
}

interface BalanceLine {
  accountCode: string
  totalDebit: number
  totalCredit: number
  balance: number
}

/* ───────────────────────────────────────────────────────────────
   Fallback Data — OHADA SYSCOHADA
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_CHART: ChartAccount[] = [
  { id: '1', code: '101', label: 'Capital social', type: 'EQUITY' },
  { id: '2', code: '164', label: "Emprunts aupr\u00e8s des \u00e9tablissements de cr\u00e9dit", type: 'LIABILITY' },
  { id: '3', code: '201', label: "Frais d'\u00e9tablissement", type: 'ASSET' },
  { id: '4', code: '211', label: 'Terrains', type: 'ASSET' },
  { id: '5', code: '213', label: 'Constructions', type: 'ASSET' },
  { id: '6', code: '218', label: 'Mat\u00e9riel de bureau et informatique', type: 'ASSET' },
  { id: '7', code: '281', label: 'Amortissements des immobilisations', type: 'ASSET' },
  { id: '8', code: '311', label: 'Marchandises', type: 'ASSET' },
  { id: '9', code: '411', label: 'Clients', type: 'ASSET' },
  { id: '10', code: '421', label: 'Fournisseurs', type: 'LIABILITY' },
  { id: '11', code: '431', label: 'Personnel - r\u00e9mun\u00e9rations dues', type: 'LIABILITY' },
  { id: '12', code: '441', label: '\u00c9tat - TVA collect\u00e9e', type: 'LIABILITY' },
  { id: '13', code: '471', label: "Compte d'attente", type: 'ASSET' },
  { id: '14', code: '511', label: 'Banques', type: 'ASSET' },
  { id: '15', code: '531', label: 'Caisse', type: 'ASSET' },
  { id: '16', code: '601', label: 'Achats de marchandises', type: 'EXPENSE' },
  { id: '17', code: '701', label: 'Ventes de marchandises', type: 'REVENUE' },
  { id: '18', code: '641', label: 'Salaires et traitements', type: 'EXPENSE' },
  { id: '19', code: '671', label: 'Imp\u00f4ts et taxes', type: 'EXPENSE' },
  { id: '20', code: '811', label: 'R\u00e9sultat net', type: 'EQUITY' },
]

const FALLBACK_ENTRIES: Entry[] = [
  {
    id: '1', reference: 'EC-2024-001', label: 'Vente au comptant client KONE', date: '2024-06-20',
    lines: [
      { id: 'l1', accountCode: '531', accountLabel: 'Caisse', debit: 2500000, credit: 0 },
      { id: 'l2', accountCode: '701', accountLabel: 'Ventes de marchandises', debit: 0, credit: 2118644 },
      { id: 'l3', accountCode: '441', accountLabel: '\u00c9tat - TVA collect\u00e9e', debit: 0, credit: 381356 },
    ]
  },
  {
    id: '2', reference: 'EC-2024-002', label: 'Achat fournitures bureau', date: '2024-06-19',
    lines: [
      { id: 'l4', accountCode: '601', accountLabel: 'Achats de marchandises', debit: 350000, credit: 0 },
      { id: 'l5', accountCode: '511', accountLabel: 'Banques', debit: 0, credit: 350000 },
    ]
  },
  {
    id: '3', reference: 'EC-2024-003', label: 'R\u00e8glement facture client DIAKIT\u00c9', date: '2024-06-18',
    lines: [
      { id: 'l6', accountCode: '511', accountLabel: 'Banques', debit: 1800000, credit: 0 },
      { id: 'l7', accountCode: '411', accountLabel: 'Clients', debit: 0, credit: 1800000 },
    ]
  },
  {
    id: '4', reference: 'EC-2024-004', label: 'Paiement salaires juin 2024', date: '2024-06-17',
    lines: [
      { id: 'l8', accountCode: '641', accountLabel: 'Salaires et traitements', debit: 4200000, credit: 0 },
      { id: 'l9', accountCode: '431', accountLabel: 'Personnel - r\u00e9mun\u00e9rations dues', debit: 0, credit: 4200000 },
    ]
  },
  {
    id: '5', reference: 'EC-2024-005', label: 'Facture \u00e9lectricit\u00e9 SODECI', date: '2024-06-16',
    lines: [
      { id: 'l10', accountCode: '601', accountLabel: 'Achats de marchandises', debit: 245000, credit: 0 },
      { id: 'l11', accountCode: '511', accountLabel: 'Banques', debit: 0, credit: 245000 },
    ]
  },
]

const FALLBACK_BALANCE: BalanceLine[] = [
  { accountCode: '101', totalDebit: 0, totalCredit: 50000000, balance: -50000000 },
  { accountCode: '164', totalDebit: 0, totalCredit: 15000000, balance: -15000000 },
  { accountCode: '211', totalDebit: 25000000, totalCredit: 0, balance: 25000000 },
  { accountCode: '213', totalDebit: 35000000, totalCredit: 0, balance: 35000000 },
  { accountCode: '218', totalDebit: 8500000, totalCredit: 0, balance: 8500000 },
  { accountCode: '281', totalDebit: 0, totalCredit: 12000000, balance: -12000000 },
  { accountCode: '311', totalDebit: 6500000, totalCredit: 0, balance: 6500000 },
  { accountCode: '411', totalDebit: 8200000, totalCredit: 1800000, balance: 6400000 },
  { accountCode: '421', totalDebit: 0, totalCredit: 4200000, balance: -4200000 },
  { accountCode: '431', totalDebit: 0, totalCredit: 4200000, balance: -4200000 },
  { accountCode: '441', totalDebit: 0, totalCredit: 381356, balance: -381356 },
  { accountCode: '511', totalDebit: 1800000, totalCredit: 595000, balance: 1205000 },
  { accountCode: '531', totalDebit: 2500000, totalCredit: 0, balance: 2500000 },
  { accountCode: '601', totalDebit: 595000, totalCredit: 0, balance: 595000 },
  { accountCode: '641', totalDebit: 4200000, totalCredit: 0, balance: 4200000 },
  { accountCode: '701', totalDebit: 0, totalCredit: 2118644, balance: -2118644 },
]

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const tabs = [
  { id: 'chart', label: 'Plan Comptable', icon: BookOpen },
  { id: 'entries', label: 'Journaux', icon: FileText },
  { id: 'balance', label: 'Balance', icon: Scale },
] as const
type TabId = typeof tabs[number]['id']

const typeLabel = (type: string) => {
  const labels: Record<string, string> = {
    ASSET: 'Actif', LIABILITY: 'Passif', EQUITY: 'Capitaux Propres',
    REVENUE: 'Produits', EXPENSE: 'Charges',
  }
  return labels[type] || type
}

const typeColor = (type: string) => {
  const colors: Record<string, string> = {
    ASSET: 'text-emerald-400 bg-emerald-500/10',
    LIABILITY: 'text-amber-400 bg-amber-500/10',
    EQUITY: 'text-violet-400 bg-violet-500/10',
    REVENUE: 'text-blue-400 bg-blue-500/10',
    EXPENSE: 'text-red-400 bg-red-500/10',
  }
  return colors[type] || 'text-white/50 bg-white/5'
}

export default function ComptaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('chart')
  const [chart, setChart] = useState<ChartAccount[]>(FALLBACK_CHART)
  const [entries, setEntries] = useState<Entry[]>(FALLBACK_ENTRIES)
  const [balance, setBalance] = useState<BalanceLine[]>(FALLBACK_BALANCE)
  const [searchQ, setSearchQ] = useState('')

  useEffect(() => {
    fetch('/api/accounting/chart').then(r => r.ok ? r.json() : Promise.reject()).then(d => setChart(d.data)).catch(() => {})
    fetch('/api/accounting/entries').then(r => r.ok ? r.json() : Promise.reject()).then(d => setEntries(d.data)).catch(() => {})
    fetch('/api/accounting/balance').then(r => r.ok ? r.json() : Promise.reject()).then(d => setBalance(d.data)).catch(() => {})
  }, [])

  const filteredChart = chart.filter(a => a.code.includes(searchQ) || a.label.toLowerCase().includes(searchQ.toLowerCase()))
  const filteredEntries = entries.filter(e => e.reference.toLowerCase().includes(searchQ.toLowerCase()) || e.label.toLowerCase().includes(searchQ.toLowerCase()))

  const totalDebit = balance.reduce((s, l) => s + l.totalDebit, 0)
  const totalCredit = balance.reduce((s, l) => s + l.totalCredit, 0)

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-lyra-cream">Comptabilit&eacute; LYRA</h1>
              <p className="text-sm text-white/40 mt-1">Plan comptable LYRA &mdash; &Eacute;critures &mdash; Balance g&eacute;n&eacute;rale</p>
            </div>
            <RefreshCw className="w-4 h-4 text-white/20" />
          </motion.div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Total D&eacute;bit</span>
                <DollarSign className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{fmt(totalDebit)} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Total Cr&eacute;dit</span>
                <Wallet className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{fmt(totalCredit)} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">&Eacute;critures</span>
                <FileText className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{entries.length}</p>
            </CardFinance>
          </StaggerContainer>

          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-lyra-gold/15 text-lyra-gold shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs">
            <input type="text"
              placeholder={activeTab === 'chart' ? 'Rechercher un compte...' : "Rechercher une \u00e9criture..."}
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full pl-3 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40 transition-colors"
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'chart' && (
              <motion.div key="chart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <CardFinance className="overflow-hidden !p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-white/40 font-medium">Code</th>
                          <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-white/40 font-medium">Libell&eacute;</th>
                          <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-white/40 font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredChart.map((account, i) => (
                          <motion.tr key={account.id} variants={listItemVariants} initial="hidden" animate="visible"
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="py-3 px-4 font-mono text-lyra-gold text-xs">{account.code}</td>
                            <td className="py-3 px-4 text-lyra-cream">{account.label}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColor(account.type)}`}>{typeLabel(account.type)}</span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardFinance>
              </motion.div>
            )}

            {activeTab === 'entries' && (
              <motion.div key="entries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                {filteredEntries.map((entry, i) => (
                  <motion.div key={entry.id} variants={fadeUpVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}>
                    <CardFinance className="!p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-lyra-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-lyra-cream">{entry.reference}</p>
                            <p className="text-xs text-white/50">{entry.label}</p>
                          </div>
                        </div>
                        <span className="text-xs text-white/40">{entry.date}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-2 pr-4 text-white/40 font-medium">Compte</th>
                              <th className="text-left py-2 pr-4 text-white/40 font-medium">Libell&eacute;</th>
                              <th className="text-right py-2 pr-4 text-white/40 font-medium">D&eacute;bit</th>
                              <th className="text-right py-2 pr-4 text-white/40 font-medium">Cr&eacute;dit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entry.lines.map(line => (
                              <tr key={line.id} className="border-b border-white/5 last:border-0">
                                <td className="py-1.5 pr-4 font-mono text-lyra-gold">{line.accountCode}</td>
                                <td className="py-1.5 pr-4 text-white/70">{line.accountLabel}</td>
                                <td className="py-1.5 pr-4 text-right text-emerald-400">{line.debit > 0 ? fmt(line.debit) : '-'}</td>
                                <td className="py-1.5 pr-4 text-right text-amber-400">{line.credit > 0 ? fmt(line.credit) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardFinance>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'balance' && (
              <motion.div key="balance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <CardFinance className="overflow-hidden !p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-white/40 font-medium">Compte</th>
                          <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-white/40 font-medium">Total D&eacute;bit</th>
                          <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-white/40 font-medium">Total Cr&eacute;dit</th>
                          <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-white/40 font-medium">Solde</th>
                        </tr>
                      </thead>
                      <tbody>
                        {balance.map((line, i) => (
                          <motion.tr key={line.accountCode} variants={listItemVariants} initial="hidden" animate="visible"
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="py-3 px-4 font-mono text-lyra-gold text-xs">{line.accountCode}</td>
                            <td className="py-3 px-4 text-right text-emerald-400 font-medium">{line.totalDebit > 0 ? fmt(line.totalDebit) : '-'}</td>
                            <td className="py-3 px-4 text-right text-amber-400 font-medium">{line.totalCredit > 0 ? fmt(line.totalCredit) : '-'}</td>
                            <td className={`py-3 px-4 text-right font-semibold ${line.balance >= 0 ? 'text-lyra-cream' : 'text-red-400'}`}>
                              {fmt(Math.abs(line.balance))} {line.balance >= 0 ? 'D\u00e9biteur' : 'Cr\u00e9diteur'}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-lyra-gold/20 bg-lyra-gold/5">
                          <td className="py-3 px-4 font-bold text-lyra-gold text-xs uppercase">Totaux</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400">{fmt(totalDebit)}</td>
                          <td className="py-3 px-4 text-right font-bold text-amber-400">{fmt(totalCredit)}</td>
                          <td className="py-3 px-4 text-right font-bold text-lyra-cream">{fmt(Math.abs(totalDebit - totalCredit))}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardFinance>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </AppShell>
  )
}

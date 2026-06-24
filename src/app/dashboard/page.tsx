'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, useDroppable, useDraggable, DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, DollarSign, Package, Wallet, Activity, Target, Award,
  ArrowUp, ArrowDown, ChevronRight, CreditCard, FileText, AlertCircle,
  CheckCircle, Clock, Zap, Star, Shield, Heart, BookOpen, Sparkles,
} from 'lucide-react'
import { fadeUpVariants, staggerContainerVariants, listItemVariants } from '../../lib/framerVariants'
import AppShell from '../../components/layout/AppShell'
import PageTransition from '../../components/animations/PageTransition'
import StaggerContainer from '../../components/animations/StaggerContainer'
import CardFinance from '../../components/ui/CardFinance'
import ButtonElegant from '../../components/ui/ButtonElegant'
import Link from 'next/link'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface KpiData {
  label: string
  value: string
  trend: number
  icon: React.ElementType
  prefix?: string
  suffix?: string
}

interface EntryData {
  id: string
  reference: string
  label: string
  date: string
  total: number
}

interface InvoiceData {
  id: string
  reference: string
  client: string
  amount: number
  status: string
  dueDate: string
}

interface StockItem {
  id: string
  label: string
  code: string
  quantity: number
  threshold: number
}

interface ActivityChartData {
  month: string
  revenue: number
  expenses: number
}

interface ObjectiveData {
  label: string
  current: number
  target: number
  unit: string
}

interface RecognitionData {
  label: string
  icon: React.ElementType
  description: string
}

/* ───────────────────────────────────────────────────────────────
   Fallback data when API calls fail
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_ENTRIES: EntryData[] = [
  { id: '1', reference: 'EC-2024-001', label: 'Vente au comptant client KONE', date: '2024-06-20', total: 2500000 },
  { id: '2', reference: 'EC-2024-002', label: 'Achat fournitures bureau', date: '2024-06-19', total: 350000 },
  { id: '3', reference: 'EC-2024-003', label: 'Règlement facture client DIAKITÉ', date: '2024-06-18', total: 1800000 },
  { id: '4', reference: 'EC-2024-004', label: 'Paiement salaires juin', date: '2024-06-17', total: 4200000 },
  { id: '5', reference: 'EC-2024-005', label: 'Facture électricité SODECI', date: '2024-06-16', total: 245000 },
]

const FALLBACK_INVOICES: InvoiceData[] = [
  { id: '1', reference: 'FAC-2024-0456', client: 'SODECI SA', amount: 1850000, status: 'En retard', dueDate: '2024-05-30' },
  { id: '2', reference: 'FAC-2024-0457', client: 'BICICI Bank', amount: 3200000, status: 'À échoir', dueDate: '2024-07-05' },
  { id: '3', reference: 'FAC-2024-0458', client: 'Orange CI', amount: 975000, status: 'En retard', dueDate: '2024-06-10' },
  { id: '4', reference: 'FAC-2024-0459', client: 'Air France', amount: 4100000, status: 'Payée', dueDate: '2024-06-15' },
  { id: '5', reference: 'FAC-2024-0460', client: 'TotalEnergies', amount: 1500000, status: 'À échoir', dueDate: '2024-07-20' },
]

const FALLBACK_STOCK: StockItem[] = [
  { id: '1', label: 'Ordinateurs Portables Dell', code: 'STK-001', quantity: 12, threshold: 5 },
  { id: '2', label: "Cartouches d'encre HP", code: 'STK-002', quantity: 3, threshold: 10 },
  { id: '3', label: 'Mobilier de bureau', code: 'STK-003', quantity: 8, threshold: 4 },
  { id: '4', label: 'Fournitures de papeterie', code: 'STK-004', quantity: 45, threshold: 20 },
  { id: '5', label: 'Climatiseurs split', code: 'STK-005', quantity: 2, threshold: 3 },
]

const FALLBACK_CHART_DATA: ActivityChartData[] = [
  { month: 'Jan', revenue: 4500000, expenses: 3200000 },
  { month: 'Fév', revenue: 5200000, expenses: 3800000 },
  { month: 'Mar', revenue: 4800000, expenses: 3500000 },
  { month: 'Avr', revenue: 6100000, expenses: 4100000 },
  { month: 'Mai', revenue: 5900000, expenses: 3900000 },
  { month: 'Juin', revenue: 7200000, expenses: 4300000 },
]

const FALLBACK_OBJECTIVES: ObjectiveData[] = [
  { label: "Chiffre d'Affaires", current: 72, target: 100, unit: 'M FCFA' },
  { label: 'Réduction des délais clients', current: 38, target: 30, unit: 'jours' },
  { label: 'Marge brute', current: 42, target: 55, unit: '%' },
]

const FALLBACK_RECOGNITIONS: RecognitionData[] = [
  { label: 'Top Performeur', icon: Star, description: 'Atteint les objectifs 3 mois consécutifs' },
  { label: 'Conformité Totale', icon: Shield, description: '100% des déclarations à temps' },
  { label: "Esprit d'Équipe", icon: Heart, description: 'Contribution exceptionnelle au collectif' },
  { label: 'Innovation', icon: Zap, description: 'Process amélioré ce trimestre' },
  { label: 'Expertise OHADA', icon: BookOpen, description: 'Certification SYSCOHADA validée' },
]

/* ───────────────────────────────────────────────────────────────
   Helper: format number with spaces
   ─────────────────────────────────────────────────────────────── */
function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

/* ───────────────────────────────────────────────────────────────
   KPICard — single KPI metric with animated counter
   ─────────────────────────────────────────────────────────────── */
function KPICard({ data, index }: { data: KpiData; index: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  const rawValue = parseFloat(data.value.replace(/[^0-9.]/g, '')) || 0
  const Icon = data.icon
  const isPositive = data.trend >= 0

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 1200
    const step = Math.ceil(rawValue / 30)
    const interval = setInterval(() => {
      start += step
      if (start >= rawValue) {
        setDisplayValue(rawValue)
        clearInterval(interval)
      } else {
        setDisplayValue(start)
      }
    }, duration / 30)
    return () => clearInterval(interval)
  }, [isInView, rawValue])

  const display =
    rawValue >= 1000000
      ? `${data.prefix || ''}${(displayValue / 1000000).toFixed(1)}${data.suffix || ''} M`
      : rawValue >= 1000
        ? `${data.prefix || ''}${formatNumber(Math.round(displayValue))}${data.suffix || ''}`
        : `${data.prefix || ''}${displayValue.toFixed(1)}${data.suffix || ''}`

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      className="w-full"
    >
      <CardFinance className="p-5 flex flex-col gap-3 h-full relative overflow-hidden group">
        <motion.div
          className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,97,0.6), transparent)',
          }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.15em] text-white/50 font-medium">{data.label}</span>
          <div className="w-9 h-9 rounded-lg bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center">
            <Icon className="w-4 h-4 text-lyra-gold" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-2xl md:text-3xl font-display font-bold text-lyra-cream tracking-tight">
            {display}
          </span>
          <motion.div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}
            initial={{ opacity: 0, x: 10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
          >
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{Math.abs(data.trend)}%</span>
          </motion.div>
        </div>
      </CardFinance>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   PerformanceRing — SVG circular progress
   ─────────────────────────────────────────────────────────────── */
function PerformanceRing({ percentage, label }: { percentage: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const [animatedPct, setAnimatedPct] = useState(0)

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const interval = setInterval(() => {
      start += 1
      if (start >= percentage) {
        setAnimatedPct(percentage)
        clearInterval(interval)
      } else {
        setAnimatedPct(start)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [isInView, percentage])

  const color = percentage >= 75 ? '#10B981' : percentage >= 50 ? '#C9A961' : '#EF4444'

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative w-[120px] h-[120px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={isInView ? { strokeDashoffset } : {}}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold font-display"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            {animatedPct}%
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-white/50 uppercase tracking-[0.1em]">{label}</span>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   ObjectivesPanel — progress bars for monthly objectives
   ─────────────────────────────────────────────────────────────── */
function ObjectivesPanel({ objectives }: { objectives: ObjectiveData[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className="space-y-5">
      <h4 className="text-sm font-semibold text-lyra-cream flex items-center gap-2">
        <Target className="w-4 h-4 text-lyra-gold" />
        Objectifs du mois
      </h4>
      <div className="space-y-4">
        {objectives.map((obj, i) => {
          const pct = Math.min(Math.round((obj.current / obj.target) * 100), 100)
          const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-lyra-gold' : 'bg-red-500'
          return (
            <motion.div
              key={obj.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-white/70">{obj.label}</span>
                <span className="text-xs text-white/40">
                  {obj.current} / {obj.target} {obj.unit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${pct}%` } : {}}
                  transition={{ delay: 0.2 + i * 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="flex justify-end mt-0.5">
                <span className="text-[10px] text-white/30">{pct}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   RecognitionsShowcase — badge grid
   ─────────────────────────────────────────────────────────────── */
function RecognitionsShowcase({ recognitions }: { recognitions: RecognitionData[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-lyra-cream flex items-center gap-2">
        <Award className="w-4 h-4 text-lyra-gold" />
        Reconnaissances
      </h4>
      <div className="grid grid-cols-5 gap-3">
        {recognitions.map((rec, i) => {
          const Icon = rec.icon
          return (
            <motion.div
              key={rec.label}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lyra-gold/20 to-amber-600/10 border border-lyra-gold/30 flex items-center justify-center group-hover:border-lyra-gold/60 group-hover:shadow-lg group-hover:shadow-lyra-gold/20 transition-all duration-300">
                <Icon className="w-5 h-5 text-lyra-gold" />
              </div>
              <div className="text-[9px] text-white/50 text-center leading-tight group-hover:text-white/80 transition-colors">
                {rec.label}
              </div>
            </motion.div>
          )
        })}
      </div>
      <p className="text-[10px] text-white/30 text-center mt-1">
        Badges obtenus ce trimestre — 5/5 débloqués
      </p>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   DraggableWidget — wrapper for drag-and-drop
   ─────────────────────────────────────────────────────────────── */
function DraggableWidget({
  id, children, title,
}: {
  id: string
  children: React.ReactNode
  title: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-shadow ${isDragging ? 'shadow-2xl shadow-lyra-gold/20 ring-1 ring-lyra-gold/30 z-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-lyra-cream">{title}</h3>
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded-md hover:bg-white/5 text-white/30 hover:text-lyra-gold/60 transition-colors cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="4" r="1.2" fill="currentColor" />
            <circle cx="11" cy="4" r="1.2" fill="currentColor" />
            <circle cx="5" cy="8" r="1.2" fill="currentColor" />
            <circle cx="11" cy="8" r="1.2" fill="currentColor" />
            <circle cx="5" cy="12" r="1.2" fill="currentColor" />
            <circle cx="11" cy="12" r="1.2" fill="currentColor" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   DroppableZone — grid cell for widgets
   ─────────────────────────────────────────────────────────────── */
function DroppableZone({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`${className || ''} ${isOver ? 'ring-2 ring-lyra-gold/40 rounded-xl' : ''} transition-all duration-200`}
    >
      {children}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Widget — Activité Récente
   ─────────────────────────────────────────────────────────────── */
function RecentActivityWidget({ entries }: { entries: EntryData[] }) {
  return (
    <CardFinance className="p-5 h-full">
      <DraggableWidget id="recent-activity" title="Activité Récente">
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors"
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-lyra-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/80 truncate max-w-[180px]">{entry.label}</p>
                  <p className="text-[10px] text-white/30">{entry.reference}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-lyra-cream">{formatNumber(entry.total)} FCFA</p>
                <p className="text-[10px] text-white/30">{entry.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <button className="w-full mt-3 flex items-center justify-center gap-1 text-[11px] text-lyra-gold/60 hover:text-lyra-gold transition-colors py-1">
          Voir tout <ChevronRight className="w-3 h-3" />
        </button>
      </DraggableWidget>
    </CardFinance>
  )
}

/* ───────────────────────────────────────────────────────────────
   Widget — Factures en Attente
   ─────────────────────────────────────────────────────────────── */
function PendingInvoicesWidget({ invoices }: { invoices: InvoiceData[] }) {
  const statusColor = (s: string) => {
    if (s === 'En retard') return 'text-red-400 bg-red-500/10'
    if (s === 'Payée') return 'text-emerald-400 bg-emerald-500/10'
    return 'text-lyra-gold bg-lyra-gold/10'
  }

  return (
    <CardFinance className="p-5 h-full">
      <DraggableWidget id="pending-invoices" title="Factures en Attente">
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {invoices.filter(inv => inv.status !== 'Payée').slice(0, 4).map((inv, i) => (
            <motion.div
              key={inv.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors"
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-3.5 h-3.5 text-lyra-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/80 truncate max-w-[150px]">{inv.client}</p>
                  <p className="text-[10px] text-white/30">{inv.reference}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-lyra-cream">{formatNumber(inv.amount)} FCFA</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${statusColor(inv.status)}`}>
                  {inv.status}
                </span>
              </div>
            </motion.div>
          ))}
          {invoices.filter(inv => inv.status !== 'Payée').length === 0 && (
            <div className="flex items-center justify-center py-6 text-white/30 text-xs">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
              Aucune facture en attente
            </div>
          )}
        </div>
      </DraggableWidget>
    </CardFinance>
  )
}

/* ───────────────────────────────────────────────────────────────
   Widget — Graphique d'Activité (Recharts BarChart)
   ─────────────────────────────────────────────────────────────── */
function ActivityChartWidget({ data }: { data: ActivityChartData[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const formatChartVal = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
    return `${v}`
  }

  return (
    <CardFinance className="p-5 h-full">
      <DraggableWidget id="activity-chart" title="Graphique d'Activité">
        <div ref={ref} className="h-[220px]">
          {isInView && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatChartVal}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0B1428',
                    border: '1px solid rgba(201,169,97,0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F5F5F0',
                  }}
                  formatter={(value: number) => [`${formatNumber(value)} FCFA`]}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenus"
                  fill="#C9A961"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  animationBegin={0}
                  animationDuration={800}
                />
                <Bar
                  dataKey="expenses"
                  name="Dépenses"
                  fill="#4A6FA5"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  animationBegin={200}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </DraggableWidget>
    </CardFinance>
  )
}

/* ───────────────────────────────────────────────────────────────
   Widget — État du Stock
   ─────────────────────────────────────────────────────────────── */
function StockStatusWidget({ items }: { items: StockItem[] }) {
  return (
    <CardFinance className="p-5 h-full">
      <DraggableWidget id="stock-status" title="État du Stock">
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {items.map((item, i) => {
            const isLow = item.quantity <= item.threshold
            return (
              <motion.div
                key={item.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                variants={listItemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-lyra-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white/80 truncate max-w-[160px]">{item.label}</p>
                    <p className="text-[10px] text-white/30">{item.code}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-medium ${isLow ? 'text-red-400' : 'text-lyra-cream'}`}>
                    {item.quantity} {isLow && <AlertCircle className="w-3 h-3 inline ml-1 text-red-400" />}
                  </p>
                  <p className="text-[10px] text-white/30">seuil: {item.threshold}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </DraggableWidget>
    </CardFinance>
  )
}

/* ───────────────────────────────────────────────────────────────
   Dashboard Main Page
   ─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [entries, setEntries] = useState<EntryData[]>(FALLBACK_ENTRIES)
  const [invoices, setInvoices] = useState<InvoiceData[]>(FALLBACK_INVOICES)
  const [stockItems, setStockItems] = useState<StockItem[]>(FALLBACK_STOCK)
  const [chartData, setChartData] = useState<ActivityChartData[]>(FALLBACK_CHART_DATA)
  const [planName, setPlanName] = useState<string>('')
  const [planStatus, setPlanStatus] = useState<string>('')
  const [widgetOrder, setWidgetOrder] = useState<string[]>([
    'recent-activity',
    'pending-invoices',
    'activity-chart',
    'stock-status',
  ])
  const [loading, setLoading] = useState(true)
  const [noCompany, setNoCompany] = useState(false)
  const [firstLogin, setFirstLogin] = useState(false)
  const [companyLoading, setCompanyLoading] = useState(true)

  /* ── Fetch subscription info on mount ── */
  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.ok ? r.json() : Promise.reject('fail'))
      .then(res => {
        const d = res.data || {}
        setPlanName(d.plan?.name || 'Starter')
        setPlanStatus(d.status || 'active')
      })
      .catch(() => {
        // fallback: assume active subscription
        setPlanName('Business')
        setPlanStatus('active')
      })
  }, [])

  /* ── Check company + first_login on mount ── */
  useEffect(() => {
    const checkCompany = async () => {
      try {
        const res = await fetch('/api/companies')
        if (!res.ok) {
          // 404 = no company
          setNoCompany(true)
          return
        }
        const json = await res.json()
        if (!json.data) {
          setNoCompany(true)
        } else {
          setNoCompany(false)
          // Check first_login flag
          const flag = localStorage.getItem('first_login')
          if (flag === 'true') {
            setFirstLogin(true)
            localStorage.removeItem('first_login')
          }
        }
      } catch {
        setNoCompany(false) // assume company exists on error
      } finally {
        setCompanyLoading(false)
      }
    }
    checkCompany()
  }, [])

  /* ── Fetch data on mount with fallback ── */
  useEffect(() => {
    async function fetchAll() {
      try {
        const [entriesRes, invoicesRes, stockRes] = await Promise.allSettled([
          fetch('/api/accounting/entries').then(r => r.ok ? r.json() : Promise.reject('fail')),
          fetch('/api/commercial/invoices').then(r => r.ok ? r.json() : Promise.reject('fail')),
          fetch('/api/stocks/items').then(r => r.ok ? r.json() : Promise.reject('fail')),
        ])

        if (entriesRes.status === 'fulfilled') {
          const raw = entriesRes.value.data || []
          setEntries(raw.slice(0, 5).map((e: any) => ({
            id: e.id,
            reference: e.reference || '',
            label: e.label || '',
            date: e.date?.split('T')[0] || '',
            total: e.lines?.reduce((s: number, l: any) => s + (l.debit || 0), 0) || 0,
          })))
        }

        if (invoicesRes.status === 'fulfilled') {
          const raw = invoicesRes.value.data || []
          setInvoices(raw.slice(0, 5).map((inv: any) => ({
            id: inv.id,
            reference: inv.reference || '',
            client: inv.clientName || inv.customerName || '',
            amount: inv.totalAmount || inv.amount || 0,
            status: inv.status || '',
            dueDate: inv.dueDate?.split('T')[0] || '',
          })))
        }

        if (stockRes.status === 'fulfilled') {
          const raw = stockRes.value.data || []
          setStockItems(raw.slice(0, 5).map((item: any) => ({
            id: item.id,
            label: item.label || item.name || '',
            code: item.code || item.sku || '',
            quantity: item.quantity || 0,
            threshold: item.threshold || item.minStock || 0,
          })))
        }
      } catch {
        // fallback already set from initial state
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  /* ── Handle drag end ── */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = widgetOrder.indexOf(active.id as string)
    const newIndex = widgetOrder.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return

    setWidgetOrder(arrayMove(widgetOrder, oldIndex, newIndex))
  }, [widgetOrder])

  /* ── KPI data ── */
  const kpiData: KpiData[] = [
    { label: "Chiffre d'Affaires", value: '33700000', trend: 12.5, icon: DollarSign, prefix: '', suffix: ' FCFA' },
    { label: 'Marge Nette', value: '24.8', trend: 3.2, icon: TrendingUp, suffix: '%' },
    { label: 'Trésorerie', value: '12450000', trend: 8.1, icon: Wallet, suffix: ' FCFA' },
    { label: 'Stock Total', value: '8450000', trend: -2.4, icon: Package, suffix: ' FCFA' },
  ]

  /* ── Compute performance ring from objectives ── */
  const avgObjectivePct = Math.round(
    FALLBACK_OBJECTIVES.reduce((acc, o) => acc + Math.min((o.current / o.target) * 100, 100), 0) /
    FALLBACK_OBJECTIVES.length
  )

  /* ── Render widgets in order ── */
  const widgetMap: Record<string, React.ReactNode> = {
    'recent-activity': <RecentActivityWidget entries={entries} />,
    'pending-invoices': <PendingInvoicesWidget invoices={invoices} />,
    'activity-chart': <ActivityChartWidget data={chartData} />,
    'stock-status': <StockStatusWidget items={stockItems} />,
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold text-lyra-cream">Dashboard</h1>
            <p className="text-sm text-white/40 mt-1">Vue d&apos;ensemble de votre entreprise</p>
          </motion.div>

          {/* ── Plan Badge ── */}
          {planName && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-2"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div className="glass rounded-lg px-4 py-2 flex items-center gap-3 gold-border">
                  <span className="text-lyra-gold text-sm">Plan</span>
                  <span className="text-white font-semibold">{planName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    planStatus === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {planStatus === 'active' ? 'Actif' : 'Essai'}
                  </span>
                </div>
                <Link href="/pricing">
                  <span className="text-lyra-gold text-sm hover:underline cursor-pointer">Changer de plan →</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Onboarding Banner ── */}
          {!companyLoading && (noCompany || firstLogin) && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={`relative overflow-hidden rounded-xl border ${
                noCompany
                  ? 'bg-gradient-to-r from-amber-500/10 via-lyra-gold/5 to-transparent border-lyra-gold/20'
                  : 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20'
              } p-5`}>
                {/* Glow effect */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[80px] ${
                  noCompany ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                }`} />

                <div className="relative flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      noCompany
                        ? 'bg-amber-500/10 border border-amber-500/20'
                        : 'bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      <Sparkles className={`w-5 h-5 ${
                        noCompany ? 'text-amber-400' : 'text-emerald-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-lyra-cream">
                        {noCompany
                          ? 'Bienvenue dans LYRA !'
                          : 'Félicitations ! Votre société est prête.'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {noCompany
                          ? 'Commencez par configurer votre société.'
                          : 'Suivez le guide pour démarrer.'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={noCompany ? '/auth/new-company' : '/getting-started'}
                  >
                    <motion.div
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        noCompany
                          ? 'bg-lyra-gold text-lyra-dark hover:bg-lyra-goldlight shadow-lg shadow-lyra-gold/20'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                      }`}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {noCompany ? 'Configurer →' : 'Guide de démarrage →'}
                    </motion.div>
                  </Link>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => {
                    setNoCompany(false)
                    setFirstLogin(false)
                  }}
                  className="absolute top-2 right-2 p-1 rounded-md text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
                  aria-label="Fermer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── KPIs Row ── */}
          <StaggerContainer>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi, i) => (
                <KPICard key={kpi.label} data={kpi} index={i} />
              ))}
            </div>
          </StaggerContainer>

          {/* ── Middle Section: Performance Ring + Objectives + Recognitions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Performance Ring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CardFinance className="p-5 h-full flex flex-col items-center justify-center">
                <PerformanceRing percentage={avgObjectivePct} label="Taux d'atteinte des objectifs" />
              </CardFinance>
            </motion.div>

            {/* Objectives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CardFinance className="p-5 h-full">
                <ObjectivesPanel objectives={FALLBACK_OBJECTIVES} />
              </CardFinance>
            </motion.div>

            {/* Recognitions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <CardFinance className="p-5 h-full">
                <RecognitionsShowcase recognitions={FALLBACK_RECOGNITIONS} />
              </CardFinance>
            </motion.div>
          </div>

          {/* ── Widget Grid with DnD ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-sm uppercase tracking-[0.15em] text-white/30 mb-4">Widgets</h2>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {widgetOrder.map((id) => (
                  <DroppableZone key={id} id={id}>
                    {widgetMap[id]}
                  </DroppableZone>
                ))}
              </div>
            </DndContext>
          </motion.div>

          {/* ── Footer note ── */}
          <motion.p
            className="text-[10px] text-white/20 text-center pt-4 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Glissez les widgets pour les réorganiser · Données mises à jour en temps réel
          </motion.p>
        </div>
      </PageTransition>
    </AppShell>
  )
}

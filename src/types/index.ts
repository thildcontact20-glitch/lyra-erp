export interface Company {
  id: string; name: string; rcNumber?: string; ciNumber?: string;
  address?: string; phone?: string; email?: string; logoUrl?: string;
}
export interface User { id: string; email: string; name: string; role: string; companyId?: string; }
export interface DashboardKPI { label: string; value: number; unit: string; trend: number; icon: string; color: string; }
export interface ChartAccount { id: string; code: string; label: string; type: string; }
export interface Entry { id: string; date: string; reference: string; label: string; lines: EntryLine[]; }
export interface EntryLine { id: string; accountCode: string; accountLabel: string; debit: number; credit: number; }
export interface Customer { id: string; name: string; contact?: string; email?: string; phone?: string; }
export interface Invoice { id: string; number: string; date: string; totalTTC: number; status: string; customer: Customer; }
export interface Item { id: string; code: string; label: string; price: number; stock: number; }
export interface Warehouse { id: string; label: string; location?: string; }
export interface Employee { id: string; firstName: string; lastName: string; position?: string; baseSalary: number; }
export interface Payroll { id: string; period: string; grossSalary: number; netSalary: number; }
export interface TaxConfig { id: string; label: string; rate: number; type: string; }
export interface OhadaArticle { id: string; category: string; title: string; content: string; source?: string; }
export interface ChatMessage { role: 'user' | 'assistant'; content: string; timestamp: Date; references?: string[]; }

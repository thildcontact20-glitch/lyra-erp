import type { Metadata } from 'next'
import '@/styles/globals.css'
export const metadata: Metadata = {
  title: 'LYRA by Vivalys — ERP OHADA',
  description: 'L\'ERP financier des PME OHADA. Comptabilité SYSCOHADA, fiscalité ivoirienne, paie & CNPS.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-lyra-dark text-lyra-cream antialiased">
        {children}
      </body>
    </html>
  )
}

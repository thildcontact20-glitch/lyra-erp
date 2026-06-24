import Link from 'next/link'

/* ──────────────────────────────────────────────────────────────────────────────
   Footer — Épuré et professionnel
   ────────────────────────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} LYRA by Vivalys — Tous droits réservés
          </p>

          {/* Liens */}
          <div className="flex items-center gap-6">
            <Link
              href="/cgu"
              className="text-white/30 hover:text-lyra-gold text-xs transition-colors duration-200"
            >
              CGU
            </Link>
            <span className="w-px h-3 bg-white/10" />
            <Link
              href="/confidentialite"
              className="text-white/30 hover:text-lyra-gold text-xs transition-colors duration-200"
            >
              Confidentialité
            </Link>
            <span className="w-px h-3 bg-white/10" />
            <a
              href="mailto:contact@vivalyscompagny.com"
              className="text-white/30 hover:text-lyra-gold text-xs transition-colors duration-200"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

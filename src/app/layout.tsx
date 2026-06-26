import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'LYRA by Vivalys — ERP LYRA',
  description: 'L\'ERP financier des PME LYRA. Comptabilité LYRA, fiscalité ivoirienne, paie & CNPS.',
  other: {
    'lyra-copyright': 'Groupe Vivalys 2026',
    'lyra-protected': 'true',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Meta tags anti-vol */}
        <meta name="copyright" content="Groupe Vivalys 2026 - Tous droits réservés" />
        <meta name="author" content="Groupe Vivalys" />
        <meta name="robots" content="noindex, nofollow" />
        <meta httpEquiv="imagetoolbar" content="no" />
        
        {/* Anti-Copie JavaScript */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // === PROTECTION ANTI-VOL LYRA ERP ===
              (function() {
                // 1. Bloquer le clic droit
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  return false;
                });

                // 2. Bloquer la sélection de texte
                document.addEventListener('selectstart', function(e) {
                  e.preventDefault();
                  return false;
                });

                // 3. Bloquer le copier-coller
                document.addEventListener('copy', function(e) {
                  e.preventDefault();
                  return false;
                });
                document.addEventListener('cut', function(e) {
                  e.preventDefault();
                  return false;
                });
                document.addEventListener('paste', function(e) {
                  e.preventDefault();
                  return false;
                });

                // 4. Bloquer les raccourcis clavier de devtools
                document.addEventListener('keydown', function(e) {
                  // F12
                  if (e.key === 'F12') {
                    e.preventDefault();
                    return false;
                  }
                  // Ctrl+Shift+I/J/C
                  if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) {
                    e.preventDefault();
                    return false;
                  }
                  // Ctrl+U (view source)
                  if (e.ctrlKey && e.key.toUpperCase() === 'U') {
                    e.preventDefault();
                    return false;
                  }
                  // Ctrl+S (save)
                  if (e.ctrlKey && e.key.toUpperCase() === 'S') {
                    e.preventDefault();
                    return false;
                  }
                });

                // 5. Anti-devtools détection
                let devtoolsOpen = false;
                const checkDevTools = function() {
                  const threshold = 160;
                  const widthDiff = window.outerWidth - window.innerWidth > threshold;
                  const heightDiff = window.outerHeight - window.innerHeight > threshold;
                  
                  if (widthDiff || heightDiff) {
                    if (!devtoolsOpen) {
                      devtoolsOpen = true;
                      // Optionnel : rediriger ou afficher un message
                      console.log('%cLYRA ERP - Propriété Groupe Vivalys', 'color: #8b0000; font-size: 20px; font-weight: bold;');
                      console.log('%cToute tentative de vol est illégale et passible de poursuites.', 'color: #8b0000; font-size: 14px;');
                    }
                  } else {
                    devtoolsOpen = false;
                  }
                };
                setInterval(checkDevTools, 2000);

                // 6. Watermark invisible dans la console
                console.log('%c⚠️ LYRA ERP ⚠️', 'color: #8b0000; font-size: 30px; font-weight: bold;');
                console.log('%cCe logiciel est la propriété exclusive du Groupe Vivalys.', 'color: #660000; font-size: 14px;');
                console.log('%cToute copie, reproduction ou reverse engineering est interdite.', 'color: #660000; font-size: 14px;');
                console.log('%c© 2026 Groupe Vivalys - Tous droits réservés.', 'color: #440000; font-size: 12px;');

                // 7. Désactiver le drag & drop d'images
                document.addEventListener('dragstart', function(e) {
                  if (e.target instanceof HTMLImageElement) {
                    e.preventDefault();
                    return false;
                  }
                });

                console.log('✅ Protection LYRA activée');
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen bg-lyra-dark text-lyra-cream antialiased">
        {children}
        {/* Watermark visuel discret */}
        <div 
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            padding: '2px 6px',
            fontSize: '8px',
            color: 'rgba(100, 0, 0, 0.12)',
            fontFamily: 'monospace',
            zIndex: 9999,
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '1px'
          }}
        >
          LYRA © VIVALYS 2026
        </div>
      </body>
    </html>
  )
}

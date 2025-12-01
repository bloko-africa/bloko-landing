import { Mail } from "lucide-react";
import { Logo } from "../Logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a110e] border-t border-[#0a9066]/20 py-12">
      <div className="container-bloko">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo variant="white" width={100} height={33} />
            <p className="text-white/60 text-sm leading-relaxed">
              Infrastructure de confiance pour les paiements en ligne en
              Afrique.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Contact
            </h3>
            <a
              href="mailto:hello@bloko.app"
              className="flex items-center gap-2 text-white/60 hover:text-[#0a9066] transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>hello@bloko.me</span>
            </a>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Légal
            </h3>
            <nav className="flex flex-col gap-2">
              <a
                href="/confidentialite"
                className="text-white/60 hover:text-[#0a9066] transition-colors text-sm"
              >
                Politique de confidentialité
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#0a9066]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} Bloko. Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#0D4A46] bg-[#0D4A46] text-[#E6F4F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-xl bg-[#E8632C] flex items-center justify-center text-white font-black text-sm">
                J
              </div>
              <span className="text-lg font-black text-white tracking-tight">JëndCiThiès</span>
            </div>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Place de marché locale pour les commerçants de Mboro, Thiès et région. Produits frais, artisans, restaurants.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-5 text-[#F2A93B]">Commerce</h4>
            <ul className="space-y-2.5">
              <li><a href="/products" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">Produits</a></li>
              <li><a href="/shops" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">Boutiques</a></li>
              <li><a href="/cart" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">Panier</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-5 text-[#F2A93B]">Outils & Services</h4>
            <ul className="space-y-2.5">
              <li><a href="/ai-assistant" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">🤖 Assistant IA (FR/Wolof)</a></li>
              <li><a href="/merchant/poster" className="text-emerald-100/80 text-xs sm:text-sm hover:text-[#F2A93B] transition-colors">🖨️ Affiche QR Code</a></li>
              <li><a href="/checkout" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">💬 Commande WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-5 text-[#F2A93B]">Commerçants</h4>
            <ul className="space-y-2.5">
              <li><a href="/register" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">Créer ma boutique</a></li>
              <li><a href="/mon-commerce" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">Mon commerce</a></li>
              <li><a href="/merchant/dashboard" className="text-emerald-100/80 text-xs sm:text-sm hover:text-white transition-colors">Tableau de bord</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-5 text-[#F2A93B]">Contact</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-emerald-100/80 text-xs sm:text-sm">
                <span>📍</span> Mboro · Thiès, Sénégal
              </li>
              <li className="flex items-center gap-2 text-emerald-100/80 text-xs sm:text-sm">
                <span>📞</span> +221 77 123 45 67
              </li>
              <li className="flex items-center gap-2 text-emerald-100/80 text-xs sm:text-sm">
                <span>✉️</span> contact@jendcithes.sn
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-emerald-200/60 text-xs">
            JëndCiThiès by Sen-E-Carte — Commerce local à Mboro · Thiès, Sénégal
          </p>
          <div className="flex gap-4 text-xs text-emerald-200/60">
            <span>Wave & Espèces</span>
            <span>·</span>
            <span>WhatsApp Commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-green-950 text-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-700 to-green-600 flex items-center justify-center text-white font-bold">
                J
              </div>
              <span className="text-lg font-bold text-white tracking-tight">JëndCiThiès</span>
            </div>
            <p className="text-green-200/80 text-sm leading-relaxed">
              Place de marché locale pour les commerçants de Mboro, Thiès et région. Produits frais, artisans, restaurants.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Commerce</h4>
            <ul className="space-y-3">
              <li><a href="/products" className="text-green-200/80 text-sm hover:text-white transition-colors">Produits</a></li>
              <li><a href="/shops" className="text-green-200/80 text-sm hover:text-white transition-colors">Boutiques</a></li>
              <li><a href="/cart" className="text-green-200/80 text-sm hover:text-white transition-colors">Panier</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Commerçants</h4>
            <ul className="space-y-3">
              <li><a href="/register" className="text-green-200/80 text-sm hover:text-white transition-colors">Créer ma boutique</a></li>
              <li><a href="/mon-commerce" className="text-green-200/80 text-sm hover:text-white transition-colors">Mon commerce</a></li>
              <li><a href="#" className="text-green-200/80 text-sm hover:text-white transition-colors">Tarifs & abonnement</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-green-200/80 text-sm">
                <span>📍</span> Mboro · Thiès, Sénégal
              </li>
              <li className="flex items-center gap-2 text-green-200/80 text-sm">
                <span>📞</span> +221 77 123 45 67
              </li>
              <li className="flex items-center gap-2 text-green-200/80 text-sm">
                <span>✉️</span> contact@jendcithes.sn
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-green-400/70 text-xs">
            JëndCiThiès by Sen-E-Carte — Commerce local à Mboro · Thiès, Sénégal
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-green-400/70 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-green-400/70 hover:text-white transition-colors">
              <span className="sr-only">WhatsApp</span>
            </a>
            <a href="#" className="text-green-400/70 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

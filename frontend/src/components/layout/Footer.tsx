export function Footer() {
  return (
    <footer className="border-t bg-[#1A2E22] text-green-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            <span className="font-bold">JëndCiThiès</span> by Sen-E-Carte — Commerce local à Mboro · Thiès, Sénégal
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              À propos
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Conditions d'utilisation
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Confidentialité
            </a>
          </div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <span className="sr-only">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

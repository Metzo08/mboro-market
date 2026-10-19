export const metadata = {
  title: 'Espace commerçant - Mboro Market',
};

export default function MerchantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-xl font-bold text-gray-900">Mboro Market</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="/merchant/dashboard" className="text-sm font-medium text-gray-700 hover:text-green-600">
                Tableau de bord
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-green-600">
                Produits
              </a>
              <a href="#" className="text-sm font-medium text-gray-700 hover:text-green-600">
                Commandes
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}

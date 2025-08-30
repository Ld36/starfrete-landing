import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoImage from "../../assets/logo_starfrete.png";
import {
  Truck,
  Building2,
  Search,
  Bell,
  MessageSquare,
  User,
  LayoutDashboard,
  PlusSquare,
  Package,
  Map,
  FileText,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

export default function ClientLayout({ children }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: "/company-dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/publish", label: "Publicar Frete", icon: <PlusSquare className="h-5 w-5" /> },
    { path: "/freights", label: "Meus Fretes", icon: <Package className="h-5 w-5" /> },
    { path: "/tracking", label: "Rastreamento", icon: <Map className="h-5 w-5" /> },
    { path: "/documents", label: "Documentos", icon: <FileText className="h-5 w-5" /> },
    { path: "/messages", label: "Mensagens", icon: <MessageSquare className="h-5 w-5" /> },
    { path: "/settings", label: "Configurações", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/company-dashboard">
              <img 
                src={logoImage} 
                alt="StarFrete Logo" 
                className="h-12 w-auto" 
              />
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                className="w-full py-2 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="Buscar fretes, motoristas..." 
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                <User className="h-5 w-5 text-neutral-500" />
              </div>
              <span className="ml-2 font-medium hidden md:block">
                {user?.fullName || user?.name || 'Usuário'}
              </span>
            </div>

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <img 
                      src={logoImage} 
                      alt="StarFrete Logo" 
                      className="h-12 w-auto"
                    />
                  </div>
                </div>
                <div className="p-4">
                  <nav>
                    <ul className="space-y-2">
                      {navItems.map((item) => (
                        <li key={item.path}>
                          <Link 
                            href={item.path}
                            className={`flex items-center p-3 rounded-lg ${
                              location === item.path
                                ? "text-primary bg-primary-50"
                                : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.icon}
                            <span className="ml-3 font-medium">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start p-3 font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Sair
                        </Button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className="w-20 md:w-64 bg-white border-r border-neutral-200 hidden md:block">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className={`flex items-center p-3 rounded-lg ${
                      location === item.path
                        ? "text-primary bg-primary-50"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3 font-medium hidden md:block">{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start p-3 font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-0 md:mr-3" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-neutral-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden bg-white border-t border-neutral-200 fixed bottom-0 left-0 right-0 z-10">
        <div className="grid grid-cols-4">
          <Link href="/company-dashboard" className={`flex flex-col items-center p-2 ${location === "/company-dashboard" ? "text-primary" : "text-neutral-500"}`}>
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs">Início</span>
          </Link>
          <Link href="/publish" className={`flex flex-col items-center p-2 ${location === "/publish" ? "text-primary" : "text-neutral-500"}`}>
            <PlusSquare className="h-5 w-5" />
            <span className="text-xs">Publicar</span>
          </Link>
          <Link href="/freights" className={`flex flex-col items-center p-2 ${location === "/freights" ? "text-primary" : "text-neutral-500"}`}>
            <Package className="h-5 w-5" />
            <span className="text-xs">Fretes</span>
          </Link>
          <Link href="/tracking" className={`flex flex-col items-center p-2 ${location.startsWith("/tracking") ? "text-primary" : "text-neutral-500"}`}>
            <Map className="h-5 w-5" />
            <span className="text-xs">Rastrear</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

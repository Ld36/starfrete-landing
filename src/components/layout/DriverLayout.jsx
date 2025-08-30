import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/use-auth.jsx";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Truck,
  Search,
  Bell,
  MessageSquare,
  User,
  LayoutDashboard,
  Compass,
  Package,
  FileText,
  Settings,
  LogOut,
  Menu,
  Gauge,
} from "lucide-react";

export default function DriverLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: "/driver/dashboard", label: "Painel", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/driver/available", label: "Entregas Disponíveis", icon: <Compass className="h-5 w-5" /> },
    { path: "/driver/freights", label: "Minhas Entregas", icon: <Package className="h-5 w-5" /> },
    { path: "/driver/capacity", label: "Gerenciar Capacidade", icon: <Gauge className="h-5 w-5" /> },
    { path: "/driver/documents", label: "Documentos", icon: <FileText className="h-5 w-5" /> },
    { path: "/driver/messages", label: "Mensagens", icon: <MessageSquare className="h-5 w-5" /> },
    { path: "/driver/settings", label: "Configurações", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo3.png" 
                alt="StarFrete Logo" 
                className="h-12 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-primary">StarFrete</span>
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input 
                type="text" 
                className="w-full py-2 pl-10 pr-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="Buscar fretes disponíveis..." 
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
                {user?.fullName || user?.email}
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
                      src="/logo3.png" 
                      alt="StarFrete Logo" 
                      className="h-12 w-auto"
                    />
                    <span className="ml-2 text-xl font-bold text-primary">StarFrete</span>
                  </div>
                </div>
                <div className="p-4">
                  <nav>
                    <ul className="space-y-2">
                      {navItems.map((item) => (
                        <li key={item.path}>
                          <Link 
                            to={item.path}
                            className={`flex items-center p-3 rounded-lg ${
                              location.pathname === item.path
                                ? "text-primary bg-primary/10"
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
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg ${
                      location.pathname === item.path
                        ? "text-primary bg-primary/10"
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
          <Link 
            to="/driver/dashboard" 
            className={`flex flex-col items-center p-2 ${location.pathname === "/driver/dashboard" ? "text-primary" : "text-neutral-500"}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs">Início</span>
          </Link>
          <Link 
            to="/driver/available" 
            className={`flex flex-col items-center p-2 ${location.pathname === "/driver/available" ? "text-primary" : "text-neutral-500"}`}
          >
            <Compass className="h-5 w-5" />
            <span className="text-xs">Disponíveis</span>
          </Link>
          <Link 
            to="/driver/freights" 
            className={`flex flex-col items-center p-2 ${location.pathname === "/driver/freights" ? "text-primary" : "text-neutral-500"}`}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Entregas</span>
          </Link>
          <Link 
            to="/driver/capacity" 
            className={`flex flex-col items-center p-2 ${location.pathname === "/driver/capacity" ? "text-primary" : "text-neutral-500"}`}
          >
            <Gauge className="h-5 w-5" />
            <span className="text-xs">Capacidade</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

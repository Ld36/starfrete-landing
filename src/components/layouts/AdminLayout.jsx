import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoImage from "../../assets/logo_starfrete.png";
import {
  Shield,
  Users,
  Building2,
  Truck,
  BarChart3,
  Settings,
  FileText,
  AlertTriangle,
  Database,
  Activity,
  LogOut,
  Menu,
  LayoutDashboard,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/admin/users", label: "Usuários", icon: <Users className="h-5 w-5" /> },
    { path: "/admin/companies", label: "Empresas", icon: <Building2 className="h-5 w-5" /> },
    { path: "/admin/drivers", label: "Motoristas", icon: <Truck className="h-5 w-5" /> },
    { path: "/admin/reports", label: "Relatórios", icon: <BarChart3 className="h-5 w-5" /> },
    { path: "/admin/logs", label: "Logs do Sistema", icon: <Activity className="h-5 w-5" /> },
    { path: "/admin/database", label: "Banco de Dados", icon: <Database className="h-5 w-5" /> },
    { path: "/admin/settings", label: "Configurações", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-200">
        <div className="max-w-7xl mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin/dashboard">
              <img 
                src={logoImage} 
                alt="StarFrete"
                className="h-8 mr-3"
              />
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold text-red-600">Admin</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-red-600 font-medium">Administrador</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
            </div>

            {/* Mobile menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="mt-8">
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.path}>
                        <Link href={item.path}>
                          <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            location === item.path
                              ? "bg-red-100 text-red-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}>
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                    <li className="pt-4 border-t">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="ml-3">Sair</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Desktop logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <nav className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 bg-white shadow-sm border-r border-red-200">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <div className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        location === item.path
                          ? "bg-red-100 text-red-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}>
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
              
              {/* Footer da sidebar */}
              <div className="flex-shrink-0 flex border-t border-red-200 p-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      Administrador
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

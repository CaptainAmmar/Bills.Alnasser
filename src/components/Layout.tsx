import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Ship, FileText, FileSpreadsheet, Anchor, 
  Activity, ClipboardList, BarChart3, Truck, Users, 
  Trash2, Bell, Settings as SettingsIcon, LogOut, Menu, X, User, ChevronRight
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { api } from '../api';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
        try {
            const data = await api.get('/notifications');
            setUnreadCount(data.filter((n: any) => !n.isRead).length);
        } catch (e) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout', { userId: user?.id });
    } catch (e) {}
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'الرئيسية', icon: Home, roles: ['مدير', 'موظف جمارك', 'موظف شحن'] },
    { to: '/ships', label: 'البواخر', icon: Ship, roles: ['مدير'] },
    { to: '/bills', label: 'البوالص', icon: FileText, roles: ['مدير'] },
    { to: '/customs', label: 'البيانات الجمركية', icon: FileSpreadsheet, roles: ['مدير', 'موظف جمارك'] },
    { to: '/free-zone', label: 'المنطقة الحرة', icon: Anchor, roles: ['مدير', 'موظف جمارك'] },
    { to: '/operations', label: 'عمليات التشغيل', icon: Activity, roles: ['مدير', 'موظف شحن'] },
    { to: '/headings', label: 'البنود الجمركية', icon: ClipboardList, roles: ['مدير'] },
    { to: '/reports', label: 'التقارير', icon: BarChart3, roles: ['مدير'] },
    { to: '/cars', label: 'السيارات', icon: Truck, roles: ['مدير', 'موظف شحن'] },
    { to: '/users', label: 'الموظفين', icon: Users, roles: ['مدير'] },
    { to: '/deleted-logs', label: 'سجل المحذوفات', icon: Trash2, roles: ['مدير'] },
    { to: '/notifications', label: 'التنبيهات', icon: Bell, roles: ['مدير', 'موظف جمارك', 'موظف شحن'], badge: unreadCount > 0 ? unreadCount : undefined },
    { to: '/instructions', label: 'التعليمات', icon: Bell, roles: ['مدير', 'موظف جمارك', 'موظف شحن'] },
    { to: '/settings', label: 'الإعدادات', icon: SettingsIcon, roles: ['مدير'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (user?.jobTitle === 'مدير') return true;
    return item.roles.includes(user?.jobTitle || '');
  });

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 w-64 bg-primary text-white z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 leading-relaxed",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <h1 className="text-xl font-bold">الناصر للملاحة</h1>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative",
                  isActive ? "bg-white text-primary" : "hover:bg-white/10"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
                {item.badge && (
                    <span className="absolute left-4 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-primary">
                        {item.badge}
                    </span>
                )}
              </NavLink>
            ))}
            
            <div className="border-t border-white/10 my-4 pt-4">
                <NavLink
                    to="/profile"
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive ? "bg-white text-primary" : "hover:bg-white/10"
                    )}
                >
                    <User size={20} />
                    <span className="font-medium text-sm">الملف الشخصي</span>
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 text-red-100 transition-colors mt-1"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">تسجيل الخروج</span>
                </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 mr-auto">
            <div className="text-right">
              <p className="text-xs text-gray-500">{user?.jobTitle}</p>
              <p className="text-sm font-semibold">{user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary border border-gray-200">
               <User size={20} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto h-full">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}

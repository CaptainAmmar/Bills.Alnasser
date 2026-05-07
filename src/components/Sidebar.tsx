import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Zap, 
  BarChart3, 
  Cpu, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Nexus Control', icon: LayoutDashboard },
  { id: 'chat', label: 'AI Intelligence', icon: MessageSquare },
  { id: 'analytics', label: 'Synthetics', icon: BarChart3 },
  { id: 'nodes', label: 'Cloud Nodes', icon: Cpu },
  { id: 'security', label: 'Firewall', icon: ShieldAlert },
];

export const Sidebar = () => {
  return (
    <aside className="w-16 h-screen flex flex-col items-center py-8 glass-panel z-50">
      <div className="mb-12">
        <div className="w-10 h-10 bg-nexus-accent rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(49,102,255,0.4)]">
          <Zap className="text-white w-6 h-6 fill-white" />
        </div>
      </div>

      <nav className="flex-1 space-y-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            className="group relative p-3 rounded-xl hover:bg-white/5 transition-all duration-300"
            title={item.label}
          >
            <item.icon className="w-6 h-6 text-nexus-muted group-hover:text-nexus-accent transition-colors" />
            
            {/* Tooltip placeholder for later */}
            <div className="absolute left-full ml-4 px-3 py-1 bg-nexus-card border border-nexus-border rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs pointer-events-none">
              {item.label}
            </div>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <button className="p-3 rounded-xl hover:bg-white/5 group">
          <Settings className="w-6 h-6 text-nexus-muted group-hover:text-white transition-colors" />
        </button>
      </div>
    </aside>
  );
};

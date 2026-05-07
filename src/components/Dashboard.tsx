import React from 'react';
import { motion } from 'motion/react';
import { Activity, Globe, Cpu, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  { label: 'Neural Throughput', value: '84.2 GB/s', trend: '+12%', icon: Activity, color: 'text-blue-500' },
  { label: 'Active Proxies', value: '1,402', trend: '-2%', icon: Globe, color: 'text-emerald-500' },
  { label: 'CPU Cluster Load', value: '32%', trend: '+5%', icon: Cpu, color: 'text-purple-500' },
  { label: 'Nodes Online', value: '12', trend: 'Stable', icon: Users, color: 'text-orange-500' },
];

export const Dashboard = () => {
  return (
    <div className="flex-1 space-y-8 p-8 overflow-y-auto h-screen">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 font-sans">Command Center</h1>
          <p className="text-nexus-muted text-sm font-mono uppercase tracking-widest">Nexus OS v4.0.1 / Local Node</p>
        </div>
        <div className="flex space-x-2">
          <div className="px-3 py-1 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 text-[10px] text-nexus-accent uppercase font-bold tracking-tighter">
            System Operational
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5 rounded-2xl group hover:border-nexus-accent/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-gray-900 border border-nexus-border group-hover:border-nexus-accent/30 transition-colors ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 
                stat.trend === 'Stable' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-nexus-muted font-mono uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl min-h-[300px] flex flex-col justify-center items-center text-center opacity-70">
           <div className="technical-grid absolute inset-0 rounded-2xl pointer-events-none opacity-20" />
           <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4">Real-time Telemetry Visualization</p>
           <Activity className="w-12 h-12 text-nexus-accent animate-pulse mb-6" />
           <p className="text-nexus-muted text-sm max-w-xs">Connecting to decentralized compute nodes for metric synthesis...</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col">
           <h3 className="text-sm font-mono uppercase tracking-wider mb-6 text-nexus-muted border-b border-nexus-border pb-4">Recent System Logs</h3>
           <div className="space-y-4 flex-1">
              {[
                { time: '12:04:22', msg: 'Neural handshake established' },
                { time: '11:58:01', msg: 'Load balancer scaling: Cluster-02' },
                { time: '11:45:15', msg: 'Security audit: 0 threats detected' },
                { time: '11:30:00', msg: 'Auto-sync completed with node-α' },
              ].map((log, i) => (
                <div key={i} className="flex space-x-3 text-[11px] font-mono leading-tight">
                  <span className="text-nexus-accent opacity-70">{log.time}</span>
                  <span className="text-gray-400">{log.msg}</span>
                </div>
              ))}
           </div>
           <button className="mt-6 w-full py-2 bg-white/5 hover:bg-nexus-accent hover:text-white transition-all rounded-lg text-[10px] font-mono uppercase tracking-widest">
             View Full Archive
           </button>
        </div>
      </div>
    </div>
  );
};

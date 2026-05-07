import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ship, FileText, Truck, Weight, Users, Activity, ExternalLink, ClipboardList, Bell, Clock } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../lib/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    operations: 0,
    cars: 0,
    netWeight: 0,
    activeEmployees: 0,
    bills: 0
  });
  const [recentOps, setRecentOps] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [showToast, setShowToast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [ops, cars, usersData, bills, instr] = await Promise.all([
                api.get('/operations'),
                api.get('/cars'),
                api.get('/users'),
                api.get('/bills'),
                api.get(`/instructions?user_id=${user?.id}`)
            ]);
            
            const today = new Date().toISOString().split('T')[0];
            const todayOps = ops.filter((o: any) => o.timestamp.startsWith(today));
            
            setStats({
                operations: todayOps.length,
                cars: new Set(todayOps.map((o: any) => o.carId)).size,
                netWeight: todayOps.reduce((sum: number, o: any) => sum + (o.netWeight || 0), 0),
                activeEmployees: usersData.filter((u: any) => u.status === 'Online').length,
                bills: bills.length
            });

            // Get last 5 operations
            setRecentOps([...ops].reverse().slice(0, 5));
            setActiveUsers(usersData.filter((u: any) => u.status === 'Online'));
            setInstructions(instr.slice(0, 3));

            // Check for unread instructions for employee
            if (user?.jobTitle !== 'مدير') {
                const unread = instr.find((i: any) => i.status === 'sent' && (i.recipient_id === user?.id || !i.recipient_id));
                if (unread) {
                    setShowToast(unread);
                    setTimeout(() => setShowToast(null), 10000);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    if (user) fetchData();
  }, [user]);

  const cards = [
    { label: 'عمليات اليوم', value: stats.operations, icon: Activity, color: 'bg-blue-500' },
    { label: 'سيارات محملة', value: stats.cars, icon: Truck, color: 'bg-orange-500' },
    { label: 'أوزان مفرغة (طن)', value: stats.netWeight.toLocaleString(), icon: Weight, color: 'bg-emerald-500' },
    { label: 'موظفون متصلون', value: stats.activeEmployees, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">مرحباً، {user?.name}</h1>
          <p className="text-gray-500 font-medium">إليك ملخص عمليات الوكالة لهذا اليوم - {format(new Date(), 'eeee, d MMMM yyyy', { locale: ar })}</p>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={() => navigate('/instructions')}
            className="fixed bottom-10 left-10 z-50 bg-white border-2 border-primary p-6 rounded-3xl shadow-2xl flex items-center gap-4 cursor-pointer max-w-sm border-r-8"
          >
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Bell className="text-primary animate-bounce" size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-primary">توجيه جديد من الإدارة</p>
              <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-bold">{showToast.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-shadow"
          >
            <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
              <card.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="text-primary" />
              سجل العمليات الأخير
            </h2>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              عرض الكل <ExternalLink size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                  <th className="px-6 py-4">النوع</th>
                  <th className="px-6 py-4">الباخرة</th>
                  <th className="px-6 py-4">الوزن (طن)</th>
                  <th className="px-6 py-4">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOps.length > 0 ? (
                  recentOps.map((op: any) => (
                    <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                      <td className={`px-6 py-4 text-sm font-medium ${op.type === 'تحميل' ? 'text-orange-600' : 'text-blue-600'}`}>
                        {op.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{op.shipName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{op.netWeight} طن</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {format(new Date(op.timestamp), 'HH:mm', { locale: ar })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm italic">لا توجد عمليات مسجلة حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-primary/20 space-y-6 relative overflow-hidden flex flex-col">
          <div className="relative z-10 space-y-6 flex-1">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Users className="text-secondary" />
              الموظفون النشطون
            </h2>
            <div className="space-y-4">
               {activeUsers.length > 0 ? (
                 activeUsers.map((u: any) => (
                   <div key={u.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{u.name}</p>
                        <p className="text-xs text-white/60">{u.jobTitle || 'موظف'}</p>
                      </div>
                      <div className="mr-auto w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-white/50 italic text-center py-4">لا يوجد موظفون متصلون حالياً</p>
               )}
            </div>
          </div>
          
          <div className="relative z-10 border-t border-white/10 pt-6 mt-6">
             <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-white">
                <ClipboardList className="text-secondary" />
                التعليمات
             </h2>
             <div className="space-y-3">
                 {instructions.length > 0 ? (
                   instructions.map((i: any) => (
                     <div 
                        key={i.id} 
                        onClick={() => navigate('/instructions')}
                        className={`p-3 rounded-xl text-xs space-y-1 cursor-pointer transition-colors ${
                            i.status === 'sent' && user?.id === i.recipient_id ? 'bg-white/20 border border-white/20' : 'bg-white/5'
                        }`}
                     >
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-secondary">{i.sender_name}:</p>
                            <span className="text-[10px] opacity-60 flex items-center gap-1">
                                <Clock size={10} />
                                {format(new Date(i.date), 'HH:mm')}
                            </span>
                        </div>
                        <p className="line-clamp-2">{i.content}</p>
                     </div>
                   ))
                 ) : (
                   <p className="text-xs text-white/50 italic text-center">لا توجد تعليمات مرسلة</p>
                 )}
             </div>
          </div>

          {/* Decorative background shape */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

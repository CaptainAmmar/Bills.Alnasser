import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Bell, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const data = await api.get('/notifications');
        setNotifications(data);
        await api.post('/notifications/read', {});
    } catch (e) {}
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="text-primary" />
              التنبيهات والاشعارات
          </h2>
      </div>

      <div className="space-y-3">
          {notifications.map((n: any) => (
              <div key={n.id} className={`p-4 rounded-2xl bg-white border ${n.isRead ? 'border-gray-100 opacity-70' : 'border-primary/20 shadow-sm shadow-primary/5'} flex items-start gap-4 transition-all hover:bg-gray-50`}>
                  <div className={`p-2 rounded-xl scale-90 ${n.isRead ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>
                      <Bell size={20} />
                  </div>
                  <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-gray-800">{n.message}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: ar })}
                      </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
              </div>
          ))}
          {notifications.length === 0 && !isLoading && (
              <div className="p-20 text-center text-gray-400 font-medium">لا توجد تنبيهات حالياً</div>
          )}
      </div>
    </div>
  );
}

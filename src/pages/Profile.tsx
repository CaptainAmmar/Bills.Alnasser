import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { User, Mail, Shield, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const info = [
    { label: 'الاسم الكامل', value: user.name, icon: User },
    { label: 'البريد الإلكتروني', value: user.email, icon: Mail },
    { label: 'الصفة الوظيفية', value: user.jobTitle, icon: Briefcase },
    { label: 'الصلاحيات', value: user.permissions, icon: Shield },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold">الملف الشخصي</h2>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-primary text-white flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center ring-4 ring-white/10 text-4xl font-bold">
                {user.name.charAt(0)}
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-white/70 text-sm">{user.jobTitle}</p>
            </div>
        </div>

        <div className="p-8 divide-y divide-gray-50">
            {info.map((item) => (
                <div key={item.label} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <item.icon size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-500">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{item.value}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

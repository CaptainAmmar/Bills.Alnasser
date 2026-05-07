import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Facebook, Instagram, Globe, Phone, MapPin, ArrowRightLeft } from 'lucide-react';
import { api } from '../api';

export default function Welcome() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.get('/settings').then(setSettings).catch(console.error);
  }, []);

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Logo Placeholder - in a real app, settings.logo would be a URL */}
        <div className="flex justify-center flex-col items-center gap-4">
             <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-primary/20">
                {settings.logo ? (
                    <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                    <ArrowRightLeft size={100} className="text-primary" />
                )}
            </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            {settings.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600 font-medium">
             <MapPin size={18} className="text-secondary" />
             <span>{settings.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
             <div className="flex items-center gap-3 justify-center text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Phone size={20} className="text-primary" />
                <span dir="ltr">{settings.phone || '00-000-000'}</span>
             </div>
             <div className="flex items-center gap-3 justify-center text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Globe size={20} className="text-primary" />
                <span dir="ltr">{settings.web || 'www.al-nasser.com'}</span>
             </div>
        </div>

        <div className="flex justify-center gap-6 py-4">
          <a href={settings.facebook} className="text-gray-400 hover:text-blue-600 transition-colors">
            <Facebook size={28} />
          </a>
          <a href={settings.instagram} className="text-gray-400 hover:text-pink-600 transition-colors">
            <Instagram size={28} />
          </a>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="w-full max-w-sm py-4 bg-primary text-white rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all"
        >
          تسجيل الدخول
        </motion.button>

        <p className="text-gray-400 text-sm">
          جميع الحقوق محفوظة © {new Date().getFullYear()} {settings.name}
        </p>
      </motion.div>
    </div>
  );
}

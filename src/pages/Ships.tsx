import React, { useEffect, useState } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import { api } from '../api';
import { Ship as ShipIcon, Anchor } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Ships() {
  const { can } = useAuth();
  const [ships, setShips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShip, setEditingShip] = useState<any>(null);
  const [viewShip, setViewShip] = useState<any>(null);

  const fetchShips = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/ships');
      setShips(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShips();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingShip) {
        await api.put(`/ships/${editingShip.id}`, data);
      } else {
        await api.post('/ships', data);
      }
      setIsModalOpen(false);
      setEditingShip(null);
      fetchShips();
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  const columns = [
    { key: 'name', label: 'اسم الباخرة' },
    { key: 'agent', label: 'الوكيل البحري' },
    { key: 'arrivalDate', label: 'تاريخ الوصول' },
    { key: 'departureDate', label: 'تاريخ المغادرة' },
    { key: 'manifestNumber', label: 'رقم المانيفست' },
    { 
      key: 'status', 
      label: 'الحالة',
      render: (val: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          val === 'راسية' ? 'bg-blue-100 text-blue-600' :
          val === 'قيد التشغيل' ? 'bg-orange-100 text-orange-600' :
          'bg-gray-100 text-gray-600'
        }`}>
          {val}
        </span>
      )
    },
  ];

  return (
    <>
      <DataTable 
        title="إدارة البواخر"
        columns={columns}
        data={ships}
        isLoading={isLoading}
        onAdd={can('إدخال') ? () => { setEditingShip(null); setIsModalOpen(true); } : undefined}
        onEdit={can('تعديل') ? (ship) => { setEditingShip(ship); setIsModalOpen(true); } : undefined}
        onDelete={can('حذف') ? async (ship) => {
          try {
            await api.delete(`/ships/${ship.id}`);
            fetchShips();
          } catch (e) {
            alert('حدث خطأ في الحذف');
          }
        } : undefined}
        onRowClick={(ship) => setViewShip(ship)}
      />

      <Modal isOpen={!!viewShip} onClose={() => setViewShip(null)} title="تفاصيل الباخرة">
        {viewShip && (
          <div className="grid grid-cols-2 gap-4">
            {columns.map(col => (
              <div key={col.key} className="space-y-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</label>
                <div className="text-sm font-bold text-gray-800">{viewShip[col.key] || '-'}</div>
              </div>
            ))}
            <div className="col-span-2 mt-4">
               <button 
                onClick={() => setViewShip(null)}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
               >
                إغلاق
               </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingShip ? 'تعديل باخرة' : 'إضافة باخرة جديدة'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">اسم الباخرة</label>
                <input name="name" defaultValue={editingShip?.name ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الوكيل البحري</label>
                <input name="agent" defaultValue={editingShip?.agent ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">تاريخ الوصول</label>
                <input name="arrivalDate" type="date" defaultValue={editingShip?.arrivalDate ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">تاريخ المغادرة</label>
                <input name="departureDate" type="date" defaultValue={editingShip?.departureDate ?? undefined} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم المانيفست</label>
                <input name="manifestNumber" defaultValue={editingShip?.manifestNumber ?? undefined} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الحالة</label>
                <select name="status" defaultValue={editingShip?.status ?? 'راسية'} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary">
                    <option>راسية</option>
                    <option>قيد التشغيل</option>
                    <option>مغادرة</option>
                </select>
            </div>
            <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all">
                    {editingShip ? 'حفظ التعديلات' : 'إضافة الباخرة'}
                </button>
            </div>
        </form>
      </Modal>
    </>
  );
}

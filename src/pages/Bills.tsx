import React, { useEffect, useState } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import UnitSelector from '../components/UnitSelector';
import { api } from '../api';
import { useAuth } from '../lib/AuthContext';

export default function Bills() {
  const { can } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [viewBill, setViewBill] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [billsData, shipsData] = await Promise.all([
        api.get('/bills'),
        api.get('/ships')
      ]);
      setBills(billsData);
      setShips(shipsData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingBill) {
        await api.put(`/bills/${editingBill.id}`, data);
      } else {
        await api.post('/bills', data);
      }
      setIsModalOpen(false);
      setEditingBill(null);
      fetchData();
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  const columns = [
    { key: 'billNumber', label: 'رقم البوليصة' },
    { key: 'date', label: 'تاريخها' },
    { key: 'shipName', label: 'الباخرة' },
    { key: 'cargoType', label: 'نوع البضاعة' },
    { key: 'grossWeight', label: 'الوزن القائم (طن)' },
    { key: 'netWeight', label: 'الوزن الصافي (طن)' },
    { key: 'packagesCount', label: 'عدد الطرود' },
    { key: 'unit', label: 'الوحدة' },
  ];

  return (
    <>
      <DataTable 
        title="إدارة البوالص"
        columns={columns}
        data={bills}
        isLoading={isLoading}
        onAdd={can('إدخال') ? () => { setEditingBill(null); setIsModalOpen(true); } : undefined}
        onEdit={can('تعديل') ? (bill) => { setEditingBill(bill); setIsModalOpen(true); } : undefined}
        onDelete={can('حذف') ? async (bill) => {
          try {
            await api.delete(`/bills/${bill.id}`);
            fetchData();
          } catch (e) {
            alert('حدث خطأ في الحذف');
          }
        } : undefined}
        onRowClick={(bill) => setViewBill(bill)}
      />

      <Modal isOpen={!!viewBill} onClose={() => setViewBill(null)} title="تفاصيل البوليصة">
        {viewBill && (
          <div className="grid grid-cols-2 gap-4">
            {columns.map(col => (
              <div key={col.key} className="space-y-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</label>
                <div className="text-sm font-bold text-gray-800">{viewBill[col.key] || '-'}</div>
              </div>
            ))}
            <div className="col-span-2 mt-4">
               <button 
                onClick={() => setViewBill(null)}
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
        title={editingBill ? 'تعديل بوليصة' : 'إضافة بوليصة جديدة'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم البوليصة</label>
                <input name="billNumber" defaultValue={editingBill?.billNumber ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">التاريخ</label>
                <input name="date" type="date" defaultValue={editingBill?.date ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الباخرة</label>
                <select name="shipId" defaultValue={editingBill?.shipId ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary">
                    <option value="">اختر باخرة...</option>
                    {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.arrivalDate})</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">نوع البضاعة</label>
                <input name="cargoType" defaultValue={editingBill?.cargoType ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الوزن القائم (طن)</label>
                <input name="grossWeight" type="number" step="0.001" defaultValue={editingBill?.grossWeight ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الوزن الصافي (طن)</label>
                <input name="netWeight" type="number" step="0.001" defaultValue={editingBill?.netWeight ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">عدد الطرود</label>
                <input name="packagesCount" type="number" defaultValue={editingBill?.packagesCount ?? undefined} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
            </div>
            <UnitSelector name="unit" defaultValue={editingBill?.unit ?? 'طرد'} />
            <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all">
                    {editingBill ? 'حفظ التعديلات' : 'إضافة البوليصة'}
                </button>
            </div>
        </form>
      </Modal>
    </>
  );
}

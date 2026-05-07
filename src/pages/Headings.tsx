import React, { useEffect, useState } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import { api } from '../api';
import { useAuth } from '../lib/AuthContext';

export default function Headings() {
  const { can } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try { setData(await api.get('/headings')); } catch (e) {}
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
        await api.post('/headings', data);
        setIsModalOpen(false);
        fetchData();
    } catch (e) { alert('خطأ'); }
  };

  const columns = [
    { key: 'heading', label: 'البند الجمركي' },
    { key: 'description', label: 'التسمية' },
    { key: 'feeValue', label: 'قيمة الرسم' },
  ];

  const handleDelete = async (item: any) => {
    try {
        await api.delete(`/headings/${item.id}`);
        fetchData();
    } catch (e) {
        alert('خطأ في الحذف');
    }
  };

  return (
    <>
      <DataTable 
        title="البنود الجمركية" 
        columns={columns} 
        data={data} 
        isLoading={isLoading} 
        onAdd={can('إدخال') ? () => setIsModalOpen(true) : undefined}
        onDelete={can('حذف') ? handleDelete : undefined}
        onRowClick={(item) => setViewItem(item)}
      />

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل البند الجمركي">
        {viewItem && (
          <div className="grid grid-cols-2 gap-4">
            {columns.map(col => (
              <div key={col.key} className="space-y-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</label>
                <div className="text-sm font-bold text-gray-800">{viewItem[col.key] || '-'}</div>
              </div>
            ))}
            <div className="col-span-2 mt-4">
               <button 
                onClick={() => setViewItem(null)}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
               >
                إغلاق
               </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة بند جمركي">
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="heading" placeholder="البند" required className="w-full p-2 border rounded" />
            <input name="description" placeholder="الوصف/التسمية" required className="w-full p-2 border rounded" />
            <input name="feeValue" type="number" step="0.01" placeholder="قيمة الرسم" required className="w-full p-2 border rounded" />
            <button type="submit" className="w-full py-2 bg-primary text-white rounded font-bold">حفظ</button>
        </form>
      </Modal>
    </>
  );
}

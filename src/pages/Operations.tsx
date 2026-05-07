import React, { useEffect, useState } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import UnitSelector from '../components/UnitSelector';
import { api } from '../api';
import { useAuth } from '../lib/AuthContext';

export default function Operations() {
  const { user, can } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [selectedShipId, setSelectedShipId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ops, shipsData, billsData, carsData] = await Promise.all([
        api.get('/operations'),
        api.get('/ships'),
        api.get('/bills'),
        api.get('/cars')
      ]);
      setData(ops);
      setShips(shipsData);
      setBills(billsData);
      setCars(carsData);
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
    const dataObj = Object.fromEntries(formData.entries());
    const payload = {
        ...dataObj,
        employeeId: user?.id
    };

    try {
      if (editingItem) {
        await api.put(`/operations/${editingItem.id}`, payload);
      } else {
        await api.post('/operations', payload);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  const columns = [
    { key: 'type', label: 'النوع' },
    { key: 'shipName', label: 'الباخرة' },
    { key: 'billNumber', label: 'البوليصة' },
    { key: 'carNumber', label: 'رقم السيارة' },
    { key: 'netWeight', label: 'الوزن الصافي (طن)' },
    { key: 'packagesCount', label: 'عدد الطرود' },
    { key: 'unit', label: 'الوحدة' },
    { key: 'employeeName', label: 'الموظف' },
    { key: 'timestamp', label: 'الوقت', render: (val: string) => new Date(val).toLocaleString('ar-SY') },
  ];

  const filteredBills = selectedShipId ? bills.filter((b: any) => String(b.shipId) === selectedShipId) : [];

  return (
    <>
      <DataTable 
        title="عمليات التفريغ والتحميل"
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={can('إدخال') ? () => { setEditingItem(null); setIsModalOpen(true); } : undefined}
        onEdit={can('تعديل') ? (item) => { setEditingItem(item); setSelectedShipId(String(item.shipId)); setIsModalOpen(true); } : undefined}
        onDelete={can('حذف') ? async (op) => {
            try {
              await api.delete(`/operations/${op.id}`, { deletedBy: user?.name || '' });
              fetchData();
            } catch (e) {
              alert('حدث خطأ في الحذف');
            }
        } : undefined}
        onRowClick={(item) => setViewItem(item)}
      />

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل العملية">
        {viewItem && (
          <div className="grid grid-cols-2 gap-4">
            {columns.map(col => (
              <div key={col.key} className="space-y-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</label>
                <div className="text-sm font-bold text-gray-800">
                    {col.render ? col.render(viewItem[col.key]) : (viewItem[col.key] || '-')}
                </div>
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

      <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingItem(null);}} title={editingItem ? "تعديل عملية" : "تسجيل عملية جديدة"}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">نوع العملية</label>
                <select name="type" defaultValue={editingItem?.type} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option>تفريغ</option>
                    <option>تحميل</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الباخرة</label>
                <select 
                    name="shipId" 
                    defaultValue={editingItem?.shipId}
                    required 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    onChange={(e) => setSelectedShipId(e.target.value)}
                >
                    <option value="">اختر باخرة...</option>
                    {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.arrivalDate})</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم البوليصة</label>
                {!selectedShipId ? (
                    <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm text-center">
                        يرجى اختيار الباخرة أولاً
                    </div>
                ) : (
                    <select name="billId" defaultValue={editingItem?.billId} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">اختر بوليصة...</option>
                        {filteredBills.map((b: any) => <option key={b.id} value={b.id}>{b.billNumber}</option>)}
                    </select>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم السيارة</label>
                <select name="carId" defaultValue={editingItem?.carId} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="">اختر سيارة...</option>
                    {cars.map((c: any) => <option key={c.id} value={c.id}>{c.carNumber} - {c.driverName}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الوزن الصافي (طن)</label>
                <input name="netWeight" type="number" step="0.001" defaultValue={editingItem?.netWeight} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">عدد الطرود</label>
                <input name="packagesCount" type="number" defaultValue={editingItem?.packagesCount} required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <UnitSelector name="unit" defaultValue={editingItem?.unit} />
            <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all">
                    {editingItem ? 'حفظ التعديلات' : 'تسجيل العملية'}
                </button>
            </div>
        </form>
      </Modal>
    </>
  );
}

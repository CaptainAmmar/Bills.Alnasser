import React, { useEffect, useState } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import UnitSelector from '../components/UnitSelector';
import { api } from '../api';
import { useAuth } from '../lib/AuthContext';

export default function Customs() {
  const { can } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [headings, setHeadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [selectedShipId, setSelectedShipId] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [customsData, shipsData, billsData, headingsData] = await Promise.all([
        api.get('/customs'),
        api.get('/ships'),
        api.get('/bills'),
        api.get('/headings')
      ]);
      setData(customsData);
      setShips(shipsData);
      setBills(billsData);
      setHeadings(headingsData);
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
    const payload = Object.fromEntries(formData.entries());

    try {
      if (editingItem) {
        await api.put(`/customs/${editingItem.id}`, payload);
      } else {
        await api.post('/customs', payload);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  const columns = [
    { key: 'type', label: 'نوع البيان' },
    { key: 'code', label: 'الرمز' },
    { key: 'declarationNumber', label: 'رقم البيان' },
    { key: 'date', label: 'تاريخه' },
    { key: 'sender', label: 'المرسل' },
    { key: 'consignee', label: 'المرسل إليه' },
    { key: 'shipName', label: 'الباخرة' },
    { key: 'billNumber', label: 'البوليصة' },
    { key: 'headingName', label: 'البند الجمركي' },
    { key: 'declarant', label: 'المصرح' },
    { key: 'clearingAgent', label: 'المخلص' },
    { key: 'destination', label: 'المقصد' },
    { key: 'cargoType', label: 'نوع البضاعة' },
    { key: 'fees', label: 'الرسوم' },
    { key: 'grossWeight', label: 'الوزن القائم (طن)' },
    { key: 'netWeight', label: 'الوزن الصافي (طن)' },
    { key: 'packagesCount', label: 'الطرود' },
    { key: 'unit', label: 'الوحدة' },
    { key: 'totalValue', label: 'القيمة الإجمالية' },
  ];

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setSelectedShipId(String(item.shipId));
    setIsModalOpen(true);
  };

  const handleDelete = async (item: any) => {
    try {
      await api.delete(`/customs/${item.id}`);
      fetchData();
    } catch (e) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <>
      <DataTable 
        title="البيانات الجمركية"
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={can('إدخال') ? () => { setEditingItem(null); setSelectedShipId(''); setIsModalOpen(true); } : undefined}
        onEdit={can('تعديل') ? handleEdit : undefined}
        onDelete={can('حذف') ? handleDelete : undefined}
        onRowClick={(item) => setViewItem(item)}
      />

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل البيان الجمركي">
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'تعديل بيان جمركي' : 'إضافة بيان جمركي'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">نوع البيان</label>
                <select name="type" defaultValue={editingItem?.type} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option>استيراد</option>
                    <option>تصدير</option>
                    <option>ترانزيت</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الرمز</label>
                <select name="code" defaultValue={editingItem?.code} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option>IM4</option>
                    <option>IM42</option>
                    <option>IM44</option>
                    <option>TR85</option>
                    <option>TR82</option>
                    <option>EX</option>
                    <option>EX10</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم البيان</label>
                <input name="declarationNumber" defaultValue={editingItem?.declarationNumber} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">تاريخ البيان</label>
                <input name="date" type="date" defaultValue={editingItem?.date} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">اسم المرسل</label>
                <input name="sender" defaultValue={editingItem?.sender} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">اسم المرسل إليه</label>
                <input name="consignee" defaultValue={editingItem?.consignee} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الباخرة</label>
                <select 
                    name="shipId" 
                    defaultValue={editingItem?.shipId}
                    required 
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    onChange={(e) => setSelectedShipId(e.target.value)}
                >
                    <option value="">اختر باخرة...</option>
                    {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.arrivalDate})</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم البوليصة</label>
                {!selectedShipId ? (
                    <div className="p-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400 text-xs text-center">
                        يرجى اختيار الباخرة أولاً
                    </div>
                ) : (
                    <select name="billId" defaultValue={editingItem?.billId} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">اختر بوليصة...</option>
                        {bills.filter((b: any) => String(b.shipId) === selectedShipId).map((b: any) => (
                            <option key={b.id} value={b.id}>{b.billNumber}</option>
                        ))}
                    </select>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">البند الجمركي</label>
                <select name="headingId" defaultValue={editingItem?.headingId} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="">اختر بند...</option>
                    {headings.map((h: any) => <option key={h.id} value={h.id}>{h.heading}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">المصرح</label>
                <input name="declarant" defaultValue={editingItem?.declarant} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">المخلص</label>
                <input name="clearingAgent" defaultValue={editingItem?.clearingAgent} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">المقصد</label>
                <input name="destination" defaultValue={editingItem?.destination} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الرسوم المستوفاة</label>
                <input name="fees" type="number" step="0.01" defaultValue={editingItem?.fees} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">نوع البضاعة</label>
                <input name="cargoType" defaultValue={editingItem?.cargoType} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الوزن القائم (طن)</label>
                <input name="grossWeight" type="number" step="0.001" defaultValue={editingItem?.grossWeight} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">الوزن الصافي (طن)</label>
                <input name="netWeight" type="number" step="0.001" defaultValue={editingItem?.netWeight} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">عدد الطرود</label>
                <input name="packagesCount" type="number" defaultValue={editingItem?.packagesCount} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <UnitSelector name="unit" defaultValue={editingItem?.unit} />
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">القيمة الإجمالية</label>
                <input name="totalValue" type="number" step="0.01" defaultValue={editingItem?.totalValue} required className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="md:col-span-3 pt-4">
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all">
                    {editingItem ? 'حفظ التعديلات' : 'إضافة البيان'}
                </button>
            </div>
        </form>
      </Modal>
    </>
  );
}

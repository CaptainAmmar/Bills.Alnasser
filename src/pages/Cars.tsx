import React, { useEffect, useState, useRef } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import { api } from '../api';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Cars() {
  const { can } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try { setData(await api.get('/cars')); } catch (e) {}
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        const cars = jsonData.map((row: any) => ({
          carNumber: String(row['رقم السيارة'] || row['Car Number'] || row['carNumber'] || '').trim(),
          driverName: String(row['اسم السائق'] || row['Driver Name'] || row['driverName'] || '').trim(),
          mobileNumber: String(row['رقم الموبايل'] || row['Mobile Number'] || row['mobileNumber'] || '').trim(),
        })).filter(c => c.carNumber);

        if (cars.length === 0) {
            alert('لم يتم العثور على بيانات صالحة في الملف. تأكد من وجود عمود بعنوان "رقم السيارة"');
            return;
        }

        const res = await api.post('/cars/bulk', cars);
        alert(`تم استيراد ${res.addedCount} سيارة جديدة بنجاح. ${cars.length - res.addedCount} سيارة كانت موجودة مسبقاً.`);
        fetchData();
      } catch (err) {
        alert('فشل في قراءة ملف الإكسل');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
        if (editingItem) await api.put(`/cars/${editingItem.id}`, formData);
        else await api.post('/cars', formData);
        setIsModalOpen(false);
        fetchData();
    } catch (e) { alert('خطأ'); }
  };

  const columns = [
    { key: 'carNumber', label: 'رقم السيارة' },
    { key: 'driverName', label: 'اسم السائق' },
    { key: 'mobileNumber', label: 'رقم الموبايل' },
  ];

  const handleDelete = async (item: any) => {
    try {
        await api.delete(`/cars/${item.id}`);
        fetchData();
    } catch (e) {
        alert('خطأ في الحذف');
    }
  };

  const extraActions = can('إدخال') ? (
    <>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls" 
            className="hidden" 
        />
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-secondary transition-all flex items-center gap-2 font-semibold text-sm shadow-sm"
        >
            <Upload size={20} />
            <span className="hidden sm:inline">استيراد من إكسل</span>
        </button>
    </>
  ) : null;

  return (
    <>
      <DataTable 
        title="إدارة السيارات" 
        columns={columns} 
        data={data} 
        isLoading={isLoading} 
        onAdd={can('إدخال') ? () => {setEditingItem(null); setIsModalOpen(true);} : undefined} 
        onEdit={can('تعديل') ? (i) => {setEditingItem(i); setIsModalOpen(true);} : undefined}
        onDelete={can('حذف') ? handleDelete : undefined}
        extraHeaderActions={extraActions}
        onRowClick={(item) => setViewItem(item)}
      />

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل السيارة">
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة/تعديل سيارة">
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="carNumber" defaultValue={editingItem?.carNumber ?? undefined} placeholder="رقم السيارة" required className="w-full p-2 border rounded" />
            <input name="driverName" defaultValue={editingItem?.driverName ?? undefined} placeholder="اسم السائق" required className="w-full p-2 border rounded" />
            <input name="mobileNumber" defaultValue={editingItem?.mobileNumber ?? undefined} placeholder="رقم الموبايل" required className="w-full p-2 border rounded" />
            <button type="submit" className="w-full py-2 bg-primary text-white rounded font-bold">حفظ</button>
        </form>
      </Modal>
    </>
  );
}

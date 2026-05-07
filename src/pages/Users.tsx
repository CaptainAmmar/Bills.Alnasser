import React, { useEffect, useState } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import { api } from '../api';
import { cn } from '../lib/utils';

export default function Users() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);

  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  useEffect(() => {
    if (editingItem && editingItem.permissions) {
      setSelectedPerms(editingItem.permissions.split(','));
    } else {
      setSelectedPerms(['قراءة فقط']);
    }
  }, [editingItem]);

  const togglePermission = (perm: string) => {
    setSelectedPerms(prev => {
      if (perm === 'الكل') {
         return prev.includes('الكل') ? [] : ['الكل'];
      }
      const newPerms = prev.filter(p => p !== 'الكل');
      if (newPerms.includes(perm)) {
         return newPerms.filter(p => p !== perm);
      } else {
         return [...newPerms, perm];
      }
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const users = await api.get('/users');
      setData(users);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dataObj = Object.fromEntries(formData.entries());
    const payload = {
      ...dataObj,
      permissions: selectedPerms.join(',')
    };

    try {
      if (editingItem) await api.put(`/users/${editingItem.id}`, payload);
      else await api.post('/users', payload);
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (e) { alert('حدث خطأ'); }
  };

  const columns = [
    { key: 'userId', label: 'معرف المستخدم' },
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'الإيميل' },
    { key: 'jobTitle', label: 'الصفة الوظيفية' },
    { key: 'permissions', label: 'الصلاحيات' },
    { 
      key: 'status', label: 'الحالة',
      render: (val: string) => (
        <span className={cn("px-2 py-1 rounded text-xs font-bold", val === 'Online' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500")}>
            {val === 'Online' ? 'متصل' : 'غير متصل'}
        </span>
      )
    },
  ];

  return (
    <>
      <DataTable 
        title="إدارة الموظفين" 
        columns={columns} 
        data={data} 
        isLoading={isLoading} 
        onAdd={() => { setEditingItem(null); setIsModalOpen(true); }} 
        onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }} 
        onDelete={async (item) => { 
            try {
              await api.delete(`/users/${item.id}`); 
              fetchData(); 
            } catch (e) {
              alert('حدث خطأ في الحذف');
            }
        }} 
        onRowClick={(item) => setViewItem(item)}
      />

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="تفاصيل الموظف">
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'تعديل موظف' : 'إضافة موظف'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-bold">معرف المستخدم</label>
                <input name="userId" defaultValue={editingItem?.userId ?? undefined} required className="w-full p-2 border rounded-lg" />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-bold">الاسم</label>
                <input name="name" defaultValue={editingItem?.name ?? undefined} required className="w-full p-2 border rounded-lg" />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-bold">الإيميل</label>
                <input name="email" type="email" defaultValue={editingItem?.email ?? undefined} required className="w-full p-2 border rounded-lg" />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-bold">كلمة المرور</label>
                <input name="password" type="password" required={!editingItem} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-bold">الصفة الوظيفية</label>
                <select name="jobTitle" defaultValue={editingItem?.jobTitle ?? 'موظف شحن'} className="w-full p-2 border rounded-lg">
                    <option>مدير</option>
                    <option>موظف جمارك</option>
                    <option>موظف شحن</option>
                </select>
            </div>
            <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold">الصلاحيات</label>
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {['الكل', 'إدخال', 'تعديل', 'حذف', 'قراءة فقط'].map(perm => (
                        <label key={perm} className="flex items-center gap-2 cursor-pointer group">
                            <div 
                                onClick={() => togglePermission(perm)}
                                className={cn(
                                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                    selectedPerms.includes(perm) ? "bg-primary border-primary" : "bg-white border-gray-300 group-hover:border-primary"
                                )}
                            >
                                {selectedPerms.includes(perm) && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{perm}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2 mt-4">
                <button type="submit" className="w-full py-3 bg-primary text-white rounded-lg font-bold">حفظ</button>
            </div>
        </form>
      </Modal>
    </>
  );
}

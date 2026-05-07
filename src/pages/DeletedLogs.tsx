import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { api } from '../api';
import { RotateCcw } from 'lucide-react';

export default function DeletedLogs() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try { setData(await api.get('/deleted-logs')); } catch (e) {}
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRestore = async (id: number) => {
    try {
        const res = await api.post(`/restore-operation/${id}`, {});
        if (res.success) {
            alert('تم استعادة العملية بنجاح');
            fetchData();
        } else {
            alert(res.message || 'فشلت عملية الاستعادة');
        }
    } catch (e) {
        alert('خطأ أثناء الاستعادة');
    }
  };

  const columns = [
    { key: 'type', label: 'النوع' },
    { key: 'shipName', label: 'الباخرة' },
    { key: 'billNumber', label: 'البوليصة' },
    { key: 'carNumber', label: 'السيارة' },
    { key: 'netWeight', label: 'الوزن (طن)' },
    { key: 'packagesCount', label: 'عدد الطرود' },
    { key: 'unit', label: 'الوحدة' },
    { key: 'employeeName', label: 'الموظف الأصلي' },
    { key: 'deletedBy', label: 'حذفت بواسطة' },
    { key: 'deletedAt', label: 'وقت الحذف', render: (val: string) => new Date(val).toLocaleString('ar-SY') },
    { 
        key: 'actions', label: 'استعادة',
        render: (_: any, item: any) => (
            <button onClick={() => handleRestore(item.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="استعادة">
                <RotateCcw size={18} />
            </button>
        )
    }
  ];

  return (
    <DataTable title="سجل المحذوفات" columns={columns} data={data} isLoading={isLoading} />
  );
}

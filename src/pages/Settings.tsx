import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { 
  Settings as SettingsIcon, Save, Image as ImageIcon, Loader2, 
  Database, FileSpreadsheet, Upload, History, Download, Trash2, RefreshCw, Camera
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData] = await Promise.all([
        api.get('/settings').catch(() => ({}))
      ]);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    setIsSnapshotLoading(true);
    try {
      // Trigger download from server
      const response = await api.get('/snapshots/create-and-download', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const filename = `maritime_backup_${new Date().toISOString().split('T')[0]}.db`;
      saveAs(blob, filename);
      
      alert('تم إنشاء نسخة النظام بنجاح وحفظها على جهازك');
    } catch (err: any) {
      console.error('Error creating snapshot:', err);
      alert(`خطأ في إنشاء النسخة: ${err.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setIsSnapshotLoading(false);
    }
  };

  const handleLocalRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('سيتم استبدال قاعدة بيانات النظام بالكامل من هذا الملف. هل أنت متأكد؟')) {
      e.target.value = '';
      return;
    }

    setIsRestoring(true);
    setRestoreProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Manual upload with progress to handle progress events
      // Since we don't know the exact axios config in ../api, we use a simple approach or simulated progress
      // But let's try to use progress if supported
      
      // Simulated progress for UI feedback while waiting for server
      const progressInterval = setInterval(() => {
        setRestoreProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 500);

      const response = await api.post('/snapshots/upload-restore', formData);

      clearInterval(progressInterval);
      setRestoreProgress(100);

      if (response.success) {
        alert('✅ تم استعادة النظام بنجاح من الملف المحلي! سيتم إعادة تحميل الصفحة الآن.');
        window.location.reload();
      } else {
        throw new Error(response.message || 'فشلت الاستعادة');
      }
    } catch (err: any) {
      console.error('Snapshot restore error:', err);
      alert(`❌ فشل استعادة النظام: ${err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsRestoring(false);
      setRestoreProgress(0);
      e.target.value = '';
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const endpoints = ['/ships', '/bills', '/operations', '/customs', '/deposits', '/exits', '/cars', '/headings', '/users', '/settings', '/invoices', '/instructions', '/notifications', '/deleted-logs'];
      const data = await Promise.all(endpoints.map(endpoint => api.get(endpoint).catch(() => [])));
      
      const workbook = XLSX.utils.book_new();
      
      endpoints.forEach((endpoint, index) => {
        const sheetName = endpoint.replace('/', '');
        let items = Array.isArray(data[index]) ? data[index] : [data[index]];
        
        // Sanitize data for Excel: truncate strings longer than 32,767 characters
        const sanitizedItems = items.map((item: any) => {
          const newItem = { ...item };
          Object.keys(newItem).forEach(key => {
            if (typeof newItem[key] === 'string' && newItem[key].length > 32700) {
              newItem[key] = newItem[key].substring(0, 32700) + '... (truncated)';
            }
          });
          return newItem;
        });

        if (sanitizedItems.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(sanitizedItems);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      });
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(blob, `backup_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Backup error:', error);
      alert('حدث خطأ أثناء أخذ النسخة الاحتياطية');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('سيتم استبدال جميع البيانات الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟')) {
      e.target.value = '';
      return;
    }

    setIsLoading(true);
    try {
      console.log('Reading file...');
      const data = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      });

      console.log('Parsing workbook...');
      const workbook = XLSX.read(data, { type: 'array' });
      
      let successCount = 0;
      let failCount = 0;

      console.log(`Workbook has ${workbook.SheetNames.length} sheets`);
      for (const sheetName of workbook.SheetNames) {
        const records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(`Sheet "${sheetName}" has ${records.length} records`);
        if (records.length > 0) {
          try {
            await api.post('/restore', { table: sheetName, records });
            console.log(`Restored ${sheetName}`);
            successCount++;
          } catch (err) {
            console.error(`Error restoring ${sheetName}:`, err);
            failCount++;
          }
        }
      }
      
      console.log(`Finished restore. Success: ${successCount}, Fail: ${failCount}`);
      if (successCount === 0 && failCount === 0) {
        alert('لم يتم العثور على بيانات صالحة للاستعادة في الملف أو الجداول فارغة');
      } else if (failCount === 0) {
        alert('تمت استعادة جميع البيانات بنجاح');
      } else {
        alert(`تمت استعادة ${successCount} جداول، وفشل استعادة ${failCount} جداول. راجع وحدة التحكم للمزيد من التفاصيل.`);
      }
      window.location.reload();
    } catch (error) {
      console.error('Restore error:', error);
      alert('حدث خطأ أثناء استعادة البيانات');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await api.post('/settings', settings);
        alert('تم حفظ الإعدادات بنجاح');
    } catch (e) {
        alert('خطأ أثناء الحفظ');
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSettings({ ...settings, logo: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <SettingsIcon size={28} />
        </div>
        <h2 className="text-3xl font-bold">إعدادات النظام</h2>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-2">النسخ الاحتياطي والأرشفة (Excel)</h3>
            <p className="text-sm text-gray-500 font-bold">نسخ واستعادة البيانات عبر ملفات إكسل</p>
          </div>
          <div className="flex gap-4">
              <button 
                  onClick={handleBackup}
                  disabled={isLoading}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                  <FileSpreadsheet size={20} />
                  نسخة إكسل
              </button>
              <label className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all cursor-pointer">
                  <Upload size={20} />
                  استعادة من إكسل
                  <input type="file" hidden accept=".xlsx" onChange={handleRestore} disabled={isLoading} />
              </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">لقطات النظام الكاملة (.db)</h3>
            <p className="text-sm text-gray-500 font-bold">أخذ نسخة كاملة من قاعدة بيانات النظام كملف على جهازك واستعادتها من ملف محلي</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={handleCreateSnapshot}
              disabled={isSnapshotLoading || isRestoring}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSnapshotLoading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
              أخذ لقطة للنظام
            </button>
            <label 
              className={`bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer ${isRestoring ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'}`}
            >
              {isRestoring ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              استعادة من ملف محلي
              <input 
                type="file" 
                hidden 
                accept=".db" 
                onChange={handleLocalRestore} 
                disabled={isSnapshotLoading || isRestoring} 
              />
            </label>
          </div>
        </div>

        {isRestoring && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-gray-600">
              <span>جاري استعادة النظام...</span>
              <span>{restoreProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${restoreProgress}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
              />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="space-y-4 flex flex-col items-center">
                    <div className="w-40 h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                        {settings.logo ? (
                            <img src={settings.logo} className="w-full h-full object-contain" alt="Logo" />
                        ) : (
                            <ImageIcon size={40} className="text-gray-300" />
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                            تغيير الشعار
                            <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                        </label>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">شعار الوكالة</p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 mr-2">اسم الوكالة</label>
                        <input 
                            value={settings.name || ''} 
                            onChange={e => setSettings({...settings, name: e.target.value})}
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 mr-2">العنوان</label>
                        <input 
                            value={settings.address || ''} 
                            onChange={e => setSettings({...settings, address: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 mr-2">رقم الهاتف</label>
                        <input 
                            value={settings.phone || ''} 
                            dir="ltr"
                            onChange={e => setSettings({...settings, phone: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 mr-2">رقم الموبايل</label>
                        <input 
                            value={settings.mobile || ''} 
                            dir="ltr"
                            onChange={e => setSettings({...settings, mobile: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 mr-2">الموقع الإلكتروني</label>
                        <input 
                            value={settings.web || ''} 
                            dir="ltr"
                            onChange={e => setSettings({...settings, web: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-600 mr-2">فيسبوك</label>
                        <input 
                            value={settings.facebook || ''} 
                            dir="ltr"
                            onChange={e => setSettings({...settings, facebook: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
                type="submit" 
                disabled={isSaving}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50"
            >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                حفظ الإعدادات
            </button>
        </div>
      </form>
    </div>
  );
}

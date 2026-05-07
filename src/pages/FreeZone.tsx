import React, { useState, useEffect } from 'react';
import DataTable, { Modal } from '../components/DataTable';
import UnitSelector from '../components/UnitSelector';
import { api } from '../api';
import { Archive, Receipt, Truck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

type TabType = 'deposits' | 'invoices' | 'exits';

export default function FreeZone() {
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('deposits');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [exits, setExits] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [headings, setHeadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [selectedShipIdForBills, setSelectedShipIdForBills] = useState('');
  const [selectedShipIdForInvoices, setSelectedShipIdForInvoices] = useState('');
  const [selectedShipIdForExits, setSelectedShipIdForExits] = useState('');
  const [im77Number, setIm77Number] = useState('');
  const [im77Date, setIm77Date] = useState('');

  const fetchAll = async () => {
    setIsLoading(true);
    try {
        const [dep, inv, exs, shipsData, billsData, headingsData] = await Promise.all([
            api.get('/deposits'),
            api.get('/invoices'),
            api.get('/exits'),
            api.get('/ships'),
            api.get('/bills'),
            api.get('/headings')
        ]);
        setDeposits(dep);
        setInvoices(inv);
        setExits(exs);
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
    fetchAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
        const endpoint = `/${activeTab}`;
        if (editingItem) {
            await api.put(`${endpoint}/${editingItem.id}`, payload);
        } else {
            await api.post(endpoint, payload);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        fetchAll();
    } catch (e) { alert('خطأ'); }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (item.im77Number) setIm77Number(item.im77Number);
    if (item.im77Date || item.date) setIm77Date(item.im77Date || item.date);
    if (activeTab === 'deposits') setSelectedShipIdForBills(String(item.shipId));
    setIsModalOpen(true);
  };

  const handleDelete = async (item: any) => {
    try {
      await api.delete(`/${activeTab}/${item.id}`);
      fetchAll();
    } catch (e) { 
      console.error(e);
      alert('حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.'); 
    }
  };

  const depositColumns = [
    { key: 'declarationNumber', label: 'رقم البيان' },
    { key: 'date', label: 'التاريخ' },
    { key: 'tr85Number', label: 'TR85' },
    { key: 'depositNumber', label: 'رقم الإيداع' },
    { key: 'localNumber', label: 'الرقم المحلي' },
    { key: 'entryRequestNumber', label: 'طلب إدخال' },
    { key: 'sender', label: 'المرسل' },
    { key: 'consignee', label: 'المرسل إليه' },
    { key: 'cargoOwner', label: 'مالك البضاعة' },
    { key: 'shipName', label: 'الباخرة' },
    { key: 'billNumber', label: 'البوليصة' },
    { key: 'cargoType', label: 'نوع البضاعة' },
    { key: 'grossWeight', label: 'الوزن القائم (طن)' },
    { key: 'netWeight', label: 'الوزن الصافي (طن)' },
    { key: 'packagesCount', label: 'الطرود' },
    { key: 'unit', label: 'الوحدة' },
  ];

  const invoiceColumns = [
    { key: 'invoiceType', label: 'نوع الفاتورة' },
    { key: 'invoiceNumber', label: 'رقم الفاتورة' },
    { key: 'date', label: 'تاريخ الفاتورة' },
    { key: 'investorName', label: 'المستثمر' },
    { key: 'beneficiaryName', label: 'المستفيد' },
    { key: 'im77Number', label: 'رقم IM77' },
    { key: 'im77Date', label: 'تاريخ IM77' },
    { key: 'tr85Number', label: 'TR85' },
    { key: 'depositNumber', label: 'الإيداع' },
    { key: 'localNumber', label: 'المحلي' },
    { key: 'exitRequestNumber', label: 'طلب إخراج' },
    { key: 'shipName', label: 'الباخرة' },
    { key: 'cargoType', label: 'نوع البضاعة' },
    { key: 'netWeight', label: 'الوزن الصافي (طن)' },
    { key: 'packagesCount', label: 'الطرود' },
    { key: 'unit', label: 'الوحدة' },
  ];

  const exitColumns = [
    { key: 'declarationType', label: 'نوع البيان' },
    { key: 'code', label: 'الرمز' },
    { key: 'declarationNumber', label: 'رقم البيان' },
    { key: 'date', label: 'التاريخ' },
    { key: 'sender', label: 'المرسل' },
    { key: 'consignee', label: 'المرسل إليه' },
    { key: 'im77Number', label: 'رقم IM77' },
    { key: 'invoiceNumber', label: 'رقم الفاتورة' },
    { key: 'shipName', label: 'الباخرة' },
    { key: 'cargoType', label: 'البضاعة' },
    { key: 'origin', label: 'المنشأ' },
    { key: 'carsCount', label: 'عدد السيارات' },
    { key: 'netWeight', label: 'الوزن الصافي (طن)' },
    { key: 'packagesCount', label: 'الطرود' },
    { key: 'unit', label: 'الوحدة' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('deposits')}
          className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'deposits' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Archive size={18} />
          الإيداع (IM77)
        </button>
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'invoices' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Receipt size={18} />
          الفواتير
        </button>
        <button 
          onClick={() => setActiveTab('exits')}
          className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'exits' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Truck size={18} />
          الإخراج (السحب)
        </button>
      </div>

      {activeTab === 'deposits' && (
        <DataTable 
          onRowClick={(item) => setViewItem({ item, cols: depositColumns })} 
          title="سجل الإيداعات (IM77)" 
          columns={depositColumns} 
          data={deposits} 
          isLoading={isLoading} 
          onAdd={can('إدخال') ? () => { setEditingItem(null); setSelectedShipIdForBills(''); setIsModalOpen(true); } : undefined}
          onEdit={can('تعديل') ? handleEdit : undefined}
          onDelete={can('حذف') ? handleDelete : undefined}
        />
      )}
      {activeTab === 'invoices' && (
        <DataTable 
          onRowClick={(item) => setViewItem({ item, cols: invoiceColumns })} 
          title="سجل الفواتير" 
          columns={invoiceColumns} 
          data={invoices} 
          isLoading={isLoading} 
          onAdd={can('إدخال') ? () => { setEditingItem(null); setIsModalOpen(true); } : undefined}
          onEdit={can('تعديل') ? handleEdit : undefined}
          onDelete={can('حذف') ? handleDelete : undefined}
        />
      )}
      {activeTab === 'exits' && (
        <DataTable 
          onRowClick={(item) => setViewItem({ item, cols: exitColumns })} 
          title="سجل الإخراج (السحب)" 
          columns={exitColumns} 
          data={exits} 
          isLoading={isLoading} 
          onAdd={can('إدخال') ? () => { setEditingItem(null); setIsModalOpen(true); } : undefined}
          onEdit={can('تعديل') ? handleEdit : undefined}
          onDelete={can('حذف') ? handleDelete : undefined}
        />
      )}

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="التفاصيل">
        {viewItem && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {viewItem.cols.map((col: any) => (
              <div key={col.key} className="space-y-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{col.label}</label>
                <div className="text-sm font-bold text-gray-800">
                    {col.render ? col.render(viewItem.item[col.key]) : (viewItem.item[col.key] || '-')}
                </div>
              </div>
            ))}
            <div className="col-span-2 lg:col-span-3 mt-4">
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
        onClose={() => { 
            setIsModalOpen(false); 
            setEditingItem(null); 
            setIm77Number('');
            setIm77Date('');
        }} 
        title={
            editingItem ? (
                activeTab === 'deposits' ? 'تعديل إيداع (IM77)' : 
                activeTab === 'invoices' ? 'تعديل فاتورة' : 
                'تعديل بيان إخراج (سحب)'
            ) : (
                activeTab === 'deposits' ? 'إضافة إيداع (IM77)' : 
                activeTab === 'invoices' ? 'إضافة فاتورة' : 
                'إضافة بيان إخراج (سحب)'
            )
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'deposits' && (
                <>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم البيان</label><input name="declarationNumber" defaultValue={editingItem?.declarationNumber} required className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ البيان</label><input name="date" type="date" defaultValue={editingItem?.date} required className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم TR85</label><input name="tr85Number" defaultValue={editingItem?.tr85Number} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخه (TR85)</label><input name="tr85Date" type="date" defaultValue={editingItem?.tr85Date} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم الإيداع</label><input name="depositNumber" defaultValue={editingItem?.depositNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ الإيداع</label><input name="depositDate" type="date" defaultValue={editingItem?.depositDate} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم المحلي</label><input name="localNumber" defaultValue={editingItem?.localNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ المحلي</label><input name="localDate" type="date" defaultValue={editingItem?.localDate} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم طلب الإدخال</label><input name="entryRequestNumber" defaultValue={editingItem?.entryRequestNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المرسل</label><input name="sender" defaultValue={editingItem?.sender} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المرسل إليه</label><input name="consignee" defaultValue={editingItem?.consignee} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">مالك البضاعة</label><input name="cargoOwner" defaultValue={editingItem?.cargoOwner} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">نوع البضاعة</label><input name="cargoType" defaultValue={editingItem?.cargoType} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم السجل التجاري</label><input name="commercialRegister" defaultValue={editingItem?.commercialRegister} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المنشأ</label><input name="origin" defaultValue={editingItem?.origin} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المصدر</label><input name="source" defaultValue={editingItem?.source} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المقصد</label><input name="destination" defaultValue={editingItem?.destination} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المصرح</label><input name="declarant" defaultValue={editingItem?.declarant} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المخلص</label><input name="clearingAgent" defaultValue={editingItem?.clearingAgent} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">الباخرة</label>
                        <select 
                            name="shipId" 
                            defaultValue={editingItem?.shipId}
                            required 
                            className="w-full p-2 border rounded-lg"
                            onChange={(e) => setSelectedShipIdForBills(e.target.value)}
                        >
                            <option value="">اختر باخرة...</option>
                            {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} - {s.arrivalDate}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">رقم البوليصة</label>
                        {!selectedShipIdForBills ? (
                            <div className="p-2 border border-dashed border-gray-300 rounded-lg text-gray-400 text-[10px] text-center">
                                اختر باخرة أولاً
                            </div>
                        ) : (
                            <select name="billId" defaultValue={editingItem?.billId} required className="w-full p-2 border rounded-lg">
                                <option value="">اختر بوليصة...</option>
                                {bills.filter((b: any) => String(b.shipId) === selectedShipIdForBills).map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.billNumber}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">البند الجمركي</label>
                        <select name="headingId" defaultValue={editingItem?.headingId} className="w-full p-2 border rounded-lg">
                            <option value="">اختر بنداً...</option>
                            {headings.map((h: any) => <option key={h.id} value={h.id}>{h.heading}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم الفاتورة الأجنبية</label><input name="foreignInvoiceNumber" defaultValue={editingItem?.foreignInvoiceNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم شهادة المنشأ</label><input name="originCertificateNumber" defaultValue={editingItem?.originCertificateNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">عدد الأقلام</label><input name="itemsCount" type="number" defaultValue={editingItem?.itemsCount} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">الوزن القائم (طن)</label><input name="grossWeight" type="number" step="0.001" defaultValue={editingItem?.grossWeight} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">الوزن الصافي (طن)</label><input name="netWeight" type="number" step="0.001" defaultValue={editingItem?.netWeight} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">عدد الطرود</label><input name="packagesCount" type="number" defaultValue={editingItem?.packagesCount} className="w-full p-2 border rounded-lg" /></div>
                    <UnitSelector name="unit" defaultValue={editingItem?.unit} />
                </>
            )}

            {activeTab === 'invoices' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">نوع الفاتورة</label>
                        <select name="invoiceType" defaultValue={editingItem?.invoiceType} required className="w-full p-2 border rounded-lg">
                            <option>ترانزيت</option>
                            <option>محلية</option>
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم الفاتورة</label><input name="invoiceNumber" defaultValue={editingItem?.invoiceNumber} required className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ الفاتورة</label><input name="date" type="date" defaultValue={editingItem?.date} required className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">اسم المستثمر</label><input name="investorName" defaultValue={editingItem?.investorName} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">اسم المستفيد</label><input name="beneficiaryName" defaultValue={editingItem?.beneficiaryName} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">اختيار بيان (IM77)</label>
                        <select 
                            className="w-full p-2 border rounded-lg bg-blue-50/50"
                            onChange={(e) => {
                                const [num, date] = e.target.value.split('|');
                                setIm77Number(num || '');
                                setIm77Date(date || '');
                            }}
                            value={im77Number ? `${im77Number}|${im77Date}` : ""}
                        >
                            <option value="">-- اختر من البيانات الموجودة --</option>
                            {deposits.map((d: any) => (
                                <option key={d.id} value={`${d.declarationNumber}|${d.date}`}>
                                    {d.declarationNumber} ({d.date})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">رقم بيان الإيداع (IM77)</label>
                        <input 
                            name="im77Number" 
                            value={im77Number} 
                            onChange={(e) => setIm77Number(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">تاريخ بيان الإيداع (IM77)</label>
                        <input 
                            name="im77Date" 
                            type="date" 
                            value={im77Date} 
                            onChange={(e) => setIm77Date(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg" 
                        />
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم TR85</label><input name="tr85Number" defaultValue={editingItem?.tr85Number} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ TR85</label><input name="tr85Date" type="date" defaultValue={editingItem?.tr85Date} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم الإيداع</label><input name="depositNumber" defaultValue={editingItem?.depositNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ الإيداع</label><input name="depositDate" type="date" defaultValue={editingItem?.depositDate} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم المحلي</label><input name="localNumber" defaultValue={editingItem?.localNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ المحلي</label><input name="localDate" type="date" defaultValue={editingItem?.localDate} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم طلب الإخراج</label><input name="exitRequestNumber" defaultValue={editingItem?.exitRequestNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">الباخرة</label>
                        <select name="shipId" defaultValue={editingItem?.shipId} required className="w-full p-2 border rounded-lg">
                            <option value="">اختر باخرة...</option>
                            {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} - {s.arrivalDate}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">البند الجمركي</label>
                        <select name="headingId" defaultValue={editingItem?.headingId} className="w-full p-2 border rounded-lg">
                            <option value="">اختر بنداً...</option>
                            {headings.map((h: any) => <option key={h.id} value={h.id}>{h.heading}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">نوع البضاعة</label><input name="cargoType" defaultValue={editingItem?.cargoType} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">الوزن القائم (طن)</label><input name="grossWeight" type="number" step="0.001" defaultValue={editingItem?.grossWeight} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">الوزن الصافي (طن)</label><input name="netWeight" type="number" step="0.001" defaultValue={editingItem?.netWeight} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">عدد الطرود</label><input name="packagesCount" type="number" defaultValue={editingItem?.packagesCount} className="w-full p-2 border rounded-lg" /></div>
                    <UnitSelector name="unit" defaultValue={editingItem?.unit} />
                </>
            )}

            {activeTab === 'exits' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">نوع البيان</label>
                        <select name="declarationType" defaultValue={editingItem?.declarationType} className="w-full p-2 border rounded-lg">
                            <option>استيراد</option>
                            <option>تصدير</option>
                            <option>ترانزيت</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">الرمز</label>
                        <select name="code" defaultValue={editingItem?.code} className="w-full p-2 border rounded-lg">
                            <option>IM4</option>
                            <option>IM42</option>
                            <option>IM44</option>
                            <option>TR85</option>
                            <option>TR82</option>
                            <option>EX</option>
                            <option>EX10</option>
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم البيان</label><input name="declarationNumber" defaultValue={editingItem?.declarationNumber} required className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">تاريخ البيان</label><input name="date" type="date" defaultValue={editingItem?.date} required className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المرسل</label><input name="sender" defaultValue={editingItem?.sender} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المرسل إليه</label><input name="consignee" defaultValue={editingItem?.consignee} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">نوع البضاعة</label><input name="cargoType" defaultValue={editingItem?.cargoType} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المنشأ</label><input name="origin" defaultValue={editingItem?.origin} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المصدر</label><input name="source" defaultValue={editingItem?.source} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المقصد</label><input name="destination" defaultValue={editingItem?.destination} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المصرح</label><input name="declarant" defaultValue={editingItem?.declarant} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">المخلص</label><input name="clearingAgent" defaultValue={editingItem?.clearingAgent} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">اختيار بيان (IM77)</label>
                        <select 
                            className="w-full p-2 border rounded-lg bg-blue-50/50"
                            onChange={(e) => {
                                const [num, date] = e.target.value.split('|');
                                setIm77Number(num || '');
                                setIm77Date(date || '');
                            }}
                            value={im77Number ? `${im77Number}|${im77Date}` : ""}
                        >
                            <option value="">-- اختر من البيانات الموجودة --</option>
                            {deposits.map((d: any) => (
                                <option key={d.id} value={`${d.declarationNumber}|${d.date}`}>
                                    {d.declarationNumber} ({d.date})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">رقم IM77</label>
                        <input 
                            name="im77Number" 
                            value={im77Number} 
                            onChange={(e) => setIm77Number(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">تاريخ IM77</label>
                        <input 
                            name="im77Date" 
                            type="date" 
                            value={im77Date} 
                            onChange={(e) => setIm77Date(e.target.value)}
                            required
                            className="w-full p-2 border rounded-lg" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">البند الجمركي</label>
                        <select name="headingId" defaultValue={editingItem?.headingId} className="w-full p-2 border rounded-lg">
                            <option value="">اختر بنداً...</option>
                            {headings.map((h: any) => <option key={h.id} value={h.id}>{h.heading}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">عدد السيارات</label><input name="carsCount" type="number" defaultValue={editingItem?.carsCount} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم الفاتورة</label><input name="invoiceNumber" defaultValue={editingItem?.invoiceNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">رقم شهادة المنشأ</label><input name="originCertificateNumber" defaultValue={editingItem?.originCertificateNumber} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold">الباخرة</label>
                        <select name="shipId" defaultValue={editingItem?.shipId} required className="w-full p-2 border rounded-lg">
                            <option value="">اختر باخرة...</option>
                            {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} - {s.arrivalDate}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">الوزن القائم (طن)</label><input name="grossWeight" type="number" step="0.001" defaultValue={editingItem?.grossWeight} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">الوزن الصافي (طن)</label><input name="netWeight" type="number" step="0.001" defaultValue={editingItem?.netWeight} className="w-full p-2 border rounded-lg" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">عدد الطرود</label><input name="packagesCount" type="number" defaultValue={editingItem?.packagesCount} className="w-full p-2 border rounded-lg" /></div>
                    <UnitSelector name="unit" defaultValue={editingItem?.unit} />
                </>
            )}

            <div className="md:col-span-3 pt-4 border-t mt-2">
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all">
                    {editingItem ? 'حفظ التعديلات' : 'حفظ البيانات'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
}

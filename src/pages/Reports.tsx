import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Download, Search, FileSpreadsheet, Filter, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export default function Reports() {
  const [activeReport, setActiveReport] = useState<'ops' | 'freezone' | 'customs' | 'exits'>('ops');
  const [operations, setOperations] = useState<any[]>([]);
  const [customs, setCustoms] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [exits, setExits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedShipId, setSelectedShipId] = useState('');
  const [selectedBillId, setSelectedBillId] = useState('');
  const [selectedBillNumber, setSelectedBillNumber] = useState('');
  const [selectedIM77, setSelectedIM77] = useState('');
  const [declType, setDeclType] = useState('');
  const [sender, setSender] = useState('');
  const [consignee, setConsignee] = useState('');

  const resetFilters = () => {
    setSelectedShipId('');
    setSelectedBillId('');
    setSelectedBillNumber('');
    setSelectedIM77('');
    setDeclType('');
    setDeclCode('');
    setDeclNumber('');
    setDeclarant('');
    setClearingAgent('');
    setDestination('');
    setSender('');
    setConsignee('');
    setFromDate('');
    setToDate('');
  };
  const [declCode, setDeclCode] = useState('');
  const [declNumber, setDeclNumber] = useState('');
  const [declarant, setDeclarant] = useState('');
  const [clearingAgent, setClearingAgent] = useState('');
  const [destination, setDestination] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const opsColumnLabels: Record<string, string> = {
    type: 'نوع العملية',
    shipName: 'الباخرة',
    billNumber: 'رقم البوليصة',
    carNumber: 'رقم السيارة',
    netWeight: 'الوزن الصافي (طن)',
    packagesCount: 'العدد',
    unit: 'الوحدة',
    employeeName: 'الموظف',
    timestamp: 'التاريخ والوقت'
  };

  const freezoneColumnLabels: Record<string, string> = {
    declarationNumber: 'رقم IM77',
    billNumber: 'رقم البوليصة',
    netWeight: 'الوزن الأصلي',
    totalWithdrawnWeight: 'الوزن المسحوب',
    remainingWeight: 'الوزن المتبقي',
    packagesCount: 'العدد الأصلي',
    totalWithdrawnPackages: 'العدد المسحوب',
    remainingPackages: 'العدد المتبقي',
  };
  
  const customsColumnLabels: Record<string, string> = {
    type: 'نوع البيان',
    code: 'الرمز',
    declarationNumber: 'رقم البيان',
    date: 'تاريخ البيان',
    sender: 'المرسل',
    consignee: 'المرسل إليه',
    declarant: 'المصرح',
    clearingAgent: 'المخلص',
    destination: 'المقصد',
    cargoType: 'نوع البضاعة',
    grossWeight: 'الوزن القائم',
    netWeight: 'الوزن الصافي',
    packagesCount: 'العدد',
    unit: 'الوحدة',
  };

  const exitsColumnLabels: Record<string, string> = {
    declarationType: 'نوع البيان',
    code: 'الرمز',
    declarationNumber: 'رقم البيان',
    date: 'تاريخ البيان',
    sender: 'المرسل',
    consignee: 'المرسل إليه',
    cargoType: 'نوع البضاعة',
    origin: 'المنشأ',
    source: 'المصدر',
    destination: 'المقصد',
    declarant: 'المصرح',
    clearingAgent: 'المخلص',
    shipName: 'الباخرة',
    grossWeight: 'الوزن القائم',
    netWeight: 'الوزن الصافي',
    packagesCount: 'عدد الطرود',
    unit: 'الوحدة',
    carsCount: 'عدد السيارات',
  };

  useEffect(() => {
    if (activeReport === 'ops') {
        setSelectedColumns(Object.keys(opsColumnLabels));
    } else if (activeReport === 'freezone') {
        setSelectedColumns(Object.keys(freezoneColumnLabels));
    } else if (activeReport === 'customs') {
        setSelectedColumns(Object.keys(customsColumnLabels));
    } else {
        setSelectedColumns(Object.keys(exitsColumnLabels));
    }
  }, [activeReport]);

  const currentColumnLabels = 
    activeReport === 'ops' ? opsColumnLabels : 
    (activeReport === 'freezone' ? freezoneColumnLabels : 
    (activeReport === 'customs' ? customsColumnLabels : exitsColumnLabels));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ops, customsData, shipsData, billsData, depositsData, exitsData] = await Promise.all([
        api.get('/operations'),
        api.get('/customs'),
        api.get('/ships'),
        api.get('/bills'),
        api.get('/deposits'),
        api.get('/exits')
      ]);
      setOperations(ops);
      setCustoms(customsData);
      setShips(shipsData);
      setBills(billsData);
      setDeposits(depositsData);
      setExits(exitsData);
    } catch (e) {}
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredOps = operations.filter((op: any) => {
    if (selectedShipId && String(op.shipId) !== selectedShipId) return false;
    if (selectedBillId && String(op.billId) !== selectedBillId) return false;
    if (fromDate && op.timestamp < fromDate) return false;
    if (toDate && op.timestamp > toDate + 'T23:59:59') return false;
    return true;
  });

  const freeZoneComparison = (deposits || []).map((dep: any) => {
    const relatedExits = (exits || []).filter((ex: any) => ex.im77Number === dep.declarationNumber);
    const totalWithdrawnWeight = relatedExits.reduce((sum, ex: any) => sum + (Number(ex.netWeight) || 0), 0);
    const totalWithdrawnPackages = relatedExits.reduce((sum, ex: any) => sum + (Number(ex.packagesCount) || 0), 0);
    
    return {
      ...dep,
      relatedExits,
      totalWithdrawnWeight,
      totalWithdrawnPackages,
      remainingWeight: (Number(dep.netWeight) || 0) - totalWithdrawnWeight,
      remainingPackages: (Number(dep.packagesCount) || 0) - totalWithdrawnPackages,
    };
  }).filter((dep: any) => {
    if (selectedIM77 && !dep.declarationNumber.includes(selectedIM77)) return false;
    if (selectedBillNumber && !dep.billNumber?.includes(selectedBillNumber)) return false;
    if (fromDate && dep.date < fromDate) return false;
    if (toDate && dep.date > toDate) return false;
    return true;
  });

  const filteredCustoms = (customs || []).filter((c: any) => {
    if (declType && c.type !== declType) return false;
    if (declCode && c.code !== declCode) return false;
    if (declNumber && !c.declarationNumber?.includes(declNumber)) return false;
    if (declarant && !c.declarant?.includes(declarant)) return false;
    if (clearingAgent && !c.clearingAgent?.includes(clearingAgent)) return false;
    if (destination && !c.destination?.includes(destination)) return false;
    if (selectedShipId && String(c.shipId) !== selectedShipId) return false;
    if (selectedBillId && String(c.billId) !== selectedBillId) return false;
    if (fromDate && c.date < fromDate) return false;
    if (toDate && c.date > toDate) return false;
    return true;
  });

  const filteredExits = (exits || []).filter((e: any) => {
    if (declType && e.declarationType !== declType) return false;
    if (declCode && e.code !== declCode) return false;
    if (declNumber && !e.declarationNumber?.includes(declNumber)) return false;
    if (sender && !e.sender?.includes(sender)) return false;
    if (consignee && !e.consignee?.includes(consignee)) return false;
    if (destination && !e.destination?.includes(destination)) return false;
    if (declarant && !e.declarant?.includes(declarant)) return false;
    if (clearingAgent && !e.clearingAgent?.includes(clearingAgent)) return false;
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    return true;
  });

  const handleExport = () => {
    const dataToFilter = 
        activeReport === 'ops' ? filteredOps : 
        (activeReport === 'freezone' ? freeZoneComparison : 
        (activeReport === 'customs' ? filteredCustoms : filteredExits));
    const labels = currentColumnLabels;
    
    const dataToExport = dataToFilter.map((item: any) => {
        const row: any = {};
        selectedColumns.forEach(key => {
            let val = item[key];
            if (key === 'timestamp' && val) val = format(new Date(val), 'yyyy-MM-dd HH:mm');
            if (typeof val === 'number' && !Number.isInteger(val)) val = val.toFixed(3);
            row[labels[key] || key] = val;
        });
        return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    const sheetName = 
        activeReport === 'ops' ? "تقرير العمليات" : 
        (activeReport === 'freezone' ? "تقرير المنطقة الحرة" : 
        (activeReport === 'customs' ? "تقرير البيانات الجمركية" : "تقارير السحب"));
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Write and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${sheetName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">التقارير</h2>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setActiveReport('ops')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeReport === 'ops' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            >
                تقارير العمليات
            </button>
            <button 
                onClick={() => setActiveReport('freezone')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeReport === 'freezone' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            >
                تقارير المنطقة الحرة
            </button>
            <button 
                onClick={() => setActiveReport('customs')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeReport === 'customs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            >
                تقارير البيانات الجمركية
            </button>
            <button 
                onClick={() => setActiveReport('exits')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeReport === 'exits' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
            >
                تقارير الإخراج
            </button>
            <button 
               onClick={resetFilters}
               className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all mr-4"
            >
              <RotateCcw size={18} />
              إعادة ضبط
            </button>
            <button 
               onClick={() => setIsExportModalOpen(true)}
               className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all mr-2"
            >
              <FileSpreadsheet size={18} />
              تصدير
            </button>
        </div>
      </div>

      {activeReport === 'ops' ? (
        <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">الباخرة</label>
                    <select value={selectedShipId} onChange={(e) => setSelectedShipId(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all">
                        <option value="">جميع البواخر</option>
                        {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.arrivalDate})</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رقم البوليصة</label>
                    <select value={selectedBillId} onChange={(e) => setSelectedBillId(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all">
                        <option value="">جميع البوالص</option>
                        {bills.filter((b: any) => !selectedShipId || String(b.shipId) === selectedShipId).map((b: any) => <option key={b.id} value={b.id}>{b.billNumber}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">من تاريخ</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">إلى تاريخ</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all" />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">النوع</th>
                                <th className="px-6 py-4">الباخرة</th>
                                <th className="px-6 py-4">البوليصة</th>
                                <th className="px-6 py-4">السيارة</th>
                                <th className="px-6 py-4">الوزن (طن)</th>
                                <th className="px-6 py-4">العدد</th>
                                <th className="px-6 py-4">الوحدة</th>
                                <th className="px-6 py-4">الوقت</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredOps.map((op: any) => (
                                <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary">{op.type}</td>
                                    <td className="px-6 py-4">{op.shipName}</td>
                                    <td className="px-6 py-4">{op.billNumber}</td>
                                    <td className="px-6 py-4">{op.carNumber}</td>
                                    <td className="px-6 py-4 font-mono">{op.netWeight} طن</td>
                                    <td className="px-6 py-4 font-mono">{op.packagesCount}</td>
                                    <td className="px-6 py-4 font-mono">{op.unit}</td>
                                    <td className="px-6 py-4 font-mono text-gray-400">{format(new Date(op.timestamp), 'yyyy-MM-dd HH:mm')}</td>
                                </tr>
                            ))}
                            {filteredOps.length === 0 && (
                                <tr><td colSpan={7} className="p-20 text-center text-gray-400">لا توجد نتائج مطابقة للبحث</td></tr>
                            )}
                        </tbody>
                        {filteredOps.length > 0 && (
                            <tfoot className="bg-gray-50/50 font-bold border-t-2 border-gray-100">
                                <tr>
                                    <td className="px-6 py-6" colSpan={4}>المجموع الإجمالي</td>
                                    <td className="px-6 py-6 font-mono text-lg text-primary">{filteredOps.reduce((sum: number, o: any) => sum + (o.netWeight || 0), 0).toFixed(3)} طن</td>
                                    <td className="px-6 py-6 font-mono text-lg text-emerald-600">{filteredOps.reduce((sum: number, o: any) => sum + (Number(o.packagesCount) || 0), 0)}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </>
      ) : activeReport === 'exits' ? (
        <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">نوع البيان</label>
                    <select value={declType} onChange={(e) => setDeclType(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">الكل</option>
                        <option value="استيراد">استيراد</option>
                        <option value="تصدير">تصدير</option>
                        <option value="ترانزيت">ترانزيت</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رمز البيان</label>
                    <select value={declCode} onChange={(e) => setDeclCode(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">الكل</option>
                        <option value="IM4">IM4</option>
                        <option value="IM42">IM42</option>
                        <option value="IM44">IM44</option>
                        <option value="TR85">TR85</option>
                        <option value="TR82">TR82</option>
                        <option value="EX">EX</option>
                        <option value="EX10">EX10</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رقم البيان</label>
                    <input type="text" value={declNumber} onChange={(e) => setDeclNumber(e.target.value)} placeholder="رقم البيان..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المرسل</label>
                    <input type="text" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="بحث بالمرسل..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المرسل إليه</label>
                    <input type="text" value={consignee} onChange={(e) => setConsignee(e.target.value)} placeholder="بحث بالمرسل إليه..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المقصد</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="بحث بالمقصد..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المصرح</label>
                    <input type="text" value={declarant} onChange={(e) => setDeclarant(e.target.value)} placeholder="بحث بالمصرح..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المخلص</label>
                    <input type="text" value={clearingAgent} onChange={(e) => setClearingAgent(e.target.value)} placeholder="بحث بالمخلص..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">من تاريخ</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">إلى تاريخ</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-[9px] font-bold uppercase tracking-wider">
                                <th className="px-2 py-4">النوع</th>
                                <th className="px-2 py-4">الرمز</th>
                                <th className="px-2 py-4">رقم البيان</th>
                                <th className="px-2 py-4">التاريخ</th>
                                <th className="px-2 py-4">المرسل</th>
                                <th className="px-2 py-4">المرسل إليه</th>
                                <th className="px-2 py-4">البضاعة</th>
                                <th className="px-2 py-4">المنشأ</th>
                                <th className="px-2 py-4">المصدر</th>
                                <th className="px-2 py-4">المقصد</th>
                                <th className="px-2 py-4">المصرح</th>
                                <th className="px-2 py-4">المخلص</th>
                                <th className="px-2 py-4">الباخرة</th>
                                <th className="px-2 py-4">الوزن القائم</th>
                                <th className="px-2 py-4">الصافي</th>
                                <th className="px-2 py-4">الطرود</th>
                                <th className="px-2 py-4">الوحدة</th>
                                <th className="px-2 py-4">السيارات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[10px]">
                            {filteredExits.map((e: any) => (
                                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-2 py-4">{e.declarationType}</td>
                                    <td className="px-2 py-4 font-bold text-primary">{e.code}</td>
                                    <td className="px-2 py-4 font-bold">{e.declarationNumber}</td>
                                    <td className="px-2 py-4">{e.date}</td>
                                    <td className="px-2 py-4">{e.sender}</td>
                                    <td className="px-2 py-4">{e.consignee}</td>
                                    <td className="px-2 py-4">{e.cargoType}</td>
                                    <td className="px-2 py-4">{e.origin}</td>
                                    <td className="px-2 py-4">{e.source}</td>
                                    <td className="px-2 py-4">{e.destination}</td>
                                    <td className="px-2 py-4">{e.declarant}</td>
                                    <td className="px-2 py-4">{e.clearingAgent}</td>
                                    <td className="px-2 py-4">{e.shipName}</td>
                                    <td className="px-2 py-4 font-mono">{e.grossWeight}</td>
                                    <td className="px-2 py-4 font-mono font-bold">{e.netWeight}</td>
                                    <td className="px-2 py-4 font-mono">{e.packagesCount}</td>
                                    <td className="px-2 py-4">{e.unit}</td>
                                    <td className="px-2 py-4 font-mono">{e.carsCount}</td>
                                </tr>
                            ))}
                            {filteredExits.length === 0 && (
                                <tr><td colSpan={18} className="p-20 text-center text-gray-400">لا توجد بيانات متاحة</td></tr>
                            )}
                        </tbody>
                        {filteredExits.length > 0 && (
                            <tfoot className="bg-gray-50 border-t-2 border-gray-100">
                                <tr className="font-bold text-[10px]">
                                    <td className="px-2 py-6 text-gray-500" colSpan={13}>المجموع الإجمالي لنتائج الفلترة</td>
                                    <td className="px-2 py-6 font-mono text-primary">
                                        {filteredExits.reduce((sum: number, x: any) => sum + (Number(x.grossWeight) || 0), 0).toFixed(3)}
                                    </td>
                                    <td className="px-2 py-6 font-mono text-primary">
                                        {filteredExits.reduce((sum: number, x: any) => sum + (Number(x.netWeight) || 0), 0).toFixed(3)}
                                    </td>
                                    <td className="px-2 py-6 font-mono text-emerald-600">
                                        {filteredExits.reduce((sum: number, x: any) => sum + (Number(x.packagesCount) || 0), 0)}
                                    </td>
                                    <td className="px-2 py-6"></td>
                                    <td className="px-2 py-6 font-mono text-blue-600">
                                        {filteredExits.reduce((sum: number, x: any) => sum + (Number(x.carsCount) || 0), 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </>
      ) : activeReport === 'customs' ? (
        <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">نوع البيان</label>
                    <select value={declType} onChange={(e) => setDeclType(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">الكل</option>
                        <option value="استيراد">استيراد</option>
                        <option value="تصدير">تصدير</option>
                        <option value="ترانزيت">ترانزيت</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رمز البيان</label>
                    <select value={declCode} onChange={(e) => setDeclCode(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">الكل</option>
                        <option value="IM4">IM4</option>
                        <option value="IM42">IM42</option>
                        <option value="IM44">IM44</option>
                        <option value="TR85">TR85</option>
                        <option value="TR82">TR82</option>
                        <option value="EX">EX</option>
                        <option value="EX10">EX10</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رقم البيان</label>
                    <input type="text" value={declNumber} onChange={(e) => setDeclNumber(e.target.value)} placeholder="بحث بالرقم..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المصرح</label>
                    <input type="text" value={declarant} onChange={(e) => setDeclarant(e.target.value)} placeholder="بحث بالمصرح..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المخلص</label>
                    <input type="text" value={clearingAgent} onChange={(e) => setClearingAgent(e.target.value)} placeholder="بحث بالمخلص..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">المقصد</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="بحث بالمقصد..." className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">الباخرة</label>
                    <select value={selectedShipId} onChange={(e) => setSelectedShipId(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">جميع البواخر</option>
                        {ships.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.arrivalDate})</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">البوليصة</label>
                    <select value={selectedBillId} onChange={(e) => setSelectedBillId(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">جميع البوالص</option>
                        {bills.filter((b: any) => !selectedShipId || String(b.shipId) === selectedShipId).map((b: any) => <option key={b.id} value={b.id}>{b.billNumber}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">من تاريخ</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">إلى تاريخ</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-2 py-4">النوع</th>
                                <th className="px-2 py-4">الرمز</th>
                                <th className="px-2 py-4">رقم البيان</th>
                                <th className="px-2 py-4">التاريخ</th>
                                <th className="px-2 py-4">المرسل</th>
                                <th className="px-2 py-4">المرسل إليه</th>
                                <th className="px-2 py-4">المصرح</th>
                                <th className="px-2 py-4">المخلص</th>
                                <th className="px-2 py-4">المقصد</th>
                                <th className="px-2 py-4">نوع البضاعة</th>
                                <th className="px-2 py-4">الوزن القائم</th>
                                <th className="px-2 py-4">الوزن الصافي</th>
                                <th className="px-2 py-4">العدد</th>
                                <th className="px-2 py-4">الوحدة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                            {filteredCustoms.map((c: any) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-2 py-4">{c.type}</td>
                                    <td className="px-2 py-4 font-bold text-primary">{c.code}</td>
                                    <td className="px-2 py-4 font-bold">{c.declarationNumber}</td>
                                    <td className="px-2 py-4">{c.date}</td>
                                    <td className="px-2 py-4">{c.sender}</td>
                                    <td className="px-2 py-4">{c.consignee}</td>
                                    <td className="px-2 py-4">{c.declarant}</td>
                                    <td className="px-2 py-4">{c.clearingAgent}</td>
                                    <td className="px-2 py-4">{c.destination}</td>
                                    <td className="px-2 py-4">{c.cargoType}</td>
                                    <td className="px-2 py-4 font-mono">{c.grossWeight}</td>
                                    <td className="px-2 py-4 font-mono font-bold">{c.netWeight}</td>
                                    <td className="px-2 py-4 font-mono">{c.packagesCount}</td>
                                    <td className="px-2 py-4">{c.unit}</td>
                                </tr>
                            ))}
                            {filteredCustoms.length === 0 && (
                                <tr><td colSpan={14} className="p-20 text-center text-gray-400">لا توجد بيانات متاحة</td></tr>
                            )}
                        </tbody>
                        {filteredCustoms.length > 0 && (
                            <tfoot className="bg-gray-50 border-t-2 border-gray-100">
                                <tr className="font-bold text-[10px]">
                                    <td className="px-2 py-6 text-gray-500" colSpan={10}>المجموع الإجمالي لنتائج الفلترة</td>
                                    <td className="px-2 py-6 font-mono text-primary">
                                        {filteredCustoms.reduce((sum: number, c: any) => sum + (Number(c.grossWeight) || 0), 0).toFixed(3)}
                                    </td>
                                    <td className="px-2 py-6 font-mono text-primary">
                                        {filteredCustoms.reduce((sum: number, c: any) => sum + (Number(c.netWeight) || 0), 0).toFixed(3)}
                                    </td>
                                    <td className="px-2 py-6 font-mono text-emerald-600">
                                        {filteredCustoms.reduce((sum: number, c: any) => sum + (Number(c.packagesCount) || 0), 0)}
                                    </td>
                                    <td className="px-2 py-6"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </>
      ) : (
        <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رقم بيان الإيداع (IM77)</label>
                    <input 
                        type="text" 
                        placeholder="بحث برقم البيان..."
                        value={selectedIM77} 
                        onChange={(e) => setSelectedIM77(e.target.value)} 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">رقم البوليصة</label>
                    <input 
                        type="text" 
                        placeholder="بحث برقم البوليصة..."
                        value={selectedBillNumber} 
                        onChange={(e) => setSelectedBillNumber(e.target.value)} 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">من تاريخ</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 mr-2">إلى تاريخ</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all" />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">رقم IM77</th>
                                <th className="px-6 py-4">البوليصة</th>
                                <th className="px-6 py-4 bg-blue-50/50">الوزن الأصلي</th>
                                <th className="px-6 py-4 bg-blue-50/50">الوزن المسحوب</th>
                                <th className="px-6 py-4 bg-blue-100/50">الوزن المتبقي</th>
                                <th className="px-6 py-4 bg-emerald-50/50">العدد الأصلي</th>
                                <th className="px-6 py-4 bg-emerald-50/50">العدد المسحوب</th>
                                <th className="px-6 py-4 bg-emerald-100/50">العدد المتبقي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {freeZoneComparison.map((dep: any) => (
                                <React.Fragment key={dep.id}>
                                    {/* Deposit Main Header */}
                                    <tr className="bg-blue-50/10 border-t-2 border-primary/10">
                                        <td className="px-6 py-4 font-bold text-primary">{dep.declarationNumber}</td>
                                        <td className="px-6 py-4 text-xs">{dep.billNumber}</td>
                                        <td className="px-6 py-4 font-mono font-bold">{dep.netWeight}</td>
                                        <td colSpan={2} className="bg-gray-50/30"></td>
                                        <td className="px-6 py-4 font-mono font-bold">{dep.packagesCount}</td>
                                        <td colSpan={2} className="bg-gray-50/30"></td>
                                    </tr>
                                    
                                    {/* Withdrawal Details */}
                                    {dep.relatedExits.length > 0 ? (
                                        dep.relatedExits.map((ex: any) => (
                                            <tr key={ex.id} className="text-[11px] text-gray-500 border-b border-dashed border-gray-100 hover:bg-gray-50/50">
                                                <td className="px-10 py-2 border-r-2 border-primary/5">
                                                    إخراج: {ex.declarationNumber}
                                                </td>
                                                <td className="px-6 py-2 text-[10px] opacity-70">
                                                    تاريخ: {ex.date}
                                                </td>
                                                <td className="bg-blue-50/5 text-gray-300">---</td>
                                                <td className="px-6 py-2 font-mono text-blue-600 font-bold bg-blue-50/5">
                                                    {ex.netWeight} -
                                                </td>
                                                <td className="bg-blue-100/5"></td>
                                                <td className="bg-emerald-50/5 text-gray-300">---</td>
                                                <td className="px-6 py-2 font-mono text-emerald-600 font-bold bg-emerald-50/5">
                                                    {ex.packagesCount} -
                                                </td>
                                                <td className="bg-emerald-100/5"></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr className="text-[10px] text-gray-400 italic">
                                            <td colSpan={8} className="px-10 py-1">لا توجد عمليات سحب مسجلة لهذا البيان بعد</td>
                                        </tr>
                                    )}

                                    {/* Balance Summary Row */}
                                    <tr className="bg-white border-b-2 border-gray-100 font-bold">
                                        <td colSpan={3} className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-400">
                                            ملخص الرصيد للبيان {dep.declarationNumber}:
                                        </td>
                                        <td className="px-6 py-3 font-mono text-blue-600 bg-blue-50/30 text-xs">
                                            إجمالي المسحوب: {dep.totalWithdrawnWeight.toFixed(3)}
                                        </td>
                                        <td className={`px-6 py-3 font-mono text-xs bg-blue-100/30 ${dep.remainingWeight <= 0 ? 'text-red-500' : 'text-blue-800'}`}>
                                            الرصيد المتبقي: {dep.remainingWeight.toFixed(3)}
                                        </td>
                                        <td className="bg-emerald-50/30"></td>
                                        <td className="px-6 py-3 font-mono text-emerald-600 bg-emerald-50/30 text-xs">
                                            إجمالي المسحوب: {dep.totalWithdrawnPackages}
                                        </td>
                                        <td className={`px-6 py-3 font-mono text-xs bg-emerald-100/30 ${dep.remainingPackages <= 0 ? 'text-red-500' : 'text-emerald-800'}`}>
                                            الرصيد المتبقي: {dep.remainingPackages}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                            {freeZoneComparison.length === 0 && (
                                <tr><td colSpan={8} className="p-20 text-center text-gray-400">لا توجد بيانات متاحة للمنطقة الحرة</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl w-full max-w-lg p-8 space-y-6">
                  <h3 className="text-xl font-bold">إعدادات التصدير</h3>
                  <p className="text-gray-500">اختر الحقول التي ترغب في تضمينها في ملف الإكسل:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(currentColumnLabels).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={selectedColumns.includes(key)}
                                onChange={(e) => {
                                    if (e.target.checked) setSelectedColumns([...selectedColumns, key]);
                                    else setSelectedColumns(selectedColumns.filter(c => c !== key));
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm font-bold text-gray-700">{label}</span>
                          </label>
                      ))}
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                      <button onClick={handleExport} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">تصدير الآن</button>
                      <button onClick={() => setIsExportModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold">إلغاء</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

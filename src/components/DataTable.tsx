import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Download, 
  ChevronLeft, ChevronRight, Loader2, AlertCircle, 
  CheckCircle2, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onExport?: () => void;
  extraHeaderActions?: React.ReactNode;
  onRowClick?: (item: any) => void;
}

export default function DataTable({ 
  title, columns, data, onAdd, onEdit, onDelete, 
  isLoading, searchPlaceholder, onExport, extraHeaderActions,
  onRowClick
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [selectedExportCols, setSelectedExportCols] = useState<string[]>(columns.map(c => c.key));
  const itemsPerPage = 10;

  const handleExportClick = () => {
    if (!onExport) return;
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = () => {
    onExport?.(); 
    setIsExportModalOpen(false);
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete && onDelete) {
        onDelete(itemToDelete);
        setItemToDelete(null);
    }
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex items-center gap-3">
          {extraHeaderActions}
          {onExport && (
            <button 
              onClick={handleExportClick}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary transition-all flex items-center gap-2 font-semibold text-sm shadow-sm"
            >
              <Download size={20} />
              <span className="hidden sm:inline">تصدير</span>
            </button>
          )}
          {onAdd && (
            <button 
              onClick={onAdd}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all flex items-center gap-2 font-bold text-sm shadow-lg shadow-primary/20"
            >
              <Plus size={20} />
              <span>إضافة جديد</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder={searchPlaceholder || 'بحث...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                />
            </div>
        </div>

        <div className="overflow-x-auto min-h-[400px] relative scrollbar-thin scrollbar-thumb-gray-200">
          {isLoading ? (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-primary animate-spin" />
                    <span className="text-sm font-bold text-primary">جاري التحميل...</span>
                </div>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-medium">
                لا توجد بيانات متاحة
            </div>
          ) : (
            <table className="w-full text-right min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                  {columns.map(col => (
                    <th key={col.key} className="px-6 py-4">{col.label}</th>
                  ))}
                  {(onEdit || onDelete) && <th className="px-6 py-4 w-28 text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedData.map((item, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item.id} 
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "group hover:bg-gray-50/80 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-6 py-4 text-sm font-medium text-gray-700">
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(item)}
                              className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-white transition-all shadow-sm"
                              title="تعديل"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              onClick={() => handleDeleteClick(item)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white transition-all shadow-sm"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
            <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    عرض {startIndex + 1} إلى {Math.min(startIndex + itemsPerPage, filteredData.length)} من {filteredData.length} سجل
                </span>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-white disabled:opacity-30 transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "w-8 h-8 rounded-lg text-sm font-bold transition-all",
                                    currentPage === page ? "bg-primary text-white shadow-md shadow-primary/20" : "hover:bg-white border border-transparent hover:border-gray-200 text-gray-600"
                                )}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 enabled:hover:bg-white disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>
      
      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="إعدادات التصدير">
        <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">اختر الأعمدة التي ترغب في تصديرها إلى ملف Excel:</p>
            <div className="grid grid-cols-2 gap-3">
                {columns.map(col => (
                    <label key={col.key} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-white transition-all select-none">
                        <input 
                            type="checkbox" 
                            checked={selectedExportCols.includes(col.key)}
                            onChange={(e) => {
                                if (e.target.checked) setSelectedExportCols([...selectedExportCols, col.key]);
                                else setSelectedExportCols(selectedExportCols.filter(c => c !== col.key));
                            }}
                            className="w-5 h-5 rounded text-primary focus:ring-primary" 
                        />
                        <span className="text-sm font-bold text-gray-700">{col.label}</span>
                    </label>
                ))}
            </div>
            <div className="pt-6 border-t border-gray-50">
                <button 
                  onClick={handleConfirmExport}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
                >
                    <Download size={20} />
                    تأكيد التصدير
                </button>
            </div>
        </div>
      </Modal>

      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="تأكيد الحذف">
        <div className="space-y-6">
            <div className="flex items-center gap-4 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">
                <AlertCircle size={32} />
                <div>
                    <h4 className="font-bold">هل أنت متأكد من الحذف؟</h4>
                    <p className="text-sm opacity-90">لا يمكن التراجع عن هذا الإجراء بعد التنفيذ.</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} />
                    نعم، حذف السجل
                </button>
                <button 
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                    تراجع
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[80vh]">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

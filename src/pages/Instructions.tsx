import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, MessageSquare, User, Clock, Bell, Trash2 } from 'lucide-react';
import { api } from '../api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';

export default function Instructions() {
  const { user } = useAuth();
  const [instructions, setInstructions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newInstruction, setNewInstruction] = useState({ recipient_id: '', content: '' });
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInstructions(user);
      if (user.jobTitle === 'مدير') {
        fetchUsers();
      }
    }
  }, [user]);

  const fetchInstructions = async (currentUser: any) => {
    try {
      const data = await api.get(`/instructions?user_id=${currentUser.id}&jobTitle=${currentUser.jobTitle}`);
      setInstructions(data);
    } catch (error) {
      console.error('Error fetching instructions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api.get('/users');
      setUsers(data.filter((u: any) => u.jobTitle !== 'مدير'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstruction.content || !user) return;
    setIsLoading(true);
    try {
      await api.post('/instructions', {
        sender_id: user.id,
        recipient_id: newInstruction.recipient_id || null,
        content: newInstruction.content
      });
      setNewInstruction({ recipient_id: '', content: '' });
      fetchInstructions(user);
    } catch (error) {
      console.error('Error sending instruction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (id: number) => {
    if (!replyText[id]) return;
    try {
      await api.post('/instructions/reply', { id, reply: replyText[id] });
      setReplyText({ ...replyText, [id]: '' });
      fetchInstructions(user);
    } catch (error) {
      console.error('Error replying:', error);
    }
  };

  const markAsRead = async (id: number, currentStatus: string) => {
    if (user && user.jobTitle !== 'مدير' && currentStatus === 'sent') {
      try {
        await api.post('/instructions/read', { id });
        fetchInstructions(user);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/instructions/${id}`);
      fetchInstructions(user);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting instruction:', error);
      alert('فشل حذف التعليمة');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">تأكيد الحذف</h3>
              <p className="text-gray-500 font-bold mb-6">هل أنت متأكد من رغبتك في حذف هذه التعليمة؟ لن يتمكن الموظفون من رؤيتها بعد الآن.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bold hover:bg-red-700 transition-all"
                >
                  نعم، احذفها
                </button>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Bell className="text-primary" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">مركز التعليمات والتوجيهات</h2>
            <p className="text-gray-500 font-bold">إدارة التواصل المباشر مع فريق العمل</p>
          </div>
        </div>
      </div>

      {user?.jobTitle === 'مدير' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Send size={20} className="text-primary" />
            إرسال تعليمة جديدة
          </h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-400 mr-2">الموظف الموجه إليه (اختياري)</label>
                <select
                  value={newInstruction.recipient_id}
                  onChange={(e) => setNewInstruction({ ...newInstruction, recipient_id: e.target.value })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary transition-all font-bold"
                >
                  <option value="">جميع الموظفين</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.jobTitle})</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-gray-400 mr-2">نص التعليمة</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInstruction.content}
                    onChange={(e) => setNewInstruction({ ...newInstruction, content: e.target.value })}
                    placeholder="اكتب التوجيهات هنا..."
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-primary transition-all font-bold"
                    required
                  />
                  <button 
                    disabled={isLoading}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'جاري الإرسال...' : (
                      <>
                        <Send size={20} />
                        إرسال
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode='popLayout'>
          {instructions.map((inst) => (
            <motion.div
              key={inst.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onViewportEnter={() => markAsRead(inst.id, inst.status)}
              className={`bg-white p-6 rounded-3xl shadow-sm border transition-all ${
                inst.status === 'sent' && user?.id === inst.recipient_id ? 'border-primary border-2 shadow-primary/5' : 'border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-xl">
                    <User size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {inst.sender_name} {inst.recipient_id ? `إلى: ${inst.recipient_name || 'موظف'}` : '(للجميع)'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mt-1">
                      <Clock size={12} />
                      {format(new Date(inst.date), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </div>
                </div>
                {inst.status === 'read' && (
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                    <CheckCircle2 size={14} />
                    تمت القراءة
                  </div>
                )}
                {user?.jobTitle === 'مدير' && (
                  <button
                    onClick={() => setDeleteConfirm(inst.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="حذف التعليمة"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl text-gray-800 font-medium mb-4 relative">
                {inst.content}
                {inst.status === 'sent' && user?.id === inst.recipient_id && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] px-2 py-1 rounded-lg font-bold">جديد</div>
                )}
              </div>

              {inst.reply ? (
                <div className="mr-8 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 border-dashed relative">
                  <div className="absolute -right-4 top-4 w-4 h-4 border-r-2 border-b-2 border-emerald-200 rounded-br-lg"></div>
                  <div className="flex items-center gap-2 mb-2 text-[10px] text-emerald-600 font-bold">
                    <MessageSquare size={12} />
                    رد الموظف ({format(new Date(inst.reply_date), 'HH:mm')})
                  </div>
                  <p className="text-emerald-900 font-bold text-sm">{inst.reply}</p>
                </div>
              ) : user?.id === inst.recipient_id ? (
                <div className="flex gap-2 mr-8">
                  <input
                    type="text"
                    value={replyText[inst.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [inst.id]: e.target.value })}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-bold"
                  />
                  <button
                    onClick={() => handleReply(inst.id)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    إرسال الرد
                  </button>
                </div>
              ) : null}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {instructions.length === 0 && (
          <div className="text-center p-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">لا يوجد أي تعليمات في الوقت الحالي</p>
          </div>
        )}
      </div>
    </div>
  );
}

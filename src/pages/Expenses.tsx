import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiPlus,
  FiTrash2,
  FiDollarSign,
  FiTag,
  FiFileText
} from 'react-icons/fi';
import { supabase } from '../lib/supabase';

interface Project {
  id: number;
  title: string;
}

interface ExpensesProps {
  expenses: any[];
  projects: Project[];
  currency: string;
  operatorId: string;
  onRefresh: () => void;
}

const Expenses = ({ expenses, currency, operatorId, onRefresh }: ExpensesProps) => {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categorías que coinciden con tu Check Constraint de DB
  const categories = ['Software', 'Hardware', 'Marketing', 'Servicios', 'Impuestos', 'Otros'];

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: categories[0], 
    date: new Date().toISOString().split('T')[0]
  });

  // Filtrar gastos según búsqueda
  const filteredExpenses = expenses.filter(e => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      (e.concept && e.concept.toLowerCase().includes(search)) ||
      (e.category && e.category.toLowerCase().includes(search)) ||
      (e.date && e.date.includes(search))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(formData.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error("Por favor, ingresá un monto válido.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          concept: formData.description.trim(), 
          amount: numericAmount,
          category: formData.category,
          date: formData.date,
          user_id: operatorId
        }]);

      if (error) throw error;

      setFormData({
        description: '',
        amount: '',
        category: categories[0],
        date: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      onRefresh(); 
      
    } catch (err: any) {
      console.error("Error detallado:", err);
      console.error(`Error al guardar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que querés eliminar este gasto?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) onRefresh();
  };

  return (
    <div className="p-8 min-h-screen bg-[#05070a] text-white font-space transition-colors duration-500">
      {/* Header */}
      <div className="mb-6 select-none animate-fade-in flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase font-sans transition-all duration-300 ease-in-out hover:text-cyan-400 cursor-default">
            {t('expenses.title').split('//')[0]} <span className="text-xl font-bold tracking-wide text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-300">//{t('expenses.title').split('//')[1]}</span>
          </h1>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mt-1 opacity-80 border-l-2 border-cyan-500 pl-2">
            {t('expenses.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-white/30 text-sm">search</span>
            <input
              type="text"
              placeholder={t('expenses.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/[0.03] border border-white/10 rounded-full pl-10 pr-4 py-2 text-white text-[10px] font-space uppercase tracking-widest placeholder:text-white/20 focus:border-cyan-500/50 outline-none w-56 transition-all focus:w-72"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-sm"
          >
            {isAdding ? t('expenses.cancel') : <><FiPlus /> {t('expenses.newExpense')}</>}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {isAdding && (
        <div className="mb-10 bg-white/[0.03] border border-white/10 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4 shadow-sm transition-colors">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 transition-colors">{t('expenses.form.concept')}</label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  required
                  type="text"
                  placeholder={t('expenses.form.conceptPlaceholder')}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-white/30 outline-none transition-colors"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 transition-colors">{t('expenses.form.amount')} ({currency})</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  required
                  type="number"
                  step="0.01"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-white/30 outline-none transition-colors"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-2 transition-colors">{t('expenses.form.category')}</label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <select 
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-white/30 outline-none appearance-none cursor-pointer transition-colors"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat} value={cat} className="bg-[#0a0a0a]">{cat}</option>)}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-2 font-bold text-xs uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? '...' : t('expenses.confirm')}
            </button>
          </form>
        </div>
      )}

      {/* Tabla */}
      <section className="glass-card overflow-hidden relative z-10 rounded-2xl shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-outline font-space text-[10px] uppercase tracking-widest bg-white/[0.02] border-b border-white/5 transition-colors">
              <tr>
                <th className="px-8 py-5 font-medium">{t('expenses.columns.date')}</th>
                <th className="px-8 py-5 font-medium">{t('expenses.columns.concept')}</th>
                <th className="px-8 py-5 font-medium">{t('expenses.columns.category')}</th>
                <th className="px-8 py-5 font-medium">{t('expenses.columns.amount')}</th>
                <th className="px-8 py-5 font-medium text-right">{t('expenses.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-space text-sm">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-white/[0.04] transition-all group active:bg-white/[0.06]">
                  <td className="px-8 py-6 text-white/50 font-mono text-xs">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-white font-bold group-hover:text-cyan-400 transition-colors">
                      {expense.concept}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] uppercase text-white/60">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-red-400 font-bold">
                    -{currency}{Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="w-8 h-8 min-w-[32px] min-h-[32px] border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Eliminar Gasto"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Expenses;
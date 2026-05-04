import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ExpensesProps {
  currency: string;
  operatorId: string;
}

export default function Expenses({ currency, operatorId }: ExpensesProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ concept: '', category: 'Despensas', amount: '' });

  const categories = [
    { label: 'Despensas', color: '#00f0ff', bg: 'bg-cyan-400' },
    { label: 'Alquiler', color: '#cf5cff', bg: 'bg-secondary-container' },
    { label: 'Otros', color: '#d9dd00ff', bg: 'bg-neutral-600' },
  ];

  useEffect(() => {
    if (operatorId) {
      fetchExpenses();
    }
  }, [operatorId]);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setExpenses(data);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.concept || !newExpense.amount) return;

    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        operator_id: operatorId,
        concept: newExpense.concept,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: new Date().toLocaleDateString(),
      }])
      .select()
      .single();

    if (data && !error) {
      setExpenses([data, ...expenses]);
      setNewExpense({ concept: '', category: 'Despensas', amount: '' });
      setIsModalOpen(false);
    }
  };



  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryStats = () => {
    if (expenses.length === 0) return categories.map(c => ({ ...c, pct: 0, amount: 0 }));

    return categories.map(cat => {
      const catAmount = expenses
        .filter(e => e.category === cat.label)
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        ...cat,
        amount: catAmount,
        pct: Math.round((catAmount / totalExpenses) * 100)
      };
    });
  };

  const stats = getCategoryStats();

  return (

    <>
      {/* TopAppBar */}
      <header className="sticky top-0 right-0 flex items-center justify-between px-8 h-16 z-40 bg-neutral-950/40 backdrop-blur-lg border-b border-white/5 ml-64 w-[calc(100%-16rem)]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white tracking-tight uppercase">Financial Command</h1>
          <span className="px-2 py-0.5 rounded-full bg-error/10 border border-error text-[10px] text-error font-bold neon-glow-red">NEXUS SGE</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative focus-within:ring-1 focus-within:ring-cyan-500/50 rounded-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">search</span>
            <input
              className="bg-black/40 border border-white/10 rounded-lg py-1.5 pl-10 pr-4 text-sm font-mono focus:outline-none focus:border-cyan-400/50 w-64"
              placeholder="Search transactions..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <button className="hover:text-cyan-400 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hover:text-cyan-400 transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            <button className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-cyan-400 font-mono text-sm tracking-widest mb-1">TERMINAL // EXPENSES</p>
              <h2 className="text-3xl font-black tracking-tight text-white uppercase">Gastos Terminal</h2>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-3 bg-white/5 border border-cyan-400/30 px-6 py-3 rounded-xl hover:bg-cyan-400/10 transition-all neon-glow-cyan"
            >
              <span className="material-symbols-outlined text-cyan-400 group-hover:rotate-90 transition-transform">add</span>
              <span className="font-bold text-white uppercase tracking-tight">Nuevo Gasto</span>
            </button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined" style={{ fontSize: '6rem' }}>payments</span>
              </div>
              <p className="text-neutral-500 font-mono text-xs uppercase tracking-wider mb-2">Total Gastos</p>
              <h3 className="text-3xl font-black text-error neon-glow-red tracking-tight">{currency}{totalExpenses.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-error text-xs font-bold flex items-center">
                  <span className="material-symbols-outlined text-sm">trending_up</span> 0%
                </span>
                <span className="text-neutral-600 text-xs font-mono italic">sin datos</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined" style={{ fontSize: '6rem' }}>calendar_month</span>
              </div>
              <p className="text-neutral-500 font-mono text-xs uppercase tracking-wider mb-2">Promedio Mensual</p>
              <h3 className="text-3xl font-black text-white tracking-tight">{currency}0.00</h3>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-0"></div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-cyan-400/20">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined" style={{ fontSize: '6rem' }}>account_balance_wallet</span>
              </div>
              <p className="text-neutral-500 font-mono text-xs uppercase tracking-wider mb-2">Presupuesto Restante</p>
              <h3 className="text-3xl font-black text-cyan-400 neon-glow-cyan tracking-tight">{currency}0.00</h3>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-cyan-400 text-xs font-bold">0% remaining</span>
                <span className="text-neutral-600 text-xs font-mono italic">Waiting for allocation</span>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Transaction Table */}
            <div className="col-span-12 lg:col-span-8 glass-panel rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-cyan-400">receipt_long</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight">Registro de Gastos</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 transition-colors">
                    <span className="material-symbols-outlined text-sm">filter_alt</span>
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 transition-colors">
                    <span className="material-symbols-outlined text-sm">more_vert</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-sm">
                  <thead>
                    <tr className="bg-white/5 text-neutral-400 uppercase text-[10px] tracking-widest">
                      <th className="px-6 py-4 font-semibold">Concepto</th>
                      <th className="px-6 py-4 font-semibold">Categoría</th>
                      <th className="px-6 py-4 font-semibold">Fecha</th>
                      <th className="px-6 py-4 font-semibold text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-white font-bold uppercase">{exp.concept}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${categories.find(c => c.label === exp.category)?.bg} text-black uppercase`}>
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{exp.date}</td>
                        <td className="px-6 py-4 text-right text-white font-bold">{currency}{exp.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {expenses.length === 0 && (
                <div className="mt-auto p-12 text-center">
                  <p className="text-neutral-500 font-space text-[10px] uppercase tracking-widest">Sin transacciones registradas</p>
                </div>
              )}
            </div>


            {/* Analysis Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Doughnut */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-base">pie_chart</span>
                  Gastos por categoría
                </h3>
                <div className="relative h-48 flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" fill="transparent" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    {expenses.length > 0 && stats.map((stat, i) => {
                      // Calculate strokeDashoffset based on cumulative percentages
                      const prevStats = stats.slice(0, i);
                      const totalPrevPct = prevStats.reduce((acc, curr) => acc + curr.pct, 0);
                      const dashArray = 440;
                      const offset = dashArray - (stat.pct / 100) * dashArray;
                      const rotate = (totalPrevPct / 100) * 360;

                      return (
                        <circle
                          key={stat.label}
                          cx="80"
                          cy="80"
                          fill="transparent"
                          r="70"
                          stroke={stat.color}
                          strokeWidth="12"
                          strokeDasharray={dashArray}
                          strokeDashoffset={offset}
                          transform={`rotate(${rotate} 80 80)`}
                          className="transition-all duration-1000"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{expenses.length > 0 ? '100%' : '0%'}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">TOTAL</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {stats.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.bg}`}></div>
                        <span className="text-xs text-neutral-300">{item.label}</span>
                      </div>
                      <span className="text-xs font-mono text-white">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-base">bar_chart</span>
                  Entradas y Salidas
                </h3>
                <div className="h-40 flex items-end gap-3 px-2">
                  {[
                    { month: 'AGO', heightOuter: 'h-24', heightInner: 'h-1/2', color: 'bg-cyan-400', base: 'bg-cyan-400/20', active: false },
                    { month: 'SEP', heightOuter: 'h-32', heightInner: 'h-3/4', color: 'bg-cyan-400', base: 'bg-cyan-400/20', active: false },
                    { month: 'OCT', heightOuter: 'h-28', heightInner: 'h-1/3', color: 'bg-error', base: 'bg-error/20', active: true },
                    { month: 'NOV', heightOuter: 'h-20', heightInner: 'h-1/4', color: 'bg-cyan-400', base: 'bg-cyan-400/20', active: false },
                  ].map((bar) => (
                    <div key={bar.month} className="flex-1 flex flex-col gap-1 items-center">
                      <div className={`w-full ${bar.base} ${bar.heightOuter} relative overflow-hidden group ${!bar.active ? 'opacity-50' : ''}`}>
                        <div className={`absolute bottom-0 w-full ${bar.color} ${bar.heightInner} group-hover:h-2/3 transition-all`}></div>
                      </div>
                      <span className={`text-[9px] font-mono ${bar.active ? 'text-cyan-400 font-bold' : 'text-neutral-600'}`}>{bar.month}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
                    <span className="text-[10px] text-neutral-500 uppercase">Ingresos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-error rounded-sm"></div>
                    <span className="text-[10px] text-neutral-500 uppercase">Gastos</span>
                  </div>
                </div>
              </div>

              {/* Highlight Card */}
              <div className="rounded-2xl p-6 bg-gradient-to-br from-cyan-900 to-blue-900 border border-white/20 shadow-xl overflow-hidden relative">
                <div className="absolute -right-8 -bottom-8 opacity-20">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '9rem' }}>bolt</span>
                </div>
                <h4 className="text-white font-bold text-lg mb-2 z-10 relative">AI Optimizer</h4>
                <p className="text-cyan-100 text-sm leading-relaxed z-10 relative mb-4">
                  Se detectaron 3 suscripciones duplicadas. Podrías ahorrar {currency}120/mes.
                </p>
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-cyan-50 transition-colors z-10 relative">
                  Optimizar Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <form
            onSubmit={handleAddExpense}
            className="w-full max-w-md glass-panel p-8 relative z-10 border-cyan-400/20 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-white font-black text-xl uppercase tracking-tighter">Nuevo Gasto Detectado</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Concepto del Gasto</label>
                <input
                  required
                  type="text"
                  placeholder="E.G. SUSCRIPCIÓN AWS"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-all uppercase font-mono"
                  value={newExpense.concept}
                  onChange={(e) => setNewExpense({ ...newExpense, concept: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Categoría Operativa</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-all font-mono"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  {categories.map(cat => <option key={cat.label} value={cat.label} className="bg-neutral-900">{cat.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Monto ({currency})</label>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-all font-mono"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-cyan-400 text-neutral-950 font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all mt-4"
              >
                Registrar Transacción
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}


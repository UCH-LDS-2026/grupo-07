import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, DollarSign, Briefcase, Hash, Percent } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceModal = ({ isOpen, onClose, onSuccess }: InvoiceModalProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]); 
  const [projectId, setProjectId] = useState('');
  const [baseBudget, setBaseBudget] = useState(0);
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState('pending');
  const [paymentType, setPaymentType] = useState('100'); 
  const [projectClientName, setProjectClientName] = useState(''); 
  const [detectedClientId, setDetectedClientId] = useState<string | null>(null); 
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, title, budget, client');

        const { data: clientsData } = await supabase
          .from('clients') 
          .select('id, name'); 
        
        setProjects(projectsData || []);
        setClients(clientsData || []);
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProjectChange = async (selectedProjectId: string) => {
    setProjectId(selectedProjectId);
    const targetProject = projects.find(p => p.id.toString() === selectedProjectId);
    
    if (targetProject) {
      const budget = targetProject.budget ? Number(targetProject.budget) : 0;
      setBaseBudget(budget);
      
      const clientName = targetProject.client || '';
      setProjectClientName(clientName);
      
      const foundClient = clients.find(c => c.name.toLowerCase().trim() === clientName.toLowerCase().trim());
      setDetectedClientId(foundClient ? foundClient.id : null);

      const { data: existingInvoices } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('project_id', parseInt(selectedProjectId));

      const hasAdvance = existingInvoices?.some(inv => inv.invoice_number?.endsWith('-ADV'));
      const hasEnd = existingInvoices?.some(inv => inv.invoice_number?.endsWith('-END'));

      if (hasAdvance && !hasEnd) {
        setPaymentType('50_end'); 
        setAmount((budget * 0.5).toString());
      } else if (hasAdvance && hasEnd) {
        console.error('Este proyecto ya se encuentra facturado en su totalidad (50% Adelanto y 50% Liquidación).');
        setPaymentType('100');
        setAmount(budget.toString());
      } else {
        setPaymentType('100');
        setAmount(budget.toString());
      }
    } else {
      setBaseBudget(0);
      setAmount('');
      setProjectClientName('');
      setDetectedClientId(null);
    }
  };

  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type);
    if (type === '100') {
      setAmount(baseBudget.toString());
    } else {
      setAmount((baseBudget * 0.5).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !amount) return console.error('Por favor, selecciona un proyecto operativo.');
    if (!detectedClientId) return console.error('Error: No se encontró el UUID del cliente asociado.');

    setSending(true);

    let finalInvoiceNumber = invoiceNumber.trim();
    if (finalInvoiceNumber) {
      if (paymentType === '50_init') finalInvoiceNumber += '-ADV';
      if (paymentType === '50_end') finalInvoiceNumber += '-END';
    }

    const { error } = await supabase.from('invoices').insert([
      {
        project_id: parseInt(projectId),
        client_id: detectedClientId, 
        amount: parseFloat(amount),
        invoice_number: finalInvoiceNumber || null,
        status: status
      }
    ]);

    setSending(true);
    if (!error) {
      setProjectId('');
      setAmount('');
      setInvoiceNumber('');
      setProjectClientName('');
      setDetectedClientId(null);
      setPaymentType('100');
      setStatus('pending');
      onSuccess();
      onClose();
    } else {
      console.error(`Error al guardar: ${error.message}`);
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-md border-cyan-500/30 p-6 bg-[#090d12] rounded-xl text-white">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">Generar_Recibo</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors cursor-pointer"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 block mb-2">Seleccionar Proyecto Operativo *</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14}/>
              <select 
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full bg-[#0d1216] border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm focus:border-cyan-500/50 outline-none text-white appearance-none"
              >
                <option value="">-- Vincular a Proyecto Existente --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#05070a]">{p.title}</option>
                ))}
              </select>
            </div>
            {projectClientName && (
              <p className="text-[10px] mt-1 pl-1 text-white/50">
                Cliente: <span className="text-purple-400 uppercase font-mono">{projectClientName}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 block mb-2">Esquema de Cobro / Distribución</label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14}/>
              <select 
                value={paymentType}
                onChange={(e) => handlePaymentTypeChange(e.target.value)}
                className="w-full bg-[#0d1216] border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm focus:border-cyan-500/50 outline-none text-white"
              >
                <option value="100">Pago Único Completo (100%)</option>
                <option value="50_init">Adelanto Inicial (50%)</option>
                <option value="50_end">Liquidación / Entrega Final (50%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 block mb-2">Número de Registro Base (Opcional)</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14}/>
              <input 
                type="text" 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm focus:border-cyan-500/50 outline-none text-white" 
                placeholder="Ej: NXS-001" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-cyan-400 block mb-2">Monto Calculado *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14}/>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm focus:border-cyan-500/50 outline-none font-mono text-white" 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-cyan-400 block mb-2">Estado Recibo</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0d1216] border border-white/10 rounded-md py-2 px-3 text-sm focus:border-cyan-500/50 outline-none h-[38px] text-white"
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Cobrado</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={sending || !detectedClientId}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold py-3 rounded-md text-[10px] uppercase tracking-[0.2em] mt-4 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {sending ? 'Guardando...' : 'Ejecutar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};
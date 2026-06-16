import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { Download, Trash2, FileText, CheckCircle2, Clock } from 'lucide-react';
import { InvoiceModal } from '../components/InvoiceModal';
import SearchBar from '../components/SearchBar';
import { jsPDF } from 'jspdf';

export const Invoices = ({ userId }: { userId?: string }) => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Relacional (con garantía de que loading siempre se apaga)
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          amount,
          status,
          project_id,
          client_id,
          contract_id,
          created_at,
          projects!invoices_project_id_fkey ( title ),
          clients!invoices_client_id_fkey ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error en fetch relacional de facturas:', error.message);
        setInvoices([]);
      } else {
        setInvoices(data || []);
      }
    } catch (err) {
      console.error('❌ Error inesperado en fetchInvoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si no tenemos userId aún, desactivar loading para no colgar la UI
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch inicial al montar el componente
    fetchInvoices();

    // Configurar suscripción a Realtime de Supabase
    const channel = supabase
      .channel('invoices-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        (payload) => {
          console.log('⚡ Cambio en facturas detectado en tiempo real:', payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            window.dispatchEvent(new CustomEvent('terminal-log', { detail: "[Invoice] GENERATED: Facturas de pago asociadas y listas para control." }));
          }
          // Pequeño delay de seguridad para que Supabase termine de propagar las relaciones
          setTimeout(() => {
            fetchInvoices();
          }, 300);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscrito a eventos en tiempo real para facturas');
        }
      });

    // Cleanup de la suscripción al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const toggleInvoiceStatus = async (invoiceId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'paid' : 'pending';

    const { error } = await supabase
      .from('invoices')
      .update({ status: nextStatus })
      .eq('id', invoiceId);

    if (error) {
      console.error('Error al actualizar estado:', error.message);
    } else {
      setInvoices(prev => 
        prev.map(inv => inv.id === invoiceId ? { ...inv, status: nextStatus } : inv)
      );
    }
  };

  const deleteInvoice = async (invoiceId: number, hasContract: boolean) => {
    if (hasContract) {
      alert("Esta factura pertenece a un contrato y no puede eliminarse individualmente. Gestioná el ciclo de vida desde el módulo de Contratos Legales.");
      return;
    }
    if (!window.confirm(t('invoices.confirmDelete'))) return;

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) {
      console.error('Error al eliminar:', error.message);
    } else {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    }
  };

  // Exportación Limpia de PDF
  const handleExportPDF = (invoice: any) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(10, 14, 18);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(6, 182, 212); 
    doc.text('FACTURA', 18, 25);

    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139); 
    doc.text('SISTEMA OPERATIVO DE FACTURACIÓN // COMPROBANTE OFICIAL', 18, 31);

    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.4);
    doc.line(18, 36, 192, 36);

    doc.setFontSize(9);
    doc.setTextColor(248, 250, 252);
    doc.text(`REGISTRO ID:`, 18, 50);
    doc.setFont('Helvetica', 'bold');
    doc.text(`#${invoice.id}`, 55, 50);

    doc.setFont('Helvetica', 'normal');
    doc.text(`CÓDIGO DE RECIBO:`, 18, 57);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${invoice.invoice_number || `REC-${invoice.id}`}`, 55, 57);

    const createdAt = invoice.created_at ? new Date(invoice.created_at) : new Date();
    const dateFormatted = createdAt.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    doc.setFont('Helvetica', 'normal');
    doc.text(`FECHA REGISTRO:`, 18, 64);
    doc.setFont('Helvetica', 'bold');
    doc.text(dateFormatted, 55, 64);

    doc.setFillColor(15, 23, 42); 
    doc.rect(18, 80, 174, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(6, 182, 212);
    doc.text('DESCRIPCIÓN OPERATIVA DEL REGISTRO', 22, 85);
    doc.text('DETALLE', 122, 85);

    doc.setFillColor(22, 28, 36);
    doc.rect(18, 88, 174, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'normal');
    doc.text('Proyecto Vinculado', 22, 94);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${invoice.projects?.title || 'No asignado'}`, 122, 94);

    doc.setFillColor(17, 22, 28);
    doc.rect(18, 98, 174, 10, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.text('Entidad Contratante / Cliente', 22, 104);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${invoice.clients?.name || 'No asignado'}`, 122, 104);

    doc.setFillColor(22, 28, 36);
    doc.rect(18, 108, 174, 10, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.text('Distribución de Transacción', 22, 114);
    doc.setFont('Helvetica', 'bold');
    
    let typeLabel = 'Pago Único Integral (100%)';
    if (invoice.invoice_number?.endsWith('-ADV')) typeLabel = 'Adelanto Inicial (50%)';
    if (invoice.invoice_number?.endsWith('-END')) typeLabel = 'Liquidación / Cierre Final (50%)';
    doc.text(typeLabel, 122, 114);

    const totalBoxY = 135;
    doc.setFillColor(15, 23, 42);
    doc.rect(122, totalBoxY, 70, 14, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(6, 182, 212);
    doc.setFont('Helvetica', 'normal');
    doc.text('TOTAL NETO:', 126, totalBoxY + 9);

    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.text(`$ ${Number(invoice.amount).toLocaleString('es-AR')}`, 152, totalBoxY + 9.5);

    doc.setFontSize(8);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Este documento digital sirve como verificación formal de transferencia y registro en Nexus SGE.', 18, 282);

    doc.save(`Factura_${invoice.invoice_number || `ID-${invoice.id}`}.pdf`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const search = searchTerm.toLowerCase().trim();
    return (
      (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(search)) ||
      (invoice.projects?.title && invoice.projects.title.toLowerCase().includes(search)) ||
      (invoice.clients?.name && invoice.clients.name.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#05070a] text-white font-space transition-colors duration-500">
      {/* Cabecera */}
      <div className="mb-6 select-none animate-fade-in flex justify-between items-center border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase font-sans transition-all duration-300 ease-in-out hover:text-cyan-400 cursor-default">
            {t('invoices.title').split('//')[0]} <span className="text-xl font-bold tracking-wide text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-300">//{t('invoices.title').split('//')[1]}</span>
          </h1>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mt-1 opacity-80 border-l-2 border-cyan-500 pl-2">
            {t('invoices.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <button
            onClick={() => fetchInvoices()}
            className="border border-white/10 text-white bg-white/[0.02] hover:bg-white/5 px-4 py-2.5 rounded-xl font-space font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <Clock size={14} />
            {t('invoices.sync')}
          </button>
        </div>
      </div>

      {/* Tabla Principal */}
      <section className="glass-card overflow-hidden relative z-10 border-white/5 rounded-2xl bg-white/[0.01] shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-outline font-space text-[10px] uppercase tracking-widest bg-white/[0.03] border-b border-white/5 transition-colors">
              <tr>
                <th className="px-8 py-5 font-medium">{t('invoices.columns.invoiceId')}</th>
                <th className="px-8 py-5 font-medium">{t('invoices.columns.projectClient')}</th>
                <th className="px-8 py-5 font-medium">{t('invoices.columns.amount')}</th>
                <th className="px-8 py-5 font-medium">{t('invoices.columns.status')}</th>
                <th className="px-8 py-5 font-medium text-right">{t('invoices.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-cyan-500 font-space text-[10px] uppercase tracking-widest animate-pulse">{t('invoices.loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-outline">
                      <FileText size={32} className="mb-3 opacity-20" />
                      <p className="font-space text-[10px] uppercase tracking-widest">{t('invoices.empty')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    className="hover:bg-white/[0.03] transition-all group active:bg-white/[0.05]"
                  >
                    {/* ID de Factura */}
                    <td className="px-8 py-6">
                      <span className="font-mono font-bold text-xs rounded border transition-colors text-cyan-400 bg-cyan-400/10 border-cyan-400/20 px-2 py-1">
                        {invoice.invoice_number || `NEXUS-INV-${invoice.id}`}
                      </span>
                    </td>

                    {/* 2. Proyecto y Cliente Estético */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-white font-bold font-outfit text-sm uppercase tracking-wider group-hover:text-cyan-300 transition-colors">
                          {invoice.projects?.title || 'PROYECTO DESCONOCIDO'}
                        </span>
                        <span className="text-[10px] text-purple-400 font-space font-medium uppercase tracking-[0.1em] mt-1 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-purple-500"></span>
                          {invoice.clients?.name || 'CLIENTE NO VINCULADO'}
                        </span>
                      </div>
                    </td>

                    {/* Monto Total */}
                    <td className="px-8 py-6 text-white font-bold font-space text-sm transition-colors">
                      ${Number(invoice.amount).toLocaleString('es-AR')}
                    </td>

                    {/* 3. Badges de Estado Mejorados */}
                    <td className="px-8 py-6">
                      <button
                        onClick={() => toggleInvoiceStatus(invoice.id, invoice.status)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-space font-bold uppercase tracking-[0.1em] transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          invoice.status === 'paid' 
                            ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]' 
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                        }`}
                      >
                        {invoice.status === 'paid' ? (
                          <>
                            <CheckCircle2 size={12} />
                            {t('invoices.status.paid')}
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            {t('invoices.status.pending')}
                          </>
                        )}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleExportPDF(invoice)}
                          className="w-8 h-8 flex items-center justify-center border rounded-lg transition-all cursor-pointer bg-white/[0.02] border-white/5 hover:border-cyan-500/30 text-outline hover:text-cyan-400 hover:bg-cyan-500/10"
                          title="Descargar Factura PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          onClick={() => deleteInvoice(invoice.id, !!invoice.contract_id)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                            invoice.contract_id 
                              ? 'bg-white/[0.01] border border-white/5 text-white/20 hover:text-white/20 hover:bg-white/[0.01] hover:border-white/5 cursor-not-allowed'
                              : 'bg-white/[0.02] border border-white/5 hover:border-red-500/30 text-outline hover:text-red-400 hover:bg-red-500/10'
                          }`}
                          title={invoice.contract_id ? "Bloqueado por contrato asociado" : "Eliminar Factura"}
                          disabled={!!invoice.contract_id}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <InvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchInvoices} 
      />
    </div>
  );
};

export default Invoices;
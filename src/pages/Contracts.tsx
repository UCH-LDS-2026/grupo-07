import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import SearchBar from '../components/SearchBar';

interface ContractsProps {
  contracts: any[];
  onRefresh: () => Promise<void>;
  userId: string;
  projects?: any[];
}

export default function Contracts({ contracts, onRefresh, userId, projects = [] }: ContractsProps) {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [localContracts, setLocalContracts] = useState<any[]>(contracts);

  // Sincronizar el estado local si el prop cambia desde afuera (ej. si se ejecuta fetchAppData del App)
  useEffect(() => {
    setLocalContracts(contracts);
  }, [contracts]);

  const filteredContracts = localContracts.filter(contract => {
    const search = searchTerm.toLowerCase().trim();
    return (
      (contract.title && contract.title.toLowerCase().includes(search)) ||
      (contract.legal_hash && contract.legal_hash.toLowerCase().includes(search))
    );
  });

  // 1. CONTROL DEL CAMBIO DE PROYECTO
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);

    const targetProject = projects.find(p => p.id.toString() === projectId);
    if (targetProject) {
      setContractTitle(`Contrato de Desarrollo: ${targetProject.title}`);
    } else {
      setContractTitle('');
    }
  };

  // 2. CREAR CONTRATO + HITOS DE FACTURACIÓN (CORREGIDO)
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      console.error("⚠️ ERROR: No se detectó ID de operador activo.");
      return;
    }
    if (!selectedProjectId) {
      console.error("⚠️ ERROR: Por favor, seleccioná un proyecto válido.");
      return;
    }

    const project = projects.find(p => p.id.toString() === selectedProjectId);
    if (!project) {
      console.error("⚠️ ERROR: El proyecto seleccionado no existe en los registros locales.");
      return;
    }

    console.log("PROYECTO SELECCIONADO EN MEMORIA:", project);

    setIsCreating(true);

    try {
      // Obtener el directorio de clientes para vincular el ID correcto
      const { data: clientsData, error: clientFetchError } = await supabase
        .from('clients')
        .select('id, name');

      if (clientFetchError) throw clientFetchError;

      const projectClientName = project.client || '';
      const foundClient = (clientsData || []).find(
        c => c.name.toLowerCase().trim() === projectClientName.toLowerCase().trim()
      );

      if (!foundClient) {
        console.error(`⚠️ ERROR DE ASIGNACIÓN:\nEl proyecto pertenece a "${projectClientName}", pero no existe ningún cliente con ese nombre en tu Directorio.`);
        setIsCreating(false);
        return;
      }

      // MATEMÁTICA FINANCIERA CON DETECCIÓN FLEXIBLE DE IVA
      const netBudget = Number(project.budget) || 0;     
      const taxPercentage = Number(project.tax_rate || project.tax || project.iva || project.porcentaje_iva || 0); 

      const totalTax = netBudget * (taxPercentage / 100);
      const totalWithTax = netBudget + totalTax;

      // Divisiones exactas en hitos 50/50
      const halfTotalAmount = totalWithTax / 2;     

      console.log("MATEMÁTICA CALCULADA:", {
        netBudget,
        taxPercentage,
        totalTax,
        totalWithTax,
        halfTotalAmount
      });

      // Guardado del Contrato Base
      const { data: newContract, error: contractError } = await supabase
        .from('contracts')
        .insert([
          {
            title: contractTitle || `Contrato de Desarrollo: ${project.title}`,
            amount: totalWithTax, 
            status: 'active',
            legal_hash: 'nexus_sha256_' + Math.random().toString(16).substring(2, 12),
            user_id: userId,
            project_id: project.id,
            client_id: foundClient.id
          }
        ])
        .select('id')
        .single();

      if (contractError) {
        console.error("❌ ERROR AL CREAR EL CONTRATO BASE:", contractError);
        throw contractError;
      }

      const baseCode = Math.floor(100 + Math.random() * 900);

      // Inserción Automatizada de Hitos en 'invoices'
      const { error: invoicesError } = await supabase
        .from('invoices')
        .insert([
          {
            invoice_number: `${baseCode}-ADV`,
            amount: halfTotalAmount,   
            status: 'pending',
            project_id: project.id, 
            client_id: foundClient.id,
            contract_id: newContract.id
          },
          {
            invoice_number: `${baseCode}-END`,
            amount: halfTotalAmount,   
            status: 'pending',
            project_id: project.id, 
            client_id: foundClient.id,
            contract_id: newContract.id
          }
        ]);

      if (invoicesError) {
        console.error("❌ ERROR CRÍTICO AL INSERTAR LAS FACTURAS:", invoicesError);
        throw invoicesError;
      }

      console.log(`✅ CONTRATO E HITOS EMITIDOS\n\nDesglose:\n• Neto base: $${netBudget.toLocaleString('es-AR')}\n• IVA aplicado (${taxPercentage}%): $${totalTax.toLocaleString('es-AR')}\n• Monto total del contrato: $${totalWithTax.toLocaleString('es-AR')}\n\nLas dos facturas del 50% ($${halfTotalAmount.toLocaleString('es-AR')} c/u) se inyectaron correctamente.`);
      
      window.dispatchEvent(new CustomEvent('terminal-log', { detail: "[Contract] SUCCESS: Nuevo contrato laboral generado y registrado." }));

      // ACTULIZAR ESTADO LOCAL INSTANTÁNEAMENTE PARA REACTIVIDAD
      setLocalContracts(prev => [newContract, ...prev]);

      setShowForm(false);
      setSelectedProjectId('');
      setContractTitle('');
      setDueDate('');

      if (typeof onRefresh === 'function') {
        onRefresh(); // Ejecutar en background sin bloquear
      }

    } catch (err: any) {
      console.error('ERROR CAPTURADO COMPLETO:', err);
      console.error(`⚠️ ERROR OPERATIVO:\n${err.message || 'Ver consola del navegador (F12)'}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 3. FUNCIÓN PARA ELIMINAR CONTRATO
  const handleDeleteContract = async (contractId: number) => {
    if (!confirm(t('contracts.confirmDelete'))) {
      return;
    }

    try {
      // 1. Borrado en Cascada: Eliminar facturas vinculadas primero
      const { error: invoicesError } = await supabase
        .from('invoices')
        .delete()
        .eq('contract_id', contractId);

      if (invoicesError) {
        console.warn("Advertencia: No se pudieron eliminar las facturas asociadas o no existían.", invoicesError);
      }

      // 2. Eliminar el contrato
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);

      if (error) throw error;

      console.log("Contrato revocado del sistema.");
      
      // ELIMINAR DEL ESTADO LOCAL INSTANTÁNEAMENTE
      setLocalContracts(prev => prev.filter(c => c.id !== contractId));

      if (typeof onRefresh === 'function') {
        onRefresh(); // Ejecutar en background sin bloquear
      }
    } catch (err: any) {
      console.error("Error al eliminar contrato:", err);
      console.error("Error operativo al eliminar: " + err.message);
    }
  };

  // 4. DESCARGA DEL DOCUMENTO HTML
  const handleDownloadPDF = (contract: any) => {
    const project = projects.find(p => p.id === contract.project_id);
    const clientName = project?.client || 'Cliente';
    const totalAmount = contract.amount || 0;
    const halfAmount = (totalAmount / 2).toLocaleString('es-AR');

    const deliveryDate = dueDate
      ? new Date(dueDate).toLocaleDateString('es-AR')
      : 'Fecha a convenir';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${contract.title}</title>
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
            color: #1e293b; padding: 50px; line-height: 1.6; background: #fff; max-width: 850px; margin: 0 auto;
          }
          .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 25px; margin-bottom: 40px; }
          .brand-side h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin: 0; color: #0f172a; }
          .brand-side p { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin: 4px 0 0 0; font-weight: 600; }
          .hash-side { text-align: right; }
          .hash-badge { background: #f8fafc; padding: 6px 12px; border-radius: 6px; font-family: monospace; font-size: 11px; color: #475569; display: inline-block; border: 1px solid #e2e8f0; }
          .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 40px; border: 1px solid #f1f5f9; font-size: 13px; }
          .meta-item strong { color: #0f172a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; display: block; margin-bottom: 2px; }
          .clause { margin-bottom: 30px; }
          .clause-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a; margin-bottom: 10px; }
          .clause-text { font-size: 14px; color: #334155; text-align: justify; }
          .payment-structure { display: grid; grid-template-cols: 1fr 1fr; gap: 16px; margin: 20px 0; }
          .payment-card { border: 1px solid #e2e8f0; padding: 18px; border-radius: 10px; background: #fff; }
          .payment-card.highlight { border-color: #0f172a; background: #f8fafc; }
          .card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
          .card-amount { font-size: 20px; font-weight: 800; color: #0f172a; margin: 6px 0; }
          .card-desc { font-size: 12px; color: #475569; margin: 0; }
          .signatures-grid { margin-top: 80px; display: grid; grid-template-cols: 1fr 1fr; gap: 80px; }
          .sig-block { text-align: center; }
          .sig-line { border-top: 1px solid #cbd5e1; margin-top: 45px; padding-top: 8px; font-size: 12px; font-weight: 600; color: #475569; }
          .sig-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="brand-side">
            <h1>CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
            <p>Acuerdo de Desarrollo de Software y Consultoría Técnica</p>
          </div>
          <div class="hash-side">
            <div class="hash-badge">ID CONTROL: ${contract.legal_hash}</div>
          </div>
        </div>
        
        <div class="meta-grid">
          <div class="meta-item">
            <strong>Fecha de Emisión</strong>
            ${new Date(contract.created_at || Date.now()).toLocaleDateString('es-AR')}
          </div>
          <div class="meta-item">
            <strong>Prestador</strong>
            Desarrollador Profesional Independiente
          </div>
          <div class="meta-item">
            <strong>Cliente Destinatario</strong>
            ${clientName}
          </div>
          <div class="meta-item">
            <strong>Plazo Estimado de Entrega</strong>
            ${deliveryDate}
          </div>
        </div>

        <div class="clause">
          <div class="clause-title">01. Objeto del Acuerdo y Tiempos</div>
          <div class="clause-text">
            El prestador se compromete formalmente a ejecutar el diseño, la planificación de arquitectura y el desarrollo de software correspondiente a los requerimientos técnicos acordados bajo el proyecto denominado "<strong>${project?.title || 'Desarrollo Técnico'}</strong>". <br/>
            <strong>Cláusula de Entrega:</strong> El prestador se compromete firmemente a entregar el software operativo y funcional antes del día <strong>${deliveryDate}</strong>, sujeto a que el cliente cumpla en tiempo y forma con los hitos de pago establecidos.
          </div>
        </div>

        <div class="clause">
          <div class="clause-title">02. Estructura de Financiación (Esquema 50/50)</div>
          <div class="clause-text">
            Las partes acuerdan un presupuesto total consolidado de <strong>$${totalAmount.toLocaleString('es-AR')}</strong> para la ejecución de las tareas descritas. Los desembolsos se realizarán respetando de manera estricta los siguientes hitos:
          </div>
          
          <div class="payment-structure">
            <div class="payment-card highlight">
              <div class="card-label">Hito 01 — Pago Anticipado (50%)</div>
              <div class="card-amount">$${halfAmount}</div>
              <p class="card-desc">Abono requerido para autorizar el inicio de las fases de planificación, diseño y desarrollo inicial.</p>
            </div>
            <div class="payment-card">
              <div class="card-label">Hito 02 — Contra Entrega (50%)</div>
              <div class="card-amount">$${halfAmount}</div>
              <p class="card-desc">Saldo restante a liquidarse de manera obligatoria contra la presentación y conformidad del software finalizado.</p>
            </div>
          </div>
        </div>

        <div class="clause">
          <div class="clause-title">03. Propiedad Intelectual</div>
          <div class="clause-text">
            La totalidad de los derechos de explotación sobre el código fuente y los entornos generados serán transferidos de forma exclusiva al Cliente una vez que el Hito 02 correspondiente al 50% restante haya sido completamente liquidado.
          </div>
        </div>

        <div class="signatures-grid">
          <div class="sig-block">
            <div class="sig-line">Por el Prestador</div>
            <div class="sig-sub">Firma Autorizada</div>
          </div>
          <div class="sig-block">
            <div class="sig-line">Por el Cliente (${clientName})</div>
            <div class="sig-sub">Aceptación de Términos</div>
          </div>
        </div>
      </body>
    </html>
  `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = clientName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `contrato_servicios_${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 min-h-screen bg-[#05070a] text-white font-space relative overflow-hidden transition-colors duration-500">
      <div className="scanline-overlay pointer-events-none"></div>

      <header className="mb-6 select-none animate-fade-in relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-[1px] bg-primary-container/50"></div>
          <span className="text-primary-container font-space text-[10px] font-bold uppercase tracking-widest">{t('contracts.headerLabel')}</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white uppercase font-sans transition-all duration-300 ease-in-out hover:text-cyan-400 cursor-default">
              {t('contracts.title').split('//')[0]} <span className="text-xl font-bold tracking-wide text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-300">//{t('contracts.title').split('//')[1]}</span>
            </h1>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mt-1 opacity-80 border-l-2 border-cyan-500 pl-2">
              {t('contracts.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onRefresh()}
              className="border border-white/10 text-white bg-white/[0.02] hover:bg-white/5 px-4 py-2.5 rounded-xl font-space font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              {t('contracts.sync')}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-cyan-500 text-black px-6 py-2.5 rounded-xl font-space font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">{showForm ? 'close' : 'add_box'}</span>
              {showForm ? t('contracts.cancel') : t('contracts.structureContract')}
            </button>
          </div>
        </div>
      </header>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleCreateContract} className="glass-card p-8 mb-12 animate-in fade-in slide-in-from-top-4 rounded-2xl shadow-sm transition-colors">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">edit_document</span> {t('contracts.newContract')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-outline text-[11px] uppercase tracking-wider font-bold transition-colors">{t('contracts.selectProject')}</label>
              <select
                required
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full bg-[#0a0f14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-space focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">{t('contracts.selectProjectPlaceholder')}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.client}) — Real: ${Number(p.budget).toLocaleString('es-AR')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-outline text-[11px] uppercase tracking-wider font-bold transition-colors">{t('contracts.documentTitle')}</label>
              <input
                type="text"
                required
                placeholder={t('contracts.documentTitlePlaceholder')}
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
                className="w-full bg-[#0a0f14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-space focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-outline text-[11px] uppercase tracking-wider font-bold transition-colors">{t('contracts.deliveryDeadline')}</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#0a0f14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-space focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCreating || !selectedProjectId}
              className="bg-cyan-500 text-black font-space font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-cyan-400 transition-all"
            >
              {isCreating ? t('contracts.saving') : t('contracts.confirmContract')}
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      <section className="glass-card overflow-hidden relative z-10 rounded-2xl shadow-sm transition-colors">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01] transition-colors">
          <h3 className="font-outfit text-xl text-white font-bold transition-colors">{t('contracts.issuedDocuments')}</h3>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="text-outline font-space text-[10px] uppercase tracking-widest bg-white/[0.02] border-b border-white/5 transition-colors">
              <tr>
                <th className="px-8 py-5 font-medium">{t('contracts.columns.document')}</th>
                <th className="px-8 py-5 font-medium">{t('contracts.columns.totalBudget')}</th>
                <th className="px-8 py-5 font-medium">{t('contracts.columns.milestones')}</th>
                <th className="px-8 py-5 font-medium text-right">{t('contracts.columns.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-space text-sm">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-outline font-space text-[10px] uppercase tracking-[0.4em]">
                    {searchTerm ? `${t('contracts.noResults')} "${searchTerm}"` : t('contracts.noContracts')}
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => {
                  const half = contract.amount ? (contract.amount / 2) : 0;
                  return (
                    <tr key={contract.id} className="hover:bg-white/[0.04] transition-all group active:bg-white/[0.06]">
                      <td className="px-8 py-6">
                        <div className="text-white font-bold group-hover:text-primary-container transition-colors">{contract.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-outline">{contract.legal_hash}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(contract.legal_hash);
                              console.log('¡ID de Control copiado al portapapeles!');
                            }}
                            className="text-outline hover:text-cyan-400 transition-colors flex items-center p-0.5"
                            title="Copiar ID de Control"
                          >
                            <span className="material-symbols-outlined text-[13px]">content_copy</span>
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-cyan-400 font-mono font-bold">
                        ${Number(contract.amount || 0).toLocaleString('es-AR')}
                      </td>
                      <td className="px-8 py-6 text-xs text-outline space-y-1">
                        <div><span className="text-white font-medium">{t('contracts.payment1')}:</span> ${half.toLocaleString('es-AR')}</div>
                        <div><span className="text-cyan-500 font-medium">{t('contracts.payment2')}:</span> ${half.toLocaleString('es-AR')}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(contract)}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all flex items-center justify-center"
                            title="Descargar Contrato"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                          </button>

                          <button
                            onClick={() => handleDeleteContract(contract.id)}
                            className="w-8 h-8 min-w-[32px] min-h-[32px] border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center"
                            title="Eliminar Contrato"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
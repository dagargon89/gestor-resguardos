import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '@/lib/apiClient';
import { Printer, Download, ArrowLeft, FileCheck } from 'lucide-react';

export default function CartaViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [html, setHtml]     = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    request<{ data: { html: string } }>(`/cartas/${id}/html`)
      .then(res => setHtml(atob(res.data.html)))
      .finally(() => setLoading(false));
  }, [id]);

  function handlePrint() {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  }

  async function handleGenerar() {
    setGenerating(true);
    try {
      const res = await request<{ data: { documento_id: number; folio: string; hash: string } }>(
        `/cartas/${id}/generar`, { method: 'POST' }
      );
      setMensaje(`Carta generada y registrada. Folio: ${res.data.folio}`);
    } catch (e: unknown) {
      setMensaje(e instanceof Error ? e.message : 'Error al generar');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 no-print">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Vista de carta</h1>
        <button onClick={handlePrint} className="flex items-center gap-2 border border-gray-300 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
          <Printer size={16} /> Imprimir
        </button>
        <button onClick={handleGenerar} disabled={generating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-3 py-2 rounded-lg transition-colors">
          <FileCheck size={16} /> {generating ? 'Generando…' : 'Generar y registrar'}
        </button>
      </div>

      {mensaje && (
        <div className="px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm no-print">{mensaje}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-auto"
        dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

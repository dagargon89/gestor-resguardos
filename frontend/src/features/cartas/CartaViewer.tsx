import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '@/lib/apiClient';
import { Printer, ArrowLeft, FileCheck } from 'lucide-react';

export default function CartaViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    request<{ data: { html: string } }>(`/cartas/${id}/html`)
      .then((res) => setHtml(atob(res.data.html)))
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
        `/cartas/${id}/generar`,
        { method: 'POST' },
      );
      setMensaje(`Carta generada y registrada. Folio: ${res.data.folio}`);
    } catch (e: unknown) {
      setMensaje(e instanceof Error ? e.message : 'Error al generar');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--line-2)] border-t-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="page-head no-print">
        <div className="page-title">
          <span className="eyebrow">Documentos</span>
          <h1>Vista de carta</h1>
        </div>
        <div className="page-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} strokeWidth={1.75} /> Volver
          </button>
          <button type="button" onClick={handlePrint} className="btn btn-sm">
            <Printer size={14} strokeWidth={1.75} /> Imprimir
          </button>
          <button
            type="button"
            onClick={handleGenerar}
            disabled={generating}
            className="btn btn-primary btn-sm"
          >
            <FileCheck size={14} strokeWidth={1.75} />{' '}
            {generating ? 'Generando…' : 'Generar y registrar'}
          </button>
        </div>
      </div>

      {mensaje && (
        <div
          className="no-print rounded-[var(--r-md)] px-4 py-3 text-sm"
          style={{
            background: 'var(--ok-soft)',
            color: 'var(--ok)',
            border: '1px solid rgba(74,222,128,0.25)',
          }}
        >
          {mensaje}
        </div>
      )}

      <div
        className="card card-pad overflow-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Modal } from './Modal';
import { FileText, Upload, Check, ExternalLink, Download, AlertCircle, RefreshCw } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
  onSavePdfUrl?: (url: string) => void;
  onSyncWeeklyStatus?: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl: initialPdfUrl,
  onSavePdfUrl,
  onSyncWeeklyStatus
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(
    initialPdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>(() => {
    if (initialPdfUrl) {
      return initialPdfUrl.split('/').pop()?.split('?')[0] || 'sumula_oficial.pdf';
    }
    return 'Programacao_Semanal_Juventus_Sub20.pdf';
  });
  const [isUploading, setIsUploading] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  React.useEffect(() => {
    if (initialPdfUrl) {
      setCurrentUrl(initialPdfUrl);
      const name = initialPdfUrl.split('/').pop()?.split('?')[0] || 'sumula_oficial.pdf';
      setUploadedFileName(name);
    }
  }, [initialPdfUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadedFileName(file.name);
      
      const objectUrl = URL.createObjectURL(file);
      setTimeout(() => {
        setCurrentUrl(objectUrl);
        setIsUploading(false);
        if (onSavePdfUrl) {
          onSavePdfUrl(objectUrl);
        }
      }, 600);
    }
  };

  const handleSync = () => {
    if (onSyncWeeklyStatus) {
      onSyncWeeklyStatus();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="text-[#631426]" size={20} />
          <span>{title}</span>
        </div>
      }
      subtitle="Visualizador e Gestão de Documentos Oficiais em Nuvem"
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Arquivo Atual:</span>
            <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {uploadedFileName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors">
              <Upload size={14} className="text-[#631426]" />
              <span>{isUploading ? 'Enviando...' : 'Upload de Novo PDF'}</span>
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>

            {onSyncWeeklyStatus && (
              <button
                onClick={handleSync}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  syncSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#631426] text-white hover:bg-[#4E0F1E]'
                }`}
              >
                {syncSuccess ? <Check size={14} /> : <RefreshCw size={14} />}
                <span>{syncSuccess ? 'Sincronizado!' : 'Sincronizar Dias do Calendário'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Embedded PDF Viewer Frame */}
        <div className="relative w-full h-[520px] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          {currentUrl.startsWith('http') || currentUrl.startsWith('blob') || currentUrl.startsWith('/') ? (
            <iframe
              src={currentUrl}
              className="w-full flex-1 border-0"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <FileText size={48} className="text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">Nenhum PDF visualizável selecionado</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Faça o upload do PDF da programação semanal ou ficha de treino oficial da comissão técnica.
              </p>
            </div>
          )}

          {/* Footer notice */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Súmula Oficial anexada ao sistema
            </span>
            <div className="flex items-center gap-3">
              <a
                href={currentUrl}
                download={uploadedFileName}
                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold text-xs px-2.5 py-1 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download size={13} className="text-[#631426]" />
                <span>Baixar PDF</span>
              </a>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#631426] hover:underline font-bold"
              >
                <span>Abrir em nova aba</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

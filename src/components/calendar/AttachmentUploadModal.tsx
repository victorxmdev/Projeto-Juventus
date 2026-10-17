import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  X, 
  ExternalLink,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface AttachmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
}

export const AttachmentUploadModal: React.FC<AttachmentUploadModalProps> = ({
  isOpen,
  onClose,
  targetDate
}) => {
  const { attachScheduleFile, weeklySchedule } = useData();

  const [previewUrl, setPreviewUrl] = useState<string>(weeklySchedule.attachedImageUrl || '/microciclo_34.jpg');
  const [fileType, setFileType] = useState<'image' | 'pdf'>('image');
  const [fileName, setFileName] = useState<string>('microciclo_34.jpg');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      setFileType(isPdf ? 'pdf' : 'image');

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSaveAttachment = () => {
    if (previewUrl) {
      attachScheduleFile(previewUrl, fileType);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UploadCloud className="text-[#631426]" size={20} />
          <span className="text-slate-900">Anexar Programação Geral / Documento Oficial</span>
        </div>
      }
      subtitle="Vincule imagens ou PDFs da programação semanal para acesso imediato de toda a comissão"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        
        {/* Upload Dropzone */}
        <div className="border-2 border-dashed border-slate-300 hover:border-[#631426] rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-50/80 transition-colors relative">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-[#631426] shadow-sm">
              {fileType === 'pdf' ? <FileText size={28} /> : <ImageIcon size={28} />}
            </div>
            <p className="text-xs font-bold text-slate-800">
              Clique ou arraste a imagem da Programação ou PDF aqui
            </p>
            <p className="text-[11px] text-slate-500">
              Formatos aceitos: JPG, PNG, WEBP ou PDF (Fichas de Treino, Microciclos, Escalações)
            </p>
            {fileName && (
              <span className="text-xs font-mono font-bold text-[#631426] bg-white px-2.5 py-1 rounded-md border border-slate-200 mt-2 shadow-sm">
                Arquivo selecionado: {fileName}
              </span>
            )}
          </div>
        </div>

        {/* Live Preview of Attached File */}
        {previewUrl && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Pré-Visualização do Anexo
            </span>

            {fileType === 'image' ? (
              <div className="max-h-[320px] rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-900 p-1">
                <img
                  src={previewUrl}
                  alt="Pré-visualização do Anexo"
                  className="max-h-[300px] w-auto object-contain rounded-lg shadow-md"
                />
              </div>
            ) : (
              <div className="h-[300px] rounded-xl overflow-hidden border border-slate-200 bg-white">
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <span className="text-[11px] text-slate-400">
            Ficará fixado no topo do Calendário e acessível a qualquer momento.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAttachment}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#631426] text-white hover:bg-[#4E0F1E]'
              }`}
            >
              {isSuccess ? <Check size={14} /> : <UploadCloud size={14} />}
              <span>{isSuccess ? 'Anexado com Sucesso!' : 'Salvar no Calendário Geral'}</span>
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};


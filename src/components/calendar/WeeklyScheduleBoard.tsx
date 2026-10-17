import React, { useState } from 'react';
import { WeeklyMicrocycleSchedule, TrainingUnitPlan } from '../../types';
import { useData } from '../../context/DataContext';
import { PutPlanModal } from './PutPlanModal';
import { AttachmentUploadModal } from './AttachmentUploadModal';
import { Modal } from '../common/Modal';
import { JuventusLogo } from '../common/JuventusLogo';
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  ExternalLink, 
  Eye, 
  Calendar, 
  Clock, 
  Trophy, 
  CheckCircle2,
  AlertCircle,
  Download,
  Dumbbell,
  Video,
  Utensils,
  Moon,
  Sparkles
} from 'lucide-react';

export const WeeklyScheduleBoard: React.FC = () => {
  const { weeklySchedule, putPlans } = useData();

  const [isPutModalOpen, setIsPutModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isOriginalImageModalOpen, setIsOriginalImageModalOpen] = useState(false);

  // Default PUT plan 140
  const activePutPlan = putPlans[0] || {
    id: 'put_140',
    microcycleNumber: 34,
    unitNumber: 140,
    date: '16.10.2026',
    athletesCount: '26+4',
    category: 'Juniores (Sub-20)',
    initialConsiderations: 'Arthur Costa à parte até ordem em contrário.',
    generalObjectives: ['O.O.', 'O.D.', 'T.D.', 'T.O.'],
    materials: 'Coletes: 13+6 | 2 gols móveis | 4 estacas | 2 bonecos | Pratinhos | Bolas',
    usefulTrainingTime: "20'",
    totalTrainingTime: "28'",
    exercises: []
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner with Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#631426] animate-pulse" />
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-wide">
              PROGRAMAÇÃO SEMANAL DO MICROCICLO Nº {weeklySchedule.microcycleNumber}
            </h3>
            <span className="bg-[#631426] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              ÉPOCA {weeklySchedule.seasonYear}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Período oficial: <strong className="text-slate-800">Plano de 12 a 18 de Outubro</strong> • Treinador: <strong className="text-slate-900">{weeklySchedule.coach}</strong> • Supervisor: <strong className="text-slate-900">{weeklySchedule.supervisor}</strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* View Original Attachment (from image uploaded by user) */}
          <button
            onClick={() => setIsOriginalImageModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#631426] text-white hover:bg-[#4E0F1E] font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Eye size={14} />
            <span>Ver Imagem / Quadro Original</span>
          </button>

          {/* Attach new schedule file */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload size={14} className="text-[#631426]" />
            <span>Anexar Novo Arquivo</span>
          </button>

          {/* Open PUT Plan for Friday 16/10 */}
          <button
            onClick={() => setIsPutModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileText size={14} />
            <span>Ver PUT Nº 140 (Sexta 16/10)</span>
          </button>

        </div>
      </div>

      {/* Main Grid Representation (Exact Replica of Juventus Official Microcycle Chart) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Official Header Band */}
        <div className="bg-[#631426] px-4 py-3 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-3">
            <JuventusLogo size={38} />
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wider text-white">
                CA JUVENTUS SAF SUB-20
              </h2>
              <span className="text-[11px] text-rose-100 font-medium">
                Época {weeklySchedule.seasonYear} • MICROCICLO Nº {weeklySchedule.microcycleNumber}
              </span>
            </div>
          </div>

          <div className="text-center hidden sm:block">
            <span className="text-xs font-black tracking-widest text-amber-200 uppercase block">
              Plano de 12 a 18 de Outubro
            </span>
            <span className="text-[10px] text-rose-100">
              Estádio Conde Rodolfo Crespi (Rua Javari)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-white text-[#631426] text-[10px] font-black px-2 py-1 rounded shadow-sm">
              FPF OFICIAL
            </span>
          </div>
        </div>

        {/* 7-Day Interactive Columns */}
        <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
          
          {weeklySchedule.days.map((day) => {
            const isMatch = day.isMatchDay;
            const isOff = day.isDayOff;

            return (
              <div 
                key={day.dayOfWeek}
                className={`flex flex-col justify-between transition-colors ${
                  isMatch ? 'bg-rose-50/20' : isOff ? 'bg-slate-50/60' : 'bg-white hover:bg-slate-50/50'
                }`}
              >
                {/* Column Header */}
                <div className="bg-slate-50 p-2.5 text-center border-b border-slate-200">
                  <span className="text-xs font-black uppercase text-slate-800 block">
                    {day.dayOfWeek}
                  </span>
                  <span className="text-[11px] font-bold text-[#631426] font-mono">
                    {day.dayMonthStr}
                  </span>
                </div>

                {/* Day Body Content */}
                <div className="p-2 space-y-3 flex-1 flex flex-col justify-between">
                  
                  {/* MANHÃ */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      MANHÃ
                    </span>

                    {day.morningActivities.map((act, i) => (
                      <div 
                        key={i}
                        className={`p-1.5 rounded-lg border text-[10px] leading-tight transition-all ${
                          act.colorClass 
                            ? act.colorClass 
                            : act.title.includes('TREINO')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                            : act.title.includes('ACADEMIA')
                            ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-mono font-semibold text-[9px] opacity-70">
                          <Clock size={9} />
                          <span>{act.time}</span>
                        </div>
                        <span className="font-bold block mt-0.5">{act.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* TARDE */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      TARDE
                    </span>

                    {isMatch ? (
                      <div className="p-2.5 rounded-xl bg-[#631426] text-white shadow-sm space-y-1">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-200 uppercase">
                          <Trophy size={11} />
                          <span>Jogo Decisivo</span>
                        </div>
                        <p className="font-black text-xs leading-tight text-white">
                          Paulista Sub-20 (8ªs)
                        </p>
                        <p className="text-[11px] font-bold text-white">
                          JUVENTUS x EC Santo André
                        </p>
                        <span className="text-[10px] font-mono text-rose-100 block">
                          15h00 • Rua Javari
                        </span>
                      </div>
                    ) : isOff ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          FOLGA
                        </span>
                      </div>
                    ) : (
                      day.afternoonActivities.map((act, i) => (
                        <div key={i} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px]">
                          <span className="text-slate-400 font-mono text-[9px] block">{act.time}</span>
                          <span className="font-medium text-slate-700">{act.title}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* NOITE */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      NOITE
                    </span>
                    <div className="p-1 rounded bg-slate-50 text-[10px] text-center text-slate-500 font-medium">
                      DESCANSO
                    </div>
                  </div>

                  {/* If day has a PUT sheet attached (e.g. Friday 16/10 UT 140) */}
                  {day.putSheetId && (
                    <button
                      onClick={() => setIsPutModalOpen(true)}
                      className="mt-2 w-full py-1.5 px-2 rounded-lg bg-[#631426] text-white font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-[#4E0F1E] transition-all shadow-sm"
                    >
                      <FileText size={11} />
                      <span>Ver Ficha PUT Nº 140</span>
                    </button>
                  )}

                </div>
              </div>
            );
          })}

        </div>

        {/* Official Signatures Row */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Treinador Principal</span>
              <strong className="text-slate-800 text-xs">{weeklySchedule.coach}</strong>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Supervisor Técnico</span>
              <strong className="text-slate-800 text-xs">{weeklySchedule.supervisor}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Documento oficial sincronizado para toda a comissão técnica</span>
          </div>
        </div>

      </div>

      {/* Modal: View Original User-Uploaded Schedule Image */}
      <Modal
        isOpen={isOriginalImageModalOpen}
        onClose={() => setIsOriginalImageModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-[#631426]" />
            <span className="text-slate-900">Programação Semanal Original Anexada (Microciclo Nº 34)</span>
          </div>
        }
        subtitle="Documento gráfico oficial da Comissão Técnica do C.A. Juventus SAF"
        maxWidth="6xl"
      >
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Arquivo em alta resolução indexado ao Calendário Geral
            </span>
            <div className="flex items-center gap-2">
              <a
                href="/microciclo_34.jpg"
                download="Microciclo_34_Juventus_Sub20.jpg"
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download size={13} />
                <span>Baixar Imagem</span>
              </a>
              <a
                href="/microciclo_34.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#631426] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#4E0F1E] shadow-sm"
              >
                <ExternalLink size={13} />
                <span>Abrir em Nova Aba</span>
              </a>
            </div>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center p-2">
            <img
              src="/microciclo_34.jpg"
              alt="Programação Semanal Microciclo 34"
              className="max-h-[640px] w-auto object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </Modal>

      {/* Put Plan Modal (Plano de Unidade de Treino) */}
      <PutPlanModal
        isOpen={isPutModalOpen}
        onClose={() => setIsPutModalOpen(false)}
        plan={activePutPlan}
      />

      {/* Upload & Attach New Schedule File Modal */}
      <AttachmentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

    </div>
  );
};


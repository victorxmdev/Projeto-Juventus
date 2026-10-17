import React, { useState } from 'react';
import { TrainingUnitPlan } from '../../types';
import { Modal } from '../common/Modal';
import { 
  ClipboardList, 
  FileText, 
  Layers, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Users, 
  Target,
  ExternalLink,
  Download
} from 'lucide-react';

interface PutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TrainingUnitPlan;
}

export const PutPlanModal: React.FC<PutPlanModalProps> = ({
  isOpen,
  onClose,
  plan
}) => {
  const [activeTab, setActiveTab] = useState<'put_sheet' | 'original_doc'>('put_sheet');

  const positionsRoster = [
    { num: 1, label: 'Goleiros', players: ['Arthur Rodrigues', 'Kaiky', 'Pedro Neres', 'Rafael', 'Eduardo Salvador'], color: 'border-amber-200 bg-amber-50 text-amber-900' },
    { num: 2, label: 'Lateral Direito', players: ['Ian Nascimento', 'Rafael Cardoso', 'Talles'], color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    { num: 3, label: 'Zagueiro Central', players: ['Miguel Bittencourt', 'Matheus Baccan', 'Pedro Evangelista', 'Vitor Lima'], color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    { num: 4, label: 'Zagueiro Esquerdo', players: ['Anthony', 'Luiz Felipe Vidal', 'Nathan Borges'], color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    { num: 5, label: 'Volante', players: ['Fabricio', 'Thiago Felicci'], color: 'border-blue-200 bg-blue-50 text-blue-900' },
    { num: 6, label: 'Lateral Esquerdo', players: ['Aquila', 'Felipe Bernardi', 'Guilherme Neves'], color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    { num: 7, label: 'Extremo / Ponta', players: ['Mota', 'Pedro Júlio', 'Vitinho'], color: 'border-rose-200 bg-rose-50 text-rose-900' },
    { num: 8, label: 'Meia / 2º Volante', players: ['Fallou', 'João Emanoel', 'Ortiz', 'Riquelme dos Santos'], color: 'border-blue-200 bg-blue-50 text-blue-900' },
    { num: 9, label: 'Centroavante', players: ['Dachi', 'Félix', 'Matheus Phelipe', 'Tom'], color: 'border-rose-200 bg-rose-50 text-rose-900' },
    { num: 10, label: 'Meia Armador', players: ['Davi Fernandes', 'Dudu Gimenes', 'Henrique Miranda'], color: 'border-purple-200 bg-purple-50 text-purple-900' },
    { num: 11, label: 'Ponta Esquerda', players: ['Arthur Costa', 'Vitor Coca', 'Gabriel Jonas'], color: 'border-rose-200 bg-rose-50 text-rose-900' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#631426] text-white flex items-center justify-center font-black text-xs shadow-sm">
            PUT
          </div>
          <span className="text-slate-900 font-extrabold text-base sm:text-lg">
            PLANO DE UNIDADE DE TREINO (UT Nº {plan.unitNumber})
          </span>
        </div>
      }
      subtitle={`Microciclo Nº ${plan.microcycleNumber} • Data: ${plan.date} • C.A. Juventus SAF Sub-20`}
      maxWidth="6xl"
    >
      <div className="space-y-4">
        
        {/* Sub-tabs inside modal */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('put_sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'put_sheet'
                  ? 'bg-[#631426] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
              }`}
            >
              Ficha Técnica Digital (PUT)
            </button>
            <button
              onClick={() => setActiveTab('original_doc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'original_doc'
                  ? 'bg-[#631426] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
              }`}
            >
              <FileText size={13} />
              <span>Documento Original Anexado</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold hidden sm:block">
            Tempo Útil: <strong className="text-[#631426]">{plan.usefulTrainingTime}</strong> | Total: <strong className="text-slate-800">{plan.totalTrainingTime}</strong>
          </div>
        </div>

        {activeTab === 'put_sheet' && (
          <div className="space-y-4">
            
            {/* Header Technical Banner */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Escalão</span>
                <span className="font-extrabold text-slate-900 text-sm">{plan.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Microciclo</span>
                <span className="font-extrabold text-[#631426] text-sm">Nº {plan.microcycleNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Unidade de Treino</span>
                <span className="font-extrabold text-slate-900 text-sm">UT Nº {plan.unitNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Nº de Atletas</span>
                <span className="font-extrabold text-amber-700 text-sm">{plan.athletesCount}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Data da Sessão</span>
                <span className="font-extrabold text-slate-900 text-sm">{plan.date}</span>
              </div>
            </div>

            {/* Special Instructions & Considerations */}
            {plan.initialConsiderations && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950 font-bold uppercase text-[11px]">
                    Aspectos a Ter em Consideração:
                  </strong>
                  <span>{plan.initialConsiderations}</span>
                </div>
              </div>
            )}

            {/* Materials & Objectives Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-slate-700 uppercase flex items-center gap-1.5 text-[11px]">
                  <Package size={13} className="text-[#631426]" />
                  Material Necessário:
                </span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                  {plan.materials}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="font-bold text-slate-700 uppercase flex items-center gap-1.5 text-[11px]">
                  <Target size={13} className="text-[#631426]" />
                  Objetivos Gerais da Sessão:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {plan.generalObjectives.map(obj => (
                    <span key={obj} className="px-2 py-0.5 rounded bg-slate-100 text-[#631426] border border-slate-200 font-bold text-[10px]">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Squad Distribution by Tactical Position (from PUT document) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <Users size={14} className="text-[#631426]" />
                  Distribuição do Plantel no Campo (11 Posições)
                </h4>
                <span className="text-[10px] text-slate-500">Total: {plan.athletesCount} Atletas</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                {positionsRoster.map(pos => (
                  <div key={pos.num} className={`p-2.5 rounded-xl border ${pos.color} flex flex-col justify-between shadow-sm`}>
                    <div className="flex items-center justify-between border-b border-black/10 pb-1 mb-1.5">
                      <span className="font-black text-xs">Posição #{pos.num}</span>
                      <span className="text-[10px] font-medium opacity-80">{pos.label}</span>
                    </div>
                    <ul className="space-y-0.5 text-[11px]">
                      {pos.players.map(pName => (
                        <li key={pName} className="font-medium truncate">
                          • {pName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercises List (Exercício 1: Jogo manual com 4 balizas, Exercício 2: Pênaltis) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-[#631426]" />
                Estrutura de Exercícios da Sessão
              </h4>

              {plan.exercises.map(ex => (
                <div key={ex.number} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#631426] text-white font-black text-xs flex items-center justify-center shadow-sm">
                        {ex.number}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm">{ex.title}</h5>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[#631426] border border-slate-200">
                        TÚ: {ex.usefulTime}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        TT: {ex.totalTime}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                      {ex.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-bold text-slate-500 text-[11px] uppercase">Objetivos:</span>
                      <span className="font-semibold text-emerald-800 text-[11px]">{ex.objectives}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary Times */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-slate-700">Tempo Útil de Treino: <strong className="text-[#631426] font-bold">{plan.usefulTrainingTime}</strong></span>
              <span className="font-medium text-slate-700">Tempo Total da Sessão: <strong className="text-slate-900 font-bold">{plan.totalTrainingTime}</strong></span>
              <span className="text-[10px] text-emerald-700 font-semibold">✓ Conforme Documento Oficial Microciclo 34</span>
            </div>

          </div>
        )}

        {/* Tab 2: Documento Original Anexado */}
        {activeTab === 'original_doc' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">
                Documento de Programação Semanal & Ficha Oficial anexada
              </span>
              <a
                href="/microciclo_34.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#631426] text-white font-semibold text-xs flex items-center gap-1 hover:bg-[#4E0F1E] shadow-sm"
              >
                <ExternalLink size={13} />
                <span>Abrir Imagem em Alta Resolução</span>
              </a>
            </div>

            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center p-2">
              <img
                src="/microciclo_34.jpg"
                alt="Programação Semanal Microciclo 34"
                className="max-h-[600px] w-auto object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};


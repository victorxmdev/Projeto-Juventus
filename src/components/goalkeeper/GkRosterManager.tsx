import React, { useState } from 'react';
import { Player } from '../../types';
import { 
  Users, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Activity, 
  FileText, 
  Edit3, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Sparkles,
  ExternalLink,
  Target
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface GkRosterManagerProps {
  goalkeepers: Player[];
  onUpdateGoalkeeper?: (player: Player) => void;
}

export const GkRosterManager: React.FC<GkRosterManagerProps> = ({
  goalkeepers,
  onUpdateGoalkeeper
}) => {
  const [selectedGkId, setSelectedGkId] = useState<string>(goalkeepers[0]?.id || 'p1');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  const selectedGk = goalkeepers.find(g => g.id === selectedGkId) || goalkeepers[0];

  // Specific Goalkeeper Attributes Mapping
  const getGkAttributes = (gk: Player) => {
    if (gk.name.includes('Khendran')) {
      return {
        reflexo: 9.0,
        saidaAerea: 8.8,
        umContraUm: 8.5,
        jogoPes: 8.0,
        posicionamento: 8.7,
        comando: 8.5,
        cleanSheets: 2,
        penaltisDefendidos: 1
      };
    } else if (gk.name.includes('Eduardo')) {
      return {
        reflexo: 8.5,
        saidaAerea: 9.0,
        umContraUm: 8.2,
        jogoPes: 7.8,
        posicionamento: 8.5,
        comando: 8.8,
        cleanSheets: 4,
        penaltisDefendidos: 2
      };
    } else if (gk.name.includes('Arthur')) {
      return {
        reflexo: 8.8,
        saidaAerea: 8.2,
        umContraUm: 8.6,
        jogoPes: 8.2,
        posicionamento: 8.4,
        comando: 8.0,
        cleanSheets: 3,
        penaltisDefendidos: 1
      };
    } else if (gk.name.includes('Pedro')) {
      return {
        reflexo: 8.2,
        saidaAerea: 7.8,
        umContraUm: 8.0,
        jogoPes: 8.7, // Canhoto, excelente jogo de pés
        posicionamento: 8.0,
        comando: 7.5,
        cleanSheets: 1,
        penaltisDefendidos: 0
      };
    } else {
      return {
        reflexo: 8.2,
        saidaAerea: 8.0,
        umContraUm: 8.1,
        jogoPes: 7.9,
        posicionamento: 8.1,
        comando: 7.8,
        cleanSheets: 1,
        penaltisDefendidos: 0
      };
    }
  };

  const attrs = selectedGk ? getGkAttributes(selectedGk) : null;

  const handleOpenEdit = () => {
    if (selectedGk) {
      setEditNotes(selectedGk.notes || '');
      setIsEditModalOpen(true);
    }
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGk && onUpdateGoalkeeper) {
      onUpdateGoalkeeper({
        ...selectedGk,
        notes: editNotes
      });
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#631426]/10 text-[#631426]">
              <Users size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                ELENCO DE GOLEIROS SUB-20
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Fichas individuais, atributos técnicos específicos, dados antropométricos e acompanhamento de minutagem
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            {goalkeepers.length} Goleiros Ativos
          </span>
        </div>
      </div>

      {/* Main Grid: Goalkeeper Selector Strip & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Column: Goalkeepers List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
            Selecione o Atleta
          </div>

          {goalkeepers.map((gk) => {
            const isSelected = gk.id === selectedGkId;
            const gkAttrs = getGkAttributes(gk);

            return (
              <div
                key={gk.id}
                onClick={() => setSelectedGkId(gk.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#631426] text-white border-[#631426] shadow-md scale-[1.01]'
                    : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base shadow-xs ${
                    isSelected ? 'bg-white text-[#631426]' : 'bg-slate-900 text-white'
                  }`}>
                    #{gk.number}
                  </div>

                  <div>
                    <h3 className={`text-sm font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {gk.name}
                    </h3>
                    <div className={`flex items-center gap-2 text-xs mt-0.5 ${isSelected ? 'text-red-100' : 'text-slate-500'}`}>
                      <span>Sub-20</span>
                      <span>•</span>
                      <span>{gk.heightCm} cm</span>
                      <span>•</span>
                      <span>{gk.dominantFoot}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    Ativo
                  </span>
                  <div className={`text-[11px] font-bold mt-1 ${isSelected ? 'text-red-200' : 'text-slate-400'}`}>
                    {gkAttrs.cleanSheets} clean sheets
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Goalkeeper Sheet (7 cols) */}
        {selectedGk && attrs && (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            
            {/* Header: Athlete Name & Number */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#631426] text-white flex items-center justify-center font-black text-2xl shadow-sm">
                  #{selectedGk.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#D4AF37]/20 text-[#631426] border border-[#D4AF37]/40">
                      Goleiro Sub-20
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Nasc. {selectedGk.birthYear}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                    {selectedGk.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {selectedGk.matchSheetName || selectedGk.name.toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenEdit}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Edit3 size={14} className="text-slate-500" />
                <span>Editar Anotações</span>
              </button>
            </div>

            {/* Antropometric & Physical Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Estatura</span>
                <span className="text-base font-black text-slate-900">{selectedGk.heightCm} cm</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Massa Corporal</span>
                <span className="text-base font-black text-slate-900">{selectedGk.weightKg} kg</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Pé Dominante</span>
                <span className="text-base font-black text-slate-900">{selectedGk.dominantFoot}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Clean Sheets</span>
                <span className="text-base font-black text-emerald-600">{attrs.cleanSheets} jogos</span>
              </div>
            </div>

            {/* Specific Goalkeeper Skills (Radar Bars) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Target size={16} className="text-[#631426]" />
                <span>Atributos de Baliza & Desempenho Específico</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Reflexos & Quedas */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700">Reflexos & Quedas</span>
                    <span className="text-[#631426] font-extrabold">{attrs.reflexo} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${attrs.reflexo * 10}%` }} className="bg-[#631426] h-2 rounded-full"></div>
                  </div>
                </div>

                {/* Bolas Aéreas & Cruzamentos */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700">Bolas Aéreas & Cruzamentos</span>
                    <span className="text-blue-700 font-extrabold">{attrs.saidaAerea} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${attrs.saidaAerea * 10}%` }} className="bg-blue-600 h-2 rounded-full"></div>
                  </div>
                </div>

                {/* Enfrentamento 1x1 */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700">Bloqueio & 1x1</span>
                    <span className="text-amber-700 font-extrabold">{attrs.umContraUm} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${attrs.umContraUm * 10}%` }} className="bg-amber-500 h-2 rounded-full"></div>
                  </div>
                </div>

                {/* Jogo com os Pés */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700">Jogo com os Pés & Construção</span>
                    <span className="text-emerald-700 font-extrabold">{attrs.jogoPes} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${attrs.jogoPes * 10}%` }} className="bg-emerald-600 h-2 rounded-full"></div>
                  </div>
                </div>

                {/* Posicionamento */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700">Posicionamento de Baliza</span>
                    <span className="text-purple-700 font-extrabold">{attrs.posicionamento} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${attrs.posicionamento * 10}%` }} className="bg-purple-600 h-2 rounded-full"></div>
                  </div>
                </div>

                {/* Comando & Liderança */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-700">Comando Verbal & Liderança</span>
                    <span className="text-slate-900 font-extrabold">{attrs.comando} / 10</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div style={{ width: `${attrs.comando * 10}%` }} className="bg-slate-800 h-2 rounded-full"></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Coach Technical Observations */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[11px] font-black uppercase text-[#631426] tracking-wider block">
                Relatório Técnico Individual:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedGk.notes || 'Sem observações cadastradas. Clique em "Editar Anotações" para adicionar feedback técnico.'}
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Edit Notes Modal */}
      {isEditModalOpen && selectedGk && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Editar Relatório Técnico - ${selectedGk.name}`}
        >
          <form onSubmit={handleSaveNotes} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Anotações e Parecer Técnico do Preparador de Goleiros
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#631426]"
                placeholder="Insira pontos fortes, aspectos a aprimorar em treino e comportamento tático..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};


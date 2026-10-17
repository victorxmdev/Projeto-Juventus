import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  HeartPulse, 
  Trophy, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface RegulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegulationsModal: React.FC<RegulationsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'rec' | 'rgc'>('guide');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="text-[#631426]" size={20} />
          <span>Regulamentos Oficiais FPF 2026</span>
          <span className="bg-[#631426] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ml-1">
            SUB-20 SÉRIE A
          </span>
        </div>
      }
      subtitle="Regulamento Específico (REC) & Regulamento Geral das Competições (RGC) da Federação Paulista"
      maxWidth="6xl"
    >
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-white text-[#631426] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <ShieldAlert size={14} className="text-[#631426]" />
            <span>Guia de Regras da Comissão</span>
          </button>

          <button
            onClick={() => setActiveTab('rec')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rec'
                ? 'bg-white text-[#631426] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText size={14} className="text-[#631426]" />
            <span>REC Sub-20 2026 (19 págs)</span>
          </button>

          <button
            onClick={() => setActiveTab('rgc')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rgc'
                ? 'bg-white text-[#631426] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen size={14} className="text-[#631426]" />
            <span>RGC Geral FPF 2026 (58 págs)</span>
          </button>
        </div>

        {/* TAB 1: Quick Staff Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            
            {/* Top Alert Banner */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-[#631426] flex-shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-rose-950 space-y-1">
                <p className="font-bold text-sm text-[#631426]">
                  Atenção Especial da Comissão Técnica (Regras de Ouro FPF 2026):
                </p>
                <p>
                  O Campeonato Paulista Sub-20 Série A possui regras específicas cruciais: <strong>até 7 substituições por jogo</strong>, <strong>presença médica obrigatória no banco de reservas sob pena de W.O.</strong>, e <strong>zeramento de cartões amarelos ao término da 1ª fase</strong>.
                </p>
              </div>
            </div>

            {/* Grid of Key Rule Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              {/* Card 1: 7 Substituições */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Users size={16} className="text-[#631426]" />
                    Até 7 Substituições por Jogo
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    REC Art. 19
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Cada equipe pode substituir até <strong>7 atletas por partida</strong>, desde que respeite o máximo de <strong>3 (três) atos/paradas</strong> com a bola rolando no decorrer do jogo.
                </p>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-700 font-medium">
                  💡 <em>O intervalo entre os tempos NÃO é considerado ato de substituição.</em>
                </div>
              </div>

              {/* Card 2: Concussão Cerebral */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <HeartPulse size={16} className="text-blue-600" />
                    Protocolo de Concussão (Cartão Azul)
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    RGC Anexo VII
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Permitida <strong>1 substituição adicional e permanente</strong> por equipe em caso de suspeita ou diagnóstico de concussão cerebral durante o jogo.
                </p>
                <div className="p-2 bg-blue-50 text-blue-900 rounded-lg font-medium space-y-1">
                  <p>• O médico da equipe apresenta o <strong>Cartão Azul</strong> ao 4º árbitro.</p>
                  <p>• Não conta como parada regular. O adversário ganha 1 substituição extra automática.</p>
                </div>
              </div>

              {/* Card 3: Cartões Amarelos & Zeramento */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Cartões & Zeramento de Fase
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    REC Art. 40 e 41
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  A cada <strong>3 cartões amarelos</strong> recebidos, o atleta cumpre 1 jogo de suspensão automática.
                </p>
                <div className="p-2 bg-amber-50 text-amber-950 rounded-lg font-medium space-y-1">
                  <p>• <strong>Zeramento:</strong> Finalizada a 1ª Fase, os amarelos são zerados!</p>
                  <p>• <em>Exceção:</em> Se levar o 3º amarelo na última rodada da 1ª Fase, cumpre na 2ª Fase obrigatoriamente.</p>
                </div>
              </div>

              {/* Card 4: Idades dos Atletas */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Calendar size={16} className="text-emerald-600" />
                    Elegibilidade por Ano de Nascimento
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    REC Art. 18
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Podem atuar atletas nascidos em <strong>2006, 2007, 2008 e 2009</strong>.
                </p>
                <div className="p-2 bg-emerald-50 text-emerald-950 rounded-lg font-medium">
                  • <strong>Atletas Sub-16:</strong> Permitida a inclusão de até <strong>5 (cinco) atletas nascidos em 2010 e 2011</strong> por partida.
                </div>
              </div>

              {/* Card 5: Intervalo de 60 Horas */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Clock size={16} className="text-violet-600" />
                    Intervalo Mínimo de 60 Horas
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    RGC Anexo II, Art. 2º
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Nenhum atleta pode disputar partidas sem o <strong>intervalo mínimo de 60 (sessenta) horas</strong> de descanso.
                </p>
                <div className="p-2 bg-violet-50 text-violet-950 rounded-lg font-medium">
                  Aplica-se a atletas que iniciam como titulares ou entram no decorrer da partida.
                </div>
              </div>

              {/* Card 6: Desempate em Mata-Mata */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <Trophy size={16} className="text-[#631426]" />
                    Critérios de Mata-Mata (Pênaltis Diretos)
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                    REC Art. 5º a 15
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Jogos de ida e volta da 2ª Fase até a Final. Time de melhor campanha acumulada decide a partida de volta em casa.
                </p>
                <div className="p-2 bg-slate-50 text-slate-800 rounded-lg font-medium">
                  ⚖️ Se houver empate em pontos e saldo de gols na fase: <strong>disputa de pênaltis direta</strong> (sem prorrogação e sem gol qualificado fora).
                </div>
              </div>

              {/* Card 7: Médico Obrigatório no Banco */}
              <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-sm space-y-2 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                    <ShieldAlert size={16} className="text-rose-600" />
                    Obrigatoriedade do Médico no Banco de Reservas
                  </span>
                  <span className="bg-rose-100 text-rose-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200">
                    REC Art. 25, § 2º e § 3º
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  É <strong>estritamente obrigatória</strong> a presença de um médico do Clube devidamente registrado no CRM no local do banco de reservas. Na ausência de médico de qualquer equipe, <strong>a partida NÃO é realizada</strong>, o clube infrator é julgado por W.O. e multado administrativamente em até <strong>R$ 3.000,00</strong>.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: REC Sub-20 PDF Viewer */}
        {activeTab === 'rec' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800">
                  Regulamento Específico do Campeonato Paulista Sub-20 Série A - 2026
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  19 páginas • Aprovado pela Diretoria de Competições da FPF em 07 de maio de 2026
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/documentos/REC_Paulista_Sub20_2026.pdf"
                  download="REC_Paulista_Sub20_2026.pdf"
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download size={13} className="text-[#631426]" />
                  <span>Baixar REC</span>
                </a>
                <a
                  href="/documentos/REC_Paulista_Sub20_2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Abrir em Tela Cheia</span>
                </a>
              </div>
            </div>

            <div className="relative w-full h-[520px] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              <iframe
                src="/documentos/REC_Paulista_Sub20_2026.pdf"
                className="w-full h-full border-0"
                title="Regulamento Específico Paulista Sub-20 2026"
              />
            </div>
          </div>
        )}

        {/* TAB 3: RGC Geral PDF Viewer */}
        {activeTab === 'rgc' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800">
                  Regulamento Geral das Competições da FPF - 2026 (RGC)
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  58 páginas • Inclui Anexos Médicos, Administrativos, Antidopagem e Concussão Cerebral
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/documentos/RGC_FPF_2026.pdf"
                  download="RGC_FPF_2026.pdf"
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download size={13} className="text-[#631426]" />
                  <span>Baixar RGC</span>
                </a>
                <a
                  href="/documentos/RGC_FPF_2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Abrir em Tela Cheia</span>
                </a>
              </div>
            </div>

            <div className="relative w-full h-[520px] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              <iframe
                src="/documentos/RGC_FPF_2026.pdf"
                className="w-full h-full border-0"
                title="Regulamento Geral das Competições FPF 2026"
              />
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};

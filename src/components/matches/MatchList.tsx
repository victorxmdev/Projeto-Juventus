import React, { useState } from 'react';
import { Match } from '../../types';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { MatchSheetModal } from './MatchSheetModal';
import { FpfScoresheetAutoModal } from './FpfScoresheetAutoModal';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { RegulationsModal } from '../regulations/RegulationsModal';
import { PreparatoryVideosModal } from './PreparatoryVideosModal';
import { Modal } from '../common/Modal';
import { 
  Trophy, 
  Plus, 
  FileText, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Trash2,
  Edit,
  TrendingUp,
  Award,
  Download,
  BookOpen,
  Video,
  Youtube,
  Play,
  Film,
  Sparkles
} from 'lucide-react';

export const MatchList: React.FC = () => {
  const { matches, addMatch, updateMatch, deleteMatch } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  const [selectedMatchForSheet, setSelectedMatchForSheet] = useState<Match | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isAutoPdfModalOpen, setIsAutoPdfModalOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string>('');
  const [isRegulationsOpen, setIsRegulationsOpen] = useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [selectedTacticalMatch, setSelectedTacticalMatch] = useState<Match | null>(null);
  const [isTacticalVideoModalOpen, setIsTacticalVideoModalOpen] = useState(false);

  // Filter matches according to global championship
  const filteredMatches = matches.filter(m => {
    if (championship === 'consolidado') return true;
    return m.competition === championship;
  });

  // Summary KPIs for current championship
  const completedMatches = filteredMatches.filter(m => m.result !== 'A Jogar');
  const totalVictories = completedMatches.filter(m => m.result === 'Vitória').length;
  const totalDraws = completedMatches.filter(m => m.result === 'Empate').length;
  const totalLosses = completedMatches.filter(m => m.result === 'Derrota').length;
  const totalPending = filteredMatches.filter(m => m.result === 'A Jogar').length;
  const totalGoalsJuventus = completedMatches.reduce((acc, m) => acc + (m.scoreJuventus || 0), 0);
  const totalGoalsOpponents = completedMatches.reduce((acc, m) => acc + (m.scoreOpponent || 0), 0);

  const handleOpenNewMatch = () => {
    setSelectedMatchForSheet(null);
    setIsSheetModalOpen(true);
  };

  const handleSaveMatch = (saved: Match) => {
    const exists = matches.some(m => m.id === saved.id);
    if (exists) {
      updateMatch(saved);
    } else {
      addMatch(saved);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header & Actions Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="text-[#631426]" size={20} />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
              GESTÃO DE JOGOS & SÚMULAS OFICIAIS FPF
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Histórico oficial FPF, súmulas e recálculo automático de minutagem para: <strong className="text-[#631426] font-bold">{getChampionshipTitle(championship)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {championship === 'copinha' ? (
            <a
              href="https://www.youtube.com/playlist?list=PLJ_u_2G_zNBM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
              title="Abrir Playlist Oficial da Copinha Sil 2026 no YouTube (4 Jogos)"
            >
              <Youtube size={15} />
              <span>Câmera Tática Copinha (4 Jogos)</span>
              <ExternalLink size={12} />
            </a>
          ) : championship === 'paulista' ? (
            <a
              href="https://www.youtube.com/playlist?list=PLsNXtgaQkGjnDR7kYQH2iK5rQln1a0WfI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
              title="Abrir Playlist Oficial do Paulista Sub-20 no YouTube (15 Jogos)"
            >
              <Youtube size={15} />
              <span>Câmera Tática Paulista (15 Jogos)</span>
              <ExternalLink size={12} />
            </a>
          ) : (
            <>
              <a
                href="https://www.youtube.com/playlist?list=PLsNXtgaQkGjnDR7kYQH2iK5rQln1a0WfI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
                title="Abrir Playlist Oficial do Paulista Sub-20 no YouTube (15 Jogos)"
              >
                <Youtube size={14} />
                <span>Paulista (15J)</span>
                <ExternalLink size={11} />
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PLJ_u_2G_zNBM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
                title="Abrir Playlist Oficial da Copinha Sil 2026 no YouTube (4 Jogos)"
              >
                <Youtube size={14} />
                <span>Copinha (4J)</span>
                <ExternalLink size={11} />
              </a>
            </>
          )}

          <button
            onClick={() => setIsPrepModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-sm"
            title="Abrir Acervo de Jogos Preparatórios & Amistosos Sub-20 (19 Vídeos - Apenas Visual)"
          >
            <Film size={15} className="text-amber-400" />
            <span>Jogos Preparatórios (19 Vídeos)</span>
          </button>

          <button
            onClick={() => setIsRegulationsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors shadow-sm"
            title="Consultar Regulamentos FPF 2026 (REC Sub-20 & RGC)"
          >
            <BookOpen size={15} className="text-[#631426]" />
            <span>Regulamentos FPF 2026</span>
          </button>

          <button
            onClick={() => setIsAutoPdfModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-black text-xs hover:from-emerald-800 hover:to-teal-900 transition-all shadow-sm ring-2 ring-emerald-500/20"
            title="Lançar súmula em PDF: o sistema extrai e calcula tudo sozinho (escalação, minutagem, substituições e cartões)"
          >
            <Sparkles size={15} className="text-amber-300" />
            <span>Lançar Súmula em PDF (Cálculo Automático)</span>
          </button>

          <button
            onClick={handleOpenNewMatch}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] transition-all shadow-sm"
          >
            <Plus size={15} />
            <span>+ Registrar Jogo / Súmula Manual</span>
          </button>
        </div>
      </div>

      {/* Campaign Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total de Partidas</span>
          <p className="text-xl font-black text-slate-900 mt-1">{filteredMatches.length}</p>
          <span className="text-[10px] text-slate-400">{getChampionshipTitle(championship)}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Aproveitamento</span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {completedMatches.length > 0 
              ? `${Math.round(((totalVictories * 3 + totalDraws) / (completedMatches.length * 3)) * 100)}%` 
              : '0%'}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">{totalVictories}V • {totalDraws}E • {totalLosses}D{totalPending > 0 ? ` • ${totalPending} A Jogar` : ''}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gols Pró (JUV)</span>
          <p className="text-xl font-black text-[#631426] mt-1">{totalGoalsJuventus}</p>
          <span className="text-[10px] text-slate-400">Média {(totalGoalsJuventus / Math.max(completedMatches.length, 1)).toFixed(1)} / jogo</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Gols Sofridos</span>
          <p className="text-xl font-black text-rose-600 mt-1">{totalGoalsOpponents}</p>
          <span className="text-[10px] text-slate-400">Saldo: {totalGoalsJuventus - totalGoalsOpponents > 0 ? `+${totalGoalsJuventus - totalGoalsOpponents}` : totalGoalsJuventus - totalGoalsOpponents}</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status Regulamentar</span>
          <p className="text-xs font-bold text-[#631426] mt-1.5 flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Súmulas FPF em dia</span>
          </p>
          <span className="text-[10px] text-slate-400">Federação Paulista</span>
        </div>
      </div>

      {/* Matches List Cards */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 shadow-sm">
            Nenhuma partida cadastrada para a competição selecionada.
          </div>
        ) : (
          filteredMatches.map(match => {
            const isVictory = match.result === 'Vitória';
            const isDraw = match.result === 'Empate';
            const isPending = match.result === 'A Jogar';

            return (
              <div
                key={match.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-4 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Match Info & Score */}
                <div className="flex items-center gap-4 flex-1">
                  
                  {/* Result Badge */}
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-xs border flex-shrink-0 shadow-sm ${
                    isPending
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : isVictory 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : isDraw 
                      ? 'bg-slate-100 text-slate-700 border-slate-200' 
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    <span className="text-[9px] uppercase font-bold tracking-wider">{isPending ? 'PREV' : match.result.slice(0, 3)}</span>
                    <span className="text-sm font-black">{isPending ? 'VS' : `${match.scoreJuventus}x${match.scoreOpponent}`}</span>
                  </div>

                  {/* Match Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-white bg-[#631426] px-2 py-0.5 rounded shadow-sm">
                        Jogo #{match.matchNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {match.date} às {match.time}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {match.competition === 'paulista' ? 'Paulista Sub-20' : 'Copinha'} • {match.location}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>C.A. JUVENTUS</span>
                      <span className="text-[#631426] font-extrabold px-1">
                        {isPending ? 'x' : `${match.scoreJuventus} x ${match.scoreOpponent}`}
                      </span>
                      <span>{match.opponent}</span>
                      {isPending && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          A Jogar (3ª Fase)
                        </span>
                      )}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span>{match.stadium}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  
                  {/* Tactical Camera Video Button */}
                  {match.tacticalCameraYoutubeId && (
                    <button
                      onClick={() => {
                        setSelectedTacticalMatch(match);
                        setIsTacticalVideoModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Assistir gravação em câmera tática deste jogo no Paulista"
                    >
                      <Video size={14} className="text-red-600" />
                      <span>Câmera Tática</span>
                    </button>
                  )}

                  {/* Open Official Match Sheet Launch Modal */}
                  <button
                    onClick={() => {
                      setSelectedMatchForSheet(match);
                      setIsSheetModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#631426] hover:bg-[#4E0F1E] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Edit size={14} />
                    <span>Lançar Súmula ({match.lineup?.length || 0})</span>
                  </button>

                  {/* View Official FPF PDF Scoresheet (Modal or Direct link) */}
                  {match.pdfOfficialScoresheetUrl ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCurrentPdfUrl(match.pdfOfficialScoresheetUrl!);
                          setIsPdfViewerOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        title="Visualizar Súmula Oficial arquivada no sistema"
                      >
                        <FileText size={14} className="text-[#631426]" />
                        <span>Súmula Anexada</span>
                      </button>

                      <a
                        href={match.pdfOfficialScoresheetUrl}
                        download={`sumula_${match.matchNumber}_juventus.pdf`}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#631426] hover:text-[#4E0F1E] transition-colors shadow-sm"
                        title="Baixar arquivo PDF da Súmula localmente"
                      >
                        <Download size={14} />
                      </a>

                      {match.fpfExternalScoresheetUrl && (
                        <a
                          href={match.fpfExternalScoresheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-[#631426] transition-colors shadow-sm"
                          title="Abrir no portal oficial da Federação Paulista de Futebol (FPF)"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium">
                      Súmula pós-jogo
                    </span>
                  )}

                  {/* Delete Match */}
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o registro do jogo #${match.matchNumber} contra ${match.opponent}?`)) {
                        deleteMatch(match.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
                    title="Excluir Jogo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Match Sheet Launch Modal */}
      <MatchSheetModal
        match={selectedMatchForSheet}
        isOpen={isSheetModalOpen}
        onClose={() => {
          setIsSheetModalOpen(false);
          setSelectedMatchForSheet(null);
        }}
        onSaveMatch={handleSaveMatch}
      />

      {/* Official FPF PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
        title="Súmula Oficial FPF • Federação Paulista de Futebol"
        pdfUrl={currentPdfUrl}
      />

      {/* FPF Regulations Hub Modal */}
      <RegulationsModal
        isOpen={isRegulationsOpen}
        onClose={() => setIsRegulationsOpen(false)}
      />

      {/* Tactical Camera Match Video Modal */}
      {selectedTacticalMatch && (
        <Modal
          isOpen={isTacticalVideoModalOpen}
          onClose={() => {
            setIsTacticalVideoModalOpen(false);
            setSelectedTacticalMatch(null);
          }}
          title={`Câmera Tática: C.A. Juventus x ${selectedTacticalMatch.opponent}`}
          subtitle={`${selectedTacticalMatch.competition === 'copinha' ? 'Copa São Paulo de Futebol Júnior (Copinha 2026)' : 'Campeonato Paulista Sub-20 2026'} • Jogo #${selectedTacticalMatch.matchNumber} • ${selectedTacticalMatch.date} • ${selectedTacticalMatch.stadium}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${selectedTacticalMatch.tacticalCameraYoutubeId}?autoplay=1&rel=0`}
                title={`Câmera Tática Juventus x ${selectedTacticalMatch.opponent}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">
                  Placar: Juventus {selectedTacticalMatch.scoreJuventus} x {selectedTacticalMatch.scoreOpponent} {selectedTacticalMatch.opponent} ({selectedTacticalMatch.result})
                </span>
                <p className="text-slate-500 mt-0.5">
                  {selectedTacticalMatch.summaryObservations || 'Gravação oficial em plano aberto para análise tática e individual da comissão técnica.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${selectedTacticalMatch.tacticalCameraYoutubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Youtube size={14} />
                  <span>Assistir no YouTube</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Preparatory Videos Modal */}
      <PreparatoryVideosModal
        isOpen={isPrepModalOpen}
        onClose={() => setIsPrepModalOpen(false)}
      />

      {/* Automated FPF Scoresheet Parser Modal */}
      <FpfScoresheetAutoModal
        isOpen={isAutoPdfModalOpen}
        onClose={() => setIsAutoPdfModalOpen(false)}
      />

    </div>
  );
};


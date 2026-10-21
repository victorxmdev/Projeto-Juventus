import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Trophy, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Shield, 
  ChevronRight, 
  Zap, 
  Save, 
  ArrowRight,
  Calculator,
  UserPlus,
  Info,
  Check
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { 
  extractTextFromPdfBytes, 
  parseFpfScoresheet, 
  convertParsedToMatch,
  ParsedFpfScoresheet,
  ParsedLineupPlayer 
} from '../../services/fpfScoresheetParser';
import { Match, Player } from '../../types';

interface FpfScoresheetAutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (match: Match) => void;
}

export const FpfScoresheetAutoModal: React.FC<FpfScoresheetAutoModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { players, matches, addMatch, updateMatch, addPlayer } = useData();
  const { championship } = useChampionship();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFpfScoresheet | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [lineupFilter, setLineupFilter] = useState<'all' | 'starters' | 'subs' | 'unused'>('all');
  const [successSaved, setSuccessSaved] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Handle PDF file processing
  const processPdfFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessSaved(false);
    setUploadedFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const extractedText = extractTextFromPdfBytes(buffer);

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Não foi possível extrair o texto do PDF da súmula. Verifique se o arquivo é uma súmula oficial emitida pela FPF.');
      }

      const parsed = parseFpfScoresheet(extractedText, players);
      setParsedData(parsed);
    } catch (err: any) {
      console.error('Erro ao processar PDF da súmula:', err);
      setErrorMessage(err.message || 'Erro ao processar o arquivo PDF da súmula.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        await processPdfFile(file);
      } else {
        setErrorMessage('Por favor, selecione um arquivo em formato PDF.');
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processPdfFile(files[0]);
    }
  };

  // Test with preloaded real FPF match sheets from /sumulas
  const handleLoadSample = async (pdfPath: string, label: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessSaved(false);
    setUploadedFileName(label);

    try {
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error(`Não foi possível carregar a súmula de teste (${response.statusText})`);
      }
      const buffer = await response.arrayBuffer();
      const text = extractTextFromPdfBytes(buffer);
      const parsed = parseFpfScoresheet(text, players);
      setParsedData(parsed);
    } catch (err: any) {
      console.error('Erro ao carregar súmula de amostra:', err);
      setErrorMessage(err.message || 'Erro ao carregar a súmula de teste.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process raw pasted text
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Cole o texto da súmula no campo abaixo.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessSaved(false);
    setUploadedFileName('Texto colado da Súmula');

    try {
      const parsed = parseFpfScoresheet(pastedText, players);
      setParsedData(parsed);
    } catch (err: any) {
      console.error('Erro ao analisar texto:', err);
      setErrorMessage(err.message || 'Erro ao analisar o texto da súmula.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm and persist to DataContext
  const handleConfirmAndSync = () => {
    if (!parsedData) return;

    // Check if match already exists by matchNumber & competition
    const existingMatch = matches.find(
      m => m.matchNumber === parsedData.matchNumber && m.competition === parsedData.competition
    );

    const { match, newPlayersToAdd } = convertParsedToMatch(
      parsedData,
      players,
      existingMatch?.id,
      uploadedFileName.startsWith('http') || uploadedFileName.includes('.pdf') ? uploadedFileName : undefined
    );

    // Register any new players first
    newPlayersToAdd.forEach(newP => {
      addPlayer(newP);
    });

    // Save or update match
    if (existingMatch) {
      updateMatch(match);
    } else {
      addMatch(match);
    }

    setSuccessSaved(true);
    if (onSuccess) {
      onSuccess(match);
    }

    setTimeout(() => {
      onClose();
      setSuccessSaved(false);
      setParsedData(null);
    }, 1200);
  };

  // Filtered lineup
  const filteredLineup = (parsedData?.lineup || []).filter(p => {
    if (lineupFilter === 'starters') return p.isStarter;
    if (lineupFilter === 'subs') return p.isSubUsed;
    if (lineupFilter === 'unused') return p.isSubUnused;
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="6xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#631426] to-[#420d19] flex items-center justify-center text-white shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Lançamento Automático de Súmula Oficial FPF
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Basta soltar o PDF oficial. O sistema lê e calcula tudo sozinho (escalação, minutagem, cartões e gols).
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1 py-1">
        
        {/* Error notification */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-xs animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 text-red-600 mt-0.5" />
            <div>
              <strong className="font-bold">Aviso no processamento: </strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success toast */}
        {successSaved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-bold shadow-sm animate-in fade-in">
            <CheckCircle2 size={22} className="text-emerald-600" />
            <span>Súmula FPF processada com sucesso! Todos os 20 atletas e suas minutagens foram sincronizados com o plantel.</span>
          </div>
        )}

        {/* Upload & Dropzone Area */}
        {!parsedData ? (
          <div className="space-y-4">
            
            {/* Mode selection tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-[#631426] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Carregar Arquivo PDF Oficial
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'paste'
                    ? 'bg-[#631426] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Colar Texto da Súmula (FPF)
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#631426] bg-[#631426]/5 scale-[0.99]'
                    : 'border-slate-300 hover:border-[#631426] hover:bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#631426] shadow-xs">
                  {isProcessing ? (
                    <RefreshCw className="animate-spin text-[#631426]" size={30} />
                  ) : (
                    <UploadCloud size={32} />
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-black text-slate-900">
                  {isProcessing ? 'Lendo e decodificando PDF da Súmula...' : 'Solte o arquivo PDF da súmula oficial FPF aqui'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  ou clique para navegar no seu computador. O sistema analisa os fluxos do PDF, identifica mandante/visitante, escalação completa, substituições e minutagem exata.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">Copa São Paulo Jr 2026</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">Campeonato Paulista Sub-20</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">Padrão Oficial FPF</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Cole abaixo o texto copiado de qualquer súmula FPF (gerado a partir do site da FPF ou de um visualizador de PDF):
                </p>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Ex: Comissão Estadual de Arbitragem de Futebol - CEAF Jogo: 224 / 2026 ... Campeonato: Copa São Paulo - Júnior ..."
                  className="w-full h-44 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#631426]/20 focus:border-[#631426]"
                />
                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  disabled={isProcessing || !pastedText.trim()}
                  className="px-4 py-2 bg-[#631426] text-white text-xs font-bold rounded-xl hover:bg-[#4E0F1E] disabled:opacity-50 transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <Calculator size={14} />}
                  <span>Processar Texto da Súmula</span>
                </button>
              </div>
            )}

            {/* Quick-test with real preloaded súmulas */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Ou teste instantaneamente com uma súmula já cadastrada no acervo oficial:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadSample('/sumulas/sumula_copinha_224.pdf', 'Copinha #224 (Nacional 2x0 Juventus)')}
                  disabled={isProcessing}
                  className="p-2.5 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-[#631426]">Copinha • Jogo #224</div>
                    <div className="text-[11px] text-slate-500">Nacional 2 x 0 Juventus</div>
                  </div>
                  <Zap size={14} className="text-amber-500 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample('/sumulas/sumula_copinha_125.pdf', 'Copinha #125 (Juventus 2x0 São Bento)')}
                  disabled={isProcessing}
                  className="p-2.5 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-[#631426]">Copinha • Jogo #125</div>
                    <div className="text-[11px] text-slate-500">Juventus 2 x 0 São Bento</div>
                  </div>
                  <Zap size={14} className="text-amber-500 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSample('/sumulas/sumula_16.pdf', 'Paulista #16 (América 0x3 Juventus SAF)')}
                  disabled={isProcessing}
                  className="p-2.5 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-[#631426]">Paulista • Jogo #16</div>
                    <div className="text-[11px] text-slate-500">América 0 x 3 Juventus SAF</div>
                  </div>
                  <Zap size={14} className="text-amber-500 shrink-0" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Processed Súmula Presentation */
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Top Match Result Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-700">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#631426] text-white border border-[#831b32]">
                      {parsedData.competitionFullName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                      Rodada {parsedData.rodada} • Jogo #{parsedData.matchNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      parsedData.location === 'Casa' ? 'bg-amber-400 text-slate-900' : 'bg-slate-600 text-white'
                    }`}>
                      Mando: {parsedData.location}
                    </span>
                  </div>

                  {/* Match score line */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="text-lg sm:text-2xl font-black text-white">
                      {parsedData.mandante} <span className="text-amber-400">{parsedData.location === 'Casa' ? parsedData.scoreJuventus : parsedData.scoreOpponent}</span>
                      <span className="mx-2 text-slate-400">X</span>
                      <span className="text-amber-400">{parsedData.location === 'Casa' ? parsedData.scoreOpponent : parsedData.scoreJuventus}</span> {parsedData.visitante}
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      parsedData.result === 'Vitória' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : parsedData.result === 'Empate'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {parsedData.result}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {parsedData.dateDisplay} às {parsedData.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {parsedData.stadium}
                    </span>
                  </div>
                </div>

                {/* Duration & Automatic calculation pills */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs space-y-1.5 min-w-[240px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={12} /> Duração Oficial (com acréscimos):
                    </span>
                    <strong className="text-emerald-400 font-black">{parsedData.totalMatchMinutes} min</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Acréscimos FPF:</span>
                    <span>1ºT: +{parsedData.stoppage1T}' | 2ºT: +{parsedData.stoppage2T}'</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-700/60">
                    <span>Substituições Juventus:</span>
                    <span className="text-white font-bold">{parsedData.substitutionsCount} realizadas</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Gols / Cartões Juventus:</span>
                    <span className="text-white font-bold">
                      ⚽ {parsedData.goalsJuventusCount} • 🟨 {parsedData.yellowCardsCount} • 🟥 {parsedData.redCardsCount}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Lineup Filter Tabs & Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calculator className="text-[#631426]" size={16} />
                  <span>Escalação Oficial & Minutagens Calculadas Automaticamente ({parsedData.lineup.length} atletas)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Os minutos de titulares e reservas foram calculados segundo os momentos exatos das substituições da súmula.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLineupFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    lineupFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({parsedData.lineup.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLineupFilter('starters')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    lineupFilter === 'starters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Titulares ({parsedData.lineup.filter(p => p.isStarter).length})
                </button>
                <button
                  type="button"
                  onClick={() => setLineupFilter('subs')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    lineupFilter === 'subs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Entraram ({parsedData.lineup.filter(p => p.isSubUsed).length})
                </button>
                <button
                  type="button"
                  onClick={() => setLineupFilter('unused')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    lineupFilter === 'unused' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Banco Não Utilizado ({parsedData.lineup.filter(p => p.isSubUnused).length})
                </button>
              </div>
            </div>

            {/* Lineup Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-14 text-center">Nº</th>
                    <th className="py-2.5 px-3">Atleta (Súmula / Sistema)</th>
                    <th className="py-2.5 px-3 w-28">Posição</th>
                    <th className="py-2.5 px-3">Condição na Partida</th>
                    <th className="py-2.5 px-3 text-center">Eventos</th>
                    <th className="py-2.5 px-3 text-right w-36">Minutagem Calculada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLineup.map((p) => {
                    return (
                      <tr key={p.number} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Jersey Number */}
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs">
                            {p.number}
                          </span>
                        </td>

                        {/* Player name & photo */}
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2.5">
                            {p.matchedPhotoUrl ? (
                              <img 
                                src={p.matchedPhotoUrl} 
                                alt={p.name} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                {p.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{p.matchedPlayerName || p.name}</span>
                                {p.isNewPlayer && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    Novo Atleta
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Súmula: {p.name} {p.registration ? `• Reg: ${p.registration}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="py-2 px-3 text-slate-600 font-medium">
                          {p.matchedPosition || 'Atleta da Base'}
                        </td>

                        {/* Match Status & Subs Info */}
                        <td className="py-2 px-3">
                          {p.isStarter ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                                Titular
                              </span>
                              {p.subMinuteOut ? (
                                <span className="text-slate-500 text-[11px]">
                                  Saiu aos {p.subMinuteOut}'
                                </span>
                              ) : (
                                <span className="text-emerald-700 text-[11px] font-semibold">
                                  Partida completa
                                </span>
                              )}
                            </div>
                          ) : p.isSubUsed ? (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px]">
                                Entrou
                              </span>
                              <span className="text-slate-500 text-[11px]">
                                Aos {p.subMinuteIn}'
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Banco (Não entrou)
                            </span>
                          )}
                        </td>

                        {/* Events (Goals & Cards) */}
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {p.goals > 0 && (
                              <span 
                                className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[11px]"
                                title={`${p.goals} gol(s)`}
                              >
                                ⚽ {p.goals > 1 ? `x${p.goals}` : ''}
                              </span>
                            )}
                            {p.yellowCard && (
                              <span 
                                className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]"
                                title={p.yellowCardReason ? `Cartão Amarelo: ${p.yellowCardReason}` : 'Cartão Amarelo'}
                              >
                                🟨
                              </span>
                            )}
                            {p.redCard && (
                              <span 
                                className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-[11px]"
                                title="Cartão Vermelho"
                              >
                                🟥
                              </span>
                            )}
                            {!p.goals && !p.yellowCard && !p.redCard && (
                              <span className="text-slate-300">-</span>
                            )}
                          </div>
                        </td>

                        {/* Calculated Minutes */}
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-xs ${
                            p.calculatedMinutes > 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Calculator size={11} className={p.calculatedMinutes > 0 ? 'text-emerald-600' : 'text-slate-400'} />
                            <span>{p.calculatedMinutes} min</span>
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setParsedData(null);
                  setPastedText('');
                }}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Voltar / Carregar Outra Súmula
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndSync}
                  className="px-5 py-2.5 bg-[#631426] hover:bg-[#4E0F1E] text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Confirmar e Sincronizar Tudo</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
};


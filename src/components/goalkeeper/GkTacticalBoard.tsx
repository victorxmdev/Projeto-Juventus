import React, { useState } from 'react';
import { 
  GkTacticalBoardItem 
} from '../../types';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Move, 
  Download, 
  Eye, 
  ShieldAlert, 
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface TacticalPiece {
  id: string;
  type: 'gk' | 'defender' | 'attacker' | 'cone' | 'minigoal' | 'mannequin' | 'ball' | 'rebounder';
  label: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
}

interface GkTacticalBoardProps {
  tacticalBoards: GkTacticalBoardItem[];
  onSaveBoard?: (board: GkTacticalBoardItem) => void;
}

export const GkTacticalBoard: React.FC<GkTacticalBoardProps> = ({
  tacticalBoards,
  onSaveBoard
}) => {
  const [pitchView, setPitchView] = useState<'goal_box' | 'half_pitch' | 'full_pitch'>('goal_box');
  const [boardTitle, setBoardTitle] = useState('Exercício de Baliza & Saída Aérea');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  // Initial pieces on pitch
  const [pieces, setPieces] = useState<TacticalPiece[]>([
    { id: 'p_gk', type: 'gk', label: 'GK', x: 50, y: 18 },
    { id: 'p_df1', type: 'defender', label: 'ZAG', x: 35, y: 45 },
    { id: 'p_df2', type: 'defender', label: 'ZAG', x: 65, y: 45 },
    { id: 'p_at1', type: 'attacker', label: 'AT1', x: 45, y: 70 },
    { id: 'p_at2', type: 'attacker', label: 'AT2', x: 75, y: 55 },
    { id: 'p_ball', type: 'ball', label: '⚽', x: 75, y: 60 },
    { id: 'p_cone1', type: 'cone', label: '▲', x: 30, y: 25 },
    { id: 'p_cone2', type: 'cone', label: '▲', x: 70, y: 25 },
    { id: 'p_mannequin', type: 'mannequin', label: '🧍', x: 50, y: 42 }
  ]);

  // Add piece to pitch
  const handleAddPiece = (type: TacticalPiece['type'], label: string) => {
    const newPiece: TacticalPiece = {
      id: `piece_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      label,
      x: 50 + (Math.random() * 20 - 10),
      y: 50 + (Math.random() * 20 - 10)
    };
    setPieces(prev => [...prev, newPiece]);
    setSelectedPieceId(newPiece.id);
  };

  const handleRemoveSelected = () => {
    if (!selectedPieceId) return;
    setPieces(prev => prev.filter(p => p.id !== selectedPieceId));
    setSelectedPieceId(null);
  };

  const handleClearAll = () => {
    if (confirm('Deseja limpar todos os elementos da prancheta?')) {
      setPieces([]);
      setSelectedPieceId(null);
    }
  };

  // Preset Drills
  const loadPreset = (presetName: string) => {
    if (presetName === '1x1') {
      setBoardTitle('Exercício 1x1: Fechamento de Ângulo e Bloco Baixo');
      setPitchView('goal_box');
      setPieces([
        { id: 'p1', type: 'gk', label: 'GK', x: 50, y: 15 },
        { id: 'p2', type: 'mannequin', label: '🧍', x: 42, y: 35 },
        { id: 'p3', type: 'attacker', label: 'AT', x: 35, y: 65 },
        { id: 'p4', type: 'ball', label: '⚽', x: 36, y: 68 },
        { id: 'p5', type: 'cone', label: '▲', x: 25, y: 40 },
        { id: 'p6', type: 'cone', label: '▲', x: 75, y: 40 }
      ]);
    } else if (presetName === 'aereas') {
      setBoardTitle('Bolas Aéreas: Cobertura de Primeiro Pau e Cruzamento Fechado');
      setPitchView('half_pitch');
      setPieces([
        { id: 'p1', type: 'gk', label: 'GK', x: 50, y: 12 },
        { id: 'p2', type: 'defender', label: 'ZAG', x: 45, y: 30 },
        { id: 'p3', type: 'defender', label: 'LAT', x: 30, y: 35 },
        { id: 'p4', type: 'attacker', label: 'AT1', x: 47, y: 32 },
        { id: 'p5', type: 'attacker', label: 'AT2', x: 55, y: 28 },
        { id: 'p6', type: 'attacker', label: 'EXT', x: 85, y: 45 },
        { id: 'p7', type: 'ball', label: '⚽', x: 86, y: 48 },
        { id: 'p8', type: 'mannequin', label: '🧍', x: 50, y: 25 }
      ]);
    } else if (presetName === 'construcao') {
      setBoardTitle('Construção Ofensiva: Saída de 3 com Goleiro Aberto');
      setPitchView('half_pitch');
      setPieces([
        { id: 'p1', type: 'gk', label: 'GK', x: 50, y: 22 },
        { id: 'p2', type: 'defender', label: 'ZAG E', x: 25, y: 40 },
        { id: 'p3', type: 'defender', label: 'ZAG D', x: 75, y: 40 },
        { id: 'p4', type: 'defender', label: 'VOL', x: 50, y: 55 },
        { id: 'p5', type: 'attacker', label: 'AT', x: 48, y: 70 },
        { id: 'p6', type: 'minigoal', label: '🥅', x: 20, y: 88 },
        { id: 'p7', type: 'minigoal', label: '🥅', x: 80, y: 88 },
        { id: 'p8', type: 'ball', label: '⚽', x: 50, y: 26 }
      ]);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#631426]/10 text-[#631426]">
              <Layers size={20} />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                PLANEJADOR TÁTICO 2D (QUADRO INTERATIVO DE GOLEIROS)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Desenhe situações de jogo, exercícios de 1x1, bolas aéreas, marcação e posicionamento da baliza
              </p>
            </div>
          </div>
        </div>

        {/* Preset Drills Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Templates:</span>
          <button
            onClick={() => loadPreset('1x1')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
          >
            1x1 Fechamento
          </button>
          <button
            onClick={() => loadPreset('aereas')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
          >
            Bolas Aéreas
          </button>
          <button
            onClick={() => loadPreset('construcao')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
          >
            Saída com os Pés
          </button>
        </div>
      </div>

      {/* Main Board Layout: Controls & Tactical Field */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left Toolbar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          
          {/* Title Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Nome da Prancheta
            </label>
            <input
              type="text"
              value={boardTitle}
              onChange={(e) => setBoardTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#631426]"
            />
          </div>

          {/* Pitch View Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Visão do Campo
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {[
                { id: 'goal_box', label: 'Área & Trave' },
                { id: 'half_pitch', label: 'Meio-Campo' },
                { id: 'full_pitch', label: 'Campo Todo' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setPitchView(view.id as any)}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    pitchView === view.id
                      ? 'bg-[#631426] text-white border-[#631426] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {/* Piece Palette */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-2">
              Adicionar Peça / Elemento ao Campo
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleAddPiece('gk', 'GK')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-[#631426] text-white flex items-center justify-center text-[10px]">🧤</span>
                <span>Goleiro (GK)</span>
              </button>

              <button
                onClick={() => handleAddPiece('defender', 'ZAG')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">DF</span>
                <span>Defensor</span>
              </button>

              <button
                onClick={() => handleAddPiece('attacker', 'AT')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">AT</span>
                <span>Atacante</span>
              </button>

              <button
                onClick={() => handleAddPiece('cone', '▲')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">▲</span>
                <span>Cone</span>
              </button>

              <button
                onClick={() => handleAddPiece('mannequin', '🧍')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">🧍</span>
                <span>Manequim</span>
              </button>

              <button
                onClick={() => handleAddPiece('minigoal', '🥅')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">🥅</span>
                <span>Mini-Gol</span>
              </button>

              <button
                onClick={() => handleAddPiece('ball', '⚽')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-900 flex items-center justify-center text-[10px]">⚽</span>
                <span>Bola</span>
              </button>

              <button
                onClick={() => handleAddPiece('rebounder', '🛡️')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px]">🛡️</span>
                <span>Rebounder</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              onClick={handleRemoveSelected}
              disabled={!selectedPieceId}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                selectedPieceId
                  ? 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
                  : 'border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
            >
              <Trash2 size={14} />
              <span>Remover Seleção</span>
            </button>

            <button
              onClick={handleClearAll}
              className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1"
            >
              <RotateCcw size={14} />
              <span>Limpar</span>
            </button>
          </div>

          {/* Quick Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800">
            <p className="font-medium">
              💡 <strong>Dica do Treinador:</strong> Clique em qualquer peça no campo para selecioná-la. Use os botões de seta ou arraste para ajustar o posicionamento e demonstrar aos atletas.
            </p>
          </div>

        </div>

        {/* Right Tactical Pitch Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-sm font-black text-slate-800">
                {boardTitle}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {pieces.length} elementos posicionados
              </span>
            </div>

            {/* Tactical Pitch Surface (Grass Green) */}
            <div 
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-900/30 shadow-inner select-none"
              style={{
                backgroundColor: '#1b4d2e',
                backgroundImage: `
                  repeating-linear-gradient(0deg, #1b4d2e, #1b4d2e 40px, #174227 40px, #174227 80px)
                `
              }}
            >
              {/* Pitch Markings SVG overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Boundary */}
                <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />

                {pitchView === 'goal_box' && (
                  <>
                    {/* Goal frame on top */}
                    <rect x="36%" y="2%" width="28%" height="3%" fill="rgba(255,255,255,0.9)" stroke="#fff" strokeWidth="2" />
                    {/* Goal net mesh subtle */}
                    <line x1="36%" y1="2%" x2="64%" y2="2%" stroke="#fff" strokeWidth="3" />
                    
                    {/* Goal Area (Pequena Área) */}
                    <rect x="32%" y="5%" width="36%" height="22%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />

                    {/* Penalty Area (Grande Área) */}
                    <rect x="18%" y="5%" width="64%" height="56%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />

                    {/* Penalty Spot */}
                    <circle cx="50%" cy="38%" r="3.5" fill="rgba(255,255,255,0.9)" />

                    {/* Penalty Arc */}
                    <path d="M 38 61 A 15 15 0 0 0 62 61" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                  </>
                )}

                {pitchView === 'half_pitch' && (
                  <>
                    {/* Goal Frame on Top */}
                    <rect x="38%" y="2%" width="24%" height="3%" fill="#fff" />
                    {/* Goal Area */}
                    <rect x="34%" y="5%" width="32%" height="18%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                    {/* Penalty Area */}
                    <rect x="22%" y="5%" width="56%" height="44%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
                    {/* Penalty Spot */}
                    <circle cx="50%" cy="31%" r="3" fill="#fff" />
                    {/* Center Line on bottom */}
                    <line x1="5%" y1="95%" x2="95%" y2="95%" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" />
                    {/* Center Circle Arc */}
                    <path d="M 35 95 A 15 15 0 0 1 65 95" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                  </>
                )}

                {pitchView === 'full_pitch' && (
                  <>
                    {/* Center Line */}
                    <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                    <circle cx="50%" cy="50%" r="10%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                    {/* Top Goal Area */}
                    <rect x="30%" y="5%" width="40%" height="24%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                    {/* Bottom Goal Area */}
                    <rect x="30%" y="71%" width="40%" height="24%" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
                  </>
                )}
              </svg>

              {/* Positioned Tactical Pieces */}
              {pieces.map((piece) => {
                const isSelected = piece.id === selectedPieceId;

                const getPieceBg = () => {
                  switch (piece.type) {
                    case 'gk': return 'bg-[#631426] text-white border-white';
                    case 'defender': return 'bg-blue-600 text-white border-white';
                    case 'attacker': return 'bg-rose-600 text-white border-white';
                    case 'cone': return 'bg-amber-500 text-white border-amber-200';
                    case 'mannequin': return 'bg-slate-800 text-white border-slate-300';
                    case 'minigoal': return 'bg-emerald-700 text-white border-white';
                    case 'ball': return 'bg-white text-slate-900 border-slate-400';
                    case 'rebounder': return 'bg-purple-700 text-white border-purple-200';
                    default: return 'bg-slate-900 text-white border-white';
                  }
                };

                return (
                  <div
                    key={piece.id}
                    onClick={() => setSelectedPieceId(piece.id)}
                    style={{
                      left: `${piece.x}%`,
                      top: `${piece.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={`absolute z-20 cursor-pointer flex flex-col items-center group transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-md ${getPieceBg()} ${
                      isSelected ? 'ring-4 ring-yellow-400' : ''
                    }`}>
                      {piece.label}
                    </div>

                    {/* Move controls when selected */}
                    {isSelected && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="absolute -bottom-8 flex items-center gap-1 bg-slate-950/90 text-white px-2 py-0.5 rounded-md text-[10px] shadow-lg backdrop-blur-sm"
                      >
                        <button 
                          onClick={() => setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, y: Math.max(8, p.y - 4) } : p))}
                          className="hover:text-yellow-400"
                        >▲</button>
                        <button 
                          onClick={() => setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, y: Math.min(92, p.y + 4) } : p))}
                          className="hover:text-yellow-400"
                        >▼</button>
                        <button 
                          onClick={() => setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, x: Math.max(8, p.x - 4) } : p))}
                          className="hover:text-yellow-400"
                        >◀</button>
                        <button 
                          onClick={() => setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, x: Math.min(92, p.x + 4) } : p))}
                          className="hover:text-yellow-400"
                        >▶</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Pitch Meta */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Campo Oficial Sub-20 • Perspectiva do Preparador
            </span>
            <button
              onClick={() => {
                if (onSaveBoard) {
                  onSaveBoard({
                    id: `board_${Date.now()}`,
                    title: boardTitle,
                    category: 'Sub-20',
                    dateStr: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                    pitchType: pitchView,
                    elementsCount: pieces.length,
                    notes: `Prancheta tática de goleiros com ${pieces.length} elementos posicionados.`
                  });
                  alert(`Prancheta "${boardTitle}" salva com sucesso no banco tático!`);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#631426] hover:bg-[#7b182f] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Save size={14} />
              <span>Salvar Prancheta</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};


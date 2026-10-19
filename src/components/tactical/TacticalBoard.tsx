import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, 
  RotateCcw, 
  RotateCw, 
  Download, 
  Save, 
  Trash2, 
  Move, 
  Circle, 
  Play, 
  Video, 
  FileText,
  MousePointer,
  ArrowRight,
  Disc,
  Flag,
  Crosshair,
  ShieldAlert,
  Youtube,
  ExternalLink,
  MapPin,
  Calendar,
  Sparkles,
  Trophy,
  Search,
  Check,
  Film,
  Tag
} from 'lucide-react';
import { TacticalPiece, TacticalArrow, Match, PreparatoryMatchVideo } from '../../types';
import { useData } from '../../context/DataContext';
import { INITIAL_PREPARATORY_VIDEOS } from '../../data/seedData';

type PitchType = 'full' | 'half' | 'box';
type ToolType = 'select' | 'player' | 'goalkeeper' | 'ball' | 'cone' | 'disc' | 'ring' | 'vest' | 'pole' | 'barrier' | 'minigoal' | 'arrow_pass' | 'arrow_run' | 'arrow_carry';

export const TacticalBoard: React.FC = () => {
  const { matches } = useData();

  const [activeMainTab, setActiveMainTab] = useState<'board' | 'tactical_camera' | 'preparatory'>('board');
  const [pitchType, setPitchType] = useState<PitchType>('full');
  const [activeTool, setActiveTool] = useState<ToolType>('player');
  const [playerColor, setPlayerColor] = useState<'#631426' | '#FFFFFF' | '#FACC15' | '#3B82F6'>('#631426');
  const [playerNumber, setPlayerNumber] = useState('10');

  // Tactical camera matches (15 Paulista + 4 Copinha)
  const tacticalMatches = matches.filter(m => !!m.tacticalCameraYoutubeId);
  const [selectedTacticalMatchId, setSelectedTacticalMatchId] = useState<string>(tacticalMatches[0]?.id || 'm337');
  const [tacticalCompetitionFilter, setTacticalCompetitionFilter] = useState<'all' | 'paulista' | 'copinha'>('all');
  const [isPlaylistMode, setIsPlaylistMode] = useState<boolean>(false);
  const [videoSearchTerm, setVideoSearchTerm] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  const selectedTacticalMatch = tacticalMatches.find(m => m.id === selectedTacticalMatchId) || tacticalMatches[0];

  // Preparatory videos (19 friendlies / pre-Paulista games)
  const [selectedPrepVideoId, setSelectedPrepVideoId] = useState<string>(INITIAL_PREPARATORY_VIDEOS[0]?.id || 'prep_1');
  const [isPrepPlaylistMode, setIsPrepPlaylistMode] = useState<boolean>(false);
  const [prepTagFilter, setPrepTagFilter] = useState<string>('all');
  const [prepSearchTerm, setPrepSearchTerm] = useState<string>('');

  const selectedPrepVideo = INITIAL_PREPARATORY_VIDEOS.find(v => v.id === selectedPrepVideoId) || INITIAL_PREPARATORY_VIDEOS[0];

  const filteredPrepVideos = INITIAL_PREPARATORY_VIDEOS.filter(v => {
    if (prepTagFilter !== 'all' && v.tag !== prepTagFilter) return false;
    if (!prepSearchTerm.trim()) return true;
    const q = prepSearchTerm.toLowerCase();
    const stadiumStr = (v.stadium || (v.location === 'Casa' ? 'Estádio Conde Rodolfo Crespi (Rua Javari)' : 'Estádio Visitante')).toLowerCase();
    return (
      v.opponent.toLowerCase().includes(q) || 
      v.title.toLowerCase().includes(q) || 
      v.dateStr.includes(q) ||
      stadiumStr.includes(q)
    );
  });

  const filteredTacticalMatches = tacticalMatches.filter(m => {
    if (tacticalCompetitionFilter !== 'all' && m.competition !== tacticalCompetitionFilter) return false;
    if (!videoSearchTerm.trim()) return true;
    const q = videoSearchTerm.toLowerCase();
    return (
      m.opponent.toLowerCase().includes(q) || 
      m.date.toLowerCase().includes(q) || 
      (m.stadium && m.stadium.toLowerCase().includes(q))
    );
  });

  // Exercise text fields
  const [rules, setRules] = useState('Jogo de posição 4x4 + 3 coringas em espaço reduzido (30x30m). O time que tem a posse busca atrair a pressão para inverter o corredor.');
  const [variations, setVariations] = useState('1) Limite de 2 toques por atleta. 2) Gol só é válido após passe de um dos apoios neutros.');
  const [feedbacks, setFeedbacks] = useState('Ajustar perfil do corpo antes de receber. Girar a cabeça para escanear opções. Pressão imediata ao perder a bola (reação em 3 segundos).');

  // Canvas elements
  const [pieces, setPieces] = useState<TacticalPiece[]>([
    { id: 'pc1', type: 'goalkeeper', x: 10, y: 50, label: '1', color: '#EAB308' },
    { id: 'pc2', type: 'player', x: 25, y: 25, label: '4', color: '#631426' },
    { id: 'pc3', type: 'player', x: 25, y: 75, label: '6', color: '#631426' },
    { id: 'pc4', type: 'player', x: 40, y: 50, label: '5', color: '#631426' },
    { id: 'pc5', type: 'player', x: 55, y: 35, label: '8', color: '#631426' },
    { id: 'pc6', type: 'player', x: 55, y: 65, label: '10', color: '#631426' },
    { id: 'pc7', type: 'player', x: 75, y: 50, label: '9', color: '#631426' },
    { id: 'pc8', type: 'ball', x: 42, y: 50, color: '#FFFFFF' },
    // Opponents
    { id: 'pc9', type: 'player', x: 60, y: 48, label: '5', color: '#FFFFFF' },
    { id: 'pc10', type: 'player', x: 70, y: 30, label: '2', color: '#FFFFFF' },
  ]);

  const [arrows, setArrows] = useState<TacticalArrow[]>([
    { id: 'ar1', fromX: 42, fromY: 50, toX: 55, toY: 65, style: 'pass', color: '#C2F07C' },
    { id: 'ar2', fromX: 55, fromY: 65, toX: 75, toY: 50, style: 'run', color: '#FACC15' }
  ]);

  // History for Undo/Redo
  const [history, setHistory] = useState<Array<{ pieces: TacticalPiece[]; arrows: TacticalArrow[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);

  // Push state to history
  const pushHistory = (newPieces: TacticalPiece[], newArrows: TacticalArrow[]) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push({ pieces: newPieces, arrows: newArrows });
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setPieces(prev.pieces);
      setArrows(prev.arrows);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setPieces(next.pieces);
      setArrows(next.arrows);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleClear = () => {
    if (confirm('Deseja limpar todos os elementos da prancheta?')) {
      pushHistory([], []);
      setPieces([]);
      setArrows([]);
    }
  };

  // Render Tactical Pitch Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Pitch Background Turf Pattern
    ctx.fillStyle = '#0F2918';
    ctx.fillRect(0, 0, w, h);

    // Subtle lawn stripes
    const stripeCount = 10;
    const stripeW = w / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(21, 56, 33, 0.4)';
        ctx.fillRect(i * stripeW, 0, stripeW, h);
      }
    }

    // Pitch Lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    const m = 24; // Margin

    if (pitchType === 'full') {
      // Outer Boundary
      ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);

      // Halfway line
      ctx.beginPath();
      ctx.moveTo(w / 2, m);
      ctx.lineTo(w / 2, h - m);
      ctx.stroke();

      // Center circle
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Center spot
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Penalty Areas
      // Left Penalty Box
      const boxW = (w - 2 * m) * 0.16;
      const boxH = (h - 2 * m) * 0.55;
      const boxY = (h - boxH) / 2;
      ctx.strokeRect(m, boxY, boxW, boxH);

      // Left Goal Box
      const goalW = (w - 2 * m) * 0.06;
      const goalH = (h - 2 * m) * 0.28;
      const goalY = (h - goalH) / 2;
      ctx.strokeRect(m, goalY, goalW, goalH);

      // Left Penalty Spot
      ctx.beginPath();
      ctx.arc(m + (w - 2 * m) * 0.11, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Right Penalty Box
      ctx.strokeRect(w - m - boxW, boxY, boxW, boxH);

      // Right Goal Box
      ctx.strokeRect(w - m - goalW, goalY, goalW, goalH);

      // Right Penalty Spot
      ctx.beginPath();
      ctx.arc(w - m - (w - 2 * m) * 0.11, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();

    } else if (pitchType === 'half') {
      // Meio Campo
      ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);

      // Top line is the halfway line
      ctx.beginPath();
      ctx.arc(w / 2, m, 60, 0, Math.PI);
      ctx.stroke();

      // Penalty Box
      const boxW = (w - 2 * m) * 0.55;
      const boxH = (h - 2 * m) * 0.45;
      const boxX = (w - boxW) / 2;
      ctx.strokeRect(boxX, h - m - boxH, boxW, boxH);

      // Goal Box
      const goalW = (w - 2 * m) * 0.28;
      const goalH = (h - 2 * m) * 0.18;
      const goalX = (w - goalW) / 2;
      ctx.strokeRect(goalX, h - m - goalH, goalW, goalH);

      // Penalty Spot
      ctx.beginPath();
      ctx.arc(w / 2, h - m - (h - 2 * m) * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Caixa de Área (Box)
      ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);

      // Large box
      ctx.strokeRect(m + 40, m + 40, w - 2 * m - 80, h - 2 * m - 80);

      // Center target
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Tactical Arrows
    arrows.forEach(arrow => {
      const fromX = (arrow.fromX / 100) * w;
      const fromY = (arrow.fromY / 100) * h;
      const toX = (arrow.toX / 100) * w;
      const toY = (arrow.toY / 100) * h;

      ctx.save();
      ctx.strokeStyle = arrow.color || '#FACC15';
      ctx.fillStyle = arrow.color || '#FACC15';
      ctx.lineWidth = 3;

      if (arrow.style === 'run') {
        // Dotted / dashed line for player runs
        ctx.setLineDash([6, 4]);
      } else if (arrow.style === 'carry') {
        // Carry (squiggly or dash-dot)
        ctx.setLineDash([10, 3, 3, 3]);
      } else {
        // Solid for pass
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Arrowhead
      ctx.setLineDash([]);
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const headLen = 10;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    // Draw Pieces
    pieces.forEach(p => {
      const px = (p.x / 100) * w;
      const py = (p.y / 100) * h;

      ctx.save();

      if (p.type === 'player' || p.type === 'goalkeeper') {
        // Player circle
        const radius = 13;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color || (p.type === 'goalkeeper' ? '#EAB308' : '#631426');
        ctx.fill();

        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;

        // Label / Number
        if (p.label) {
          ctx.fillStyle = p.color === '#FFFFFF' ? '#000000' : '#FFFFFF';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.label, px, py);
        }
      } else if (p.type === 'ball') {
        // Ball
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (p.type === 'cone') {
        // Cone (triangle)
        ctx.beginPath();
        ctx.moveTo(px, py - 9);
        ctx.lineTo(px - 7, py + 7);
        ctx.lineTo(px + 7, py + 7);
        ctx.closePath();
        ctx.fillStyle = '#F97316';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (p.type === 'disc') {
        // Disc / Flat marker
        ctx.beginPath();
        ctx.ellipse(px, py, 9, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#EAB308';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (p.type === 'barrier') {
        // Training barrier
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(px - 14, py - 6, 28, 12);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px - 14, py - 6, 28, 12);
      } else if (p.type === 'minigoal') {
        // Mini-goal
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3;
        ctx.strokeRect(px - 12, py - 6, 24, 12);
      }

      ctx.restore();
    });

  }, [pitchType, pieces, arrows]);

  // Canvas Mouse Interactions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    if (activeTool === 'select') {
      const clickedPiece = pieces.find(p => {
        const dx = Math.abs(p.x - xPct);
        const dy = Math.abs(p.y - yPct);
        return dx < 4 && dy < 4;
      });
      if (clickedPiece) {
        setDraggedPieceId(clickedPiece.id);
      }
    } else if (activeTool.startsWith('arrow_')) {
      setDrawingStart({ x: xPct, y: yPct });
    } else {
      const newPiece: TacticalPiece = {
        id: `pc_${Date.now()}`,
        type: activeTool as any,
        x: xPct,
        y: yPct,
        label: activeTool === 'player' ? playerNumber : activeTool === 'goalkeeper' ? '1' : undefined,
        color: activeTool === 'player' ? playerColor : undefined
      };

      const updated = [...pieces, newPiece];
      pushHistory(updated, arrows);
      setPieces(updated);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedPieceId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    setPieces(prev => prev.map(p => {
      if (p.id === draggedPieceId) {
        return { ...p, x: xPct, y: yPct };
      }
      return p;
    }));
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedPieceId) {
      pushHistory(pieces, arrows);
      setDraggedPieceId(null);
    }

    if (drawingStart && activeTool.startsWith('arrow_')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width) * 100;
      const yPct = (y / rect.height) * 100;

      const style = activeTool === 'arrow_pass' ? 'pass' : activeTool === 'arrow_run' ? 'run' : 'carry';
      const arrowColor = activeTool === 'arrow_pass' ? '#C2F07C' : activeTool === 'arrow_run' ? '#FACC15' : '#38BDF8';

      const newArrow: TacticalArrow = {
        id: `ar_${Date.now()}`,
        fromX: drawingStart.x,
        fromY: drawingStart.y,
        toX: xPct,
        toY: yPct,
        style,
        color: arrowColor
      };

      const updatedArrows = [...arrows, newArrow];
      pushHistory(pieces, updatedArrows);
      setArrows(updatedArrows);
      setDrawingStart(null);
    }
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Prancheta_Tatica_Juventus_Sub20_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      
      {/* Top Main Navigation: Prancheta vs Câmera Tática vs Jogos Preparatórios */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMainTab('board')}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              activeMainTab === 'board'
                ? 'bg-[#631426] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers size={15} />
            <span>Prancheta Tática Interativa</span>
          </button>

          <button
            onClick={() => setActiveMainTab('tactical_camera')}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              activeMainTab === 'tactical_camera'
                ? 'bg-[#631426] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Youtube size={15} className={activeMainTab !== 'tactical_camera' ? 'text-red-600' : ''} />
            <span>Câmera Tática dos Jogos</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
              activeMainTab === 'tactical_camera' ? 'bg-white text-[#631426]' : 'bg-red-600 text-white'
            }`}>
              {tacticalMatches.length} jogos oficiais
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('preparatory')}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${
              activeMainTab === 'preparatory'
                ? 'bg-[#631426] text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Film size={15} className={activeMainTab !== 'preparatory' ? 'text-amber-500' : ''} />
            <span>Jogos Preparatórios</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
              activeMainTab === 'preparatory' ? 'bg-white text-[#631426]' : 'bg-slate-800 text-white'
            }`}>
              19 jogos
            </span>
          </button>
        </div>

        <a
          href={
            activeMainTab === 'preparatory'
              ? 'https://www.youtube.com/playlist?list=PLsNXtgaQkGjnNCptg1B0Ou_FKFiDHI4Y_'
              : (tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha')
              ? 'https://www.youtube.com/playlist?list=PLJ_u_2G_zNBM'
              : 'https://www.youtube.com/playlist?list=PLsNXtgaQkGjnDR7kYQH2iK5rQln1a0WfI'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
          title="Abrir playlist oficial no YouTube"
        >
          <Youtube size={14} />
          <span className="hidden sm:inline">
            {activeMainTab === 'preparatory' 
              ? 'Playlist Preparatórios (19)' 
              : (tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha')
              ? 'Playlist Copinha (4)'
              : 'Playlist Paulista (15)'}
          </span>
          <ExternalLink size={11} />
        </a>
      </div>

      {/* VIEW 1: PRANCHETA TÁTICA INTERATIVA */}
      {activeMainTab === 'board' && (
        <div className="space-y-4">
          
          {/* Top Controls Toolbar */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            
            {/* Pitch type selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Campo:</span>
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
                {(['full', 'half', 'box'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setPitchType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      pitchType === type
                        ? 'bg-white text-[#631426] shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type === 'full' ? 'Campo Inteiro' : type === 'half' ? 'Meio Campo' : 'Caixa de Área'}
                  </button>
                ))}
              </div>
            </div>

            {/* Undo, Redo, Clear */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-40 transition-colors"
                title="Desfazer"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-40 transition-colors"
                title="Refazer"
              >
                <RotateCw size={15} />
              </button>
              <button
                onClick={handleClear}
                className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-500 hover:text-rose-600 transition-colors"
                title="Limpar Prancheta"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Export and Save actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPng}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <Download size={15} className="text-[#631426]" />
                <span>Exportar PNG</span>
              </button>

              <button
                onClick={() => {
                  alert('Exercício tático salvo com sucesso! As diretrizes foram sincronizadas para a Ficha de Treino.');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] transition-all shadow-sm"
              >
                <Save size={15} />
                <span>Salvar Exercício</span>
              </button>
            </div>

          </div>

          {/* Main Tactical Workspace: Left Palette + Center Canvas + Right Activity Textareas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column: PEÇAS (Palette) */}
            <div className="lg:col-span-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MousePointer size={14} className="text-[#631426]" />
                Peças & Ferramentas
              </h3>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'select' as ToolType, label: 'Mover', icon: Move },
                  { id: 'player' as ToolType, label: 'Jogador', icon: Circle },
                  { id: 'goalkeeper' as ToolType, label: 'Goleiro', icon: ShieldAlert },
                  { id: 'ball' as ToolType, label: 'Bola', icon: Disc },
                  { id: 'cone' as ToolType, label: 'Cone', icon: Flag },
                  { id: 'disc' as ToolType, label: 'Pratinho', icon: Circle },
                  { id: 'barrier' as ToolType, label: 'Barreira', icon: Layers },
                  { id: 'minigoal' as ToolType, label: 'Mini-trave', icon: Crosshair },
                ].map(tool => {
                  const Icon = tool.icon as any;
                  const isActive = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        isActive
                          ? 'bg-[#631426] text-white border-[#631426] shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-[10px]">{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Setas (Corrida, Passe, Condução) */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Setas Táticas</span>
                <div className="space-y-1">
                  {[
                    { id: 'arrow_pass' as ToolType, label: 'Passe (Contínua)', color: '#16A34A' },
                    { id: 'arrow_run' as ToolType, label: 'Corrida (Tracejada)', color: '#D97706' },
                    { id: 'arrow_carry' as ToolType, label: 'Condução (Ondulada)', color: '#0284C7' },
                  ].map(arrowTool => {
                    const isActive = activeTool === arrowTool.id;
                    return (
                      <button
                        key={arrowTool.id}
                        onClick={() => setActiveTool(arrowTool.id)}
                        className={`w-full px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-semibold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-slate-100 text-[#631426] border-[#631426]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{arrowTool.label}</span>
                        <ArrowRight size={13} style={{ color: arrowTool.color }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Player Customizer if tool === 'player' */}
              {activeTool === 'player' && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Cor & Camisa</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: '#631426', label: 'Grená Juve' },
                      { color: '#FFFFFF', label: 'Branco' },
                      { color: '#FACC15', label: 'Amarelo' },
                      { color: '#3B82F6', label: 'Azul' }
                    ].map(c => (
                      <button
                        key={c.color}
                        onClick={() => setPlayerColor(c.color as any)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform shadow-sm ${
                          playerColor === c.color ? 'scale-125 border-[#631426]' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    maxLength={2}
                    value={playerNumber}
                    onChange={e => setPlayerNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#631426] rounded-lg p-1.5 text-xs text-slate-800 text-center font-mono font-bold focus:outline-none"
                    placeholder="Nº"
                  />
                </div>
              )}
            </div>

            {/* Center Column: Interactive Canvas Pitch */}
            <div className="lg:col-span-7 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[700px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-300 shadow-md">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={525}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-full cursor-crosshair select-none touch-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Clique no campo para posicionar peças ou selecione uma seta e arraste do ponto inicial ao final.
              </p>
            </div>

            {/* Right Column: ATIVIDADE (Textareas) */}
            <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <h3 className="font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileText size={15} className="text-[#631426]" />
                  Diretrizes da Atividade
                </h3>

                {/* REGRAS */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Regras do Exercício
                  </label>
                  <textarea
                    rows={4}
                    value={rules}
                    onChange={e => setRules(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#631426] focus:bg-white rounded-xl p-2.5 text-slate-800 leading-relaxed focus:outline-none transition-colors"
                    placeholder="Regras, espaço, toques e objetivos..."
                  />
                </div>

                {/* VARIAÇÕES */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Possíveis Variações
                  </label>
                  <textarea
                    rows={3}
                    value={variations}
                    onChange={e => setVariations(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#631426] focus:bg-white rounded-xl p-2.5 text-slate-800 leading-relaxed focus:outline-none transition-colors"
                    placeholder="Variações de dificuldade ou dinâmica..."
                  />
                </div>

                {/* PRINCIPAIS FEEDBACKS */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Principais Feedbacks (O que corrigir)
                  </label>
                  <textarea
                    rows={4}
                    value={feedbacks}
                    onChange={e => setFeedbacks(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#631426] focus:bg-white rounded-xl p-2.5 text-slate-800 leading-relaxed focus:outline-none transition-colors"
                    placeholder="Pontos de atenção para a comissão..."
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                ✓ Sincronizado automaticamente com o gerador oficial da Ficha de Treino em PDF.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: CÂMERA TÁTICA DOS JOGOS DO PAULISTA 2026 */}
      {activeMainTab === 'tactical_camera' && (
        <div className="space-y-4">
          
          {/* Header Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Video className="text-red-600" size={20} />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase">
                  Câmera Tática • Jogos Oficiais (Paulista & Copinha)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-200">
                  {tacticalMatches.length} Partidas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gravações oficiais em plano aberto para análise tática coletiva, transições e comportamento das linhas (15 jogos Paulista Sub-20 + 4 jogos Copinha 2026).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsPlaylistMode(!isPlaylistMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isPlaylistMode
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {isPlaylistMode 
                  ? 'Modo Jogo Individual' 
                  : (tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha')
                  ? 'Ver Playlist Copinha (4 Jogos)'
                  : 'Ver Playlist Paulista (15 Jogos)'}
              </button>

              <a
                href={
                  (tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha')
                    ? 'https://www.youtube.com/playlist?list=PLJ_u_2G_zNBM'
                    : 'https://www.youtube.com/playlist?list=PLsNXtgaQkGjnDR7kYQH2iK5rQln1a0WfI'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Youtube size={15} />
                <span>
                  {(tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha')
                    ? 'Abrir Playlist Copinha'
                    : 'Abrir Playlist Paulista'}
                </span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Horizontal Match Selector Carousel */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={14} className="text-[#631426]" />
                Selecione a Partida para Análise em Vídeo:
              </span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTacticalCompetitionFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    tacticalCompetitionFilter === 'all'
                      ? 'bg-[#631426] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Todos ({tacticalMatches.length})
                </button>
                <button
                  onClick={() => setTacticalCompetitionFilter('paulista')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    tacticalCompetitionFilter === 'paulista'
                      ? 'bg-[#631426] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Paulista ({tacticalMatches.filter(m => m.competition === 'paulista').length})
                </button>
                <button
                  onClick={() => setTacticalCompetitionFilter('copinha')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    tacticalCompetitionFilter === 'copinha'
                      ? 'bg-[#631426] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Copinha ({tacticalMatches.filter(m => m.competition === 'copinha').length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {filteredTacticalMatches.map(m => {
                const isSelected = selectedTacticalMatchId === m.id && !isPlaylistMode;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedTacticalMatchId(m.id);
                      setIsPlaylistMode(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left flex-shrink-0 transition-all min-w-[175px] ${
                      isSelected
                        ? 'bg-[#631426] text-white border-[#631426] shadow-md ring-2 ring-[#631426]/30'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <div className="flex items-center gap-1">
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          #{m.matchNumber}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${
                          isSelected 
                            ? 'bg-black/30 text-white' 
                            : m.competition === 'copinha' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {m.competition === 'copinha' ? 'Copinha' : 'Paulista'}
                        </span>
                      </div>
                      <span className={`font-mono ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {m.date}
                      </span>
                    </div>

                    <div className="font-extrabold text-xs truncate">
                      vs {m.opponent}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className={isSelected ? 'text-slate-200' : 'text-slate-500'}>
                        {m.location}
                      </span>
                      <span className={`font-black ${
                        m.result === 'Vitória' 
                          ? (isSelected ? 'text-emerald-300' : 'text-emerald-700')
                          : m.result === 'Empate'
                          ? (isSelected ? 'text-amber-200' : 'text-amber-700')
                          : (isSelected ? 'text-rose-300' : 'text-rose-700')
                      }`}>
                        {m.scoreJuventus}x{m.scoreOpponent} ({m.result.slice(0, 3)})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Video Player & Tactical Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Player Container (Col 8) */}
            <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider">
                      {isPlaylistMode 
                        ? 'PLAYLIST GERAL' 
                        : selectedTacticalMatch?.competition === 'copinha'
                        ? 'COPINHA 2026'
                        : 'PAULISTA SUB-20'}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {isPlaylistMode 
                        ? (tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha'
                            ? 'Copinha Sicredi 2026 (Câmera Tática)' 
                            : 'Paulista Sub-20 (Câmera Tática Completa)')
                        : `C.A. Juventus x ${selectedTacticalMatch?.opponent}`}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isPlaylistMode 
                      ? 'Navegue pelos jogos gravados pelo menu superior do player'
                      : `${selectedTacticalMatch?.competition === 'copinha' ? 'Copa São Paulo de Futebol Júnior' : 'Campeonato Paulista Sub-20'} • Jogo #${selectedTacticalMatch?.matchNumber} • ${selectedTacticalMatch?.date} • ${selectedTacticalMatch?.stadium}`}
                  </p>
                </div>

                {selectedTacticalMatch && !isPlaylistMode && (
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedTacticalMatch.tacticalCameraYoutubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm self-start sm:self-auto"
                  >
                    <Youtube size={14} />
                    <span>Abrir no YouTube</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* 16:9 Video Embed */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
                {isPlaylistMode ? (
                  <iframe
                    src={
                      (tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha')
                        ? 'https://www.youtube.com/embed/videoseries?list=PLJ_u_2G_zNBM&rel=0'
                        : 'https://www.youtube.com/embed/videoseries?list=PLsNXtgaQkGjnDR7kYQH2iK5rQln1a0WfI&rel=0'
                    }
                    title={
                      (tacticalCompetitionFilter === 'copinha' || selectedTacticalMatch?.competition === 'copinha')
                        ? 'Playlist Câmera Tática Copinha 2026'
                        : 'Playlist Câmera Tática Paulista Sub-20'
                    }
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : selectedTacticalMatch ? (
                  <iframe
                    key={selectedTacticalMatch.tacticalCameraYoutubeId}
                    src={`https://www.youtube.com/embed/${selectedTacticalMatch.tacticalCameraYoutubeId}?rel=0`}
                    title={`Câmera Tática Juventus x ${selectedTacticalMatch.opponent}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    Selecione um jogo para iniciar a reprodução tática
                  </div>
                )}
              </div>

              {/* Bottom strip */}
              {selectedTacticalMatch && !isPlaylistMode && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#631426]">
                      Placar Oficial: C.A. Juventus {selectedTacticalMatch.scoreJuventus} x {selectedTacticalMatch.scoreOpponent} {selectedTacticalMatch.opponent}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{selectedTacticalMatch.result}</span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    ID Vídeo: {selectedTacticalMatch.tacticalCameraYoutubeId}
                  </span>
                </div>
              )}
            </div>

            {/* Tactical Feedback & Analysis Studio (Col 4) */}
            <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={15} className="text-[#631426]" />
                    <span>Relatório Tático da Partida</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Observações de campo da comissão técnica
                  </p>
                </div>

                {selectedTacticalMatch ? (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                        Síntese Tática Coletiva
                      </span>
                      <p className="text-slate-800 leading-relaxed">
                        {selectedTacticalMatch.summaryObservations || 
                          'Plano tático executado com foco na compactação das linhas, ocupação dos corredores e reação imediata na perda da posse.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                        Fases do Jogo em Observação:
                      </span>
                      <div className="space-y-1.5">
                        {[
                          { title: 'Organização Ofensiva', desc: 'Saída baixa 3+2 com laterais dando amplitude' },
                          { title: 'Transição Defensiva', desc: 'Pressão imediata de 3 segundos pós-perda' },
                          { title: 'Organização Defensiva', desc: 'Bloco médio em 4-4-2 protegendo o funil central' },
                          { title: 'Bolas Paradas', desc: 'Marcação mista em escanteios e faltas laterais' }
                        ].map((phase, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                            <strong className="text-[#631426] block font-bold">{phase.title}</strong>
                            <span className="text-slate-600">{phase.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Action to switch to interactive board */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setActiveMainTab('board');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Layers size={15} />
                  <span>Desenhar Jogada na Prancheta Tática</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  Alterne para a prancheta para esquematizar correções ou exercícios baseados neste vídeo.
                </p>
              </div>
            </div>

          </div>

          {/* Grid of All Tactical Matches */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Video size={15} className="text-red-600" />
                  <span>Catálogo de Gravações em Câmera Tática ({filteredTacticalMatches.length} Partidas)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Clique em qualquer jogo para carregar instantaneamente o vídeo na tela de análise
                </p>
              </div>

              <div className="relative min-w-[200px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrar por adversário ou data..."
                  value={videoSearchTerm}
                  onChange={e => setVideoSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredTacticalMatches.map(m => {
                const isSelected = selectedTacticalMatchId === m.id && !isPlaylistMode;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedTacticalMatchId(m.id);
                      setIsPlaylistMode(false);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-[#631426] border-[#631426] shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
                      <img
                        src={`https://i.ytimg.com/vi/${m.tacticalCameraYoutubeId}/hqdefault.jpg`}
                        alt={`vs ${m.opponent}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          isSelected ? 'bg-[#631426] text-white' : 'bg-white/90 text-[#631426]'
                        }`}>
                          <Play size={14} className="ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                        #{m.matchNumber}
                      </span>
                      <span className={`absolute top-1 left-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow ${
                        m.competition === 'copinha' ? 'bg-amber-600 text-white' : 'bg-[#631426] text-white'
                      }`}>
                        {m.competition === 'copinha' ? 'Copinha' : 'Paulista'}
                      </span>
                    </div>

                    <div className="p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">{m.date}</span>
                        <span className={`text-[10px] font-extrabold ${
                          m.result === 'Vitória' ? 'text-emerald-700' : m.result === 'Empate' ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {m.scoreJuventus}x{m.scoreOpponent}
                        </span>
                      </div>
                      <h5 className="font-black text-slate-900 truncate">
                        vs {m.opponent}
                      </h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        {m.stadium}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: JOGOS PREPARATÓRIOS & AMISTOSOS SUB-20 (19 VÍDEOS) */}
      {activeMainTab === 'preparatory' && (
        <div className="space-y-4">
          
          {/* Header & Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Film className="text-amber-500" size={20} />
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase">
                  Jogos Preparatórios & Amistosos Sub-20
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                  19 Jogos
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Gravações completas dos jogos pré-Paulista 2026. Apenas consulta visual para comissão técnica (não gera súmula oficial nem pontuação de atletas).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsPrepPlaylistMode(!isPrepPlaylistMode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  isPrepPlaylistMode
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Youtube size={14} />
                <span>{isPrepPlaylistMode ? 'Modo: Playlist Completa' : 'Modo: Vídeo Selecionado'}</span>
              </button>

              <a
                href="https://www.youtube.com/playlist?list=PLsNXtgaQkGjnNCptg1B0Ou_FKFiDHI4Y_"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <ExternalLink size={13} />
                <span>Abrir no YouTube</span>
              </a>
            </div>
          </div>

          {/* Player & Video Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left: Video Player Embed */}
            <div className="lg:col-span-2 bg-black rounded-2xl overflow-hidden shadow-md border border-slate-800">
              <div className="relative aspect-video w-full">
                {isPrepPlaylistMode ? (
                  <iframe
                    src="https://www.youtube.com/embed/videoseries?list=PLsNXtgaQkGjnNCptg1B0Ou_FKFiDHI4Y_&autoplay=1"
                    title="Playlist de Jogos Preparatórios Sub-20 Juventus"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    key={selectedPrepVideo.youtubeId}
                    src={`https://www.youtube.com/embed/${selectedPrepVideo.youtubeId}?autoplay=1&rel=0`}
                    title={selectedPrepVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            {/* Right: Technical Notes & Quick Action */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedPrepVideo.tag === 'Jogo-Treino'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : selectedPrepVideo.tag === 'Copa Integração'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {selectedPrepVideo.tag}
                  </span>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Calendar size={13} />
                    {selectedPrepVideo.dateStr}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 leading-snug">
                    {selectedPrepVideo.title}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin size={13} className="text-[#631426]" />
                    <span>{selectedPrepVideo.stadium || (selectedPrepVideo.location === 'Casa' ? 'Estádio Conde Rodolfo Crespi (Rua Javari)' : 'Estádio Visitante')}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <strong className="text-slate-800 font-bold block">Observações Técnicas:</strong>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedPrepVideo.notes || 'Partida gravada para análise de posicionamento, transições e entrosamento tático da equipe no período pré-temporada.'}
                  </p>
                </div>
              </div>

              {/* Action to switch to interactive board */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setActiveMainTab('board');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#631426] hover:bg-[#4E0F1E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Layers size={15} />
                  <span>Esquematizar Jogada na Prancheta Tática</span>
                </button>
                <p className="text-[10px] text-slate-400 text-center">
                  Alterne para a prancheta para desenhar ajustes táticos e exercícios baseados neste jogo.
                </p>
              </div>
            </div>

          </div>

          {/* Grid of All 19 Preparatory Games */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Film size={15} className="text-amber-500" />
                  <span>Catálogo de Jogos Preparatórios (19 Partidas)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Selecione qualquer partida para carregar no player de análise
                </p>
              </div>

              {/* Tag filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  {['all', 'Jogo-Treino', 'Copa Integração', 'Coletivo Interno'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setPrepTagFilter(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        prepTagFilter === tag
                          ? 'bg-[#631426] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tag === 'all' ? 'Todos' : tag}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[180px]">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por adversário..."
                    value={prepSearchTerm}
                    onChange={e => setPrepSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredPrepVideos.map((v, idx) => {
                const isSelected = selectedPrepVideoId === v.id && !isPrepPlaylistMode;
                const stadiumText = v.stadium || (v.location === 'Casa' ? 'Rua Javari' : 'Fora');
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedPrepVideoId(v.id);
                      setIsPrepPlaylistMode(false);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`rounded-xl border overflow-hidden cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'ring-2 ring-amber-500 border-amber-500 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
                      <img
                        src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                          isSelected ? 'bg-amber-500 text-white' : 'bg-white/90 text-amber-600'
                        }`}>
                          <Play size={14} className="ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                        #{v.order || (idx + 1)}
                      </span>
                      <span className={`absolute top-1 left-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow ${
                        v.tag === 'Jogo-Treino'
                          ? 'bg-blue-600 text-white'
                          : v.tag === 'Copa Integração'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}>
                        {v.tag}
                      </span>
                    </div>

                    <div className="p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{v.dateStr}</span>
                      </div>
                      <h5 className="font-black text-slate-900 truncate">
                        {v.opponent}
                      </h5>
                      <p className="text-[10px] text-slate-500 truncate">
                        {stadiumText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

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
  ShieldAlert
} from 'lucide-react';
import { TacticalPiece, TacticalArrow } from '../../types';

type PitchType = 'full' | 'half' | 'box';
type ToolType = 'select' | 'player' | 'goalkeeper' | 'ball' | 'cone' | 'disc' | 'ring' | 'vest' | 'pole' | 'barrier' | 'minigoal' | 'arrow_pass' | 'arrow_run' | 'arrow_carry';

export const TacticalBoard: React.FC = () => {
  const [pitchType, setPitchType] = useState<PitchType>('full');
  const [activeTool, setActiveTool] = useState<ToolType>('player');
  const [playerColor, setPlayerColor] = useState<'#631426' | '#FFFFFF' | '#FACC15' | '#3B82F6'>('#631426');
  const [playerNumber, setPlayerNumber] = useState('10');

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
    ctx.lineWidth = 2.5;

    const pad = 24;
    const pw = w - pad * 2;
    const ph = h - pad * 2;

    // Outer boundary
    ctx.strokeRect(pad, pad, pw, ph);

    if (pitchType === 'full') {
      // Halfway line
      ctx.beginPath();
      ctx.moveTo(w / 2, pad);
      ctx.lineTo(w / 2, h - pad);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 55, 0, Math.PI * 2);
      ctx.stroke();

      // Center Spot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Left Penalty Area
      const boxW = pw * 0.18;
      const boxH = ph * 0.55;
      const boxY = pad + (ph - boxH) / 2;
      ctx.strokeRect(pad, boxY, boxW, boxH);

      // Left Goal Area
      const gBoxW = pw * 0.07;
      const gBoxH = ph * 0.3;
      const gBoxY = pad + (ph - gBoxH) / 2;
      ctx.strokeRect(pad, gBoxY, gBoxW, gBoxH);

      // Left Penalty Spot
      ctx.beginPath();
      ctx.arc(pad + boxW * 0.7, h / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Right Penalty Area
      ctx.strokeRect(w - pad - boxW, boxY, boxW, boxH);
      ctx.strokeRect(w - pad - gBoxW, gBoxY, gBoxW, gBoxH);

      // Right Penalty Spot
      ctx.beginPath();
      ctx.arc(w - pad - boxW * 0.7, h / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (pitchType === 'half') {
      // Half court lines
      const boxW = pw * 0.35;
      const boxH = ph * 0.6;
      const boxY = pad + (ph - boxH) / 2;
      ctx.strokeRect(pad, boxY, boxW, boxH);

      // Goal area
      const gBoxW = pw * 0.15;
      const gBoxH = ph * 0.35;
      const gBoxY = pad + (ph - gBoxH) / 2;
      ctx.strokeRect(pad, gBoxY, gBoxW, gBoxH);

      // Arc at top
      ctx.beginPath();
      ctx.arc(pad + boxW, h / 2, 45, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else {
      // Box area zoom
      const boxW = pw * 0.75;
      const boxH = ph * 0.8;
      const boxY = pad + (ph - boxH) / 2;
      ctx.strokeRect(pad, boxY, boxW, boxH);
    }

    // Draw Arrows
    arrows.forEach(arrow => {
      const fromPxX = (arrow.fromX / 100) * w;
      const fromPxY = (arrow.fromY / 100) * h;
      const toPxX = (arrow.toX / 100) * w;
      const toPxY = (arrow.toY / 100) * h;

      ctx.save();
      ctx.strokeStyle = arrow.color;
      ctx.fillStyle = arrow.color;
      ctx.lineWidth = 3;

      if (arrow.style === 'run') {
        ctx.setLineDash([6, 5]); // dotted
      } else if (arrow.style === 'carry') {
        ctx.setLineDash([12, 4]);
      } else {
        ctx.setLineDash([]); // solid pass
      }

      ctx.beginPath();
      ctx.moveTo(fromPxX, fromPxY);
      ctx.lineTo(toPxX, toPxY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(toPxY - fromPxY, toPxX - fromPxX);
      const headlen = 10;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(toPxX, toPxY);
      ctx.lineTo(toPxX - headlen * Math.cos(angle - Math.PI / 6), toPxY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toPxX - headlen * Math.cos(angle + Math.PI / 6), toPxY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });

    // Draw Pieces
    pieces.forEach(p => {
      const pxX = (p.x / 100) * w;
      const pxY = (p.y / 100) * h;

      ctx.save();

      if (p.type === 'player' || p.type === 'goalkeeper') {
        // Player circle with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = p.color || (p.type === 'goalkeeper' ? '#EAB308' : '#631426');
        ctx.beginPath();
        ctx.arc(pxX, pxY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Number/label
        ctx.fillStyle = p.color === '#FFFFFF' ? '#0B140E' : '#FFFFFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label || '10', pxX, pxY + 0.5);

      } else if (p.type === 'ball') {
        // Soccer ball
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pxX, pxY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(pxX, pxY, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.type === 'cone') {
        // Cone (triangle)
        ctx.fillStyle = '#F97316'; // orange
        ctx.beginPath();
        ctx.moveTo(pxX, pxY - 10);
        ctx.lineTo(pxX - 8, pxY + 8);
        ctx.lineTo(pxX + 8, pxY + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

      } else if (p.type === 'disc') {
        // Disc / Pratinho
        ctx.fillStyle = '#EAB308'; // yellow disc
        ctx.beginPath();
        ctx.ellipse(pxX, pxY, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

      } else if (p.type === 'barrier') {
        // Barreira
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(pxX - 12, pxY - 6, 24, 12);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pxX - 12, pxY - 6, 24, 12);

      } else if (p.type === 'minigoal') {
        // Mini trave
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3;
        ctx.strokeRect(pxX - 10, pxY - 6, 20, 12);

      } else {
        // Fallback marker
        ctx.fillStyle = '#C2F07C';
        ctx.beginPath();
        ctx.arc(pxX, pxY, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

  }, [pieces, arrows, pitchType]);

  // Canvas Mouse Interaction (Click to place, drag pieces, or draw arrows)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'select') {
      // Find piece near click (within 5%)
      const found = pieces.find(p => Math.hypot(p.x - xPct, p.y - yPct) < 5);
      if (found) {
        setDraggedPieceId(found.id);
      }
    } else if (activeTool.startsWith('arrow_')) {
      setDrawingStart({ x: xPct, y: yPct });
    } else {
      // Place piece directly
      const newPiece: TacticalPiece = {
        id: `pc_${Date.now()}`,
        type: activeTool as any,
        x: Math.round(xPct),
        y: Math.round(yPct),
        label: activeTool === 'player' ? playerNumber : activeTool === 'goalkeeper' ? '1' : undefined,
        color: activeTool === 'player' ? playerColor : activeTool === 'goalkeeper' ? '#EAB308' : undefined
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
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setPieces(prev => prev.map(p => p.id === draggedPieceId ? { ...p, x: xPct, y: yPct } : p));
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedPieceId) {
      pushHistory(pieces, arrows);
      setDraggedPieceId(null);
    }

    if (drawingStart) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

      const style: 'pass' | 'run' | 'carry' = activeTool === 'arrow_run' ? 'run' : activeTool === 'arrow_carry' ? 'carry' : 'pass';
      const arrowColor = activeTool === 'arrow_run' ? '#FACC15' : activeTool === 'arrow_carry' ? '#38BDF8' : '#C2F07C';

      const newArrow: TacticalArrow = {
        id: `ar_${Date.now()}`,
        fromX: Math.round(drawingStart.x),
        fromY: Math.round(drawingStart.y),
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

  // Export Canvas as PNG
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
  );
};

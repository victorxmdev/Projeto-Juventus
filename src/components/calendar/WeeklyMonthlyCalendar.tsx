import React, { useState } from 'react';
import { CalendarEvent, CalendarEventType, TrainingUnitPlan } from '../../types';
import { useData } from '../../context/DataContext';
import { useChampionship } from '../../context/ChampionshipContext';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { Modal } from '../common/Modal';
import { WeeklyScheduleBoard } from './WeeklyScheduleBoard';
import { PutPlanModal } from './PutPlanModal';
import { AttachmentUploadModal } from './AttachmentUploadModal';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Plus, 
  Clock, 
  MapPin, 
  Trash2,
  CheckCircle2,
  Info,
  Paperclip,
  Upload,
  Eye,
  Image as ImageIcon,
  Trophy,
  Sparkles,
  Download,
  ExternalLink
} from 'lucide-react';

export const WeeklyMonthlyCalendar: React.FC = () => {
  const { calendarEvents, matches, addCalendarEvent, deleteCalendarEvent, weeklySchedule, putPlans, attachScheduleFile } = useData();
  const { championship, getChampionshipTitle } = useChampionship();

  const [viewMode, setViewMode] = useState<'microcycle' | 'week' | 'month'>('microcycle');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Attachment & PUT modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPutModalOpen, setIsPutModalOpen] = useState(false);
  const [isAttachmentPreviewOpen, setIsAttachmentPreviewOpen] = useState(false);

  // Reference date: October 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 16)); // 16th Oct 2026 (Friday of Microciclo 34)

  // Active PUT Plan
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

  // Form state for adding an event
  const [newEventForm, setNewEventForm] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'treino',
    date: '2026-10-16',
    time: '10:00',
    location: 'Estádio Conde Rodolfo Crespi (Rua Javari)',
    details: ''
  });

  const eventTypeColors: Record<CalendarEventType, { bg: string; text: string; border: string; dot: string; label: string }> = {
    treino: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Treino' },
    jogo: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Jogo Oficial' },
    folga: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400', label: 'Folga / Descanso' },
    retorno_dm: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Retorno DM' },
    avaliacao: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500', label: 'Avaliação Física' },
    aniversario: { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200', dot: 'bg-pink-500', label: 'Aniversário' }
  };

  // Helper to format date string YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate 7 days for weekly view starting from Monday
  const getWeekDays = (baseDate: Date) => {
    const current = new Date(baseDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      weekDays.push(nextDay);
    }
    return weekDays;
  };

  const weekDays = getWeekDays(currentDate);

  // Month days generator
  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    for (let i = startDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    let trailingIndex = 1;
    while (days.length % 7 !== 0) {
      const nextDate: Date = new Date(year, month + 1, trailingIndex);
      days.push({ date: nextDate, isCurrentMonth: false });
      trailingIndex++;
    }

    return days;
  };

  const monthDays = getMonthDays(currentDate);

  // Convert matches into dynamic calendar game events
  const matchCalendarEvents: CalendarEvent[] = matches.map(m => {
    let dateIso = m.date;
    if (m.date.includes('/')) {
      const parts = m.date.split('/');
      if (parts.length === 3) {
        dateIso = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    const isPending = m.result === 'A Jogar';
    const compLabel = m.competition === 'paulista' ? 'Paulista Sub-20' : 'Copinha';
    const scoreStr = isPending ? `Juventus x ${m.opponent}` : `Juventus ${m.scoreJuventus}x${m.scoreOpponent} ${m.opponent}`;

    return {
      id: `match_cal_${m.id}`,
      date: dateIso,
      time: m.time,
      title: `${compLabel}: ${scoreStr}`,
      type: 'jogo' as CalendarEventType,
      championshipScope: m.competition,
      location: m.stadium,
      details: m.summaryObservations || `Partida oficial da FPF #${m.matchNumber} (${m.location}).`,
      attachedFileUrl: m.pdfOfficialScoresheetUrl,
      attachedFileType: m.pdfOfficialScoresheetUrl ? 'pdf' : undefined
    };
  });

  // Combine manual calendarEvents with matchCalendarEvents avoiding duplicate ids
  const combinedEvents = [
    ...calendarEvents.filter(e => !e.id.startsWith('match_cal_')),
    ...matchCalendarEvents
  ];

  // Filter events by championship scope if applicable
  const filteredEvents = combinedEvents.filter(ev => {
    if (!ev.championshipScope || ev.championshipScope === 'all') return true;
    if (championship === 'consolidado') return true;
    return ev.championshipScope === championship;
  });

  const getEventsForDate = (dateKey: string) => {
    return filteredEvents.filter(ev => ev.date === dateKey);
  };

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week' || viewMode === 'microcycle') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setMonth(next.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'week' || viewMode === 'microcycle') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title || !newEventForm.date) return;

    const event: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title: newEventForm.title,
      type: newEventForm.type as CalendarEventType || 'treino',
      date: newEventForm.date,
      time: newEventForm.time,
      location: newEventForm.location,
      details: newEventForm.details
    };

    addCalendarEvent(event);
    setIsAddEventModalOpen(false);
    setNewEventForm({
      title: '',
      type: 'treino',
      date: '2026-10-16',
      time: '10:00',
      location: 'Estádio Conde Rodolfo Crespi (Rua Javari)',
      details: ''
    });
  };

  const handleSyncWeeklyStatus = () => {
    alert('Sincronização concluída com sucesso! Os status de Treino, Jogo e Folga foram mapeados da programação semanal oficial.');
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-[#631426]" size={20} />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
              CALENDÁRIO GERAL & PROGRAMAÇÃO OFICIAL
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão integrada de microciclos, fichas de treino (PUT) e anexos em foto/PDF para a Comissão Técnica
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          
          {/* Attach / Upload schedule image or PDF */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
          >
            <Paperclip size={14} className="text-[#631426]" />
            <span>Anexar Documento</span>
          </button>

          {/* PDF Program Viewer */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#631426] hover:bg-[#4E0F1E] text-white font-semibold text-xs shadow-sm transition-all"
          >
            <FileText size={14} />
            <span>Ver PDF na Nuvem</span>
          </button>

          {/* Add Event Button */}
          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Plus size={14} />
            <span>+ Novo Evento</span>
          </button>

          {/* View Mode Segmented Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('microcycle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'microcycle'
                  ? 'bg-white text-[#631426] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quadro Oficial
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-[#631426] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-[#631426] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Attachment Banner (Anexo do Microciclo em Destaque) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#631426] rounded-xl text-white flex-shrink-0 shadow-sm">
            <ImageIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Anexo Ativo: Programação Semanal Microciclo Nº {weeklySchedule.microcycleNumber} (12 a 18/Out)
              </span>
              <span className="bg-[#631426] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                OFICIAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Arquivo anexado: <code className="text-[#631426] bg-slate-100 px-1 py-0.5 rounded font-mono">microciclo_34.jpg</code> • Vinculado ao jogo contra EC Santo André e Ficha UT Nº 140
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsAttachmentPreviewOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Eye size={13} className="text-[#631426]" />
            <span>Ver Imagem</span>
          </button>

          <button
            onClick={() => setIsPutModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-[#631426] hover:bg-[#4E0F1E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileText size={13} />
            <span>Ficha PUT Nº 140</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-medium"
            title="Substituir anexo"
          >
            <Upload size={13} />
          </button>
        </div>
      </div>

      {/* View Mode 1: Interactive Official Microcycle Board (Exact Replica) */}
      {viewMode === 'microcycle' && (
        <WeeklyScheduleBoard />
      )}

      {/* View Mode 2: Weekly List View */}
      {viewMode === 'week' && (
        <div className="space-y-4">
          
          {/* Date Navigation & Legend */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(2026, 9, 16))}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900"
                >
                  Hoje
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <span className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Visual Color Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
                <span className="text-slate-600 font-medium">🟢 Treino</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" />
                <span className="text-slate-600 font-medium">🔵 Jogo Oficial</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block shadow-sm" />
                <span className="text-slate-600 font-medium">⚪ Folga</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" />
                <span className="text-slate-600 font-medium">🟠 Retorno DM</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm" />
                <span className="text-slate-600 font-medium">🟣 Avaliação Física</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block shadow-sm" />
                <span className="text-slate-600 font-medium">🩷 Aniversário</span>
              </span>
            </div>
          </div>

          {/* 7 Days Columns */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((dayDate) => {
              const dateKey = formatDateKey(dayDate);
              const events = getEventsForDate(dateKey);
              const isToday = formatDateKey(new Date()) === dateKey || dateKey === '2026-10-16';

              // Check if matching day in official weekly schedule
              const scheduleDay = weeklySchedule.days.find(d => d.date === dateKey);

              return (
                <div 
                  key={dateKey}
                  className={`bg-white rounded-2xl flex flex-col min-h-[320px] p-3 transition-all ${
                    isToday 
                      ? 'border-2 border-[#631426] shadow-md ring-1 ring-[#631426]/20' 
                      : 'border border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-slate-500 block">
                        {dayDate.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                      <span className={`text-base font-black ${isToday ? 'text-[#631426]' : 'text-slate-900'}`}>
                        {dayDate.getDate()}
                      </span>
                    </div>
                    {isToday && (
                      <span className="bg-[#631426] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        HOJE
                      </span>
                    )}
                  </div>

                  {/* Microcycle Plan Highlights for this day if available */}
                  {scheduleDay && (
                    <div className="mb-2 p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase">
                        <span>Programação Oficial</span>
                        {scheduleDay.putSheetId && (
                          <span className="text-[#631426] font-bold">PUT 140</span>
                        )}
                      </div>

                      {scheduleDay.isMatchDay ? (
                        <div className="p-1.5 rounded-lg bg-[#631426] text-white text-[10px] font-bold shadow-sm">
                          15h: JUVENTUS x Santo André
                        </div>
                      ) : scheduleDay.isDayOff ? (
                        <div className="p-1 rounded text-center text-[10px] text-slate-500 font-bold bg-slate-100">
                          FOLGA GERAL
                        </div>
                      ) : (
                        <div className="space-y-0.5 text-[10px] text-slate-600">
                          <p>• 8h00 Apresentação / Café</p>
                          <p className="text-amber-800 font-semibold">• 8h50 Academia</p>
                          <p className="text-emerald-800 font-bold">• 10h00 Treino no Campo</p>
                        </div>
                      )}

                      {scheduleDay.putSheetId && (
                        <button
                          onClick={() => setIsPutModalOpen(true)}
                          className="mt-1 w-full py-1 rounded bg-[#631426] text-white text-[9px] font-bold flex items-center justify-center gap-1 hover:bg-[#4E0F1E] shadow-sm"
                        >
                          <FileText size={10} />
                          <span>Ver Ficha PUT</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Calendar Events List */}
                  <div className="space-y-2 flex-1">
                    {events.map((ev) => {
                      const color = eventTypeColors[ev.type] || eventTypeColors.treino;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-2 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${color.bg} ${color.border} shadow-sm`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[9px] font-bold uppercase text-slate-700 flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
                              {color.label}
                            </span>
                            {ev.time && (
                              <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-0.5">
                                <Clock size={10} />
                                {ev.time}
                              </span>
                            )}
                          </div>
                          <h4 className={`text-xs font-bold line-clamp-2 ${color.text}`}>
                            {ev.title}
                          </h4>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={() => {
                      setNewEventForm(prev => ({ ...prev, date: dateKey }));
                      setIsAddEventModalOpen(true);
                    }}
                    className="mt-2 w-full py-1 rounded-lg border border-dashed border-slate-300 hover:border-[#631426] text-slate-400 hover:text-[#631426] text-[10px] font-semibold transition-colors"
                  >
                    + Evento
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode 3: Month View */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
          <div className="grid grid-cols-7 gap-2 pb-2 border-b border-slate-200 text-center text-xs font-bold text-slate-500 uppercase">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {monthDays.map((item, idx) => {
              const dateKey = formatDateKey(item.date);
              const events = getEventsForDate(dateKey);

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                    item.isCurrentMonth
                      ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-100/40 border-slate-100 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${item.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                      {item.date.getDate()}
                    </span>
                    {events.length > 0 && (
                      <span className="text-[9px] bg-[#631426] text-white px-1.5 py-0.2 rounded font-bold shadow-sm">
                        {events.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 flex-1 overflow-hidden">
                    {events.slice(0, 2).map((ev) => {
                      const color = eventTypeColors[ev.type] || eventTypeColors.treino;
                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer ${color.bg} ${color.text} border ${color.border}`}
                          title={ev.title}
                        >
                          {ev.time ? `${ev.time} ` : ''}{ev.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: View High Resolution Attachment */}
      <Modal
        isOpen={isAttachmentPreviewOpen}
        onClose={() => setIsAttachmentPreviewOpen(false)}
        title="Quadro Geral de Programação Semanal Anexado"
        subtitle="Microciclo Nº 34 • C.A. Juventus SAF Sub-20"
        maxWidth="6xl"
      >
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Arquivo oficial digitalizado e indexado ao calendário
            </span>
            <div className="flex items-center gap-2">
              <a
                href="/microciclo_34.jpg"
                download="Microciclo_34_Juventus_Sub20.jpg"
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download size={13} />
                <span>Baixar</span>
              </a>
              <a
                href="/microciclo_34.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#631426] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#4E0F1E] shadow-sm"
              >
                <ExternalLink size={13} />
                <span>Tela Cheia</span>
              </a>
            </div>
          </div>

          <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center p-2">
            <img
              src="/microciclo_34.jpg"
              alt="Programação Semanal Microciclo 34"
              className="max-h-[640px] w-auto object-contain rounded-lg shadow-xl"
            />
          </div>
        </div>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={
          selectedEvent ? (
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${eventTypeColors[selectedEvent.type]?.dot || 'bg-emerald-500'}`} />
              <span className="text-slate-900">{selectedEvent.title}</span>
            </div>
          ) : ''
        }
        subtitle="Detalhes do Evento do Calendário"
        maxWidth="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-500">Tipo de Evento:</span>
                <span className="ml-2 font-bold uppercase text-slate-900">
                  {eventTypeColors[selectedEvent.type]?.label}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Data e Hora:</span>
                <span className="ml-2 font-bold text-slate-900">
                  {selectedEvent.date} {selectedEvent.time ? `às ${selectedEvent.time}h` : ''}
                </span>
              </div>
              {selectedEvent.location && (
                <div>
                  <span className="text-slate-500">Local:</span>
                  <span className="ml-2 font-semibold text-slate-800">{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.details && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Observações:</span>
                  <p className="text-slate-700 leading-relaxed">{selectedEvent.details}</p>
                </div>
              )}
              {selectedEvent.attachedFileUrl && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500">Documento Oficial:</span>
                  <a
                    href={selectedEvent.attachedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#631426] text-white font-bold text-xs hover:bg-[#4E0F1E] transition-colors shadow-sm"
                  >
                    <FileText size={13} />
                    <span>Súmula Oficial FPF (PDF)</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              {selectedEvent.id.startsWith('match_cal_') ? (
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Trophy size={13} className="text-[#631426]" />
                  <span>Partida Oficial FPF</span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    deleteCalendarEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Excluir Evento</span>
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add New Event Modal */}
      <Modal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        title="Agendar Novo Evento no Calendário Oficial"
        subtitle="Sincronização em tempo real com a Comissão Técnica"
        maxWidth="md"
      >
        <form onSubmit={handleAddEventSubmit} className="space-y-4">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Título do Evento</label>
              <input
                type="text"
                required
                placeholder="ex: Treino: Saída de Bola sob Pressão"
                value={newEventForm.title}
                onChange={e => setNewEventForm({ ...newEventForm, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tipo de Evento</label>
                <select
                  value={newEventForm.type}
                  onChange={e => setNewEventForm({ ...newEventForm, type: e.target.value as CalendarEventType })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                >
                  <option value="treino">🟢 Treino</option>
                  <option value="jogo">🔵 Jogo Oficial</option>
                  <option value="folga">⚪ Folga / Descanso</option>
                  <option value="retorno_dm">🟠 Retorno Previsto (DM)</option>
                  <option value="avaliacao">🟣 Avaliação Física</option>
                  <option value="aniversario">🩷 Aniversário</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Data (YYYY-MM-DD)</label>
                <input
                  type="date"
                  required
                  value={newEventForm.date}
                  onChange={e => setNewEventForm({ ...newEventForm, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Horário (HH:mm)</label>
                <input
                  type="time"
                  value={newEventForm.time || ''}
                  onChange={e => setNewEventForm({ ...newEventForm, time: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Local</label>
                <input
                  type="text"
                  placeholder="ex: Campo Principal (Rua Javari)"
                  value={newEventForm.location || ''}
                  onChange={e => setNewEventForm({ ...newEventForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:border-[#631426] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddEventModalOpen(false)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#631426] text-white font-semibold text-xs hover:bg-[#4E0F1E] shadow-sm"
            >
              Salvar Evento
            </button>
          </div>
        </form>
      </Modal>

      {/* Put Plan Modal */}
      <PutPlanModal
        isOpen={isPutModalOpen}
        onClose={() => setIsPutModalOpen(false)}
        plan={activePutPlan}
      />

      {/* Attachment Upload Modal */}
      <AttachmentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Cloud PDF Viewer Modal for Weekly Schedule */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="Programação Semanal Sub-20 (PDF Oficial na Nuvem)"
        pdfUrl={weeklySchedule.attachedPdfUrl || weeklySchedule.attachedImageUrl}
        onSavePdfUrl={(url) => attachScheduleFile(url, 'pdf')}
        onSyncWeeklyStatus={handleSyncWeeklyStatus}
      />

    </div>
  );
};

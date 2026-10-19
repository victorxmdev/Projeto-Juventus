import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { INITIAL_PREPARATORY_VIDEOS } from '../../data/seedData';
import { PreparatoryMatchVideo } from '../../types';
import { 
  Play, 
  Youtube, 
  ExternalLink, 
  Search, 
  Calendar, 
  MapPin, 
  Tag,
  Film
} from 'lucide-react';

interface PreparatoryVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreparatoryVideosModal: React.FC<PreparatoryVideosModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>(INITIAL_PREPARATORY_VIDEOS[0]?.id || 'prep_1');
  const [isFullPlaylist, setIsFullPlaylist] = useState<boolean>(false);
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedVideo = INITIAL_PREPARATORY_VIDEOS.find(v => v.id === selectedVideoId) || INITIAL_PREPARATORY_VIDEOS[0];

  const filteredVideos = INITIAL_PREPARATORY_VIDEOS.filter(v => {
    if (tagFilter !== 'all' && v.tag !== tagFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return v.opponent.toLowerCase().includes(q) || v.title.toLowerCase().includes(q) || v.dateStr.includes(q);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Jogos Preparatórios & Amistosos Sub-20 (19 Vídeos)"
      subtitle="Gravações dos jogos pré-Paulista 2026 para análise visual da comissão técnica"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Tipo:</span>
            {['all', 'Jogo-Treino', 'Copa Integração', 'Coletivo Interno'].map(tag => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  tagFilter === tag
                    ? 'bg-[#631426] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tag === 'all' ? `Todos (${INITIAL_PREPARATORY_VIDEOS.length})` : tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullPlaylist(!isFullPlaylist)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                isFullPlaylist
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {isFullPlaylist ? 'Jogo Individual' : 'Playlist Completa'}
            </button>

            <a
              href="https://www.youtube.com/playlist?list=PLsNXtgaQkGjnNCptg1B0Ou_FKFiDHI4Y_"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              title="Abrir Playlist Oficial no YouTube"
            >
              <Youtube size={15} />
            </a>
          </div>
        </div>

        {/* 16:9 Video Player */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-slate-800">
          {isFullPlaylist ? (
            <iframe
              src="https://www.youtube.com/embed/videoseries?list=PLsNXtgaQkGjnNCptg1B0Ou_FKFiDHI4Y_&rel=0"
              title="Playlist Jogos Pré-Paulista Sub-20"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : selectedVideo ? (
            <iframe
              key={selectedVideo.youtubeId}
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?rel=0`}
              title={selectedVideo.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Selecione um vídeo na lista abaixo
            </div>
          )}
        </div>

        {/* Selected Video Info */}
        {selectedVideo && !isFullPlaylist && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#631426] text-white font-bold text-[10px]">
                  {selectedVideo.tag}
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {selectedVideo.title}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {selectedVideo.notes || 'Gravação em plano aberto para observação tática.'}
              </p>
            </div>

            <a
              href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto flex-shrink-0"
            >
              <Youtube size={13} />
              <span>YouTube</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        {/* Search & Video List Carousel/Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Film size={13} className="text-[#631426]" />
              Lista de Jogos Preparatórios ({filteredVideos.length})
            </span>

            <div className="relative min-w-[200px]">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar adversário..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-slate-900 focus:bg-white focus:border-[#631426] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {filteredVideos.map(video => {
              const isSelected = selectedVideoId === video.id && !isFullPlaylist;
              return (
                <div
                  key={video.id}
                  onClick={() => {
                    setSelectedVideoId(video.id);
                    setIsFullPlaylist(false);
                  }}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#631426] text-white border-[#631426] shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 mb-1.5">
                    <img
                      src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt={video.opponent}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play size={14} className="text-white" fill="currentColor" />
                    </div>
                    <span className={`absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      isSelected ? 'bg-black/80 text-white' : 'bg-black/70 text-white'
                    }`}>
                      {video.dateStr}
                    </span>
                  </div>

                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-wider block ${
                      isSelected ? 'text-amber-300' : 'text-[#631426]'
                    }`}>
                      {video.tag}
                    </span>
                    <h5 className="font-bold text-[11px] truncate leading-tight">
                      vs {video.opponent}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>* Vídeos de uso interno da comissão técnica (sem registro de estatísticas oficiais).</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </Modal>
  );
};


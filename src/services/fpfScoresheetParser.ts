import * as fflate from 'fflate';
import { Player, Match, MatchPlayerEntry, ChampionshipType } from '../types';

export interface ParsedLineupPlayer {
  number: number;
  name: string;
  registration: string;
  isStarter: boolean;
  isSubUsed: boolean;
  isSubUnused: boolean;
  subMinuteOut?: number;
  subMinuteIn?: number;
  calculatedMinutes: number;
  goals: number;
  yellowCard: boolean;
  yellowCardReason?: string;
  redCard: boolean;
  matchedPlayerId?: string;
  matchedPlayerName?: string;
  matchedPosition?: string;
  matchedPhotoUrl?: string;
  isNewPlayer?: boolean;
}

export interface ParsedFpfScoresheet {
  matchNumber: number;
  competition: 'paulista' | 'copinha';
  competitionFullName: string;
  rodada: number;
  date: string; // YYYY-MM-DD
  dateDisplay: string; // DD/MM/YYYY
  time: string;
  stadium: string;
  mandante: string;
  visitante: string;
  opponent: string;
  location: 'Casa' | 'Fora';
  scoreJuventus: number;
  scoreOpponent: number;
  result: 'Vitória' | 'Empate' | 'Derrota';
  stoppage1T: number;
  stoppage2T: number;
  totalMatchMinutes: number;
  lineup: ParsedLineupPlayer[];
  substitutionsCount: number;
  goalsJuventusCount: number;
  yellowCardsCount: number;
  redCardsCount: number;
  rawExtractedTextSnippet: string;
}

/**
 * Extracts plain text from an official FPF PDF file by decompressing Flate streams.
 */
export function extractTextFromPdfBytes(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const streamMarker = new Uint8Array([115, 116, 114, 101, 97, 109]); // "stream"
  const endStreamMarker = new Uint8Array([101, 110, 100, 115, 116, 114, 101, 97, 109]); // "endstream"

  let pos = 0;
  let fullText = '';

  const indexOfMarker = (arr: Uint8Array, marker: Uint8Array, fromIndex: number): number => {
    const len = arr.length;
    const mLen = marker.length;
    for (let i = fromIndex; i <= len - mLen; i++) {
      let found = true;
      for (let j = 0; j < mLen; j++) {
        if (arr[i + j] !== marker[j]) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
    return -1;
  };

  while (pos < bytes.length) {
    const sStart = indexOfMarker(bytes, streamMarker, pos);
    if (sStart === -1) break;

    let contentStart = sStart + 6;
    if (bytes[contentStart] === 13) contentStart++; // CR
    if (bytes[contentStart] === 10) contentStart++; // LF

    const sEnd = indexOfMarker(bytes, endStreamMarker, contentStart);
    if (sEnd === -1) break;

    const streamData = bytes.subarray(contentStart, sEnd);

    // Try unzlib first (zlib header), then raw inflate
    let decomp: Uint8Array | null = null;
    try {
      decomp = fflate.unzlibSync(streamData);
    } catch (e1) {
      try {
        decomp = fflate.inflateSync(streamData);
      } catch (e2) {
        decomp = null;
      }
    }

    if (decomp) {
      const dec = new TextDecoder('latin1');
      const str = dec.decode(decomp);

      // Extract text in parentheses (string) Tj or [(string)] TJ
      const matches = str.match(/\((.*?)\)/g);
      if (matches) {
        fullText += matches.map(m => {
          let s = m.slice(1, -1);
          // decode escaped parens
          s = s.replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
          return s;
        }).join(' ') + ' ';
      }
    }

    pos = sEnd + 9;
  }

  // If no streams decoded (or plain text PDF), fallback to Latin-1 string decode
  if (fullText.trim().length === 0) {
    const dec = new TextDecoder('latin1');
    const plain = dec.decode(bytes);
    const matches = plain.match(/\((.*?)\)/g);
    if (matches) {
      fullText = matches.map(m => m.slice(1, -1)).join(' ');
    } else {
      fullText = plain;
    }
  }

  return fullText;
}

/**
 * Parses the raw extracted text of an official FPF scoresheet and computes all match details,
 * lineups, substitutions and player minutes automatically.
 */
export function parseFpfScoresheet(text: string, existingPlayers: Player[]): ParsedFpfScoresheet {
  // 1. Basic Metadata
  const m_jogo = text.match(/Jogo:\s*(\d+)/);
  const matchNumber = m_jogo ? parseInt(m_jogo[1], 10) : 1;

  const m_comp = text.match(/Campeonato:\s*([^\d\n\r/]+)/);
  const competitionFullName = m_comp ? m_comp[1].trim() : 'Campeonato Paulista - Sub 20';
  const isCopinha = competitionFullName.toLowerCase().includes('copa são paulo') || competitionFullName.toLowerCase().includes('copinha');
  const competition: 'paulista' | 'copinha' = isCopinha ? 'copinha' : 'paulista';

  const m_rodada = text.match(/Rodada:\s*(\d+)/);
  const rodada = m_rodada ? parseInt(m_rodada[1], 10) : 1;

  // Teams: Rodada: XX ... Jogo: TimeA X TimeB Data:
  const m_times = text.match(/Rodada:\s*\d+\s+Jogo:\s*([^X]+?)\s+X\s+([^\n\r]+?)\s+Data:/i) ||
                  text.match(/Rodada:\s*\d+[^J]*Jogo:\s*([^X]+?)\s+X\s+([^\n\r]+?)\s+Data:/i) ||
                  text.match(/Jogo:\s*([^X]+?)\s+X\s+([^\n\r]+?)\s+Data:/i);
  let mandante = 'Juventus';
  let visitante = 'Adversário';

  if (m_times) {
    mandante = m_times[1].trim();
    visitante = m_times[2].trim();
  }

  // Determine whether Juventus is Mandante (Casa) or Visitante (Fora)
  const isJuventusMandante = mandante.toLowerCase().includes('juventus');
  const location: 'Casa' | 'Fora' = isJuventusMandante ? 'Casa' : 'Fora';
  const opponent = isJuventusMandante ? visitante : mandante;

  // Date and Time
  const m_data = text.match(/Data:\s*(\d{2}\/\d{2}\/\d{4})/);
  const dateDisplay = m_data ? m_data[1] : '13/01/2026';
  // convert DD/MM/YYYY to YYYY-MM-DD
  const [d, m, y] = dateDisplay.split('/');
  const date = `${y}-${m}-${d}`;

  const m_hora = text.match(/Horário:\s*(\d{2}:\d{2})/);
  const time = m_hora ? m_hora[1] : '15:00';

  const m_estadio = text.match(/Estádio:\s*([^/]+?)\s*\//);
  const stadium = m_estadio ? m_estadio[1].trim() : (isJuventusMandante ? 'Estádio Conde Rodolfo Crespi (Rua Javari)' : 'Estádio Visitante');

  // Stoppage time & duration
  const m_acresc1T = text.match(/T[ée]rmino 1[ºo] Tempo:[^A]+Acr[ée]sc(?:imo)?:?\s*(\d+)\s*min/i);
  const m_acresc2T = text.match(/T[ée]rmino 2[ºo] Tempo:[^A]+Acr[ée]sc(?:imo)?:?\s*(\d+)\s*min/i);
  const stoppage1T = m_acresc1T ? parseInt(m_acresc1T[1], 10) : 3;
  const stoppage2T = m_acresc2T ? parseInt(m_acresc2T[1], 10) : 6;
  const totalMatchMinutes = 90 + stoppage2T;

  // Official Score
  const m_placar = text.match(/Resultado (?:Final|do 2[ºo] Tempo):\s*(\d+)\s*X\s*(\d+)/i) ||
                   text.match(/Resultado Final:\s*(\d+)\s*X\s*(\d+)/i);
  const p1 = m_placar ? parseInt(m_placar[1], 10) : 0;
  const p2 = m_placar ? parseInt(m_placar[2], 10) : 0;

  const scoreJuventus = isJuventusMandante ? p1 : p2;
  const scoreOpponent = isJuventusMandante ? p2 : p1;
  const result: 'Vitória' | 'Empate' | 'Derrota' = 
    scoreJuventus > scoreOpponent ? 'Vitória' : 
    scoreJuventus < scoreOpponent ? 'Derrota' : 'Empate';

  // 2. Lineup Extraction from "Relação de Jogadores"
  const p_section = text.match(/Relação de Jogadores.*?(?=Comissão Técnica)/s);
  const rawPlayers: Array<{ number: number; name: string; isStarter: boolean; registration: string }> = [];

  if (p_section) {
    const sec = p_section[0];
    const playerRegex = /(\d{1,2})\s+([A-Za-zÀ-ÿ\s\.\-]{3,45}?)\s+([TR])\s+([PA])\s+(\d{5,7}\/\d{2})/g;
    const allParsed: Array<{ number: number; name: string; isStarter: boolean; reg: string }> = [];
    let matchP;
    while ((matchP = playerRegex.exec(sec)) !== null) {
      allParsed.push({
        number: parseInt(matchP[1], 10),
        name: matchP[2].trim(),
        isStarter: matchP[3] === 'T',
        reg: matchP[5]
      });
    }

    // In FPF tables, players are alternated by team:
    // If Juventus is Mandante -> indices 0, 2, 4, ...
    // If Juventus is Visitante -> indices 1, 3, 5, ...
    const startIdx = isJuventusMandante ? 0 : 1;
    for (let i = startIdx; i < allParsed.length; i += 2) {
      rawPlayers.push({
        number: allParsed[i].number,
        name: allParsed[i].name,
        isStarter: allParsed[i].isStarter,
        registration: allParsed[i].reg
      });
    }
  }

  // 3. Substitutions for Juventus
  // Matches: Juventus Nº Saiu ... Nº Entrou ... Tempo (ex: 55:00 ou INT)
  const subsRegex = /(?:Juventus|C\.A\.\s*Juventus|Juventus\s*SAF)\s+(\d{1,2})\s+([^\d]+?)\s+(\d{1,2})\s+([^\d]+?)\s+(?:-\s*)?(INT|\d{1,2}:\d{2})\s*(?:1T|2T)?/g;
  const parsedSubs: Array<{ subOutNumber: number; subInNumber: number; minute: number }> = [];
  let subMatch;

  while ((subMatch = subsRegex.exec(text)) !== null) {
    const outNum = parseInt(subMatch[1], 10);
    const inNum = parseInt(subMatch[3], 10);
    const timeStr = subMatch[5];
    let minute = 45;
    if (timeStr === 'INT') {
      minute = 45;
    } else {
      const parts = timeStr.split(':');
      minute = parseInt(parts[0], 10) || 45;
    }
    parsedSubs.push({ subOutNumber: outNum, subInNumber: inNum, minute });
  }

  // 4. Goals for Juventus
  // Section: Gols Equipe Nº Nome do Jogador Tipo Tempo
  const goalsSection = text.match(/Gols.*?(?=Advertências|Publicação da Súmula|Expulsões)/s);
  const juventusGoalScorers: Record<number, number> = {};

  if (goalsSection) {
    const secG = goalsSection[0];
    const goalRegex = /(?:Juventus|C\.A\.\s*Juventus|Juventus\s*SAF)\s+(\d{1,2})\s+([^0-9\n\r]+?)(?:NR|PN|CT|FT|\-)/gi;
    let gMatch;
    while ((gMatch = goalRegex.exec(secG)) !== null) {
      const gNum = parseInt(gMatch[1], 10);
      juventusGoalScorers[gNum] = (juventusGoalScorers[gNum] || 0) + 1;
    }
  }

  // 5. Advertências / Cartões Amarelos para o Juventus
  const yellowCardsSection = text.match(/Advertências.*?(?=Expulsões|Publicação da Súmula|Motivo de atraso)/s);
  const juventusYellowCards: Record<number, { minute: string; reason: string }> = {};

  if (yellowCardsSection) {
    const secY = yellowCardsSection[0];
    const cardRegex = /(?:Juventus|C\.A\.\s*Juventus|Juventus\s*SAF)\s+(\d{1,2})\s+([^\d\n]+?)\s+(\d{1,2}:\d{2})\s*(1T|2T)\s*Motivo:(.*?)(?=(?:Juventus|Nacional|[A-Z][a-z]+)\s+\d{1,2}|AJ\s*=|Expulsões|$)/gis;
    let yMatch;
    while ((yMatch = cardRegex.exec(secY)) !== null) {
      const yNum = parseInt(yMatch[1], 10);
      const yTime = `${yMatch[3]} ${yMatch[4]}`;
      const yReason = yMatch[5].trim();
      juventusYellowCards[yNum] = { minute: yTime, reason: yReason };
    }
  }

  // 6. Expulsões / Cartões Vermelhos para o Juventus
  const redCardsSection = text.match(/Expulsões.*?(?=Motivo de atraso|Ocorrências|Relatório)/s);
  const juventusRedCards = new Set<number>();

  if (redCardsSection) {
    const secR = redCardsSection[0];
    if (!secR.includes('NÃO HOUVE EXPULSÕES')) {
      const redRegex = /(?:Juventus|C\.A\.\s*Juventus|Juventus\s*SAF)\s+(\d{1,2})/gi;
      let rMatch;
      while ((rMatch = redRegex.exec(secR)) !== null) {
        juventusRedCards.add(parseInt(rMatch[1], 10));
      }
    }
  }

  // 7. Assemble Full Lineup with Automated Minute Calculations
  const lineup: ParsedLineupPlayer[] = rawPlayers.map(p => {
    // Check if subbed out
    const subOut = parsedSubs.find(s => s.subOutNumber === p.number);
    // Check if subbed in
    const subIn = parsedSubs.find(s => s.subInNumber === p.number);

    const isStarter = p.isStarter;
    const isSubUsed = Boolean(subIn);
    const isSubUnused = !isStarter && !isSubUsed;

    let calculatedMinutes = 0;
    if (isStarter) {
      if (subOut) {
        calculatedMinutes = subOut.minute;
      } else {
        calculatedMinutes = totalMatchMinutes;
      }
    } else if (isSubUsed && subIn) {
      calculatedMinutes = Math.max(0, totalMatchMinutes - subIn.minute);
    } else {
      calculatedMinutes = 0;
    }

    // Match with existing player database
    // 1. By number
    let matched = existingPlayers.find(ep => ep.number === p.number);
    // 2. By name / matchSheetName similarity
    if (!matched) {
      const cleanPName = p.name.toLowerCase();
      matched = existingPlayers.find(ep => {
        const epName = ep.name.toLowerCase();
        const epSheet = ep.matchSheetName.toLowerCase();
        return cleanPName.includes(epName) || epName.includes(cleanPName) || cleanPName.includes(epSheet);
      });
    }

    const yellowInfo = juventusYellowCards[p.number];
    const hasRed = juventusRedCards.has(p.number);
    const goalsCount = juventusGoalScorers[p.number] || 0;

    return {
      number: p.number,
      name: p.name,
      registration: p.registration,
      isStarter,
      isSubUsed,
      isSubUnused,
      subMinuteOut: subOut ? subOut.minute : undefined,
      subMinuteIn: subIn ? subIn.minute : undefined,
      calculatedMinutes,
      goals: goalsCount,
      yellowCard: Boolean(yellowInfo),
      yellowCardReason: yellowInfo ? yellowInfo.reason : undefined,
      redCard: hasRed,
      matchedPlayerId: matched?.id,
      matchedPlayerName: matched?.name,
      matchedPosition: matched?.position,
      matchedPhotoUrl: matched?.photoUrl,
      isNewPlayer: !matched
    };
  });

  return {
    matchNumber,
    competition,
    competitionFullName,
    rodada,
    date,
    dateDisplay,
    time,
    stadium,
    mandante,
    visitante,
    opponent,
    location,
    scoreJuventus,
    scoreOpponent,
    result,
    stoppage1T,
    stoppage2T,
    totalMatchMinutes,
    lineup,
    substitutionsCount: parsedSubs.length,
    goalsJuventusCount: Object.values(juventusGoalScorers).reduce((a, b) => a + b, 0),
    yellowCardsCount: Object.keys(juventusYellowCards).length,
    redCardsCount: juventusRedCards.size,
    rawExtractedTextSnippet: text.slice(0, 1000)
  };
}

/**
 * Converts a ParsedFpfScoresheet to a full Match entity ready to be stored in DataContext.
 */
export function convertParsedToMatch(
  parsed: ParsedFpfScoresheet,
  existingPlayers: Player[],
  existingMatchId?: string,
  pdfUrl?: string
): { match: Match; newPlayersToAdd: Player[] } {
  const newPlayersToAdd: Player[] = [];

  const matchLineup: MatchPlayerEntry[] = parsed.lineup.map(p => {
    let playerId = p.matchedPlayerId;
    if (!playerId) {
      playerId = `player_num_${p.number}_${Date.now()}`;
      const newPlayer: Player = {
        id: playerId,
        number: p.number,
        name: p.name,
        matchSheetName: p.name,
        position: 'Atacante',
        status: 'DISPONÍVEL',
        birthYear: 2006,
        trainingRating: 7.0,
        matchRating: 7.0,
        trainingAttendancePct: 100,
        trainingMinutes: 0,
        statsByChampionship: {
          paulista: {
            totalMatches: 0,
            starterCount: 0,
            subUsedCount: 0,
            subUnusedCount: 0,
            totalMinutes: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            suspensionsServed: 0,
          },
          copinha: {
            totalMatches: 0,
            starterCount: 0,
            subUsedCount: 0,
            subUnusedCount: 0,
            totalMinutes: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            suspensionsServed: 0,
          }
        },
        matchLogs: []
      };
      newPlayersToAdd.push(newPlayer);
    }

    return {
      playerId,
      isStarter: p.isStarter,
      isSubUsed: p.isSubUsed,
      isSubUnused: p.isSubUnused,
      minutes: p.calculatedMinutes,
      goals: p.goals,
      assists: 0,
      yellowCard: p.yellowCard,
      redCard: p.redCard,
      rating: 7.0,
      subMinuteIn: p.subMinuteIn,
      subMinuteOut: p.subMinuteOut
    };
  });

  const match: Match = {
    id: existingMatchId || `match_${parsed.competition}_${parsed.matchNumber}_${Date.now()}`,
    matchNumber: parsed.matchNumber,
    date: parsed.date,
    time: parsed.time,
    opponent: parsed.opponent,
    competition: parsed.competition,
    location: parsed.location,
    stadium: parsed.stadium,
    scoreJuventus: parsed.scoreJuventus,
    scoreOpponent: parsed.scoreOpponent,
    result: parsed.result,
    goalsConcededDetails: [],
    pdfOfficialScoresheetUrl: pdfUrl,
    lineup: matchLineup,
    summaryObservations: `Súmula oficial FPF processada automaticamente. Duração total: ${parsed.totalMatchMinutes} min (${parsed.stoppage1T}' 1T, ${parsed.stoppage2T}' 2T). Substituições Juventus: ${parsed.substitutionsCount}.`
  };

  return { match, newPlayersToAdd };
}


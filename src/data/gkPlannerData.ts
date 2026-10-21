import { 
  GkTrainingSession, 
  GkAthleteInteraction, 
  GkMatchScout, 
  GkTacticalBoardItem 
} from '../types';

export const INITIAL_GK_TRAINING_SESSIONS: GkTrainingSession[] = [
  {
    id: 'gk_sess_61',
    code: 'UT61',
    title: 'Agilidade Cognitiva e Defesa de Meta',
    date: '31 de ago. de 2026',
    rawDate: '2026-08-31',
    durationMinutes: 30,
    category: 'Sub-20',
    intensity: 'Baixa',
    mainObjective: 'Técnico',
    objectivesRatio: {
      tecnico: 40,
      fisico: 25,
      tatico: 20,
      comportamental: 15
    },
    coachNotes: 'Foco na velocidade de tomada de decisão com estímulos sonoros e visuais. Ênfase no encaixe seguro e queda com braço estendido.',
    involvedGkIds: ['p1', 'p2', 'p3', 'p_khendran', 'p_kaue'],
    exercises: [
      {
        id: 'ex_61_1',
        name: 'Ativação Cognitiva & Visão Periférica',
        type: 'Aquecimento',
        durationMinutes: 8,
        description: 'Deslocamentos na área da baliza reagindo a cores de cones sinalizadas pelo preparador com queda rasteira controlada.',
        focus: 'Tempo de reação e ativação vestibular',
        coachingPoints: ['Manter centro de gravidade baixo', 'Olhar fixo no ponto de origem da bola']
      },
      {
        id: 'ex_61_2',
        name: 'Defesa de Baliza em Duplo Tempo',
        type: 'Parte Principal',
        durationMinutes: 14,
        description: 'Finalização frontal com desvio imediato em obstáculo (kicker) exigindo recuperação dinâmica para segunda intervenção.',
        focus: 'Velocidade de recuperação corporal e amplitude de braço',
        coachingPoints: ['Mão de sustentação firme', 'Não cruzar as pernas no deslocamento lateral']
      },
      {
        id: 'ex_61_3',
        name: 'Situação Real 1x1 com Pressão de Tempo',
        type: 'Situação Real',
        durationMinutes: 8,
        description: 'Entrada de atacante pelo bico da área; goleiro define momento de espera vs ataque agressivo à bola.',
        focus: 'Cálculo de distância e bloqueio em cruz (técnica de barreira)',
        coachingPoints: ['Fechamento do primeiro pau', 'Manter os braços abertos até o impacto']
      }
    ]
  },
  {
    id: 'gk_sess_60',
    code: 'UT60',
    title: 'Aquecimento de Jogo',
    date: '29 de ago. de 2026',
    rawDate: '2026-08-29',
    durationMinutes: 20,
    category: 'Sub-20',
    intensity: 'Baixa',
    mainObjective: 'Físico',
    objectivesRatio: {
      tecnico: 30,
      fisico: 40,
      tatico: 15,
      comportamental: 15
    },
    coachNotes: 'Protocolo de ativação pré-partida. Ganho de temperatura muscular, sensibilidade de contato com bola e pegadas altas sem sobrecarga.',
    involvedGkIds: ['p1', 'p2'],
    exercises: [
      {
        id: 'ex_60_1',
        name: 'Protocolo de Mobilidade e Pegada Progressiva',
        type: 'Aquecimento',
        durationMinutes: 7,
        description: 'Mobilidade de ombros e quadril, passes curtos de chapa e pegada frontal bola rasteira e média.',
        focus: 'Ativação muscular e sensibilidade na luva',
        coachingPoints: ['Empunhadura em W', 'Amortecer impacto junto ao peito']
      },
      {
        id: 'ex_60_2',
        name: 'Bolas Aéreas e Reposição em Profundidade',
        type: 'Parte Principal',
        durationMinutes: 8,
        description: 'Cruzamentos frontais e diagonais com saída e chamada de comando verbal em alto tom, seguidos de reposição com mão (arco).',
        focus: 'Tempo de bola e comando de área',
        coachingPoints: ['Comando "MINHA" convicto', 'Ataque à bola no ponto mais alto']
      },
      {
        id: 'ex_60_3',
        name: 'Chutes de Média Distância da Linha da Grande Área',
        type: 'Finalização',
        durationMinutes: 5,
        description: 'Chutes controlados com trajetórias variadas para fixar confiança do titular.',
        focus: 'Sentimento de confiança e leitura da trajetória',
        coachingPoints: ['Encaixar ou espalmar para as laterais']
      }
    ]
  },
  {
    id: 'gk_sess_59',
    code: 'UT 59',
    title: 'Defesa de Meta e Manutenção da Posse de Bola',
    date: '28 de ago. de 2026',
    rawDate: '2026-08-28',
    durationMinutes: 15,
    category: 'Sub-20',
    intensity: 'Baixa',
    mainObjective: 'Técnico',
    objectivesRatio: {
      tecnico: 45,
      fisico: 20,
      tatico: 25,
      comportamental: 10
    },
    coachNotes: 'Sessão de velocidade de reação pós-deslocamento curto com trabalho integrado de passe quebrando linhas de pressão.',
    involvedGkIds: ['p1', 'p2', 'p3'],
    exercises: [
      {
        id: 'ex_59_1',
        name: 'Passes de Primeira e Abertura em Apoio',
        type: 'Aquecimento',
        durationMinutes: 6,
        description: 'Goleiro atua como pivô de circulação defensiva sob marcação passiva, transferindo jogo de lado.',
        focus: 'Domínio orientado e passe com ambos os pés',
        coachingPoints: ['Pé de apoio firme', 'Corpo alinhado para o passe de saída']
      },
      {
        id: 'ex_59_2',
        name: 'Queda Rápida e Transição Imediata para o Pé',
        type: 'Parte Principal',
        durationMinutes: 9,
        description: 'Defesa de chute colocado rente à trave seguida de levantada veloz e passe em mini-gol posicionado a 25 metros.',
        focus: 'Levantada imediata e transição ataque-defesa',
        coachingPoints: ['Uso da perna externa de alavanca para erguer o tronco']
      }
    ]
  },
  {
    id: 'gk_sess_58',
    code: 'UT58',
    title: 'Manutenção da Posse e Defesa de Meta (Reação)',
    date: '20 de ago. de 2026',
    rawDate: '2026-08-20',
    durationMinutes: 20,
    category: 'Sub-20',
    intensity: 'Baixa',
    mainObjective: 'Tático',
    objectivesRatio: {
      tecnico: 35,
      fisico: 20,
      tatico: 30,
      comportamental: 15
    },
    coachNotes: 'Circulação da posse com zagueiros e tomada de decisão sobre bola longa vs quebra de pressão.',
    involvedGkIds: ['p1', 'p2', 'p_khendran'],
    exercises: [
      {
        id: 'ex_58_1',
        name: 'Simulação de Pressionamento Alto 3x1+GK',
        type: 'Parte Principal',
        durationMinutes: 12,
        description: 'Zaga do Juventus sob pressão alta adversária; goleiro como terceiro zagueiro ofertando opção de passe atrás.',
        focus: 'Linha de passe diagonal e tranquilidade sob pressão',
        coachingPoints: ['Não ficar estático sobre a linha de gol']
      },
      {
        id: 'ex_58_2',
        name: 'Defesa de Meta em Rebote de Bola Parada',
        type: 'Finalização',
        durationMinutes: 8,
        description: 'Finalizações vindas da segunda bola após corte defensivo de escanteio.',
        focus: 'Ajuste de posicionamento na entrada da área',
        coachingPoints: ['Recuo coordenado sem virar as costas para a bola']
      }
    ]
  },
  {
    id: 'gk_sess_57',
    code: 'UT57',
    title: 'Proteção do Espaço Aéreo e Enfrentamentos 2xGK',
    date: '19 de ago. de 2026',
    rawDate: '2026-08-19',
    durationMinutes: 30,
    category: 'Sub-20',
    intensity: 'Baixa',
    mainObjective: 'Tático',
    objectivesRatio: {
      tecnico: 30,
      fisico: 25,
      tatico: 30,
      comportamental: 15
    },
    coachNotes: 'Leitura de trajetórias aéreas com oposição física de bonecos e jogadores simulando bloqueio da área de meta.',
    involvedGkIds: ['p1', 'p2', 'p3', 'p_kaue'],
    exercises: [
      {
        id: 'ex_57_1',
        name: 'Impulsão Unilateral com Oposição de Boneco',
        type: 'Aquecimento',
        durationMinutes: 10,
        description: 'Salto em joelho alto protegido sobre obstáculo para interceptar cruzamento vindo da linha de fundo.',
        focus: 'Proteção corporal (joelho de proteção) e ponto mais alto',
        coachingPoints: ['Elevação do joelho proximal ao adversário para autoproteção']
      },
      {
        id: 'ex_57_2',
        name: 'Enfrentamento 2xGK em Bola Aberta',
        type: 'Parte Principal',
        durationMinutes: 20,
        description: 'Cruzamento com dois atacantes atacando primeiro e segundo paus; goleiro decide se sai na interceptação ou fica para defesa de reação.',
        focus: 'Tomada de decisão em frações de segundo',
        coachingPoints: ['Se sair, tem que encostar na bola; se hesitar, permaneça na baliza']
      }
    ]
  },
  {
    id: 'gk_sess_28',
    code: 'UT 28',
    title: 'Coordenação Motora Fina e Defesa Meta',
    date: '07 de jul. de 2026',
    rawDate: '2026-07-07',
    durationMinutes: 35,
    category: 'Sub-20',
    intensity: 'Moderada',
    mainObjective: 'Técnico',
    objectivesRatio: {
      tecnico: 50,
      fisico: 25,
      tatico: 15,
      comportamental: 10
    },
    coachNotes: 'Treino focado em coordenação inter e intramuscular para respostas rápidas de reflexo em curta distância.',
    involvedGkIds: ['p1', 'p2', 'p3'],
    exercises: [
      {
        id: 'ex_28_1',
        name: 'Circuito de Escada de Agilidade + Queda Lateral',
        type: 'Aquecimento',
        durationMinutes: 12,
        description: 'Passadas coordenadas em escada de solo seguidas de queda lateral rente à trave sem bater cotovelo.',
        focus: 'Dissociação de membros e biomecânica de queda',
        coachingPoints: ['Queda no quadril e dorsal, nunca no cotovelo']
      },
      {
        id: 'ex_28_2',
        name: 'Reflexos à Queima-Roupa com Bolas Menores',
        type: 'Parte Principal',
        durationMinutes: 23,
        description: 'Disparos a 5 metros de distância utilizando bolas de futsal e tênis para estímulo neuromuscular avançado.',
        focus: 'Velocidade de disparo das mãos',
        coachingPoints: ['Manter as palmas das mãos voltadas para frente']
      }
    ]
  }
];

export const INITIAL_GK_INTERACTIONS: GkAthleteInteraction[] = [
  {
    id: 'inter_1',
    athleteId: 'p1',
    athleteName: 'Eduardo Salvador',
    action: 'viewed',
    sessionCode: 'UT61',
    sessionTitle: 'Agilidade Cognitiva e Defesa de Meta',
    timestamp: '08/09/2026, 09:42'
  },
  {
    id: 'inter_2',
    athleteId: 'p1',
    athleteName: 'Eduardo Salvador',
    action: 'downloaded_pdf',
    sessionCode: 'UT61',
    sessionTitle: 'Agilidade Cognitiva e Defesa de Meta',
    timestamp: '30/08/2026, 22:38'
  },
  {
    id: 'inter_3',
    athleteId: 'p3',
    athleteName: 'Pedro Neres',
    action: 'viewed',
    sessionCode: 'UT61',
    sessionTitle: 'Agilidade Cognitiva e Defesa de Meta',
    timestamp: '30/08/2026, 22:29'
  },
  {
    id: 'inter_4',
    athleteId: 'p2',
    athleteName: 'Arthur Rodrigues',
    action: 'viewed',
    sessionCode: 'UT61',
    sessionTitle: 'Agilidade Cognitiva e Defesa de Meta',
    timestamp: '30/08/2026, 22:19'
  },
  {
    id: 'inter_5',
    athleteId: 'p3',
    athleteName: 'Pedro Neres',
    action: 'downloaded_pdf',
    sessionCode: 'UT 28',
    sessionTitle: 'Coordenação Motora Fina e Defesa Meta',
    timestamp: '07/07/2026, 00:13'
  },
  {
    id: 'inter_6',
    athleteId: 'p_khendran',
    athleteName: 'Khendran Santos',
    action: 'viewed',
    sessionCode: 'UT60',
    sessionTitle: 'Aquecimento de Jogo',
    timestamp: '29/08/2026, 14:15'
  },
  {
    id: 'inter_7',
    athleteId: 'p_kaue',
    athleteName: 'Kauê Cardamoni',
    action: 'viewed',
    sessionCode: 'UT57',
    sessionTitle: 'Proteção do Espaço Aéreo e Enfrentamentos 2xGK',
    timestamp: '19/08/2026, 18:20'
  }
];

export const INITIAL_GK_MATCH_SCOUTS: GkMatchScout[] = [
  {
    id: 'scout_1',
    athleteId: 'p2',
    athleteName: 'Arthur Rodrigues',
    competition: 'PAULISTA SUB20 Série A',
    phaseOrRound: 'Oitavas Jogo 2',
    matchDateStr: '17 de out. de 2026',
    intensity: 'Jogo intenso',
    cleanSheet: false,
    savesCount: 5,
    rating: 8.2,
    concededGoalsCount: 1,
    notes: 'Excelente atuação sob alta exigência. Fez duas intervenções decisivas em 1x1 e uma defesa em dois tempos após desvio na zaga.'
  },
  {
    id: 'scout_2',
    athleteId: 'p2',
    athleteName: 'Arthur Rodrigues',
    competition: 'PAULISTA SUB 20 série A',
    phaseOrRound: 'Fase de Grupos - Rodada 9',
    matchDateStr: '29 de set. de 2026',
    intensity: 'Jogo moderado',
    cleanSheet: true,
    savesCount: 4,
    rating: 8.0,
    concededGoalsCount: 0,
    notes: 'Segurança absoluta nas bolas aéreas e clean sheet consolidado. Excelente saída de bola com os pés em reposição média.'
  },
  {
    id: 'scout_3',
    athleteId: 'p2',
    athleteName: 'Arthur Rodrigues',
    competition: 'Paulista SUB 20 Série A',
    phaseOrRound: 'Fase de Grupos - Rodada 8',
    matchDateStr: '23 de set. de 2026',
    intensity: 'Jogo regular',
    cleanSheet: true,
    savesCount: 3,
    rating: 7.8,
    concededGoalsCount: 0,
    notes: 'Pouco exigido, mas muito focado. Excelente comunicação com a zaga orientando coberturas laterais.'
  },
  {
    id: 'scout_4',
    athleteId: 'p_khendran',
    athleteName: 'Khendran Santos',
    competition: 'COPINHA SICREDI 2026',
    phaseOrRound: '2ª Fase Eliminatória',
    matchDateStr: '12 de jan. de 2026',
    intensity: 'Jogo intenso',
    cleanSheet: true,
    savesCount: 6,
    rating: 8.5,
    concededGoalsCount: 0,
    notes: 'Partida histórica na Copinha contra o Retrô FC (0x0). Defesa milagrosa aos 41 do 2T no canto inferior esquerdo.'
  },
  {
    id: 'scout_5',
    athleteId: 'p_khendran',
    athleteName: 'Khendran Santos',
    competition: 'COPINHA SICREDI 2026',
    phaseOrRound: 'Fase de Grupos - Rodada 3',
    matchDateStr: '09 de jan. de 2026',
    intensity: 'Jogo moderado',
    cleanSheet: true,
    savesCount: 4,
    rating: 8.4,
    concededGoalsCount: 0,
    notes: 'Vitória por 1x0 contra o São Bento garantindo classificação em 1º do grupo. Domínio da grande área em cruzamentos.'
  }
];

export const INITIAL_GK_TACTICAL_BOARDS: GkTacticalBoardItem[] = [
  {
    id: 'board_1',
    title: 'Exercício 1x1: Fechamento de Ângulo e Bloco Baixo',
    category: 'Sub-20',
    dateStr: '14 de out. de 2026',
    pitchType: 'goal_box',
    elementsCount: 7,
    notes: 'Simulação de aproximação lateral com boneco obstáculo e finalizador móvel.'
  },
  {
    id: 'board_2',
    title: 'Bolas Aéreas: Cobertura de Primeiro Pau e Cruzamento Fechado',
    category: 'Sub-20',
    dateStr: '10 de out. de 2026',
    pitchType: 'half_pitch',
    elementsCount: 9,
    notes: 'Posicionamento em relação à linha de fundo e cálculo de interceptação da trajetória da bola.'
  },
  {
    id: 'board_3',
    title: 'Construção Ofensiva: Saída de 3 com Goleiro Aberto',
    category: 'Sub-20',
    dateStr: '05 de out. de 2026',
    pitchType: 'half_pitch',
    elementsCount: 8,
    notes: 'Goleiro atua como ponta de lança recuado para quebra de bloco de marcação alta.'
  }
];

// 7-day training load seed matching GK Planner week distribution
export const INITIAL_GK_WEEKLY_LOAD = [
  { day: 'seg.', date: '13/10', minutes: 75, intensity: 'Moderada' as const },
  { day: 'ter.', date: '14/10', minutes: 90, intensity: 'Alta' as const },
  { day: 'qua.', date: '15/10', minutes: 60, intensity: 'Moderada' as const },
  { day: 'qui.', date: '16/10', minutes: 45, intensity: 'Baixa' as const },
  { day: 'sex.', date: '17/10', minutes: 0, intensity: 'Baixa' as const }, // Jogo oficial
  { day: 'sáb.', date: '18/10', minutes: 30, intensity: 'Baixa' as const },
  { day: 'dom.', date: '19/10', minutes: 0, intensity: 'Baixa' as const } // Descanso
];


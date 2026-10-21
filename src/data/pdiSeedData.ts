import { PdiCycle, PdiGoal, PdiReviewMeeting } from '../types';

export const INITIAL_PDI_CYCLES: PdiCycle[] = [
  {
    id: 'cycle_2026_2',
    name: 'Ciclo 2026.2 • Preparação FPF Paulista & Copa São Paulo 2027',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    status: 'Ativo',
    description: 'Ciclo focado em transições rápidas, maturidade tática em bloco médio e consolidação física pré-Copinha.'
  },
  {
    id: 'cycle_2026_1',
    name: 'Ciclo 2026.1 • 1ª e 2ª Fases do Campeonato Paulista Sub-20',
    startDate: '2026-01-10',
    endDate: '2026-06-30',
    status: 'Concluído',
    description: 'Ciclo inicial focado no modelo de jogo posicional, organização ofensiva 3+2 e saída de bola sustentada.'
  }
];

export const INITIAL_PDI_GOALS: PdiGoal[] = [
  // Arthur Costa (#10 - Meia)
  {
    id: 'pdi_g1',
    athleteId: 'p9', // Arthur Costa
    athleteName: 'Arthur Costa',
    cycleId: 'cycle_2026_2',
    corner: 'Técnico / Tático',
    title: 'Aumentar Passes Verticais Progressivos no Último Terço',
    description: 'Buscar quebrar a primeira linha defensiva adversária com passe orientado entre as linhas em no máximo 2 toques.',
    targetMetric: 'Média de 6 passes progressivos verticais por partida com >75% de acerto',
    currentStatus: 'Em Progresso',
    targetDate: '2026-11-15',
    trainingAction: 'Prática deliberada em rondos posicionais 4x4 + 3 coringas e sessões de vídeo análise individual pós-jogo.',
    videoEvidenceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoEvidenceTimestamp: '03:45',
    videoEvidenceNotes: 'Passe de ruptura entrelinhas no jogo contra Mauaense que gerou finalização perigosa.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-10-15'
  },
  {
    id: 'pdi_g2',
    athleteId: 'p9',
    athleteName: 'Arthur Costa',
    cycleId: 'cycle_2026_2',
    corner: 'Físico',
    title: 'Ganho de Potência de Membros Inferiores & Salto CMJ',
    description: 'Aumentar a taxa de desenvolvimento de força (RFD) para suportar contatos físicos em duelos corpo a corpo no meio-campo.',
    targetMetric: 'Atingir salto CMJ > 46.0 cm e potência relativa > 54 W/kg',
    currentStatus: 'Em Progresso',
    targetDate: '2026-11-30',
    trainingAction: 'Sobrecarga excêntrica na Trap Bar (80-85% 1RM) e pliometria em caixa na sessão MD-4.',
    videoEvidenceNotes: 'Evolução registrada na plataforma de salto: de 42.5cm para 44.8cm nos últimos 60 dias.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-10-10'
  },
  {
    id: 'pdi_g3',
    athleteId: 'p9',
    athleteName: 'Arthur Costa',
    cycleId: 'cycle_2026_2',
    corner: 'Psicológico',
    title: 'Comportamento Resiliente e Tomada de Decisão sob Pressão',
    description: 'Manter a tranquilidade e clareza mental quando marcado de perto por volantes agressivos, evitando cartões por reclamação.',
    targetMetric: '0 cartões por indisciplina no 2º turno e tempo de recuperação emocional < 5 segundos pós-erro',
    currentStatus: 'Atingido',
    targetDate: '2026-10-01',
    trainingAction: 'Treino de respiração diafragmática no pré-jogo e visualização mental com a psicóloga esportiva.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-10-05'
  },
  {
    id: 'pdi_g4',
    athleteId: 'p9',
    athleteName: 'Arthur Costa',
    cycleId: 'cycle_2026_2',
    corner: 'Social',
    title: 'Comunicação e Liderança Vocálica Coletiva',
    description: 'Orientar o balanço da linha de meio-campo e apoiar os companheiros mais jovens recém-promovidos do Sub-17.',
    targetMetric: 'Presença ativa nas rodas de pré-jogo e orientação constante no aquecimento',
    currentStatus: 'Em Progresso',
    targetDate: '2026-12-15',
    trainingAction: 'Designado como 2º capitão do elenco pela comissão técnica para exercer liderança compartilhada.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-09-20'
  },

  // Gabriel Souza (#9 - Centroavante)
  {
    id: 'pdi_g5',
    athleteId: 'p11', // Gabriel Souza
    athleteName: 'Gabriel Souza',
    cycleId: 'cycle_2026_2',
    corner: 'Técnico / Tático',
    title: 'Ataque ao Espaço na Primeira Trave e Finalização a 1 Toque',
    description: 'Melhorar o timing do desmarque em cruzamentos laterais, antecipando o zagueiro central no primeiro pau.',
    targetMetric: 'Pelo menos 3 finalizações a 1 toque dentro da grande área por 90 minutos',
    currentStatus: 'Em Progresso',
    targetDate: '2026-11-20',
    trainingAction: 'Repetição diária de 20 minutos de finalizações pós-cruzamento com o auxiliar técnico no fim do treino.',
    videoEvidenceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoEvidenceTimestamp: '06:12',
    videoEvidenceNotes: 'Gol marcado contra Água Santa em antecipação de cruzamento do lateral direito.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-08-10',
    updatedAt: '2026-10-18'
  },
  {
    id: 'pdi_g6',
    athleteId: 'p11',
    athleteName: 'Gabriel Souza',
    cycleId: 'cycle_2026_2',
    corner: 'Físico',
    title: 'Aceleração Inicial nos Primeiros 10 Metros (Fotocélula)',
    description: 'Abaixar o tempo de largada nos primeiros 10m para vencer a linha defensiva em bolas enfiadas.',
    targetMetric: 'Tempo de 10m < 1.70 segundos na fotocélula (atualmente 1.76s)',
    currentStatus: 'Em Progresso',
    targetDate: '2026-11-30',
    trainingAction: 'Treino de tração com elástico e sprints curtos resistidos no MD-2.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-08-10',
    updatedAt: '2026-10-12'
  },

  // Gustavo Reis (#1 - Goleiro)
  {
    id: 'pdi_g7',
    athleteId: 'p1', // Gustavo Reis
    athleteName: 'Gustavo Reis',
    cycleId: 'cycle_2026_2',
    corner: 'Técnico / Tático',
    title: 'Jogo com os Pés como Apoio na Saída 3+1 (Líbero)',
    description: 'Melhorar a precisão e velocidade do passe de chapa sob pressão com perna não dominante (canhota).',
    targetMetric: '>85% de passes certos em saída curta e retenção de posse',
    currentStatus: 'Atingido',
    targetDate: '2026-10-01',
    trainingAction: 'Participação ativa nos primeiros 20 minutos dos rondos técnicos do elenco principal.',
    videoEvidenceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoEvidenceTimestamp: '01:25',
    videoEvidenceNotes: 'Excelente inversão de jogo com pé esquerdo sob pressão alta contra o Corinthians.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-07-15',
    updatedAt: '2026-10-02'
  },
  {
    id: 'pdi_g8',
    athleteId: 'p1',
    athleteName: 'Gustavo Reis',
    cycleId: 'cycle_2026_2',
    corner: 'Físico',
    title: 'Tempo de Reação e Impulsão Horizontal Lateral',
    description: 'Aprimorar a explosão para bolas rasteiras nas bochechas da trave (Zonas 1 e 3 da Trave 3x3).',
    targetMetric: 'Redução do tempo de queda lateral em 0.15s com uso de fotocélulas reativas',
    currentStatus: 'Em Progresso',
    targetDate: '2026-11-15',
    trainingAction: 'Circuito com mini-band e bolas com desvio de trajetória com o preparador de goleiros.',
    coAuthoredWithAthlete: true,
    createdAt: '2026-08-01',
    updatedAt: '2026-10-14'
  }
];

export const INITIAL_PDI_REVIEWS: PdiReviewMeeting[] = [
  {
    id: 'rev_1',
    athleteId: 'p9', // Arthur Costa
    athleteName: 'Arthur Costa',
    cycleId: 'cycle_2026_2',
    date: '2026-10-05',
    participants: ['Treinador Principal', 'Preparador Físico', 'Atleta', 'Pai / Responsável Legal'],
    fourCornerAssessment: {
      technicalTacticalScore: 8.5,
      physicalScore: 7.5,
      psychologicalScore: 8.0,
      socialScore: 8.5,
      technicalNotes: 'Grande evolução na velocidade de circulação. Está quebrando linhas com passes verticais e acelerando o ataque.',
      physicalNotes: 'Saltos aumentaram 2.3 cm no CMJ. Manter o trabalho de ganho de força excêntrica no posterior de coxa.',
      psychologicalNotes: 'Muito mais maduro e calmo em campo. Não tomou nenhum cartão nos últimos 5 jogos.',
      socialNotes: 'Exemplo de dedicação e liderança positiva para os companheiros mais novos do Sub-17.'
    },
    coachSummary: 'Arthur atingiu plenamente a meta de controle emocional e está perto de bater a meta de passes progressivos verticais. Excelente comprometimento.',
    athleteSelfReflection: 'Sinto que o trabalho de respiração antes dos jogos e a análise dos meus lances com o vídeo me ajudaram muito a enxergar melhor os companheiros antes de dominar a bola.',
    nextReviewDate: '2026-11-20',
    goalsReviewedCount: 4,
    goalsMetCount: 2,
    cycleProgressScore: 0.50
  },
  {
    id: 'rev_2',
    athleteId: 'p1', // Gustavo Reis
    athleteName: 'Gustavo Reis',
    cycleId: 'cycle_2026_2',
    date: '2026-10-02',
    participants: ['Preparador de Goleiros', 'Treinador', 'Atleta'],
    fourCornerAssessment: {
      technicalTacticalScore: 9.0,
      physicalScore: 8.0,
      psychologicalScore: 8.5,
      socialScore: 9.0,
      technicalNotes: 'A meta de saída com os pés foi concluída com louvor. Passou a ser um organizador seguro na saída baixa.',
      physicalNotes: 'Boa reatividade e posicionamento. Manter o foco no trabalho de força de membros superiores.',
      psychologicalNotes: 'Segurança e voz ativa transmitidas para a zaga.',
      socialNotes: 'Pontualidade 100% e liderança de vestiário exemplar.'
    },
    coachSummary: 'Meta de saída com os pés concluída. Abrimos novo foco no tempo de reação para finalizações no chão.',
    athleteSelfReflection: 'Me sinto muito mais confiante participando dos rondos com o grupo de linha. Não sinto mais medo da pressão adversária.',
    nextReviewDate: '2026-11-15',
    goalsReviewedCount: 2,
    goalsMetCount: 1,
    cycleProgressScore: 0.50
  }
];


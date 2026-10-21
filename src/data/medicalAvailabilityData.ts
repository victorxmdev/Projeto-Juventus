import { 
  MedicalDepartmentEntry, 
  SeparateTrainingEntry, 
  ExternalAssignmentEntry, 
  PositionalSquadSlot, 
  SquadPlayerRecord36 
} from '../types';

export const MEDICAL_AVAILABILITY_METADATA = {
  lastUpdated: '18/08/2026',
  sourceDocument: 'Planilha Oficial de Controle do Elenco Sub-20',
  totalSquad: 36,
  availableAthletesStr: '23+3gk',
  availableTotal: 26,
  inMedicalDepartment: 7,
  inPhysicalTransition: 2,
  inSeparateTraining: 3,
  withProfessional: 1,
  withSub17: 1
};

export const INITIAL_MEDICAL_DEPARTMENT_ENTRIES: MedicalDepartmentEntry[] = [
  {
    id: 'dm_1',
    name: 'Matheus Phelipe',
    birthYear: 2008,
    injury: 'Cirurgia de Menisco',
    phase: 'DM',
    expectedReturn: 'Em recuperação pós-operatória',
    severity: 'Cirúrgica',
    notes: 'Intervenção cirúrgica de menisco. Em repouso e fisioterapia inicial.'
  },
  {
    id: 'dm_2',
    name: 'Miguel Felix',
    birthYear: 2008,
    injury: 'Cirurgia no Cotovelo',
    phase: 'Transição',
    expectedReturn: 'Transição física com preparador',
    severity: 'Cirúrgica',
    notes: 'Liberado pelo cirurgião para trabalho físico aeróbico e fortalecimento sem impacto de queda.'
  },
  {
    id: 'dm_3',
    name: 'Talles de Souza',
    birthYear: 2008,
    injury: 'Torção de Tornozelo',
    phase: 'DM',
    expectedReturn: 'Fisioterapia intensiva',
    severity: 'Moderada',
    notes: 'Entorse com edema moderado. Crioterapia e drenagem linfática diária.'
  },
  {
    id: 'dm_4',
    name: 'Joao Emanoel',
    birthYear: 2007,
    injury: 'Estiramento LCM (Lig. Colateral Medial)',
    phase: 'DM',
    expectedReturn: 'Tratamento conservador',
    severity: 'Moderada',
    notes: 'Estiramento ligamentar no joelho sem instabilidade óssea.'
  },
  {
    id: 'dm_5',
    name: 'Gabriel Mota',
    birthYear: 2008,
    injury: 'Ruptura LCA (Lig. Cruzado Anterior)',
    phase: 'DM',
    expectedReturn: 'Reabilitação a longo prazo',
    severity: 'Grave',
    notes: 'Ruptura de ligamento cruzado. Acompanhamento cirúrgico e fisioterápico contínuo.'
  },
  {
    id: 'dm_6',
    name: 'Davi Fernandes',
    birthYear: 2007,
    injury: 'Edema Ósseo no Joelho',
    phase: 'Transição',
    expectedReturn: 'Transição física de campo',
    severity: 'Moderada',
    notes: 'Regressão de edema confirmada em ressonância. Iniciando corridas lineares com o preparador.'
  },
  {
    id: 'dm_7',
    name: 'Eduardo Salvador',
    birthYear: 2006,
    injury: 'Fratura na Mão',
    phase: 'DM',
    expectedReturn: 'Consolidação óssea',
    severity: 'Moderada',
    notes: 'Goleiro com imobilização rígida. Treinamento aeróbico sem uso de membros superiores.'
  },
  {
    id: 'dm_8',
    name: 'Guilherme Neves',
    birthYear: 2007,
    injury: 'Posterior da Coxa Grau 2',
    phase: 'DM',
    expectedReturn: 'Fisioterapia e fortalecimento excêntrico',
    severity: 'Moderada',
    notes: 'Lesão miofascial no bíceps femoral. Fisioterapia diária com ultrassom e liberação miofascial.'
  },
  {
    id: 'dm_9',
    name: 'Felipe Bernardi',
    birthYear: 2006,
    injury: 'Reto Femoral Grau 2',
    phase: 'DM',
    expectedReturn: 'Repouso e eletroestimulação',
    severity: 'Moderada',
    notes: 'Lesão no terço proximal do reto femoral. Em tratamento no DM.'
  }
];

export const INITIAL_SEPARATE_TRAINING_ENTRIES: SeparateTrainingEntry[] = [
  {
    id: 'sep_1',
    name: 'Kauan Araujo',
    birthYear: 2007,
    situation: 'POSSÍVEL SAÍDA',
    notes: 'Atleta em negociações com outro clube. Treina em horários adaptados com acompanhamento físico.'
  },
  {
    id: 'sep_2',
    name: 'Ruan Lima',
    birthYear: 2009,
    situation: 'INDEFINIDO',
    notes: 'Aguardando parecer final de registro e planejamento contratual.'
  },
  {
    id: 'sep_3',
    name: 'Lucas Ortiz',
    birthYear: 2007,
    situation: 'INDEFINIDO',
    notes: 'Situação administrativa e técnica sob reavaliação pela comissão.'
  }
];

export const INITIAL_EXTERNAL_ASSIGNMENTS: ExternalAssignmentEntry[] = [
  {
    id: 'ext_1',
    name: 'Miguel Bittencourt',
    birthYear: 2009,
    positionNumber: 3,
    positionName: 'Zagueiro Central',
    assignment: 'Profissional',
    notes: 'Integrado ao elenco profissional principal do C.A. Juventus para ganho de experiência e maturidade.'
  },
  {
    id: 'ext_2',
    name: 'Vitor Coca',
    birthYear: 2009,
    positionNumber: 3,
    positionName: 'Zagueiro Central',
    assignment: 'Sub-17',
    notes: 'Cedido aos jogos da categoria Sub-17 para manter ritmo e minutagem competitiva de titular.'
  }
];

export const INITIAL_POSITIONAL_SQUAD_SLOTS: PositionalSquadSlot[] = [
  {
    positionNumber: 1,
    positionName: 'Goleiro',
    sector: 'Goleiro',
    players: [
      { name: 'Arthur Rodrigues', birthYear: 2007, status: 'Disponível' },
      { name: 'Pedro Neres', birthYear: 2008, status: 'Disponível' },
      { name: 'Eduardo Salvador', birthYear: 2006, status: 'DM', details: 'Fratura na mão' }
    ]
  },
  {
    positionNumber: 2,
    positionName: 'Lateral Direito',
    sector: 'Defesa',
    players: [
      { name: 'Ian de Andrade', birthYear: 2007, status: 'Disponível' },
      { name: 'Talles de Souza', birthYear: 2008, status: 'DM', details: 'Torção tornozelo' },
      { name: 'Rafael Cardoso', birthYear: 2008, status: 'Disponível' }
    ]
  },
  {
    positionNumber: 3,
    positionName: 'Zagueiro Central (Esquerda)',
    sector: 'Defesa',
    players: [
      { name: 'Matheus Baccan', birthYear: 2008, status: 'Disponível' },
      { name: 'Miguel Bittencourt', birthYear: 2009, status: 'Profissional', details: 'No Profissional' },
      { name: 'Vitor Lima', birthYear: 2006, status: 'Disponível' }
    ]
  },
  {
    positionNumber: 4,
    positionName: 'Zagueiro Central (Direita)',
    sector: 'Defesa',
    players: [
      { name: 'Luiz Felipe Vidal', birthYear: 2007, status: 'Disponível' },
      { name: 'Antony Daniel', birthYear: 2007, status: 'Disponível' },
      { name: 'Pedro Evangelista', birthYear: 2007, status: 'Disponível' }
    ]
  },
  {
    positionNumber: 6,
    positionName: 'Lateral Esquerdo',
    sector: 'Defesa',
    players: [
      { name: 'Guilherme Neves', birthYear: 2007, status: 'DM', details: 'Posterior Grau 2' },
      { name: 'Felipe Bernardi', birthYear: 2006, status: 'DM', details: 'Reto Femoral Grau 2' }
    ]
  },
  {
    positionNumber: 5,
    positionName: 'Primeiro Volante',
    sector: 'Meio-Campo',
    players: [
      { name: 'Joao Emanoel', birthYear: 2007, status: 'DM', details: 'Estiramento LCM' },
      { name: 'Fabrício da Silva', birthYear: 2008, status: 'Disponível' },
      { name: 'Thiago Felicci', birthYear: 2006, status: 'Disponível' }
    ]
  },
  {
    positionNumber: 8,
    positionName: 'Segundo Volante / Médio Centro',
    sector: 'Meio-Campo',
    players: [
      { name: 'Lucas Ortiz', birthYear: 2007, status: 'Treino à parte', details: 'Indefinido' },
      { name: 'Davi Fernandes', birthYear: 2008, status: 'Disponível' },
      { name: 'Serigne Fallou', birthYear: 2007, status: 'Disponível' },
      { name: 'Riquelme dos Santos', birthYear: 2006, status: 'Disponível' }
    ]
  },
  {
    positionNumber: 10,
    positionName: 'Meia Armador',
    sector: 'Meio-Campo',
    players: [
      { name: 'Eduardo Gimenes', birthYear: 2008, status: 'Disponível' },
      { name: 'Henrique Miranda', birthYear: 2006, status: 'Disponível' }
    ]
  },
  {
    positionNumber: 7,
    positionName: 'Extremo Direito',
    sector: 'Ataque',
    players: [
      { name: 'Victor Barbosa', birthYear: 2006, status: 'Disponível' },
      { name: 'Gabriel Mota', birthYear: 2008, status: 'DM', details: 'Ruptura LCA' }
    ]
  },
  {
    positionNumber: 11,
    positionName: 'Extremo Esquerdo',
    sector: 'Ataque',
    players: [
      { name: 'Gabriel Jonas', birthYear: 2007, status: 'Disponível' },
      { name: 'Arthur Costa', birthYear: 2008, status: 'Disponível' },
      { name: 'Vitor Coca', birthYear: 2009, status: 'Sub-17', details: 'No Sub-17' }
    ]
  },
  {
    positionNumber: 9,
    positionName: 'Centroavante',
    sector: 'Ataque',
    players: [
      { name: 'Antonio Neto', birthYear: 2006, status: 'Disponível' },
      { name: 'Miguel Felix', birthYear: 2008, status: 'Transição', details: 'Cirurgia Cotovelo' },
      { name: 'Pedro Julio', birthYear: 2007, status: 'Disponível' },
      { name: 'Matheus Phelipe', birthYear: 2008, status: 'DM', details: 'Cirurgia Menisco' },
      { name: 'Dachi Kikvidze', birthYear: 2008, status: 'Disponível' }
    ]
  }
];

export const TOTAL_SQUAD_36_PLAYERS: SquadPlayerRecord36[] = [
  { name: 'Antônio Neto', birthYear: 2006, positionNumber: 9, positionName: 'Centroavante', status: 'Disponível' },
  { name: 'Antony Daniel', birthYear: 2007, positionNumber: 4, positionName: 'Zagueiro Central', status: 'Disponível' },
  { name: 'Arthur Costa', birthYear: 2008, positionNumber: 11, positionName: 'Extremo Esquerdo', status: 'Disponível' },
  { name: 'Arthur Rodrigues', birthYear: 2007, positionNumber: 1, positionName: 'Goleiro', status: 'Disponível' },
  { name: 'Dachi Kikvidze', birthYear: 2008, positionNumber: 9, positionName: 'Centroavante', status: 'Disponível' },
  { name: 'Davi Fernandes', birthYear: 2008, positionNumber: 8, positionName: 'Segundo Volante', status: 'Disponível' },
  { name: 'Eduardo Gimenes', birthYear: 2008, positionNumber: 10, positionName: 'Meia Armador', status: 'Disponível' },
  { name: 'Eduardo Salvador', birthYear: 2006, positionNumber: 1, positionName: 'Goleiro', status: 'DM', notes: 'Fratura na mão' },
  { name: 'Fabrício da Silva', birthYear: 2008, positionNumber: 5, positionName: 'Primeiro Volante', status: 'Disponível' },
  { name: 'Felipe Bernardi', birthYear: 2006, positionNumber: 6, positionName: 'Lateral Esquerdo', status: 'DM', notes: 'Reto Femoral Grau 2' },
  { name: 'Gabriel Jonas', birthYear: 2007, positionNumber: 11, positionName: 'Extremo Esquerdo', status: 'Disponível' },
  { name: 'Gabriel Mota', birthYear: 2008, positionNumber: 7, positionName: 'Extremo Direito', status: 'DM', notes: 'Ruptura LCA' },
  { name: 'Guilherme Neves', birthYear: 2007, positionNumber: 6, positionName: 'Lateral Esquerdo', status: 'DM', notes: 'Posterior Grau 2' },
  { name: 'Henrique Miranda', birthYear: 2006, positionNumber: 10, positionName: 'Meia Armador', status: 'Disponível' },
  { name: 'Ian de Andrade', birthYear: 2007, positionNumber: 2, positionName: 'Lateral Direito', status: 'Disponível' },
  { name: 'Joao Emanoel', birthYear: 2007, positionNumber: 5, positionName: 'Primeiro Volante', status: 'DM', notes: 'Estiramento LCM' },
  { name: 'Kauan Araujo', birthYear: 2007, positionNumber: 8, positionName: 'Segundo Volante', status: 'Treino à parte', notes: 'Possível Saída' },
  { name: 'Lucas Ortiz', birthYear: 2007, positionNumber: 8, positionName: 'Segundo Volante', status: 'Treino à parte', notes: 'Indefinido' },
  { name: 'Luiz Felipe Vidal', birthYear: 2007, positionNumber: 4, positionName: 'Zagueiro Central', status: 'Disponível' },
  { name: 'Matheus Baccan', birthYear: 2008, positionNumber: 3, positionName: 'Zagueiro Central', status: 'Disponível' },
  { name: 'Matheus Phelipe', birthYear: 2008, positionNumber: 9, positionName: 'Centroavante', status: 'DM', notes: 'Cirurgia de Menisco' },
  { name: 'Miguel Bittencourt', birthYear: 2009, positionNumber: 3, positionName: 'Zagueiro Central', status: 'Profissional', notes: 'Com o Profissional' },
  { name: 'Miguel Felix', birthYear: 2008, positionNumber: 9, positionName: 'Centroavante', status: 'Transição', notes: 'Cirurgia no Cotovelo' },
  { name: 'Pedro Evangelista', birthYear: 2007, positionNumber: 4, positionName: 'Zagueiro Central', status: 'Disponível' },
  { name: 'Pedro Julio', birthYear: 2007, positionNumber: 9, positionName: 'Centroavante', status: 'Disponível' },
  { name: 'Pedro Neres', birthYear: 2008, positionNumber: 1, positionName: 'Goleiro', status: 'Disponível' },
  { name: 'Rafael Cardoso', birthYear: 2008, positionNumber: 2, positionName: 'Lateral Direito', status: 'Disponível' },
  { name: 'Riquelme dos Santos', birthYear: 2006, positionNumber: 8, positionName: 'Segundo Volante', status: 'Disponível' },
  { name: 'Ruan Lima', birthYear: 2009, positionNumber: 7, positionName: 'Extremo', status: 'Treino à parte', notes: 'Indefinido' },
  { name: 'Serigne Fallou', birthYear: 2007, positionNumber: 8, positionName: 'Segundo Volante', status: 'Disponível' },
  { name: 'Talles de Souza', birthYear: 2008, positionNumber: 2, positionName: 'Lateral Direito', status: 'DM', notes: 'Torção de Tornozelo' },
  { name: 'Thiago Felicci', birthYear: 2006, positionNumber: 5, positionName: 'Primeiro Volante', status: 'Disponível' },
  { name: 'Victor Barbosa', birthYear: 2006, positionNumber: 7, positionName: 'Extremo Direito', status: 'Disponível' },
  { name: 'Vitor Coca', birthYear: 2009, positionNumber: 3, positionName: 'Zagueiro Central', status: 'Sub-17', notes: 'Com o Sub-17' },
  { name: 'Vitor Lima', birthYear: 2006, positionNumber: 3, positionName: 'Zagueiro Central', status: 'Disponível' },
  { name: 'Khendran Santos', birthYear: 2006, positionNumber: 1, positionName: 'Goleiro', status: 'Disponível', notes: 'Titular Copinha' }
];


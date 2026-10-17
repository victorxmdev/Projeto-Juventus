# C.A. JUVENTUS SAF SUB-20 | SISTEMA INTEGRADO DA COMISSÃO TÉCNICA

> **Plataforma Multiplataforma de Inteligência, Ciência de Dados e Controle Total da Comissão Técnica**  
> Desenvolvido para o **Clube Atlético Juventus SAF - Categoria Sub-20** (Estádio Conde Rodolfo Crespi - Rua Javari, Mooca, São Paulo).

---

## 🛡️ 1. Identidade Visual & Design System (Dark Turf & Grená Juventus)
- **Fundo Principal:** Dark Turf Profundo (`#0B140E` e `#111E16`).
- **Cards e Painéis:** `#15241B` com bordas finas `#243B2D`.
- **Destaques e Botões Primários:** Verde-limão de alta visibilidade em campo (`#C2F07C` com texto `#0B140E`).
- **Identidade Institucional:** **Grená Oficial (`#631426`)** e **Dourado Nobre (`#D4AF37`)**.
- **Multiplataforma Responsiva:**
  - **Desktop / Notebook:** Sidebar retrátil com visão analítica e relatórios em PDF.
  - **Mobile iOS / Android:** PWA com Bottom Navigation Bar otimizada para uso no campo à beira do gramado.

---

## 🏆 2. Seletor Global de Campeonato (Regra de Ouro do Sistema)
Fixo no topo de todas as telas, permite alternância instantânea entre:
1. **Campeonato Paulista Sub-20**
2. **Copa São Paulo de Futebol Júnior (Copinha)**
3. **Consolidado da Temporada (Todos os Jogos)**

*Ao alternar a competição, todas as minutagens, cartões, artilharia, histórico de jogos e microciclos são recalculados e filtrados em tempo real.*

---

## 🧩 3. Módulos do Sistema

### 📊 Módulo 1: Dashboard por Posição e Plantel
- **Aba 1 - Mapa de Profundidade por Posição:**
  - Cards agrupados por setor: `Goleiro`, `Lateral Direito`, `Zagueiro Central`, `Zagueiro Esquerdo`, `Lateral Esquerdo`, `Volante`, `Meia` e `Atacante`.
  - Exibe Atleta, Total de Jogos, Minutos totais (com barra de progresso proporcional à minutagem máxima do elenco) e badges de status (`DISPONÍVEL`, `LESIONADO`, `SUSPENSO`, `ADAPTADO`).
- **Aba 2 - Tabela Geral do Plantel & Minutagem:**
  - Filtros rápidos em pílulas: `Todos`, `Disponíveis`, `Adaptados`, `Lesionados (DM)`, `Suspensos` e `Pendurados (2 CA)`.
  - Busca por nome, ordenação por Minutagem, Jogos, Posição ou Nota.
  - Colunas completas da planilha oficial FPF + integração com treino:
    `Nº` | `Atleta` | `Nome na Súmula` | `Ano Nasc.` | `Posição` | `Nota Treino` | `Nota Jogo` | `% Presença Treino` | `Min. Treino` | `Total Jogos` | `T` | `SU` | `SN` | `Total Minutos (TJ)` | `Gols` | `Assist.` | `CA` | `CV` | `Status` | `Situação Extra` | `Suspensões Cumpridas`.
  - **Dossiê Completo do Atleta:** Modal com gráfico de minutagem jogo a jogo, evolução física, histórico médico do DM, vídeos individuais no YouTube e edição de dados.

### 📅 Módulo 2: Calendário e Programação Semanal (com PDF na Nuvem)
- Alternância entre visão **Semana** e **Mês**.
- Legenda por cores oficiais:
  - 🟢 **Treino**
  - 🔵 **Jogo Oficial**
  - ⚪ **Folga / Descanso**
  - 🟠 **Retorno Previsto (DM)**
  - 🟣 **Avaliação Física**
  - 🩷 **Aniversário**
- **Anexo de Programação Semanal via PDF:** Visualizador de PDF modal embutido com upload para Supabase Storage / cache local e sincronização automática com os dias do calendário.

### 📋 Módulo 3: Microciclo, Sessões de Treino, Fichas em PDF e YouTube
- Filtros por status: `Todos`, `Planejado`, `Realizado`, `Cancelado`.
- Tags de Fase Tática: *Organização ofensiva*, *Transição ofensiva*, *Organização defensiva*, *Transição defensiva*.
- **Ficha de Treino Oficial em PDF:** Geração automática em formato A4 com cabeçalho oficial do C.A. Juventus SAF Sub-20, exercícios, regras, variações, feedbacks e lista de presença.
- **Integração com YouTube:** Painel conectado diretamente à playlist oficial (`https://www.youtube.com/playlist?list=PLsNXtgaQkGjl_tcvyjwycc6fcLFwuquVW`), com suporte a marcadores de tempo interativos (*timestamps* clicáveis).

### 📐 Módulo 4: Prancheta Tática Interativa
- Seletor de campo: `Campo inteiro`, `Meio campo`, `Caixa de área`.
- Ferramentas: Mover, Jogador (personalizável com número e cores), Goleiro, Bola, Cone, Pratinho, Barreira, Mini-trave.
- Setas Táticas: Passe (contínua), Corrida (tracejada), Condução (ondulada).
- Textareas laterais sincronizadas em tempo real: `REGRAS`, `VARIAÇÕES` e `PRINCIPAIS FEEDBACKS`.
- Exportação de prancheta em imagem PNG de alta resolução.

### ⚽ Módulo 5: Gestão de Jogos & Súmulas Oficiais FPF
- Histórico completo de partidas com placar, gols pró e contra, local e adversário.
- **Lançamento Rápido da Súmula do Jogo:**
  - Seleção dos 11 Titulares (`T`), Suplentes Utilizados (`SU`) e Não Utilizados (`SN`).
  - Cálculo automático de minutos jogados (TJ) por tempo de substituição + acréscimos (ex: 97', 98').
  - Registro de gols, assistências, cartões e notas individuais com recálculo instantâneo de todo o sistema.

### 🏃 Módulo 6: Preparação Física (Testes, Carga PSE/Wellness & Maturação)
- **Resultados da Equipe:** 4 KPIs, tabela com indicadores de evolução (▲ verde / ▼ vermelho) em Velocidade 20m, Yo-Yo Test, Salto Vertical e Agilidade.
- **Carga Interna & ACWR:** Gráfico semanal de carga (PSE x minutos), monotonia e relação aguda/crônica para prevenção de lesões.
- **Questionário Mobile do Atleta:** Preenchimento rápido via smartphone para bem-estar pré-treino (Escala Hooper) e esforço pós-treino (Escala Borg CR-10).
- **Maturação Biológica (Mirwald & Bio-Banding):** Painel em 3 colunas (`Pré-pico`, `No pico de crescimento`, `Pós-pico`) para ajuste de carga dos atletas mais jovens (2008/2009).

### 🧤 Módulo 7: Preparação de Goleiros
- Filtro individual pelos goleiros do elenco: `Eduardo Salvador`, `Arthur Rodrigues`, `Pedro Neres`.
- **Gols Sofridos:** Desenho interativo da trave dividida em 9 quadrantes (3x3) onde o treinador de goleiros clica no local exato onde a bola entrou, registrando origem, tipo e situação.
- **Periodização Semanal (Segunda a Sábado):** Grade diária com tags de conteúdos específicos, minutos, intensidade e botão de exportação **"PDF da Semana"**.

---

## ⚡ 4. Execução do Projeto

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Iniciar em Modo de Desenvolvimento
```bash
npm install
npm run dev
```
O aplicativo estará disponível em `http://localhost:3000`.

### Gerar Build de Produção
```bash
npm run build
```

---

## ☁️ 5. Conexão com Supabase
O sistema opera em arquitetura **Local-First**: funciona perfeitamente sem nenhuma configuração de banco externa (armazenando dados e estado no LocalStorage com suporte a exportação de Backup JSON completo).  
Para conectar a um projeto Supabase na nuvem, basta clicar no ícone de Nuvem no cabeçalho ou configurar o arquivo `.env`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

---

**Clube Atlético Juventus SAF - Categoria Sub-20**  
*Tradicional time da Mooca • Paixão, Ciência de Dados e Excelência no Futebol.*


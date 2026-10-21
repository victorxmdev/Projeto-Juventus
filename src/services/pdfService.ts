import { jsPDF } from 'jspdf';
import { TrainingSession, Player, GoalkeeperPeriodizationDay, OpponentPenaltyTaker, GkTrainingSession } from '../types';

export function generateTrainingSessionPdf(session: TrainingSession, allPlayers: Player[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background header band - Juventus Grená
  doc.setFillColor(99, 20, 38); // #631426
  doc.rect(0, 0, 210, 32, 'F');

  // Gold accent line
  doc.setFillColor(212, 175, 55); // #D4AF37
  doc.rect(0, 32, 210, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('CLUBE ATLÉTICO JUVENTUS SAF - SUB-20', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 231, 178); // gold light
  doc.text('COMISSÃO TÉCNICA • FICHA OFICIAL DE SESSÃO DE TREINO', 14, 20);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`GERADO EM: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 14, 27);

  // Session Summary Card
  doc.setFillColor(245, 247, 246);
  doc.roundedRect(14, 38, 182, 30, 2, 2, 'F');
  doc.setDrawColor(200, 210, 204);
  doc.roundedRect(14, 38, 182, 30, 2, 2, 'S');

  doc.setTextColor(17, 30, 22);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(session.title.toUpperCase(), 18, 46);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${session.date} às ${session.time}h  |  Duração: ${session.durationMinutes} min  |  Local: ${session.location}`, 18, 53);
  doc.text(`Fase Tática: ${session.tacticalPhase}  |  Status: ${session.status}  |  Nota Média: ${session.averageRating ? session.averageRating.toFixed(1) : 'N/A'}`, 18, 60);

  let currentY = 76;

  // REGRAS DO EXERCÍCIO
  doc.setFillColor(99, 20, 38);
  doc.rect(14, currentY, 3, 6, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('1. REGRAS DO EXERCÍCIO', 19, currentY + 5);
  currentY += 8;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const rulesLines = doc.splitTextToSize(session.rules || 'Nenhuma regra detalhada registrada.', 180);
  doc.text(rulesLines, 14, currentY);
  currentY += (rulesLines.length * 4.5) + 6;

  // VARIAÇÕES
  doc.setFillColor(99, 20, 38);
  doc.rect(14, currentY, 3, 6, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('2. VARIAÇÕES E PROGRESSÕES', 19, currentY + 5);
  currentY += 8;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const varLines = doc.splitTextToSize(session.variations || 'Sem variações cadastradas.', 180);
  doc.text(varLines, 14, currentY);
  currentY += (varLines.length * 4.5) + 6;

  // PRINCIPAIS FEEDBACKS
  doc.setFillColor(99, 20, 38);
  doc.rect(14, currentY, 3, 6, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('3. PRINCIPAIS FEEDBACKS E CORREÇÕES TÁTICAS', 19, currentY + 5);
  currentY += 8;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const feedbackLines = doc.splitTextToSize(session.feedbacks || 'Foco na intensidade e velocidade na circulação da bola.', 180);
  doc.text(feedbackLines, 14, currentY);
  currentY += (feedbackLines.length * 4.5) + 8;

  // LISTA DE PRESENÇA DOS ATLETAS
  doc.setFillColor(99, 20, 38);
  doc.rect(14, currentY, 3, 6, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text(`4. LISTA DE ATLETAS RELACIONADOS (${session.attendancePlayerIds?.length || 0} PRESENTES)`, 19, currentY + 5);
  currentY += 9;

  // 3-column roster list
  const presentPlayers = allPlayers.filter(p => session.attendancePlayerIds?.includes(p.id));
  const colWidth = 60;
  let col = 0;
  let startColY = currentY;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  presentPlayers.forEach((p, idx) => {
    const xPos = 14 + (col * colWidth);
    const yPos = startColY + (Math.floor(idx / 3) * 5.2);
    
    if (yPos > 265) {
      // Avoid footer overflow
      return;
    }
    
    doc.text(`• [${p.number}] ${p.name} (${p.position.slice(0, 3)})`, xPos, yPos);
    col = (col + 1) % 3;
    currentY = Math.max(currentY, yPos + 6);
  });

  // Footer & Signatures
  doc.setDrawColor(212, 175, 55);
  doc.line(14, 275, 95, 275);
  doc.line(115, 275, 196, 275);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Treinador Principal / Coordenação Técnica Sub-20', 14, 280);
  doc.text('Preparador Físico / Fisiologia C.A. Juventus SAF', 115, 280);

  // Save the PDF
  const cleanTitle = session.title.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Ficha_Treino_Juventus_Sub20_${cleanTitle}_${session.date}.pdf`);
}

export function generateGoalkeeperWeeklyPdf(periodization: GoalkeeperPeriodizationDay[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Background header band - Juventus Grená
  doc.setFillColor(99, 20, 38);
  doc.rect(0, 0, 297, 26, 'F');

  // Gold accent line
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 26, 297, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CLUBE ATLÉTICO JUVENTUS SAF • DEPARTAMENTO DE PREPARAÇÃO DE GOLEIROS SUB-20', 14, 12);

  doc.setFontSize(9);
  doc.setTextColor(245, 231, 178);
  doc.text('PERIODIZAÇÃO SEMANAL ESPECÍFICA (SEGUNDA A SÁBADO) • MICROCICLO DE TREINOS', 14, 19);

  let startX = 14;
  const cardWidth = 44;
  const cardHeight = 150;
  const gap = 2;

  periodization.forEach((day, index) => {
    const x = startX + index * (cardWidth + gap);
    const y = 33;

    // Day card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');

    // Day Header
    doc.setFillColor(day.intensity === 'Alta' ? 220 : day.intensity === 'Média' ? 180 : 120, 40, 50);
    doc.roundedRect(x, y, cardWidth, 12, 2, 2, 'F');
    doc.setFillColor(248, 250, 252);
    doc.rect(x, y + 8, cardWidth, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(day.dayName.toUpperCase(), x + (cardWidth / 2), y + 6, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(day.dateStr, x + (cardWidth / 2), y + 10.5, { align: 'center' });

    // Details: Minutes & Intensity
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 30, 22);
    doc.text(`Tempo: ${day.minutes} min`, x + 4, y + 18);
    doc.text(`Intensidade: ${day.intensity}`, x + 4, y + 23);

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(x + 4, y + 26, x + cardWidth - 4, y + 26);

    // Tags
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 20, 38);
    doc.text('CONTEÚDOS:', x + 4, y + 31);

    let tagY = y + 36;
    day.contentTags.forEach((tag) => {
      doc.setFillColor(236, 242, 238);
      doc.roundedRect(x + 3, tagY - 3, cardWidth - 6, 6.5, 1, 1, 'F');
      doc.setTextColor(21, 56, 33);
      doc.setFontSize(6.8);
      doc.setFont('helvetica', 'normal');
      doc.text(tag, x + 5, tagY + 1.2, { maxWidth: cardWidth - 10 });
      tagY += 8;
    });

    // Notes
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 20, 38);
    doc.text('OBSERVAÇÕES:', x + 4, y + 115);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const obsLines = doc.splitTextToSize(day.observations || 'Treino padrão.', cardWidth - 8);
    doc.text(obsLines, x + 4, y + 120);
  });

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Preparador de Goleiros C.A. Juventus SAF Sub-20 • Documento de Uso Interno da Comissão Técnica', 14, 195);

  doc.save(`Periodizacao_Semanal_Goleiros_Juventus_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function generateOpponentPenaltyScoutingPdf(taker: OpponentPenaltyTaker) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background header band - Juventus Grená (#631426)
  doc.setFillColor(99, 20, 38);
  doc.rect(0, 0, 210, 28, 'F');

  // Gold accent line (#D4AF37)
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 28, 210, 2, 'F');

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CLUBE ATLÉTICO JUVENTUS SAF • SUB-20', 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 231, 178); // gold light
  doc.text('DEPARTAMENTO DE PREPARAÇÃO DE GOLEIROS • SCOUTING DE PÊNALTIS ADVERSÁRIOS (TRAVE 3X3)', 14, 19);

  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`DATA DO RELATÓRIO: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • CLASSIFICAÇÃO: CONFIDENCIAL / USO INTERNO`, 14, 25);

  // Kicks calculations
  const totalKicks = taker.kicks.length;
  const goalsCount = taker.kicks.filter(k => k.outcome === 'Gol').length;
  const savesCount = taker.kicks.filter(k => k.outcome === 'Defendido').length;
  const missesCount = taker.kicks.filter(k => k.outcome === 'Fora' || k.outcome === 'Trave').length;

  const goalPct = totalKicks > 0 ? ((goalsCount / totalKicks) * 100).toFixed(1) : '0.0';
  const savePct = totalKicks > 0 ? ((savesCount / totalKicks) * 100).toFixed(1) : '0.0';
  const missPct = totalKicks > 0 ? ((missesCount / totalKicks) * 100).toFixed(1) : '0.0';

  // Quadrant counts & percentages (1 to 9)
  const qCounts: { [key: number]: number } = {};
  const qPcts: { [key: number]: number } = {};
  for (let q = 1; q <= 9; q++) {
    const c = taker.kicks.filter(k => k.quadrant === q).length;
    qCounts[q] = c;
    qPcts[q] = totalKicks > 0 ? (c / totalKicks) * 100 : 0;
  }

  // Taker Profile Card (Left: x=14, y=34, w=115, h=38)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, 115, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, 115, 38, 2, 2, 'S');

  doc.setTextColor(99, 20, 38);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(taker.name.toUpperCase(), 18, 42);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Equipe: ${taker.team}`, 18, 48);
  doc.text(`Camisa: #${taker.shirtNumber}  |  Posição: ${taker.position}  |  Pé Dominante: ${taker.dominantFoot.toUpperCase()}`, 18, 54);
  if (taker.birthYear) {
    doc.text(`Ano de Nasc.: ${taker.birthYear} (${2026 - taker.birthYear} anos)  |  Altura: ${taker.heightCm || 'N/A'} cm`, 18, 60);
  }

  // oGol link button
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(18, 63, 50, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('↗ ABRIR PERFIL NO OGOL', 22, 67.2);
  doc.link(18, 63, 50, 6, { url: taker.oGolUrl });

  // Summary Stats Card (Right: x=133, y=34, w=63, h=38)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(133, 34, 63, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(133, 34, 63, 38, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 30, 22);
  doc.text('RESUMO DE DESEMPENHO', 137, 41);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Cobranças Analisadas: ${totalKicks}`, 137, 48);

  doc.setTextColor(22, 101, 52); // green
  doc.setFont('helvetica', 'bold');
  doc.text(`Gols Marcados: ${goalsCount} (${goalPct}%)`, 137, 54);

  doc.setTextColor(30, 64, 175); // blue
  doc.text(`Defendidos: ${savesCount} (${savePct}%)`, 137, 60);

  doc.setTextColor(153, 27, 27); // red
  doc.text(`Fora / Trave: ${missesCount} (${missPct}%)`, 137, 66);

  // Section Header: Trave 3x3
  const traveStartY = 76;
  doc.setFillColor(99, 20, 38);
  doc.rect(14, traveStartY, 3, 5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('MAPEAMENTO DE FINALIZAÇÕES E GOLS SOFRIDOS (TRAVE 3X3)', 19, traveStartY + 4.2);

  // Goal Frame Vector Drawing
  const frameX = 14;
  const frameY = 84;
  const frameW = 114;
  const frameH = 54;
  const cellW = frameW / 3;
  const cellH = frameH / 3;

  // Outer Goal Border (Crossbar and Posts)
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(1.2);
  doc.rect(frameX, frameY, frameW, frameH, 'S');

  // Grass line at bottom
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1.5);
  doc.line(frameX - 2, frameY + frameH, frameX + frameW + 2, frameY + frameH);

  // Quadrant Labels Map: 1 to 9
  const quadrantNames = [
    'Q1 (Ângulo Esq)', 'Q2 (Meio Alto)', 'Q3 (Ângulo Dir)',
    'Q4 (Meia Alt. Esq)', 'Q5 (Centro)', 'Q6 (Meia Alt. Dir)',
    'Q7 (Rasteiro Esq)', 'Q8 (Rasteiro Centro)', 'Q9 (Rasteiro Dir)'
  ];

  // Draw 9 Quadrants
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const qNum = r * 3 + c + 1;
      const qX = frameX + c * cellW;
      const qY = frameY + r * cellH;
      const count = qCounts[qNum] || 0;
      const pct = qPcts[qNum] || 0;

      // Color based on percentage (Heatmap fill)
      if (pct >= 40) {
        doc.setFillColor(254, 226, 226); // intense light red
      } else if (pct >= 20) {
        doc.setFillColor(254, 243, 199); // amber/gold light
      } else if (pct > 0) {
        doc.setFillColor(241, 245, 249); // subtle gray-blue
      } else {
        doc.setFillColor(255, 255, 255); // pure white
      }
      doc.rect(qX, qY, cellW, cellH, 'F');

      // Grid border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.rect(qX, qY, cellW, cellH, 'S');

      // Quadrant Label (e.g. Q1, Q2)
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(quadrantNames[qNum - 1], qX + 3, qY + 4.5);

      // Percentage (Prominent in center)
      if (pct >= 40) {
        doc.setTextColor(153, 27, 27); // dark red
      } else if (pct >= 20) {
        doc.setTextColor(180, 83, 9); // dark amber
      } else if (pct > 0) {
        doc.setTextColor(30, 41, 59); // dark slate
      } else {
        doc.setTextColor(148, 163, 184); // muted slate
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${pct.toFixed(0)}%`, qX + cellW / 2, qY + 10.5, { align: 'center' });

      // Count badge
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${count} ${count === 1 ? 'cobrança' : 'cobranças'}`, qX + cellW / 2, qY + 15, { align: 'center' });
    }
  }

  // Trave Side Info Card (x=133, y=84, w=63, h=54)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(133, frameY, 63, frameH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(133, frameY, 63, frameH, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('PADRÃO DE FINALIZAÇÃO', 137, frameY + 7);

  // Find preferred quadrant
  let topQuadrant = 1;
  let maxCount = -1;
  for (let q = 1; q <= 9; q++) {
    if (qCounts[q] > maxCount) {
      maxCount = qCounts[q];
      topQuadrant = q;
    }
  }

  // Side distribution
  const leftSideCount = qCounts[1] + qCounts[4] + qCounts[7];
  const centerCount = qCounts[2] + qCounts[5] + qCounts[8];
  const rightSideCount = qCounts[3] + qCounts[6] + qCounts[9];

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Quadrante Preferido: Q${topQuadrant} (${qPcts[topQuadrant].toFixed(0)}%)`, 137, frameY + 14);
  doc.text(`Lado Esquerdo do Goleiro: ${leftSideCount} (${totalKicks > 0 ? ((leftSideCount/totalKicks)*100).toFixed(0) : 0}%)`, 137, frameY + 21);
  doc.text(`Centro da Baliza: ${centerCount} (${totalKicks > 0 ? ((centerCount/totalKicks)*100).toFixed(0) : 0}%)`, 137, frameY + 28);
  doc.text(`Lado Direito do Goleiro: ${rightSideCount} (${totalKicks > 0 ? ((rightSideCount/totalKicks)*100).toFixed(0) : 0}%)`, 137, frameY + 35);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('* Perspectiva da trave: goleiro de frente', 137, frameY + 44);
  doc.text('  para a bola.', 137, frameY + 48);

  // Technical Analysis & Goalkeeper Directive Card
  const techY = 143;
  doc.setFillColor(254, 252, 232); // amber light
  doc.roundedRect(14, techY, 182, 38, 2, 2, 'F');
  doc.setDrawColor(253, 224, 71); // amber border
  doc.roundedRect(14, techY, 182, 38, 2, 2, 'S');

  doc.setFillColor(99, 20, 38);
  doc.rect(14, techY, 3, 38, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('ANÁLISE DE CORRIDA & POSTURA CORPORAL:', 20, techY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const runUpLines = doc.splitTextToSize(taker.technicalAnalysis.runUpDescription + ' ' + taker.technicalAnalysis.bodyLanguage, 172);
  doc.text(runUpLines, 20, techY + 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('DIRETRIZ TÁTICA PARA O GOLEIRO DO JUVENTUS:', 20, techY + 24);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  const recLines = doc.splitTextToSize(taker.technicalAnalysis.goalkeeperRecommendation, 172);
  doc.text(recLines, 20, techY + 29);

  // Penalties History Table
  const tableY = 186;
  doc.setFillColor(99, 20, 38);
  doc.rect(14, tableY, 3, 5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('HISTÓRICO INDIVIDUAL DE COBRANÇAS ANALISADAS', 19, tableY + 4.2);

  // Table Headers
  const thY = tableY + 8;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, thY, 182, 6.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, thY, 182, 6.5, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('DATA', 16, thY + 4.5);
  doc.text('CONFRONTO / COMPETIÇÃO', 36, thY + 4.5);
  doc.text('MIN', 115, thY + 4.5);
  doc.text('QUADRANTE', 125, thY + 4.5);
  doc.text('DESFECHO', 148, thY + 4.5);
  doc.text('VÍDEO / CORTE', 172, thY + 4.5);

  let rowY = thY + 6.5;
  taker.kicks.forEach((kick, index) => {
    if (rowY > 275) return;
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(14, rowY, 182, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, rowY, 182, 7, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(kick.dateStr, 16, rowY + 4.8);

    doc.text(kick.match.length > 45 ? kick.match.slice(0, 43) + '...' : kick.match, 36, rowY + 4.8);
    doc.text(`${kick.minute}'`, 116, rowY + 4.8);
    doc.text(`Q${kick.quadrant} (${quadrantNames[kick.quadrant - 1]?.slice(0, 11) || 'N/A'})`, 125, rowY + 4.8);

    // Outcome Badge
    if (kick.outcome === 'Gol') {
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.text('● GOL', 148, rowY + 4.8);
    } else if (kick.outcome === 'Defendido') {
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('★ DEFENDIDO', 148, rowY + 4.8);
    } else {
      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.text(`○ ${kick.outcome.toUpperCase()}`, 148, rowY + 4.8);
    }

    // Video Link
    if (kick.videoUrl) {
      doc.setTextColor(37, 99, 235);
      doc.setFont('helvetica', 'bold');
      doc.text('▶ Ver Vídeo', 172, rowY + 4.8);
      doc.link(170, rowY, 24, 7, { url: kick.videoUrl });
    } else {
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('Sem vídeo', 172, rowY + 4.8);
    }

    rowY += 7;
  });

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('C.A. Juventus SAF Sub-20 • Departamento de Inteligência Tática e Preparação de Goleiros • Documento Confidencial', 14, 290);

  const cleanName = taker.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Scouting_Penaltis_${cleanName}_Juventus_Sub20.pdf`);
}

export function generateGkTrainingSessionPdf(session: GkTrainingSession, goalkeepers: Player[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Top header band - Deep Crimson Juventus (#631426)
  doc.setFillColor(99, 20, 38);
  doc.rect(0, 0, 210, 32, 'F');

  // Gold accent line
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 32, 210, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CLUBE ATLÉTICO JUVENTUS SAF - SUB-20', 14, 13);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(245, 231, 178); // gold light
  doc.text('GK PLANNER • FICHA OFICIAL DE UNIDADE DE TREINO (UT)', 14, 20);

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`GERADO EM: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 14, 27);

  // Session Summary Card (x=14, y=38, w=182, h=32)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, 182, 32, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 38, 182, 32, 2, 2, 'S');

  // Session Code Badge
  doc.setFillColor(99, 20, 38);
  doc.roundedRect(18, 43, 20, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(session.code, 28, 48.5, { align: 'center' });

  // Session Title
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(session.title.toUpperCase(), 42, 49);

  // Metadata Subtitle
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Data: ${session.date}   |   Duração: ${session.durationMinutes} min   |   Categoria: ${session.category}   |   Intensidade: ${session.intensity.toUpperCase()}`, 18, 58);

  // Objectives Distribution Bar
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('Distribuição de Objetivos:', 18, 65);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Técnico: ${session.objectivesRatio.tecnico}%   •   Físico: ${session.objectivesRatio.fisico}%   •   Tático: ${session.objectivesRatio.tatico}%   •   Comportamental: ${session.objectivesRatio.comportamental}%`, 58, 65);

  let currentY = 75;

  // Involved Goalkeepers Pill Card
  const involvedGks = goalkeepers.filter(g => session.involvedGkIds.includes(g.id));
  if (involvedGks.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, 182, 12, 1.5, 1.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 20, 38);
    doc.text('GOLEIROS CONVOCADOS:', 18, currentY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const gkNames = involvedGks.map(g => `#${g.number} ${g.name}`).join('  |  ');
    doc.text(gkNames, 62, currentY + 7.5);

    currentY += 16;
  }

  // Coach Observations Card
  if (session.coachNotes) {
    doc.setFillColor(254, 252, 232); // amber light
    doc.roundedRect(14, currentY, 182, 14, 1.5, 1.5, 'F');
    doc.setDrawColor(253, 224, 71);
    doc.roundedRect(14, currentY, 182, 14, 1.5, 1.5, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(161, 98, 7);
    doc.text('OBSERVAÇÕES DA COMISSÃO:', 18, currentY + 6);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(session.coachNotes, 172);
    doc.text(splitNotes, 18, currentY + 10.5);

    currentY += 18;
  }

  // Exercises Section
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 20, 38);
  doc.text('ESTRUTURA METODOLÓGICA & EXERCÍCIOS ESPECÍFICOS', 14, currentY + 4);
  currentY += 7;

  session.exercises.forEach((ex, idx) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    const cardHeight = 36 + (ex.coachingPoints.length * 4.5);

    // Exercise Card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, currentY, 182, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, 182, cardHeight, 2, 2, 'S');

    // Left accent strip
    doc.setFillColor(ex.type === 'Aquecimento' ? 22 : ex.type === 'Parte Principal' ? 99 : 217, ex.type === 'Aquecimento' ? 101 : ex.type === 'Parte Principal' ? 20 : 119, ex.type === 'Aquecimento' ? 52 : ex.type === 'Parte Principal' ? 38 : 6);
    doc.rect(14, currentY, 3, cardHeight, 'F');

    // Badge: Phase
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, currentY + 4, 30, 6, 1, 1, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(ex.type.toUpperCase(), 35, currentY + 8, { align: 'center' });

    // Duration Badge
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(53, currentY + 4, 16, 6, 1, 1, 'F');
    doc.setTextColor(153, 27, 27);
    doc.text(`${ex.durationMinutes} min`, 61, currentY + 8, { align: 'center' });

    // Exercise Title
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`${idx + 1}. ${ex.name}`, 73, currentY + 8.5);

    // Focus
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 20, 38);
    doc.text('Foco Técnico:', 20, currentY + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(ex.focus, 42, currentY + 15);

    // Description
    doc.setFontSize(7.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const descLines = doc.splitTextToSize(ex.description, 170);
    doc.text(descLines, 20, currentY + 20);

    // Coaching Points Checklist
    let cpY = currentY + 28;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('PONTOS-CHAVE DE CORREÇÃO (COACHING POINTS):', 20, cpY);

    ex.coachingPoints.forEach((point) => {
      cpY += 4.5;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${point}`, 23, cpY);
    });

    currentY += cardHeight + 5;
  });

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('C.A. Juventus SAF Sub-20 • Departamento de Preparação de Goleiros • Documento Técnico Oficial', 14, 290);

  const cleanCode = session.code.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Plano_Treino_${cleanCode}_Juventus_Sub20.pdf`);
}




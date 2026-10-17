import { jsPDF } from 'jspdf';
import { TrainingSession, Player, GoalkeeperPeriodizationDay } from '../types';

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


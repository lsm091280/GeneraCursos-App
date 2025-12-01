
import { Course } from "../types";

const getCommonStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap');
  body { background-color: #fff; color: #1e293b; font-family: 'Montserrat', sans-serif; padding: 0; margin: 0; line-height: 1.6; text-align: justify; }
  .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; text-align: center; padding: 20px; page-break-after: always; }
  .cover h1 { font-size: 3.5rem; margin-bottom: 20px; text-transform: uppercase; background: linear-gradient(90deg, #22d3ee, #c084fc); -webkit-background-clip: text; color: transparent; background-clip: text; }
  .cover p { font-size: 1.5rem; color: #94a3b8; }
  .container { max-width: 900px; margin: 0 auto; padding: 40px; }
  .chapter-title { font-size: 2.2rem; color: #0f172a; border-bottom: 3px solid #22d3ee; padding-bottom: 10px; margin-top: 60px; margin-bottom: 30px; page-break-before: always; text-align: left; }
  .section { margin-bottom: 50px; page-break-inside: avoid; }
  .section-title { font-size: 1.6rem; color: #3b82f6; margin-bottom: 15px; margin-top: 30px; text-align: left; }
  .content-img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; }
  .quiz-block { background: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 5px solid #22d3ee; page-break-inside: avoid; }
  .chapter-quiz-block { background: #f0fdf4; padding: 25px; border-radius: 8px; margin-top: 40px; border: 2px solid #22c55e; page-break-before: always; }
  .summary-block { background: #eff6ff; padding: 40px; margin-top: 60px; border-top: 8px solid #3b82f6; page-break-before: always; }
  .resources-block { background: #fff7ed; padding: 40px; margin-top: 60px; border-top: 8px solid #f97316; page-break-before: always; }
  .footer { text-align: center; padding: 20px; background: #f1f5f9; color: #64748b; margin-top: 80px; font-size: 0.8rem; }
  ul { padding-left: 20px; list-style: none; }
  li { margin-bottom: 8px; position: relative; padding-left: 20px; text-align: justify; }
  li::before { content: '➤'; color: #3b82f6; position: absolute; left: 0; font-size: 0.8em; }
  blockquote { border-left: 4px solid #8b5cf6; background: #f1f5f9; padding: 10px 20px; margin: 20px 0; font-style: italic; color: #475569; text-align: justify; }
  strong { color: #0369a1; }
  p { text-align: justify; margin-bottom: 1em; }
`;

const buildCourseHtmlContent = (course: Course) => {
  const chaptersHtml = course.chapters.map(chapter => `
    <h2 class="chapter-title">Capítulo ${chapter.id}: ${chapter.title}</h2>
    <p style="font-size: 1.1em; font-style: italic; color: #64748b; margin-bottom: 30px; text-align: justify;">${chapter.description}</p>
    
    ${chapter.sections.map(sec => `
      <div class="section">
        <h3 class="section-title">${sec.id} ${sec.title}</h3>
        ${sec.imageUrl ? `<img src="${sec.imageUrl}" class="content-img" alt="${sec.title}" />` : ''}
        <div class="content">${sec.content || '<p><em>Contenido pendiente de generación.</em></p>'}</div>
        
        ${sec.quiz ? `
           <div class="quiz-block">
             <h4 style="margin: 0 0 10px 0; color: #0f172a;">⚡ Test Rápido: ${sec.title}</h4>
             ${sec.quiz.map((q, i) => `
                <div style="margin-bottom: 10px; font-size: 0.9em;">
                  <strong>${i+1}. ${q.question}</strong><br/>
                  <span style="color: #16a34a;">Respuesta correcta: ${q.options[q.correctAnswer]}</span>
                </div>
             `).join('')}
           </div>
        ` : ''}
      </div>
    `).join('')}

    ${chapter.quiz ? `
      <div class="chapter-quiz-block">
        <h3 style="color: #15803d; margin-top:0;">📝 Examen del Capítulo ${chapter.id} (20 Preguntas)</h3>
        ${chapter.quiz.map((q, i) => `
          <div style="margin-bottom: 15px;">
            <p><strong>${i+1}. ${q.question}</strong></p>
            <ul style="list-style-type: none; padding: 0;">
              ${q.options.map((opt, oi) => `
                <li style="padding-left: 0; ${oi === q.correctAnswer ? 'color: #16a34a; font-weight: bold;' : ''}">
                  ${oi === q.correctAnswer ? '✓' : '○'} ${opt}
                </li>
              `).join('')}
            </ul>
            <p style="font-size: 0.9em; color: #475569;"><em>💡 ${q.explanation}</em></p>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `).join('');

  return `
      <div class="cover">
        <h1>${course.title}</h1>
        <p>Dirigido a: ${course.targetAudience}</p>
        <p style="margin-top: 40px; font-size: 1rem;">Generado por GeneraCursos AI</p>
      </div>
      <div class="container">
        ${chaptersHtml}
        
        ${course.globalSummary ? `
           <div class="summary-block">
             <h2 style="color: #1e40af; margin-top: 0;">📜 Resumen Final y Clausura</h2>
             <div class="content">${course.globalSummary}</div>
           </div>
        ` : ''}

        ${course.resources ? `
           <div class="resources-block">
             <h2 style="color: #ea580c; margin-top: 0;">📚 Recursos y Bibliografía</h2>
             <div class="content">${course.resources}</div>
           </div>
        ` : ''}
      </div>
      <div class="footer">
        GeneraCursos © 2025 - Contenido generado por IA
      </div>
  `;
};

// Option 1: Download as interactive HTML file
export const generateFullCourseHTML = (course: Course) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${course.title}</title>
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      ${buildCourseHtmlContent(course)}
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${course.title.replace(/\s+/g, '_').toLowerCase()}_web.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Option 2: Print as PDF (Triggers browser print dialog)
export const printCourseAsPDF = (course: Course) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Por favor, permite las ventanas emergentes para descargar el PDF.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${course.title} - PDF Export</title>
      <style>
        ${getCommonStyles()}
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .cover { height: 100vh; margin: 0; padding: 0; }
        }
      </style>
    </head>
    <body>
      ${buildCourseHtmlContent(course)}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 1000); // Allow images to load slightly
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

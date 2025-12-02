
import { Course, Chapter, Section, QuizQuestion } from "../types";

// --- CSS COMÚN Y ESTILOS DE PDF ---
const getPdfStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap');
  body { background-color: #fff; color: #1e293b; font-family: 'Montserrat', sans-serif; padding: 0; margin: 0; line-height: 1.6; text-align: justify; }
  .cover { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #fff; color: #0f172a; text-align: center; padding: 20px; page-break-after: always; border: 20px solid #f1f5f9; }
  .cover h1 { font-size: 3.5rem; margin-bottom: 20px; text-transform: uppercase; color: #0f172a; }
  .cover p { font-size: 1.5rem; color: #64748b; }
  .container { max-width: 900px; margin: 0 auto; padding: 40px; }
  
  /* Typos */
  h2.chapter-title { font-size: 2.2rem; color: #0f172a; border-bottom: 4px solid #22d3ee; padding-bottom: 10px; margin-top: 60px; margin-bottom: 30px; page-break-before: always; text-align: left; }
  h3.section-title { font-size: 1.6rem; color: #3b82f6; margin-bottom: 15px; margin-top: 40px; text-align: left; }
  h4 { margin-top: 0; }
  
  /* Content */
  .section { margin-bottom: 50px; page-break-inside: avoid; }
  .content-img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; }
  
  /* Text Formatting */
  ul { padding-left: 20px; list-style: none; }
  li { margin-bottom: 8px; position: relative; padding-left: 20px; text-align: justify; }
  li::before { content: '➤'; color: #3b82f6; position: absolute; left: 0; font-size: 0.8em; }
  p { text-align: justify; margin-bottom: 1em; }
  blockquote { border-left: 4px solid #8b5cf6; background: #f8fafc; padding: 10px 20px; margin: 20px 0; font-style: italic; color: #475569; }

  /* Quiz PDF Styles */
  .quiz-container { border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 30px; background-color: #f8fafc; page-break-inside: avoid; }
  .quiz-header { font-weight: bold; font-size: 1.2rem; margin-bottom: 15px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; }
  .quiz-question { margin-bottom: 15px; }
  .quiz-question strong { display: block; margin-bottom: 5px; color: #334155; }
  .quiz-options { margin-left: 15px; list-style-type: none; padding: 0; }
  .quiz-options li::before { content: '☐'; margin-right: 8px; color: #94a3b8; }
  
  .answer-key { margin-top: 20px; padding-top: 15px; border-top: 2px dashed #94a3b8; }
  .answer-key h4 { color: #16a34a; margin-bottom: 10px; }
  .key-item { font-size: 0.9em; margin-bottom: 5px; color: #475569; }
  .key-item strong { color: #0f172a; }

  /* Blocks */
  .summary-block { background: #eff6ff; padding: 40px; margin-top: 60px; border-top: 8px solid #3b82f6; page-break-before: always; }
  .resources-block { background: #fff7ed; padding: 40px; margin-top: 60px; border-top: 8px solid #f97316; page-break-before: always; }
  
  @media print {
     body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
     .no-print { display: none; }
  }
`;

// --- PDF GENERATOR LOGIC ---
const buildPdfHtml = (course: Course) => {
  const renderQuizPdf = (questions: QuizQuestion[], title: string) => `
    <div class="quiz-container">
      <div class="quiz-header">${title}</div>
      <!-- Questions Part -->
      ${questions.map((q, i) => `
        <div class="quiz-question">
          <strong>${i + 1}. ${q.question}</strong>
          <ul class="quiz-options">
            ${q.options.map(opt => `<li>${opt}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
      
      <!-- Answer Key Part (Separate Block) -->
      <div class="answer-key">
        <h4>🗝️ Solucionario</h4>
        ${questions.map((q, i) => `
          <div class="key-item">
            <strong>${i + 1}. Respuesta:</strong> ${q.options[q.correctAnswer]} <br/>
            <em>Explicación: ${q.explanation}</em>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const chaptersHtml = course.chapters.map(chapter => `
    <h2 class="chapter-title">Capítulo ${chapter.id}: ${chapter.title}</h2>
    <p style="font-size: 1.1em; font-style: italic; color: #64748b; margin-bottom: 30px;">${chapter.description}</p>
    
    ${chapter.sections.map(sec => `
      <div class="section">
        <h3 class="section-title">${sec.id} ${sec.title}</h3>
        ${sec.imageUrl ? `<img src="${sec.imageUrl}" class="content-img" alt="Imagen del apartado" />` : ''}
        <div class="content">${sec.content || '<p><em>Contenido no generado.</em></p>'}</div>
        
        ${sec.quiz ? renderQuizPdf(sec.quiz, `Test Rápido: ${sec.title}`) : ''}
      </div>
    `).join('')}

    ${chapter.quiz ? renderQuizPdf(chapter.quiz, `Examen del Capítulo ${chapter.id} (20 Preguntas)`) : ''}
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${course.title} - PDF</title>
      <style>${getPdfStyles()}</style>
    </head>
    <body>
      <div class="cover">
        <h1>${course.title}</h1>
        <p>Dirigido a: ${course.targetAudience}</p>
        <p style="margin-top: 50px; font-size: 1rem; color: #94a3b8;">Generado por GeneraCursos AI</p>
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
      <script>
        window.onload = function() { setTimeout(function() { window.print(); }, 1500); };
      </script>
    </body>
    </html>
  `;
};

// --- INTERACTIVE HTML GENERATOR LOGIC ---
const buildInteractiveHtml = (course: Course) => {
  // Serialize course data to inject into script
  const courseData = JSON.stringify(course).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${course.title} - Interactivo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Montserrat', 'sans-serif'] },
          colors: { background: '#0f172a', card: '#1e293b', fluor: '#22d3ee' }
        }
      }
    }
  </script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; overflow: hidden; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    .prose p, .prose li { text-align: justify; margin-bottom: 1em; line-height: 1.8; }
    .prose h3 {
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      font-weight: 900; font-size: 1.5em; margin: 2em 0 1em 0;
    }
    .prose blockquote { border-left: 4px solid #22d3ee; background: rgba(30,41,59,0.5); padding: 1.5em; border-radius: 0 12px 12px 0; margin: 2em 0; color: #94a3b8; }
    .prose li::before { content: '➤'; color: #22d3ee; margin-right: 8px; }
    .active-nav { background-color: #334155; color: white; border-left: 3px solid #22d3ee; }
    .quiz-option { transition: all 0.2s; border: 1px solid #334155; padding: 12px; border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: block; width: 100%; text-align: left; }
    .quiz-option:hover { background-color: #1e293b; border-color: #22d3ee; }
    .quiz-option.selected { border-color: #22d3ee; background-color: rgba(34, 211, 238, 0.1); color: #22d3ee; font-weight: bold; }
    .quiz-option.correct { border-color: #22c55e; background-color: rgba(34, 197, 94, 0.2); color: #86efac; }
    .quiz-option.wrong { border-color: #ef4444; background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .hidden { display: none; }
  </style>
</head>
<body class="flex h-screen">

  <!-- SIDEBAR -->
  <aside class="w-80 bg-card border-r border-slate-700 flex flex-col flex-shrink-0 z-20">
    <div class="p-4 border-b border-slate-700">
      <h1 class="font-bold text-white text-sm mb-1 truncate" title="${course.title}">${course.title}</h1>
      <div class="w-full bg-slate-900 rounded-full h-2 mt-2 overflow-hidden">
        <div id="progress-bar" class="bg-fluor h-full transition-all duration-500" style="width: 0%"></div>
      </div>
      <p id="progress-text" class="text-[10px] text-fluor text-right mt-1">0% Completado</p>
    </div>
    <div id="sidebar-content" class="flex-1 overflow-y-auto p-2 space-y-1">
      <!-- Generated via JS -->
    </div>
    <div class="p-4 border-t border-slate-700 text-[10px] text-slate-500 text-center">
      Generado por GeneraCursos AI
    </div>
  </aside>

  <!-- MAIN CONTENT -->
  <main class="flex-1 overflow-y-auto bg-background p-8 md:p-12 relative" id="main-scroll">
    <div id="main-content" class="max-w-4xl mx-auto pb-20">
      <!-- Dynamic Content -->
    </div>
  </main>

  <script>
    // --- DATA & STATE ---
    const course = ${courseData};
    const STORAGE_KEY = 'offline_course_' + course.title.replace(/\\s/g, '_') + '_v1';
    
    // State stored in localStorage
    let state = {
      completedSections: [], // IDs like "1.1"
      completedQuizzes: [], // IDs like "quiz_1.1" or "quiz_ch_1"
      currentView: { type: 'cover' } // { type: 'content'|'quiz', chIdx, secIdx }
    };

    // --- INIT ---
    function init() {
      // Load State
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { state = { ...state, ...JSON.parse(saved) }; } catch(e) {}
      }

      renderSidebar();
      updateProgress();
      
      // Route to view
      if (state.currentView.type === 'cover') {
        renderCover();
      } else if (state.currentView.type === 'content') {
        renderContent(state.currentView.chIdx, state.currentView.secIdx);
      } else if (state.currentView.type === 'quiz') {
        renderSectionQuiz(state.currentView.chIdx, state.currentView.secIdx);
      } else if (state.currentView.type === 'chapter-quiz') {
        renderChapterQuiz(state.currentView.chIdx);
      } else if (state.currentView.type === 'summary') {
        renderSummary();
      } else if (state.currentView.type === 'resources') {
        renderResources();
      }
    }

    function saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateProgress();
    }

    function updateProgress() {
      // Calc logic similar to React app
      let total = 2; // Summary + Resources
      let completed = 0;
      if (state.completedSections.includes('summary')) completed++;
      if (state.completedSections.includes('resources')) completed++;

      course.chapters.forEach(ch => {
        total++; // Ch Quiz
        if (state.completedQuizzes.includes('quiz_ch_'+ch.id)) completed++;
        ch.sections.forEach(sec => {
          total+=2; // Content + Quiz
          if (state.completedSections.includes(sec.id)) completed++;
          if (state.completedQuizzes.includes('quiz_'+sec.id)) completed++;
        });
      });
      
      const pct = Math.round((completed / total) * 100);
      document.getElementById('progress-bar').style.width = pct + '%';
      document.getElementById('progress-text').textContent = pct + '% Completado';
    }

    // --- RENDERERS ---

    function renderSidebar() {
      const container = document.getElementById('sidebar-content');
      container.innerHTML = '';

      course.chapters.forEach((ch, chIdx) => {
        // Chapter Header
        const chBtn = document.createElement('button');
        chBtn.className = "w-full text-left px-3 py-2 rounded text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 flex justify-between";
        chBtn.innerHTML = \`<span>\${ch.id}. \${ch.title}</span> <i class="fas fa-chevron-down text-xs"></i>\`;
        chBtn.onclick = () => {
           // Toggle Logic could go here, for now open section 1
           renderContent(chIdx, 0);
        };
        container.appendChild(chBtn);

        // Sections Container
        const secDiv = document.createElement('div');
        secDiv.className = "ml-3 pl-3 border-l border-slate-700 mt-1 mb-2 space-y-1";
        
        ch.sections.forEach((sec, secIdx) => {
          const btn = document.createElement('button');
          const isDone = state.completedSections.includes(sec.id);
          const isActive = state.currentView.type === 'content' && state.currentView.secIdx === secIdx && state.currentView.chIdx === chIdx;
          
          btn.className = \`w-full text-left px-3 py-1.5 text-xs rounded transition-all flex items-center gap-2 \${isActive ? 'bg-fluor/20 text-fluor font-bold' : 'text-slate-500 hover:text-slate-300'}\`;
          btn.innerHTML = \`<i class="fas \${isDone ? 'fa-check-circle text-green-500' : 'fa-circle text-[6px]'}"></i> \${sec.title}\`;
          btn.onclick = () => renderContent(chIdx, secIdx);
          secDiv.appendChild(btn);
        });

        // Chapter Quiz Button
        const quizBtn = document.createElement('button');
        const isQuizDone = state.completedQuizzes.includes('quiz_ch_'+ch.id);
        const isQuizActive = state.currentView.type === 'chapter-quiz' && state.currentView.chIdx === chIdx;
        
        quizBtn.className = \`w-full text-left px-3 py-1.5 text-xs rounded transition-all flex items-center gap-2 \${isQuizActive ? 'bg-purple-500/20 text-purple-400 font-bold' : 'text-slate-500 hover:text-purple-300'}\`;
        quizBtn.innerHTML = \`<i class="fas \${isQuizDone ? 'fa-check-square text-purple-500' : 'fa-square'}"></i> Examen Capítulo \${ch.id}\`;
        quizBtn.onclick = () => renderChapterQuiz(chIdx);
        secDiv.appendChild(quizBtn);

        container.appendChild(secDiv);
      });

      // Bottom Links
      const extraDiv = document.createElement('div');
      extraDiv.className = "mt-4 pt-4 border-t border-slate-700 space-y-1";
      extraDiv.innerHTML = \`
        <button onclick="renderSummary()" class="w-full text-left px-3 py-2 text-sm font-bold text-slate-400 hover:text-white flex gap-2 items-center"><i class="fas fa-scroll"></i> Resumen Final</button>
        <button onclick="renderResources()" class="w-full text-left px-3 py-2 text-sm font-bold text-slate-400 hover:text-white flex gap-2 items-center"><i class="fas fa-book"></i> Recursos</button>
      \`;
      container.appendChild(extraDiv);
    }

    function renderCover() {
      const main = document.getElementById('main-content');
      main.innerHTML = \`
        <div class="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
          <h1 class="text-5xl font-black text-white mb-4">\${course.title}</h1>
          <p class="text-xl text-fluor mb-8">\${course.targetAudience}</p>
          <button onclick="renderContent(0,0)" class="bg-fluor text-slate-900 px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white transition-all">
             Comenzar Curso <i class="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      \`;
      state.currentView = { type: 'cover' };
      saveState();
    }

    function renderContent(chIdx, secIdx) {
      state.currentView = { type: 'content', chIdx, secIdx };
      saveState();
      renderSidebar(); // Update active highlight

      const ch = course.chapters[chIdx];
      const sec = ch.sections[secIdx];
      const main = document.getElementById('main-content');

      // Mark as read immediately when viewed
      if (!state.completedSections.includes(sec.id)) {
        state.completedSections.push(sec.id);
        saveState();
        renderSidebar(); // Update checkmark
      }

      main.innerHTML = \`
        <div class="fade-in">
          <div class="mb-6 border-b border-slate-700 pb-4">
             <span class="text-fluor text-xs font-bold uppercase">Capítulo \${ch.id}</span>
             <h2 class="text-3xl font-black text-white mt-1">\${sec.title}</h2>
          </div>
          \${sec.imageUrl ? \`<img src="\${sec.imageUrl}" class="w-full rounded-xl border border-slate-700 shadow-lg mb-8" />\` : ''}
          <div class="prose prose-invert prose-lg max-w-none text-justify">
             \${sec.content}
          </div>
          <div class="mt-12 flex justify-end">
             <button onclick="renderSectionQuiz(\${chIdx}, \${secIdx})" class="bg-slate-700 hover:bg-fluor hover:text-slate-900 text-white px-6 py-3 rounded-full font-bold transition-all">
                Realizar Test <i class="fas fa-clipboard-check ml-2"></i>
             </button>
          </div>
        </div>
      \`;
      document.getElementById('main-scroll').scrollTop = 0;
    }

    function renderSectionQuiz(chIdx, secIdx) {
      state.currentView = { type: 'quiz', chIdx, secIdx };
      saveState();
      renderSidebar();

      const sec = course.chapters[chIdx].sections[secIdx];
      renderQuizUI(sec.quiz, "Test de Apartado: " + sec.title, 'quiz_'+sec.id, () => {
         // On Success
         if (secIdx < course.chapters[chIdx].sections.length - 1) {
            renderContent(chIdx, secIdx + 1);
         } else {
            renderChapterQuiz(chIdx);
         }
      });
    }

    function renderChapterQuiz(chIdx) {
      state.currentView = { type: 'chapter-quiz', chIdx };
      saveState();
      renderSidebar();
      
      const ch = course.chapters[chIdx];
      renderQuizUI(ch.quiz, "Examen Maestro: Capítulo " + ch.id, 'quiz_ch_'+ch.id, () => {
         if (chIdx < course.chapters.length - 1) {
            renderContent(chIdx + 1, 0);
         } else {
            renderSummary();
         }
      });
    }

    // Generic Quiz Engine
    function renderQuizUI(questions, title, quizId, onNext) {
      const main = document.getElementById('main-content');
      if (!questions || questions.length === 0) {
        main.innerHTML = '<p class="text-center text-slate-500">No hay preguntas disponibles.</p>';
        return;
      }

      // Render Questions
      let html = \`
        <div class="max-w-3xl mx-auto bg-card border border-slate-700 p-8 rounded-2xl shadow-xl">
          <h2 class="text-2xl font-bold text-white mb-6 text-center">\${title}</h2>
          <div id="quiz-form" class="space-y-8">
      \`;

      questions.forEach((q, idx) => {
         html += \`
           <div class="question-block" data-idx="\${idx}">
              <p class="font-bold text-white mb-3"><span class="text-fluor">#\${idx+1}</span> \${q.question}</p>
              <div class="space-y-2">
                 \${q.options.map((opt, optIdx) => \`
                    <button class="quiz-option" onclick="selectOption(\${idx}, \${optIdx})">\${opt}</button>
                 \`).join('')}
              </div>
              <div class="explanation hidden mt-3 p-3 bg-slate-800 rounded text-sm text-slate-300">
                 \${q.explanation}
              </div>
           </div>
         \`;
      });

      html += \`
          </div>
          <div class="mt-8 pt-6 border-t border-slate-700 text-center">
             <button id="btn-check" onclick="checkAnswers()" class="bg-fluor text-slate-900 px-8 py-3 rounded-full font-bold uppercase">Corregir</button>
             <button id="btn-next" onclick="nextStep()" class="hidden bg-green-500 text-white px-8 py-3 rounded-full font-bold uppercase">Continuar <i class="fas fa-arrow-right"></i></button>
          </div>
        </div>
      \`;
      
      main.innerHTML = html;
      document.getElementById('main-scroll').scrollTop = 0;

      // Attach internal logic to window for buttons
      window.userAnswers = new Array(questions.length).fill(-1);
      
      window.selectOption = (qIdx, optIdx) => {
         if (window.quizSubmitted) return;
         window.userAnswers[qIdx] = optIdx;
         const block = document.querySelector(\`.question-block[data-idx="\${qIdx}"]\`);
         block.querySelectorAll('.quiz-option').forEach((btn, i) => {
            if (i === optIdx) btn.classList.add('selected');
            else btn.classList.remove('selected');
         });
      };

      window.checkAnswers = () => {
         if (window.userAnswers.includes(-1)) { alert("Por favor responde todas las preguntas."); return; }
         window.quizSubmitted = true;
         let score = 0;
         
         questions.forEach((q, idx) => {
            const userAns = window.userAnswers[idx];
            if (userAns === q.correctAnswer) score++;
            
            const block = document.querySelector(\`.question-block[data-idx="\${idx}"]\`);
            block.querySelector('.explanation').classList.remove('hidden');
            
            const opts = block.querySelectorAll('.quiz-option');
            opts[userAns].classList.remove('selected');
            if (userAns === q.correctAnswer) {
               opts[userAns].classList.add('correct');
            } else {
               opts[userAns].classList.add('wrong');
               opts[q.correctAnswer].classList.add('correct');
            }
         });

         document.getElementById('btn-check').classList.add('hidden');
         const passed = score >= (questions.length * 0.6);
         
         if (passed) {
            // Save state
            if (!state.completedQuizzes.includes(quizId)) {
               state.completedQuizzes.push(quizId);
               saveState();
               renderSidebar();
            }
            document.getElementById('btn-next').classList.remove('hidden');
         } else {
             const btn = document.getElementById('btn-check');
             btn.innerText = "Repetir Test (Suspendido: " + score + "/" + questions.length + ")";
             btn.classList.remove('hidden');
             btn.onclick = () => {
                window.quizSubmitted = false;
                window.userAnswers.fill(-1);
                renderQuizUI(questions, title, quizId, onNext); // Reload
             };
         }
      };

      window.nextStep = onNext;
    }

    function renderSummary() {
      state.currentView = { type: 'summary' };
      if (!state.completedSections.includes('summary')) { state.completedSections.push('summary'); saveState(); renderSidebar(); }
      
      const main = document.getElementById('main-content');
      main.innerHTML = \`
         <div class="max-w-3xl mx-auto text-center">
            <h1 class="text-4xl font-bold text-white mb-6">Resumen Final</h1>
            <div class="bg-card border border-blue-500/30 p-8 rounded-2xl text-justify prose prose-invert">
               \${course.globalSummary}
            </div>
            <button onclick="renderResources()" class="mt-8 bg-fluor text-slate-900 px-6 py-2 rounded-full font-bold">Ver Recursos</button>
         </div>
      \`;
    }

    function renderResources() {
      state.currentView = { type: 'resources' };
      if (!state.completedSections.includes('resources')) { state.completedSections.push('resources'); saveState(); renderSidebar(); }
      
      const main = document.getElementById('main-content');
      main.innerHTML = \`
         <div class="max-w-3xl mx-auto text-center">
            <h1 class="text-4xl font-bold text-white mb-6">Recursos y Bibliografía</h1>
            <div class="bg-card border border-orange-500/30 p-8 rounded-2xl text-justify prose prose-invert">
               \${course.resources}
            </div>
         </div>
      \`;
    }

    // Start
    init();
  </script>
</body>
</html>`;
};

// 1. PDF PRINT EXPORT
export const printCourseAsPDF = (course: Course) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Permite ventanas emergentes para imprimir.");
    return;
  }
  printWindow.document.write(buildPdfHtml(course));
  printWindow.document.close();
};

// 2. INTERACTIVE HTML EXPORT
export const generateFullCourseHTML = (course: Course) => {
  const html = buildInteractiveHtml(course);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${course.title.replace(/\s+/g, '_').toLowerCase()}_app.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

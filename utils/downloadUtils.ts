
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
  .content-img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; display: block; }
  
  /* Text Formatting */
  ul { padding-left: 20px; list-style: none; }
  li { margin-bottom: 8px; position: relative; padding-left: 20px; text-align: justify; }
  li::before { content: '➤'; color: #3b82f6; position: absolute; left: 0; font-size: 0.8em; }
  p { text-align: justify; margin-bottom: 1em; }
  blockquote { border-left: 4px solid #8b5cf6; background: #f8fafc; padding: 10px 20px; margin: 20px 0; font-style: italic; color: #475569; page-break-inside: avoid; }

  /* Quiz PDF Styles */
  .quiz-section { margin-top: 40px; page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .quiz-header { background: #f1f5f9; padding: 15px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 1.1em; }
  
  .quiz-questions-block { padding: 20px; background: #fff; }
  .q-item { margin-bottom: 20px; }
  .q-text { font-weight: bold; margin-bottom: 8px; display: block; color: #334155; }
  .q-options { padding-left: 0; list-style: none; }
  .q-options li { padding-left: 25px; margin-bottom: 4px; color: #475569; }
  .q-options li::before { content: '☐'; font-size: 1.2em; left: 0; color: #cbd5e1; } /* Checkbox style */

  .quiz-answers-block { padding: 20px; background: #f8fafc; border-top: 2px dashed #cbd5e1; }
  .answers-title { font-weight: bold; color: #16a34a; margin-bottom: 10px; display: block; text-transform: uppercase; font-size: 0.9em; }
  .a-item { margin-bottom: 8px; font-size: 0.9em; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
  .a-item:last-child { border-bottom: none; }
  .a-correct { color: #0f172a; font-weight: bold; }
  .a-explanation { display: block; color: #64748b; font-style: italic; margin-top: 2px; }

  /* Blocks */
  .summary-block { background: #eff6ff; padding: 40px; margin-top: 60px; border-top: 8px solid #3b82f6; page-break-before: always; }
  .resources-block { background: #fff7ed; padding: 40px; margin-top: 60px; border-top: 8px solid #f97316; page-break-before: always; }
  
  @media print {
     body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
     .page-break { page-break-after: always; }
  }
`;

// --- PDF GENERATOR LOGIC ---
const buildPdfHtml = (course: Course) => {
  const renderQuizPdf = (questions: QuizQuestion[], title: string) => `
    <div class="quiz-section">
      <div class="quiz-header">📝 ${title}</div>
      
      <!-- 1. BLOQUE DE PREGUNTAS (Para rellenar) -->
      <div class="quiz-questions-block">
        ${questions.map((q, i) => `
          <div class="q-item">
            <span class="q-text">${i + 1}. ${q.question}</span>
            <ul class="q-options">
              ${q.options.map(opt => `<li>${opt}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <!-- 2. BLOQUE DE SOLUCIONARIO (Separado) -->
      <div class="quiz-answers-block">
        <span class="answers-title">🗝️ Clave de Respuestas</span>
        ${questions.map((q, i) => `
          <div class="a-item">
            <strong>${i + 1}.</strong> <span class="a-correct">${q.options[q.correctAnswer]}</span><br/>
            <span class="a-explanation">${q.explanation}</span>
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
        ${sec.imageUrl ? `<img src="${sec.imageUrl}" class="content-img" alt="Imagen didáctica" />` : ''}
        <div class="content">${sec.content || '<p><em>Contenido no generado.</em></p>'}</div>
        
        ${sec.quiz ? renderQuizPdf(sec.quiz, `Test de Apartado: ${sec.title}`) : ''}
      </div>
    `).join('')}

    ${chapter.quiz ? renderQuizPdf(chapter.quiz, `EXAMEN GLOBAL: Capítulo ${chapter.id}`) : ''}
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${course.title} - Libro del Curso</title>
      <style>${getPdfStyles()}</style>
    </head>
    <body>
      <div class="cover">
        <h1>${course.title}</h1>
        <p>Dirigido a: ${course.targetAudience}</p>
        <div style="margin-top: 100px; padding: 20px; border: 1px solid #e2e8f0; display: inline-block;">
           <strong>Generado por GeneraCursos AI</strong><br/>
           <span style="font-size: 0.8em; color: #94a3b8;">${new Date().toLocaleDateString()}</span>
        </div>
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
        window.onload = function() { 
          // Auto-print prompt
          setTimeout(function() { window.print(); }, 1000); 
        };
      </script>
    </body>
    </html>
  `;
};

// --- INTERACTIVE HTML GENERATOR LOGIC ---
const buildInteractiveHtml = (course: Course) => {
  // Serialize course data safely
  const courseData = JSON.stringify(course).replace(/<\/script>/g, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${course.title} - Curso Interactivo</title>
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
    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }

    /* Typography */
    .prose p, .prose li { text-align: justify !important; margin-bottom: 1em; line-height: 1.8; }
    .prose h3 {
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      font-weight: 900; font-size: 1.5em; margin: 2em 0 1em 0;
    }
    .prose blockquote { border-left: 4px solid #22d3ee; background: rgba(30,41,59,0.5); padding: 1.5em; border-radius: 0 12px 12px 0; margin: 2em 0; color: #94a3b8; font-style: italic; }
    .prose li::before { content: '➤'; color: #22d3ee; margin-right: 8px; font-weight: bold; }
    
    /* Interactive Elements */
    .nav-btn { text-align: left; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; transition: all 0.2s; display: flex; align-items: center; gap: 8px; width: 100%; }
    .nav-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
    .nav-btn.active { background: rgba(34, 211, 238, 0.15); color: #22d3ee; font-weight: bold; }
    .nav-btn.done i { color: #22c55e; }
    
    .quiz-option { width: 100%; text-align: left; padding: 15px; border: 2px solid #334155; border-radius: 10px; margin-bottom: 10px; transition: all 0.2s; background: transparent; color: #cbd5e1; }
    .quiz-option:hover:not(:disabled) { border-color: #22d3ee; background: rgba(30, 41, 59, 0.8); }
    .quiz-option.selected { border-color: #22d3ee; background: rgba(34, 211, 238, 0.1); color: #22d3ee; font-weight: bold; }
    .quiz-option.correct { border-color: #22c55e; background: rgba(34, 197, 94, 0.2); color: #86efac; }
    .quiz-option.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    
    .img-container { width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 30px; background: #000; }
    .img-content { width: 100%; height: auto; display: block; object-fit: cover; }
    
    .fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body class="flex h-screen text-sm md:text-base">

  <!-- MOBILE HEADER -->
  <div class="md:hidden fixed top-0 w-full bg-card border-b border-slate-700 z-50 p-4 flex justify-between items-center">
    <span class="font-bold text-white truncate max-w-[200px]">${course.title}</span>
    <button onclick="toggleSidebar()" class="text-fluor"><i class="fas fa-bars fa-lg"></i></button>
  </div>

  <!-- SIDEBAR -->
  <aside id="sidebar" class="fixed inset-y-0 left-0 transform -translate-x-full md:translate-x-0 md:static w-80 bg-card border-r border-slate-800 flex flex-col z-40 transition-transform duration-300">
    <div class="p-4 border-b border-slate-700 pt-20 md:pt-4">
       <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-fluor to-blue-600 flex items-center justify-center text-slate-900 font-black text-xs">GC</div>
          <div>
            <h1 class="font-bold text-white text-sm leading-tight">${course.title}</h1>
            <p class="text-[10px] text-slate-500">Curso Offline Interactivo</p>
          </div>
       </div>
       
       <!-- Progress Bar -->
       <div class="bg-slate-900 rounded-full h-2 w-full overflow-hidden border border-slate-700">
          <div id="progress-bar" class="bg-fluor h-full transition-all duration-500" style="width: 0%"></div>
       </div>
       <p id="progress-text" class="text-right text-[10px] text-fluor font-mono mt-1">0% Completado</p>
    </div>

    <div id="nav-container" class="flex-1 overflow-y-auto p-3 space-y-1">
       <!-- Menu Generated by JS -->
    </div>
    
    <div class="p-3 border-t border-slate-700 text-[10px] text-center text-slate-500 bg-slate-900/50">
       <i class="fas fa-save mr-1"></i> Progreso guardado automáticamente
    </div>
  </aside>

  <!-- CONTENT -->
  <main class="flex-1 h-full overflow-y-auto bg-background relative pt-16 md:pt-0" id="main-scroll">
    <div id="app-content" class="max-w-4xl mx-auto p-6 md:p-12 pb-24 min-h-full">
       <!-- Content Injected by JS -->
    </div>
  </main>

  <script>
    // --- APP ENGINE ---
    const course = ${courseData};
    const STORAGE_KEY = 'gc_offline_' + course.title.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Initial State
    let state = {
      completedIds: [], // Stores IDs of completed sections/quizzes
      currentRoute: { type: 'cover' }
    };

    // --- LOGIC ---
    function init() {
      // Load Memory
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
         try { state = { ...state, ...JSON.parse(saved) }; } catch(e) {}
      }
      
      renderSidebar();
      updateProgress();
      navigate(state.currentRoute, false); // Don't save on initial load
    }

    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateProgress();
      renderSidebar();
    }

    function markComplete(id) {
      if (!state.completedIds.includes(id)) {
        state.completedIds.push(id);
        save();
      }
    }

    function navigate(route, doSave = true) {
      state.currentRoute = route;
      if (doSave) save();
      
      const app = document.getElementById('app-content');
      document.getElementById('main-scroll').scrollTop = 0;
      
      // Close mobile sidebar if open
      if (window.innerWidth < 768) {
         document.getElementById('sidebar').classList.add('-translate-x-full');
      }

      // RENDER ROUTER
      if (route.type === 'cover') renderCover(app);
      else if (route.type === 'content') renderSectionContent(app, route.ch, route.sec);
      else if (route.type === 'quiz') renderSectionQuiz(app, route.ch, route.sec);
      else if (route.type === 'ch-quiz') renderChapterQuiz(app, route.ch);
      else if (route.type === 'summary') renderSummary(app);
      else if (route.type === 'resources') renderResources(app);
      
      renderSidebar(); // Update active states
    }

    function updateProgress() {
       let total = 2; // Summary + Resources
       let done = 0;
       if (state.completedIds.includes('summary')) done++;
       if (state.completedIds.includes('resources')) done++;

       course.chapters.forEach(ch => {
          total++; // Ch Quiz
          if (state.completedIds.includes('q_ch_'+ch.id)) done++;
          ch.sections.forEach(sec => {
             total += 2; // Read + Quiz
             if (state.completedIds.includes('sec_'+sec.id)) done++;
             if (state.completedIds.includes('q_sec_'+sec.id)) done++;
          });
       });
       
       const pct = Math.round((done / total) * 100);
       document.getElementById('progress-bar').style.width = pct + '%';
       document.getElementById('progress-text').textContent = pct + '% Completado';
    }

    // --- RENDERERS ---

    function renderSidebar() {
      const el = document.getElementById('nav-container');
      el.innerHTML = '';
      
      course.chapters.forEach((ch, chIdx) => {
         // Chapter Header
         const det = document.createElement('details');
         det.className = "group";
         // Open detail if active inside
         const isActiveInside = (state.currentRoute.ch === chIdx);
         if (isActiveInside) det.open = true;

         const sum = document.createElement('summary');
         sum.className = "list-none cursor-pointer p-2 rounded hover:bg-slate-800 text-slate-400 font-bold text-sm flex justify-between items-center";
         sum.innerHTML = \`<span>\${ch.id}. \${ch.title}</span> <i class="fas fa-chevron-down text-xs transition-transform group-open:rotate-180"></i>\`;
         det.appendChild(sum);
         
         const div = document.createElement('div');
         div.className = "pl-2 mt-1 space-y-1 border-l border-slate-700 ml-2";
         
         ch.sections.forEach((sec, secIdx) => {
            const btn = document.createElement('button');
            const isRead = state.completedIds.includes('sec_'+sec.id);
            const isActive = (state.currentRoute.type === 'content' && state.currentRoute.sec === secIdx && state.currentRoute.ch === chIdx);
            
            btn.className = \`nav-btn \${isActive ? 'active' : 'text-slate-500'} \${isRead ? 'done' : ''}\`;
            btn.innerHTML = \`<i class="fas \${isRead ? 'fa-check-circle' : 'fa-circle text-[6px]'}"></i> \${sec.title}\`;
            btn.onclick = () => navigate({ type: 'content', ch: chIdx, sec: secIdx });
            div.appendChild(btn);
         });

         // Chapter Quiz
         const qBtn = document.createElement('button');
         const qDone = state.completedIds.includes('q_ch_'+ch.id);
         const qActive = (state.currentRoute.type === 'ch-quiz' && state.currentRoute.ch === chIdx);
         qBtn.className = \`nav-btn \${qActive ? 'text-purple-400 bg-purple-500/10 font-bold' : 'text-slate-500 hover:text-purple-300'} \${qDone ? 'done' : ''}\`;
         qBtn.innerHTML = \`<i class="fas \${qDone ? 'fa-check-square' : 'fa-square'}"></i> Examen Capítulo \${ch.id}\`;
         qBtn.onclick = () => navigate({ type: 'ch-quiz', ch: chIdx });
         div.appendChild(qBtn);

         det.appendChild(div);
         el.appendChild(det);
      });

      // Footer Links
      const extraDiv = document.createElement('div');
      extraDiv.className = "mt-4 pt-4 border-t border-slate-800 space-y-1";
      
      const sumBtn = document.createElement('button');
      sumBtn.className = \`nav-btn \${state.currentRoute.type === 'summary' ? 'active' : 'text-slate-400'}\`;
      sumBtn.innerHTML = '<i class="fas fa-scroll"></i> Resumen Final';
      sumBtn.onclick = () => navigate({ type: 'summary' });
      extraDiv.appendChild(sumBtn);

      const resBtn = document.createElement('button');
      resBtn.className = \`nav-btn \${state.currentRoute.type === 'resources' ? 'active' : 'text-slate-400'}\`;
      resBtn.innerHTML = '<i class="fas fa-book-reader"></i> Recursos';
      resBtn.onclick = () => navigate({ type: 'resources' });
      extraDiv.appendChild(resBtn);
      
      el.appendChild(extraDiv);
    }

    function renderCover(app) {
      app.innerHTML = \`
        <div class="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
           <h1 class="text-4xl md:text-6xl font-black text-white mb-6">\${course.title}</h1>
           <p class="text-xl text-fluor mb-10">\${course.targetAudience}</p>
           <button onclick="navigate({type:'content', ch:0, sec:0})" class="bg-fluor text-slate-900 px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:scale-105 transition-all shadow-lg shadow-fluor/20">
              Comenzar Curso <i class="fas fa-arrow-right ml-2"></i>
           </button>
        </div>
      \`;
    }

    function renderSectionContent(app, chIdx, secIdx) {
       const sec = course.chapters[chIdx].sections[secIdx];
       markComplete('sec_'+sec.id);
       
       app.innerHTML = \`
         <div class="fade-in">
           <div class="mb-8 border-b border-slate-800 pb-4">
              <span class="text-fluor text-xs font-bold uppercase">Capítulo \${course.chapters[chIdx].id}</span>
              <h2 class="text-3xl md:text-4xl font-black text-white mt-2">\${sec.title}</h2>
           </div>
           \${sec.imageUrl ? \`
             <div class="img-container">
               <img src="\${sec.imageUrl}" class="img-content" alt="Imagen didáctica" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'p-8 text-center text-slate-500 bg-slate-900\\'><i class=\\'fas fa-wifi mb-2\\'></i><br>La imagen requiere conexión a internet para cargar.</div>';"/> 
             </div>
           \` : ''}
           <div class="prose prose-invert prose-lg max-w-none text-justify">
              \${sec.content}
           </div>
           <div class="mt-12 flex justify-end">
              <button onclick="navigate({type:'quiz', ch:\${chIdx}, sec:\${secIdx}})" class="bg-slate-700 hover:bg-fluor hover:text-slate-900 text-white px-6 py-3 rounded-full font-bold transition-all">
                 Realizar Test <i class="fas fa-clipboard-check ml-2"></i>
              </button>
           </div>
         </div>
       \`;
    }

    function renderSectionQuiz(app, chIdx, secIdx) {
       const sec = course.chapters[chIdx].sections[secIdx];
       renderQuizEngine(app, sec.quiz, "Test: " + sec.title, 'q_sec_'+sec.id, () => {
          // Next Logic
          if (secIdx < course.chapters[chIdx].sections.length - 1) {
             navigate({ type: 'content', ch: chIdx, sec: secIdx + 1 });
          } else {
             navigate({ type: 'ch-quiz', ch: chIdx });
          }
       });
    }

    function renderChapterQuiz(app, chIdx) {
       const ch = course.chapters[chIdx];
       renderQuizEngine(app, ch.quiz, "Examen Maestro: Capítulo " + ch.id, 'q_ch_'+ch.id, () => {
          if (chIdx < course.chapters.length - 1) {
             navigate({ type: 'content', ch: chIdx + 1, sec: 0 });
          } else {
             navigate({ type: 'summary' });
          }
       });
    }

    function renderSummary(app) {
       markComplete('summary');
       app.innerHTML = \`
         <div class="max-w-3xl mx-auto fade-in">
            <h1 class="text-4xl font-bold text-white mb-6 text-center">Resumen Final</h1>
            <div class="bg-slate-800/50 p-8 rounded-2xl border border-blue-500/30 prose prose-invert max-w-none text-justify">
               \${course.globalSummary}
            </div>
            <div class="text-center mt-8">
               <button onclick="navigate({type:'resources'})" class="bg-fluor text-slate-900 px-6 py-2 rounded-full font-bold">Ver Recursos</button>
            </div>
         </div>
       \`;
    }

    function renderResources(app) {
       markComplete('resources');
       app.innerHTML = \`
         <div class="max-w-3xl mx-auto fade-in">
            <h1 class="text-4xl font-bold text-white mb-6 text-center">Recursos y Bibliografía</h1>
            <div class="bg-slate-800/50 p-8 rounded-2xl border border-orange-500/30 prose prose-invert max-w-none text-justify">
               \${course.resources}
            </div>
         </div>
       \`;
    }

    // --- QUIZ ENGINE (Pure JS) ---
    function renderQuizEngine(container, questions, title, quizId, onNext) {
       if (!questions || !questions.length) {
          container.innerHTML = '<div class="text-center p-10">No hay preguntas disponibles.</div><div class="text-center"><button onclick="'+onNext.toString().replace(/"/g, "'")+'()" class="text-fluor underline">Saltar</button></div>';
          return;
       }

       let html = \`
         <div class="max-w-2xl mx-auto bg-card border border-slate-700 p-8 rounded-2xl shadow-xl fade-in">
           <h2 class="text-xl font-bold text-white mb-6 text-center">\${title}</h2>
           <div id="quiz-area" class="space-y-8">
       \`;
       
       questions.forEach((q, idx) => {
          html += \`
            <div class="q-block" id="q-\${idx}">
               <p class="font-bold text-white mb-3"><span class="text-fluor">#\${idx+1}</span> \${q.question}</p>
               <div class="space-y-2">
                 \${q.options.map((opt, oIdx) => \`
                    <button class="quiz-option" onclick="selOpt(\${idx}, \${oIdx})">\${opt}</button>
                 \`).join('')}
               </div>
               <div class="explanation hidden mt-3 p-3 bg-slate-900 rounded text-xs text-slate-300 border-l-2 border-fluor">\${q.explanation}</div>
            </div>
          \`;
       });

       html += \`
           </div>
           <div class="mt-8 text-center pt-6 border-t border-slate-700">
              <button id="btn-check" onclick="checkAll()" class="bg-fluor text-slate-900 px-8 py-3 rounded-full font-bold uppercase hover:bg-white transition-colors">Corregir</button>
              <button id="btn-next" class="hidden bg-green-500 text-white px-8 py-3 rounded-full font-bold uppercase hover:bg-green-400">Continuar <i class="fas fa-arrow-right"></i></button>
           </div>
         </div>
       \`;
       
       container.innerHTML = html;

       // State Logic attached to Window for HTML event handlers
       window.userAns = new Array(questions.length).fill(-1);
       window.isSub = false;

       window.selOpt = (qIdx, oIdx) => {
          if (window.isSub) return;
          window.userAns[qIdx] = oIdx;
          const block = document.getElementById('q-'+qIdx);
          block.querySelectorAll('.quiz-option').forEach((b, i) => {
             if (i === oIdx) b.classList.add('selected');
             else b.classList.remove('selected');
          });
       };

       window.checkAll = () => {
          if (window.userAns.includes(-1)) { alert('Responde todas las preguntas.'); return; }
          window.isSub = true;
          let score = 0;
          
          questions.forEach((q, idx) => {
             const ans = window.userAns[idx];
             if (ans === q.correctAnswer) score++;
             
             const block = document.getElementById('q-'+idx);
             block.querySelector('.explanation').classList.remove('hidden');
             const btns = block.querySelectorAll('.quiz-option');
             
             btns[ans].classList.remove('selected');
             if (ans === q.correctAnswer) btns[ans].classList.add('correct');
             else {
                btns[ans].classList.add('wrong');
                btns[q.correctAnswer].classList.add('correct');
             }
          });

          const passed = score >= (questions.length * 0.6);
          const btnC = document.getElementById('btn-check');
          const btnN = document.getElementById('btn-next');
          
          btnC.classList.add('hidden');
          
          if (passed) {
             markComplete(quizId);
             btnN.classList.remove('hidden');
             btnN.onclick = onNext;
          } else {
             btnC.innerText = \`Repetir (Nota: \${score}/\${questions.length})\`;
             btnC.classList.remove('hidden');
             btnC.classList.replace('bg-fluor', 'bg-slate-700');
             btnC.classList.replace('text-slate-900', 'text-white');
             btnC.onclick = () => {
                 renderQuizEngine(container, questions, title, quizId, onNext); // Reset
             };
          }
       };
    }

    function toggleSidebar() {
       const sb = document.getElementById('sidebar');
       sb.classList.toggle('-translate-x-full');
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
  a.download = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_app_offline.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

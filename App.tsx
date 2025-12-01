
import React, { useState, useEffect, useRef } from 'react';
import { generateCourseStructure, generateSectionContent, generateSectionQuiz, generateChapterQuiz, generateGlobalSummary, generateResources } from './services/geminiService';
import { Course, AppStep, Chapter, Section, QuizQuestion, DownloadState } from './types';
import { Button } from './components/Button';
import { Footer } from './components/Footer';
import { generateFullCourseHTML, printCourseAsPDF } from './utils/downloadUtils';

// --- SUB-COMPONENTS ---

// 1. CONFIRMATION MODAL
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string; 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-fluor/30 shadow-[0_0_40px_rgba(34,211,238,0.2)] rounded-2xl max-w-md w-full p-6 transform transition-all scale-100">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300 mb-6 text-sm leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="ghost" className="text-xs">Cancelar</Button>
          <Button onClick={onConfirm} variant="danger" className="text-xs">Confirmar Acción</Button>
        </div>
      </div>
    </div>
  );
};

// 2. API KEY SCREEN (New)
const ApiKeyScreen = ({ onSave }: { onSave: (key: string) => void }) => {
  const [keyInput, setKeyInput] = useState('');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full animate-fadeIn px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Configuración Inicial</h1>
        <p className="text-slate-400">Para usar GeneraCursos, necesitas tu propia API Key de Google.</p>
      </div>

      <div className="w-full max-w-lg bg-card p-8 rounded-3xl border border-slate-700 shadow-2xl">
        <ol className="list-decimal pl-5 space-y-3 text-slate-300 text-sm mb-6">
          <li>Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-fluor underline hover:text-white">Google AI Studio</a>.</li>
          <li>Inicia sesión con tu cuenta de Google.</li>
          <li>Pulsa en <strong>"Create API Key"</strong>.</li>
          <li>Copia la clave que empieza por <code>AIza...</code> y pégala abajo.</li>
        </ol>

        <div className="mb-6">
          <label className="block text-fluor text-xs font-bold uppercase tracking-wider mb-2">Tu API Key</label>
          <input 
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:border-fluor focus:outline-none transition-colors font-mono"
          />
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <i className="fas fa-lock"></i> Tu clave se guarda solo en tu navegador.
          </p>
        </div>

        <Button 
          onClick={() => onSave(keyInput)} 
          disabled={keyInput.length < 20} 
          className="w-full py-4"
        >
          Guardar y Comenzar <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </div>
  );
};

const InputScreen = ({ 
  onStart, 
  onResume, 
  onDiscard, 
  restoredCourse, 
  isLoading 
}: { 
  onStart: (t: string, a: string) => void, 
  onResume: () => void,
  onDiscard: () => void,
  restoredCourse: Course | null,
  isLoading: boolean 
}) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [showManual, setShowManual] = useState(false);

  if (restoredCourse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full w-full max-w-2xl mx-auto animate-fadeIn px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">Bienvenido de nuevo</h1>
          <p className="text-slate-400">Tienes un curso pendiente de finalizar.</p>
        </div>

        <div className="w-full bg-card p-8 rounded-3xl border border-fluor/30 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative overflow-hidden">
          <div className="text-center space-y-6">
            <div>
              <p className="text-xs font-bold uppercase text-fluor mb-1">Curso Detectado</p>
              <h2 className="text-2xl font-bold text-white">{restoredCourse.title}</h2>
              <p className="text-slate-500 text-sm mt-1">{restoredCourse.targetAudience}</p>
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={onResume} className="w-full py-4 text-sm" variant="primary">
                <i className="fas fa-play mr-2"></i> Continuar por donde iba
              </Button>
              <Button onClick={onDiscard} className="w-full py-3 text-sm" variant="secondary">
                <i className="fas fa-trash-alt mr-2"></i> Descartar y empezar nuevo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-2xl mx-auto animate-fadeIn px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
          GeneraCursos
        </h1>
        <p className="text-slate-400 text-lg">Tu arquitecto de formación IA</p>
      </div>

      <div className="w-full bg-card p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="space-y-6">
          <div>
            <label className="block text-fluor text-xs font-bold uppercase tracking-wider mb-2">Tema del Curso</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Introducción a la Inteligencia Artificial"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:border-fluor focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-fluor text-xs font-bold uppercase tracking-wider mb-2">Público Objetivo</label>
            <input 
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Ej: Estudiantes de secundaria, Profesionales de marketing..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:border-fluor focus:outline-none transition-colors"
            />
          </div>
          <Button 
            onClick={() => onStart(topic, audience)} 
            disabled={!topic.trim() || !audience.trim()} 
            isLoading={isLoading}
            className="w-full py-4 text-sm"
          >
            Generar Estructura del Curso <i className="fas fa-magic ml-2"></i>
          </Button>
        </div>
      </div>

      {/* COLLAPSIBLE MANUAL */}
      <div className="w-full max-w-2xl pb-10">
        <button 
          onClick={() => setShowManual(!showManual)}
          className="flex items-center justify-center w-full gap-2 text-slate-400 hover:text-fluor transition-colors text-sm font-bold uppercase tracking-wider mb-4"
        >
          <i className={`fas fa-book transition-transform ${showManual ? 'rotate-0' : '-rotate-12'}`}></i> 
          {showManual ? 'Ocultar Manual' : 'Ver Manual de Uso'}
          <i className={`fas fa-chevron-down ml-1 transition-transform ${showManual ? 'rotate-180' : ''}`}></i>
        </button>

        {showManual && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-slideUp shadow-lg">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
              <i className="fas fa-info-circle text-fluor"></i> Cómo funciona la App
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <strong className="text-white">Define el Curso:</strong> Introduce un tema y a quién va dirigido. La IA generará un árbol de 6 capítulos con 5 apartados cada uno.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <strong className="text-white">Navega y Genera:</strong> Usa el menú lateral. Al hacer clic en un apartado, la IA redactará el contenido y creará una imagen al instante.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <strong className="text-white">Evalúate:</strong> Tras leer, realiza el test de 5 preguntas. Al acabar un capítulo, enfréntate al examen de 20 preguntas.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <strong className="text-white">Descarga Total:</strong> Al finalizar (o cuando quieras), descarga el curso en PDF o HTML. Si faltan partes, la app las generará automáticamente antes de descargar.
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                <i className="fas fa-save text-fluor"></i> <strong>Auto-guardado:</strong> Tu progreso se guarda automáticamente en el navegador para que no pierdas nada.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuizComponent = ({ 
  questions, 
  title, 
  onComplete, 
  isGlobal = false 
}: { 
  questions: QuizQuestion[], 
  title: string, 
  onComplete: () => void,
  isGlobal?: boolean 
}) => {
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  // Reset when questions change
  useEffect(() => {
    setAnswers(new Array(questions.length).fill(-1));
    setSubmitted(false);
  }, [questions]);

  const score = answers.reduce((acc, curr, idx) => curr === questions[idx].correctAnswer ? acc + 1 : acc, 0);
  const passed = score >= (questions.length * 0.6); // 60% to pass

  return (
    <div className="animate-fadeIn w-full">
      <div className={`bg-card border ${isGlobal ? 'border-green-600 shadow-[0_0_30px_rgba(34,197,94,0.15)]' : 'border-slate-700 shadow-xl'} rounded-2xl p-8`}>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {isGlobal ? '🎓 EXAMEN DE CAPÍTULO' : '⚡ Test de Apartado'}
        </h2>
        <p className="text-center text-slate-400 mb-8">{title}</p>

        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={idx} className="border-b border-slate-800 pb-6 last:border-0">
              <p className="font-bold text-lg text-white mb-4 flex gap-3">
                <span className="text-fluor">#{idx + 1}</span> {q.question}
              </p>
              <div className="grid gap-3">
                {q.options.map((opt, optIdx) => {
                  let statusClass = "border-slate-700 text-slate-300 hover:bg-slate-800";
                  if (submitted) {
                    if (optIdx === q.correctAnswer) statusClass = "border-green-500 bg-green-900/20 text-green-300";
                    else if (answers[idx] === optIdx) statusClass = "border-red-500 bg-red-900/20 text-red-300";
                    else statusClass = "border-slate-800 text-slate-500 opacity-50";
                  } else if (answers[idx] === optIdx) {
                    statusClass = "border-fluor bg-fluor/10 text-fluor";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => !submitted && setAnswers(prev => { const n = [...prev]; n[idx] = optIdx; return n; })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${statusClass}`}
                      disabled={submitted}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg text-sm text-slate-300 animate-fadeIn">
                  <strong className="text-fluor">Explicación:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col items-center">
          {!submitted ? (
            <Button onClick={() => setSubmitted(true)} disabled={answers.includes(-1)} className="w-full md:w-auto">
              Verificar Respuestas
            </Button>
          ) : (
            <div className="text-center w-full animate-slideUp">
              <div className="text-4xl font-black text-white mb-2">
                Nota: <span className={passed ? "text-green-400" : "text-red-400"}>{score} / {questions.length}</span>
              </div>
              <p className="text-slate-400 mb-6">
                {passed ? "¡Objetivo cumplido! Puedes avanzar." : "Te recomendamos repasar antes de continuar."}
              </p>
              
              <div className="flex gap-4 justify-center">
                 <Button onClick={() => { setSubmitted(false); setAnswers(new Array(questions.length).fill(-1)); }} variant="secondary">
                   Repetir Test
                 </Button>
                 <Button onClick={onComplete} variant="primary">
                   Continuar <i className="fas fa-arrow-right ml-2"></i>
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DOWNLOAD OVERLAY ---
const DownloadOverlay = ({ state }: { state: DownloadState }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.logs]);

  if (!state.isDownloading) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="terminal-window flex flex-col">
        <div className="terminal-header">
           <div className="terminal-dot bg-red-500"></div>
           <div className="terminal-dot bg-yellow-500"></div>
           <div className="terminal-dot bg-green-500"></div>
           <span className="ml-4 text-xs text-slate-400 font-mono">GeneraCursos-CLI — Batch Process</span>
        </div>
        <div className="terminal-body font-mono" ref={scrollRef}>
          {state.logs.map((log, i) => (
             <span key={i} className={`log-line ${
               log.type === 'success' ? 'log-success' : 
               log.type === 'error' ? 'log-error' : 
               log.type === 'warn' ? 'log-warn' : 'log-info'
             }`}>
               {log.type === 'success' ? '✔' : log.type === 'error' ? '✖' : '➜'} {log.text}
             </span>
          ))}
          <span className="log-line text-fluor mt-4">
             Processing... {Math.round(state.progress)}% <span className="cursor-blink"></span>
          </span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState<AppStep>(AppStep.API_KEY);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Data State
  const [restoredCourse, setRestoredCourse] = useState<Course | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  
  // Navigation State
  const [viewMode, setViewMode] = useState<'content' | 'section-quiz' | 'chapter-quiz' | 'summary' | 'resources'>('content');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0); 
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Download State
  const [downloadState, setDownloadState] = useState<DownloadState>({ isDownloading: false, logs: [], progress: 0 });

  // --- EFFECT: LOAD PERSISTENCE (Course & Key) ---
  useEffect(() => {
    const savedKey = localStorage.getItem('generaCursosApiKey');
    if (savedKey) {
      setApiKey(savedKey);
      setStep(AppStep.INPUT);
    } else {
      setStep(AppStep.API_KEY);
    }

    const savedCourse = localStorage.getItem('generaCursosData');
    if (savedCourse) {
      try {
        const parsed = JSON.parse(savedCourse);
        setRestoredCourse(parsed);
      } catch (e) {
        console.error("Failed to restore course", e);
      }
    }
  }, []);

  // --- EFFECT: SAVE PERSISTENCE ---
  useEffect(() => {
    if (course) {
      localStorage.setItem('generaCursosData', JSON.stringify(course));
    }
  }, [course]);

  // --- HANDLER: API KEY ---
  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('generaCursosApiKey', key);
    setApiKey(key);
    setStep(AppStep.INPUT);
  };

  const clearApiKey = () => {
    if(confirm("¿Quieres borrar tu API Key y salir?")) {
      localStorage.removeItem('generaCursosApiKey');
      setApiKey('');
      setStep(AppStep.API_KEY);
    }
  };

  // --- HANDLER: RESUME COURSE ---
  const handleResume = () => {
    if (restoredCourse) {
      setCourse(restoredCourse);
      setStep(AppStep.PLAYER);
    }
  };

  // --- ACTIONS (Reset, Regenerate & Preload) ---

  const triggerReset = () => {
    setModalConfig({
      isOpen: true,
      title: "Nuevo Curso",
      message: "Se borrarán todos los datos del curso actual de forma permanente. ¿Estás seguro de que quieres empezar de cero?",
      onConfirm: executeReset
    });
  };

  const executeReset = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    localStorage.removeItem('generaCursosData');
    setCourse(null);
    setRestoredCourse(null);
    setStep(AppStep.INPUT);
  };

  const triggerRegenerate = () => {
    setModalConfig({
      isOpen: true,
      title: "Regenerar Apartado",
      message: "Se eliminará el contenido y el test de este apartado actual y la IA generará una nueva versión. Esta acción no se puede deshacer. ¿Continuar?",
      onConfirm: executeRegenerate
    });
  };

  const executeRegenerate = async () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    if (!course) return;

    setLoading(true);
    setLoadingMessage(`Regenerando: ${course.chapters[activeChapterIndex].sections[activeSectionIndex].title}...`);

    try {
      const currentChapter = course.chapters[activeChapterIndex];
      const currentSection = currentChapter.sections[activeSectionIndex];

      const sectionToRegenerate = { 
        ...currentSection, 
        isGenerated: false, 
        content: undefined, 
        imageUrl: undefined,
        imagePrompt: undefined,
        quiz: undefined,
        isQuizGenerated: false
      };

      const updatedSection = await generateSectionContent(apiKey, course.title, course.targetAudience, currentChapter.title, sectionToRegenerate);
      
      const newCourse = JSON.parse(JSON.stringify(course));
      newCourse.chapters[activeChapterIndex].sections[activeSectionIndex] = updatedSection;
      setCourse(newCourse);

    } catch (e) {
      console.error(e);
      alert("Error al regenerar contenido. Verifica tu API Key.");
    } finally {
      setLoading(false);
    }
  };

  const triggerPreload = () => {
    setModalConfig({
      isOpen: true,
      title: "⚡ Pre-carga Masiva",
      message: "Estás a punto de pedir a la IA que genere TODO el contenido faltante del curso (Lecturas, Tests de Apartado y Exámenes).\n\n⏳ Tiempo estimado: 5 - 8 minutos.\n⚠️ IMPORTANTE: No cierres la pestaña mientras la terminal de 'Hacker' esté trabajando.\n\n¿Estás listo para esperar?",
      onConfirm: () => {
        setModalConfig(prev => ({...prev, isOpen: false}));
        processDownloadQueue('preload');
      }
    });
  };

  // --- HELPER: PROGRESS CALCULATOR ---
  const getCourseProgress = () => {
    if (!course) return 0;
    let totalItems = 0;
    let completedItems = 0;
    
    course.chapters.forEach(ch => {
      totalItems += 1; // Chapter Quiz
      if (ch.isQuizGenerated) completedItems += 1;
      
      ch.sections.forEach(sec => {
        totalItems += 2; // Content + Quiz
        if (sec.isGenerated) completedItems += 1;
        if (sec.isQuizGenerated) completedItems += 1;
      });
    });

    totalItems += 1; // Global Summary
    if (course.globalSummary) completedItems += 1;
    totalItems += 1; // Resources
    if (course.resources) completedItems += 1;

    return Math.round((completedItems / totalItems) * 100);
  };

  // START NEW
  const handleStart = async (topic: string, audience: string) => {
    setLoading(true);
    setLoadingMessage('Diseñando la estructura del curso (6 capítulos)...');
    try {
      const newCourse = await generateCourseStructure(apiKey, topic, audience);
      setCourse(newCourse);
      setStep(AppStep.PLAYER);
      await loadSectionContent(newCourse, 0, 0);
    } catch (e) {
      alert("Error al conectar con el mentor IA. Verifica tu API Key e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // LOAD SECTION
  const loadSectionContent = async (currentCourse: Course, chIdx: number, secIdx: number) => {
    setActiveChapterIndex(chIdx);
    setActiveSectionIndex(secIdx);
    setViewMode('content');

    const section = currentCourse.chapters[chIdx].sections[secIdx];
    if (section.isGenerated) return;

    setLoading(true);
    setLoadingMessage(`Redactando: ${section.title}...`);
    try {
      const updatedSection = await generateSectionContent(apiKey, currentCourse.title, currentCourse.targetAudience, currentCourse.chapters[chIdx].title, section);
      
      // Deep Copy to ensure React updates
      const newCourse = JSON.parse(JSON.stringify(currentCourse));
      newCourse.chapters[chIdx].sections[secIdx] = updatedSection;
      setCourse(newCourse);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // FLOW LOGIC
  const handleContentNext = async () => {
    setViewMode('section-quiz');
    const currentSection = course!.chapters[activeChapterIndex].sections[activeSectionIndex];
    if (!currentSection.isQuizGenerated) {
       setLoading(true);
       setLoadingMessage('Generando Test del Apartado...');
       try {
         const quiz = await generateSectionQuiz(apiKey, course!.title, currentSection.title);
         const newCourse = JSON.parse(JSON.stringify(course));
         newCourse.chapters[activeChapterIndex].sections[activeSectionIndex].quiz = quiz;
         newCourse.chapters[activeChapterIndex].sections[activeSectionIndex].isQuizGenerated = true;
         setCourse(newCourse);
       } catch(e) { console.error(e); }
       setLoading(false);
    }
  };

  const handleSectionQuizComplete = async () => {
     const currentChapter = course!.chapters[activeChapterIndex];
     
     if (activeSectionIndex < currentChapter.sections.length - 1) {
       loadSectionContent(course!, activeChapterIndex, activeSectionIndex + 1);
     } else {
       setViewMode('chapter-quiz');
       if (!currentChapter.isQuizGenerated) {
         setLoading(true);
         setLoadingMessage('Generando Examen del Capítulo (20 preguntas)...');
         try {
           const quiz = await generateChapterQuiz(apiKey, course!.title, currentChapter.title);
           const newCourse = JSON.parse(JSON.stringify(course));
           newCourse.chapters[activeChapterIndex].quiz = quiz;
           newCourse.chapters[activeChapterIndex].isQuizGenerated = true;
           setCourse(newCourse);
         } catch(e) { console.error(e); }
         setLoading(false);
       }
     }
  };

  const handleChapterQuizComplete = () => {
     if (activeChapterIndex < course!.chapters.length - 1) {
       loadSectionContent(course!, activeChapterIndex + 1, 0);
     } else {
       handleLoadSummary();
     }
  };

  const handleLoadSummary = async () => {
     setViewMode('summary');
     if (!course!.globalSummary) {
        setLoading(true);
        setLoadingMessage('Redactando resumen final del curso...');
        try {
           const summary = await generateGlobalSummary(apiKey, course!);
           const newCourse = JSON.parse(JSON.stringify(course));
           newCourse.globalSummary = summary;
           setCourse(newCourse);
        } catch(e) { console.error(e); }
        setLoading(false);
     }
  };

  const handleLoadResources = async () => {
     setViewMode('resources');
     if (!course!.resources) {
        setLoading(true);
        setLoadingMessage('Recopilando recursos y bibliografía...');
        try {
           const resources = await generateResources(apiKey, course!);
           const newCourse = JSON.parse(JSON.stringify(course));
           newCourse.resources = resources;
           setCourse(newCourse);
        } catch(e) { console.error(e); }
        setLoading(false);
     }
  };

  // DOWNLOAD LOGIC
  const processDownloadQueue = async (type: 'pdf' | 'html' | 'preload') => {
     if (!course) return;
     
     setDownloadState({ 
        isDownloading: true, 
        logs: [{ type: 'info', text: 'Initializing course export engine...' }], 
        progress: 0 
     });

     const addLog = (text: string, type: 'info'|'success'|'warn'|'error' = 'info') => {
        setDownloadState(prev => ({ ...prev, logs: [...prev.logs, { type, text }] }));
     };

     // Deep clone for temporary mutations
     let tempCourse = JSON.parse(JSON.stringify(course));
     
     const tasks: (() => Promise<void>)[] = [];
     
     tempCourse.chapters.forEach((ch: Chapter, chIdx: number) => {
        ch.sections.forEach((sec: Section, secIdx: number) => {
           if (!sec.isGenerated) {
              tasks.push(async () => {
                 addLog(`Generating Content: [${ch.id}.${sec.id}] ${sec.title}...`);
                 const updatedSec = await generateSectionContent(apiKey, tempCourse.title, tempCourse.targetAudience, ch.title, sec);
                 tempCourse.chapters[chIdx].sections[secIdx] = updatedSec;
                 addLog(`Content OK: ${sec.title}`, 'success');
              });
           }
           if (!sec.isQuizGenerated) {
              tasks.push(async () => {
                 addLog(`Generating Quiz: [${ch.id}.${sec.id}]...`);
                 const quiz = await generateSectionQuiz(apiKey, tempCourse.title, sec.title);
                 tempCourse.chapters[chIdx].sections[secIdx].quiz = quiz;
                 tempCourse.chapters[chIdx].sections[secIdx].isQuizGenerated = true;
                 addLog(`Quiz OK: ${sec.title}`, 'success');
              });
           }
        });
        
        if (!ch.isQuizGenerated) {
           tasks.push(async () => {
              addLog(`Generating MASTER EXAM: Chapter ${ch.id}...`, 'warn');
              const quiz = await generateChapterQuiz(apiKey, tempCourse.title, ch.title);
              tempCourse.chapters[chIdx].quiz = quiz;
              tempCourse.chapters[chIdx].isQuizGenerated = true;
              addLog(`Exam OK: Chapter ${ch.id}`, 'success');
           });
        }
     });

     if (!tempCourse.globalSummary) {
        tasks.push(async () => {
           addLog(`Drafting Global Summary...`, 'warn');
           const sum = await generateGlobalSummary(apiKey, tempCourse);
           tempCourse.globalSummary = sum;
           addLog(`Summary OK`, 'success');
        });
     }

     if (!tempCourse.resources) {
        tasks.push(async () => {
           addLog(`Compiling Resources...`, 'warn');
           const res = await generateResources(apiKey, tempCourse);
           tempCourse.resources = res;
           addLog(`Resources OK`, 'success');
        });
     }

     const totalTasks = tasks.length;
     if (totalTasks > 0) {
        addLog(`Found ${totalTasks} missing components. Starting batch generation...`, 'warn');
        for (let i = 0; i < totalTasks; i++) {
           try {
              await tasks[i]();
              setDownloadState(prev => ({ ...prev, progress: ((i + 1) / totalTasks) * 90 }));
           } catch (e) {
              addLog(`Error in task ${i}`, 'error');
           }
        }
     } else {
        addLog('All content is up to date.', 'success');
     }

     setCourse(tempCourse);
     setDownloadState(prev => ({ ...prev, progress: 100 }));

     if (type === 'preload') {
        addLog('All content pre-loaded successfully!', 'success');
        setTimeout(() => setDownloadState({ isDownloading: false, logs: [], progress: 0 }), 2000);
        return;
     }

     addLog(`Compiling final ${type.toUpperCase()} file...`, 'info');
     
     await new Promise(r => setTimeout(r, 1000));
     
     if (type === 'pdf') printCourseAsPDF(tempCourse);
     else generateFullCourseHTML(tempCourse);
     
     setTimeout(() => setDownloadState({ isDownloading: false, logs: [], progress: 0 }), 3000);
  };

  // --- RENDER API KEY SCREEN ---
  if (step === AppStep.API_KEY) {
    return <ApiKeyScreen onSave={handleSaveApiKey} />;
  }

  // --- RENDER INPUT ---
  if (step === AppStep.INPUT) {
    return (
      <div className="h-screen bg-background relative overflow-y-auto">
        <ConfirmationModal 
          isOpen={modalConfig.isOpen} 
          title={modalConfig.title} 
          message={modalConfig.message} 
          onClose={() => setModalConfig(prev => ({...prev, isOpen: false}))}
          onConfirm={modalConfig.onConfirm}
        />

        {loading && (
          <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center backdrop-blur-sm animate-fadeIn">
            <i className="fas fa-circle-notch fa-spin text-4xl text-fluor mb-4"></i>
            <p className="text-white text-lg">{loadingMessage}</p>
          </div>
        )}
        <InputScreen 
          onStart={handleStart} 
          onResume={handleResume}
          onDiscard={triggerReset}
          restoredCourse={restoredCourse}
          isLoading={loading} 
        />
        <div className="text-center pb-4">
           <button onClick={clearApiKey} className="text-slate-600 text-xs hover:text-red-500 underline">Cambiar API Key</button>
        </div>
        <Footer />
      </div>
    );
  }

  // --- RENDER PLAYER ---
  const activeChapter = course!.chapters[activeChapterIndex];
  const activeSection = activeChapter.sections[activeSectionIndex];
  const progress = getCourseProgress();

  return (
    <div className="h-screen bg-background flex overflow-hidden">
       <ConfirmationModal 
          isOpen={modalConfig.isOpen} 
          title={modalConfig.title} 
          message={modalConfig.message} 
          onClose={() => setModalConfig(prev => ({...prev, isOpen: false}))}
          onConfirm={modalConfig.onConfirm}
       />

       <DownloadOverlay state={downloadState} />

       {loading && (
          <div className="fixed inset-0 bg-slate-900/80 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="bg-card p-6 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center">
               <i className="fas fa-robot text-4xl text-fluor mb-4 animate-bounce"></i>
               <p className="text-white font-bold text-lg mb-1">{loadingMessage}</p>
            </div>
          </div>
        )}

      {/* LEFT SIDEBAR */}
      <aside className={`bg-card border-r border-slate-800 flex flex-col w-80 flex-shrink-0 transition-all duration-300 absolute md:relative z-40 h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-80'}`}>
        <div className="p-4 border-b border-slate-700">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fluor to-blue-600 flex items-center justify-center text-slate-900 font-black text-xs">GC</div>
                 <span className="font-bold text-white text-sm">GeneraCursos</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={triggerReset} 
                  type="button"
                  title="Borrar y Nuevo Curso"
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
                <button 
                  onClick={clearApiKey}
                  type="button"
                  title="Salir (Borrar Key)"
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400"><i className="fas fa-times"></i></button>
              </div>
           </div>
           
           <div className="bg-slate-900 rounded-full h-2 w-full overflow-hidden border border-slate-700 relative">
             <div 
                className="bg-fluor h-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
             ></div>
           </div>
           <p className="text-right text-[10px] text-fluor font-mono mt-1">{progress}% Completado</p>
           
           <button
              onClick={triggerPreload}
              className="w-full mt-3 bg-slate-800 hover:bg-fluor/20 border border-slate-600 hover:border-fluor text-slate-300 hover:text-fluor text-[10px] uppercase font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Generar todo el contenido pendiente ahora"
           >
              <i className="fas fa-bolt"></i> ⚡ Pre-cargar Todo
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {course?.chapters.map((ch, chIdx) => (
            <div key={ch.id} className="mb-2">
              <button 
                type="button"
                onClick={() => {
                   if (activeChapterIndex !== chIdx) {
                      loadSectionContent(course!, chIdx, 0);
                   }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center transition-colors cursor-pointer ${
                  activeChapterIndex === chIdx ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{ch.id}. {ch.title}</span>
                <i className={`fas fa-chevron-down transition-transform text-xs ${activeChapterIndex === chIdx ? 'rotate-180' : ''}`}></i>
              </button>
              
              {activeChapterIndex === chIdx && (
                <div className="ml-3 pl-3 border-l border-slate-700 mt-2 space-y-1 animate-fadeIn">
                  {ch.sections.map((sec, secIdx) => {
                    const isActive = activeSectionIndex === secIdx && (viewMode === 'content' || viewMode === 'section-quiz');
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => loadSectionContent(course!, chIdx, secIdx)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                          isActive
                            ? 'text-fluor bg-fluor/10 font-bold' 
                            : sec.isGenerated ? 'text-slate-300' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <i className={`fas ${sec.isGenerated ? 'fa-check-circle text-[10px]' : 'fa-circle text-[6px]'}`}></i>
                        {sec.title}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => { setViewMode('chapter-quiz'); setActiveChapterIndex(chIdx); }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-2 mt-2 cursor-pointer ${
                      viewMode === 'chapter-quiz' ? 'text-purple-400 bg-purple-500/10 font-bold' : 'text-slate-500 hover:text-purple-400'
                    }`}
                  >
                    <i className="fas fa-tasks text-[10px]"></i> Examen (20 Preguntas)
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-700 space-y-2">
            <button
               type="button"
               onClick={handleLoadSummary}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex gap-2 items-center transition-colors cursor-pointer ${
                 viewMode === 'summary' ? 'bg-blue-900/30 text-blue-300 border border-blue-800' : 'text-slate-400 hover:text-white'
               }`}
            >
               <i className="fas fa-scroll"></i> 📜 Resumen Final
            </button>
            <button
               type="button"
               onClick={handleLoadResources}
               className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex gap-2 items-center transition-colors cursor-pointer ${
                 viewMode === 'resources' ? 'bg-orange-900/30 text-orange-300 border border-orange-800' : 'text-slate-400 hover:text-white'
               }`}
            >
               <i className="fas fa-book-reader"></i> 📚 Recursos
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-2">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 text-center">Descargar Curso Completo</p>
           <Button variant="secondary" onClick={() => processDownloadQueue('pdf')} className="w-full text-[10px] py-2">
              <i className="fas fa-file-pdf mr-2"></i> PDF (Imprimir)
           </Button>
           <Button variant="primary" onClick={() => processDownloadQueue('html')} className="w-full text-[10px] py-2">
              <i className="fas fa-code mr-2"></i> HTML Interactivo
           </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto relative flex flex-col no-print">
        <div className="md:hidden bg-card border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
           <span className="font-bold text-white text-sm truncate">{course?.title}</span>
           <button onClick={() => setSidebarOpen(true)} className="text-fluor"><i className="fas fa-bars"></i></button>
        </div>

        <div className="flex-grow p-6 md:p-12 max-w-4xl mx-auto w-full">
          
          {/* VIEW: SECTION CONTENT */}
          {viewMode === 'content' && (
             <div className="animate-slideUp">
                <div className="mb-8 pb-6 border-b border-slate-800">
                  <span className="text-fluor text-xs font-bold uppercase tracking-widest mb-2 block">
                    Capítulo {activeChapter.id} • {activeChapter.title}
                  </span>
                  <div className="flex justify-between items-start gap-4">
                     <div>
                       <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">{activeSection.title}</h1>
                       <p className="text-slate-500 text-sm">Apartado {activeSection.id}</p>
                     </div>
                     <button 
                        type="button"
                        onClick={triggerRegenerate}
                        title="Regenerar contenido con IA"
                        className="flex-shrink-0 w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-fluor hover:border-fluor hover:bg-slate-800 transition-all cursor-pointer"
                     >
                       <i className="fas fa-sync-alt"></i>
                     </button>
                  </div>
                </div>

                {activeSection.imageUrl && (
                  <div className="w-full rounded-2xl overflow-hidden mb-10 border border-slate-700 shadow-2xl relative group bg-slate-900">
                    <img src={activeSection.imageUrl} alt={activeSection.imagePrompt} className="w-full h-auto object-cover max-h-[500px]" loading="lazy" />
                  </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none text-justify">
                  <div dangerouslySetInnerHTML={{ __html: activeSection.content || '' }} />
                </div>
                
                <div className="mt-16 pt-8 border-t border-slate-800 flex justify-end">
                   <Button onClick={handleContentNext} className="group">
                     Realizar Test del Apartado <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                   </Button>
                </div>
             </div>
          )}

          {/* VIEW: SECTION QUIZ */}
          {viewMode === 'section-quiz' && activeSection.quiz && (
             <QuizComponent 
                questions={activeSection.quiz} 
                title={`Autoevaluación: ${activeSection.title}`} 
                onComplete={handleSectionQuizComplete} 
             />
          )}

          {/* VIEW: CHAPTER QUIZ */}
          {viewMode === 'chapter-quiz' && activeChapter.quiz && (
             <QuizComponent 
                questions={activeChapter.quiz} 
                title={`Examen Maestro del Capítulo ${activeChapter.id}`} 
                onComplete={handleChapterQuizComplete}
                isGlobal={true}
             />
          )}

          {/* VIEW: GLOBAL SUMMARY */}
          {viewMode === 'summary' && course?.globalSummary && (
             <div className="animate-slideUp max-w-3xl mx-auto">
                <div className="text-center mb-10">
                   <i className="fas fa-award text-6xl text-yellow-400 mb-4"></i>
                   <h1 className="text-4xl font-black text-white mb-4">¡Curso Completado!</h1>
                   <p className="text-slate-400">Has recorrido todo el camino. Aquí tienes tu resumen final.</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                   <div className="prose prose-invert prose-lg max-w-none text-justify">
                      <div dangerouslySetInnerHTML={{ __html: course.globalSummary }} />
                   </div>
                </div>
                <div className="mt-10 text-center flex justify-center">
                    <Button onClick={handleLoadResources} variant="primary">
                       Ver Recursos Extra <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                </div>
             </div>
          )}

          {/* VIEW: RESOURCES */}
          {viewMode === 'resources' && course?.resources && (
             <div className="animate-slideUp max-w-3xl mx-auto">
                <div className="text-center mb-10">
                   <i className="fas fa-book-reader text-6xl text-orange-400 mb-4"></i>
                   <h1 className="text-4xl font-black text-white mb-4">Recursos y Bibliografía</h1>
                   <p className="text-slate-400">Herramientas y lecturas para seguir profundizando.</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                   <div className="prose prose-invert prose-lg max-w-none text-justify">
                      <div dangerouslySetInnerHTML={{ __html: course.resources }} />
                   </div>
                </div>
                <div className="mt-10 text-center space-y-4">
                   <p className="text-sm text-slate-500 uppercase tracking-widest">Ya tienes todo. Descarga tu certificado (simulado) y el curso completo.</p>
                   <div className="flex justify-center gap-4">
                      <Button onClick={() => processDownloadQueue('pdf')} variant="primary">Descargar Curso en PDF</Button>
                   </div>
                </div>
             </div>
          )}
        </div>
        
        <div className="pb-8">
            <Footer />
        </div>
      </main>
    </div>
  );
};

export default App;

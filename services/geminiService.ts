
import { GoogleGenAI } from "@google/genai";
import { Course, Chapter, Section, QuizQuestion } from "../types";

// --- UTILS ---

const cleanJsonString = (str: string) => {
  return str.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
};

const getPollinationsImage = (prompt: string) => {
  // Enhanced prompt for MAXIMUM SHARPNESS and PROFESSIONAL LOOK
  const styleKeywords = "isometric 3d render, octane render, unreal engine 5, highly detailed, sharp focus, cinematic lighting, professional educational illustration, 8k resolution, minimalist, clean background, soft shadows, 3d icon style";
  
  // Combine prompt with style
  const fullPrompt = `${prompt}, ${styleKeywords}`;
  const encoded = encodeURIComponent(fullPrompt);
  
  // Use a large seed range for variety
  const seed = Math.floor(Math.random() * 99999);
  
  // Using model=flux (best quality) with HD resolution 1280x720
  return `https://image.pollinations.ai/prompt/${encoded}?nologo=true&seed=${seed}&width=1280&height=720&model=flux`;
};

// --- API CALLS ---

// 1. GENERATE SKELETON (6 Chapters x 5 Sections)
export const generateCourseStructure = async (apiKey: string, topic: string, audience: string): Promise<Course> => {
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `Actúa como un arquitecto de formación experto.
  Diseña la estructura completa de un curso sobre "${topic}" dirigido específicamente a: "${audience}".
  
  REGLAS ESTRUCTURALES:
  1. El curso debe tener EXACTAMENTE 6 Capítulos (Chapters). NO generes 8 ni 10. Solo 6.
  2. Condensa todo el conocimiento esencial y avanzado en estos 6 capítulos sin perder profundidad ni contexto.
  3. Cada Capítulo debe tener EXACTAMENTE 5 Apartados (Sections).
  4. Los títulos deben ser atractivos y progresivos.
  
  Devuelve SOLO un JSON con esta estructura exacta:
  {
    "title": "Título Creativo del Curso",
    "chapters": [
      {
        "id": 1,
        "title": "Título Capítulo 1",
        "description": "Breve descripción",
        "sections": [
          { "id": "1.1", "title": "Título Apartado 1" },
          ... (5 apartados)
        ]
      },
      ... (6 capítulos)
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      const data = JSON.parse(cleanJsonString(response.text));
      // Hydrate with initial flags
      const chapters: Chapter[] = data.chapters.map((ch: any) => ({
        ...ch,
        isQuizGenerated: false,
        sections: ch.sections.map((sec: any) => ({
          ...sec,
          isGenerated: false,
          isQuizGenerated: false
        }))
      }));

      return {
        topic,
        targetAudience: audience,
        title: data.title,
        chapters
      };
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Structure Error:", error);
    throw error;
  }
};

// 2. GENERATE SECTION CONTENT
export const generateSectionContent = async (
  apiKey: string,
  courseTitle: string,
  audience: string,
  chapterTitle: string,
  section: Section
): Promise<Section> => {
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';

  const prompt = `Escribe el contenido educativo para el apartado "${section.title}" del capítulo "${chapterTitle}".
  Curso: "${courseTitle}". Público: "${audience}".
  
  REQUISITOS DE FORMATO (IMPORTANTE):
  1. Usa HTML semántico.
  2. Usa <h3> para subtítulos.
  3. Usa <ul> y <li> para listas (NO uses guiones planos).
  4. Usa <blockquote> para resaltar ideas clave, definiciones o advertencias importantes.
  5. Usa <strong> para palabras clave.
  6. Alineación de texto justificada en el CSS, genera párrafos largos y completos.
  
  ESTILO Y CONTENIDO:
  1. Tono didáctico, experto y motivador.
  2. Extensión: 300-500 palabras.
  3. Incluye ejemplos claros.
  
  IMAGEN (Prompt Engineering):
  Genera un "imagePrompt" en INGLÉS.
  CRÍTICO: Describe una ESCENA VISUAL CONCRETA y OBJETOS FÍSICOS que representen el concepto.
  EVITA conceptos abstractos. NO pidas texto en la imagen.
  Ejemplo MAL: "Concepto de programación".
  Ejemplo BIEN: "A cute robot organizing colorful blocks on a sleek futuristic desk, isometric view".
  
  Respuesta JSON:
  {
    "content": "<html>...",
    "imagePrompt": "detailed visual description in english..."
  }`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      const data = JSON.parse(cleanJsonString(response.text));
      return {
        ...section,
        isGenerated: true,
        content: data.content,
        imagePrompt: data.imagePrompt,
        imageUrl: getPollinationsImage(data.imagePrompt)
      };
    }
    throw new Error("Failed content generation");
  } catch (error) {
    console.error("Section Error:", error);
    throw error;
  }
};

// 3. GENERATE SECTION QUIZ (5 Questions)
export const generateSectionQuiz = async (
  apiKey: string,
  courseTitle: string,
  sectionTitle: string
): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';
  const prompt = `Crea un examen rápido de 5 preguntas sobre el apartado "${sectionTitle}" del curso "${courseTitle}".
  JSON Array:
  [ { "id": 1, "question": "?", "options": ["A","B","C"], "correctAnswer": 0, "explanation": "..." } ]`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return response.text ? JSON.parse(cleanJsonString(response.text)) : [];
  } catch (error) {
    console.error("Section Quiz Error", error);
    return [];
  }
};

// 4. GENERATE CHAPTER QUIZ (20 Questions)
export const generateChapterQuiz = async (
  apiKey: string,
  courseTitle: string,
  chapterTitle: string
): Promise<QuizQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';

  const prompt = `Crea un EXAMEN COMPLETO de 20 preguntas (muy exhaustivo) sobre el capítulo "${chapterTitle}" del curso "${courseTitle}".
  Debe cubrir todos los aspectos del capítulo.
  
  REQUISITOS:
  - 20 preguntas únicas.
  - 3 opciones de respuesta por pregunta.
  - Indica el índice de la correcta (0, 1 o 2).
  - Provee una breve "explanation" (retroalimentación).
  
  JSON Array:
  [
    {
      "id": 1,
      "question": "¿...?",
      "options": ["A", "B", "C"],
      "correctAnswer": 0,
      "explanation": "Es correcto porque..."
    },
    ... (hasta 20)
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    if (response.text) {
      return JSON.parse(cleanJsonString(response.text));
    }
    throw new Error("Failed quiz generation");
  } catch (error) {
    console.error("Chapter Quiz Error:", error);
    throw error;
  }
};

// 5. GENERATE GLOBAL SUMMARY
export const generateGlobalSummary = async (apiKey: string, course: Course): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';
  
  // Create a context summary from titles
  const structure = course.chapters.map(c => `${c.title}: ${c.description}`).join('\n');

  const prompt = `Genera un "Resumen Final y Clausura" para el curso "${course.title}".
  Estructura del curso:
  ${structure}
  
  Escribe un texto motivador, de cierre, que resuma los puntos clave aprendidos en los 6 capítulos y felicite al alumno.
  Usa formato HTML (<h3>, <p>, <ul>, <strong>). Texto Justificado.
  No uses <h1> ni <h2>.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      // No JSON here, just HTML string
    });
    return response.text || "<p>Error generando resumen.</p>";
  } catch (error) {
    return "<p>No se pudo generar el resumen final.</p>";
  }
};

// 6. GENERATE RESOURCES
export const generateResources = async (apiKey: string, course: Course): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `Genera una sección de "Recursos Recomendados y Bibliografía" para el curso "${course.title}".
  
  Debe incluir:
  1. Libros clave recomendados (Autor, Título).
  2. Herramientas digitales, software o webs útiles relacionadas.
  3. Referencias para seguir aprendiendo.
  
  Usa HTML semántico y limpio (<h3>, <ul>, <li>, <strong>, <p>).
  Usa iconos o emojis para cada categoría si es posible.
  Texto justificado.
  No uses <h1> ni <h2>.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "<p>Error generando recursos.</p>";
  } catch (error) {
    return "<p>No se pudieron generar los recursos.</p>";
  }
};

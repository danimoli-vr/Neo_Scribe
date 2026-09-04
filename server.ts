import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Healthcheck
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Coherence Auditor Endpoint
app.post("/api/audit-coherence", async (req: Request, res: Response) => {
  try {
    const { 
      sceneText, 
      analysisType, 
      contextConfig, 
      systemInstruction: clientInstruction, 
      genreId 
    } = req.body;

    if (!sceneText || typeof sceneText !== "string") {
      return res.status(400).json({ error: "sceneText is required" });
    }

    const ai = getGeminiClient();

    // Determine system instruction: prefer client-provided prompt if present
    let systemInstruction = clientInstruction;

    if (!systemInstruction) {
      if (genreId === "fantasy") {
        systemInstruction = `Eres el "Archimaestre y Consultor Ontológico de Alta Fantasía", una IA especializada en el worldbuilding y coherencia narrativa de esta saga de fantasía.
Tu misión es auditar borradores de escenas, sistemas mágicos, linajes y duelos para asegurar que NO HAYA INCOHERENCIAS con las reglas canónicas:
1. Toda magia exige coste (energía vital, componentes, juramentos de sangre).
2. Respeto estricto a las consecuencias políticas y heridas previas de los personajes.
3. Causalidad y lógica interna sin 'Deus Ex Machina'.
INSTRUCCIONES DE RESPUESTA:
Evalúa el texto y responde estructuradamente en Markdown en español:
1. 📊 Dictamen de Coherencia (Puntuación 0-100 y estado).
2. 🔮 Análisis del Sistema Mágico y Costes.
3. 👑 Consistencia de Facciones y Linajes.
4. 💡 Sugerencias de Parche Narrativo (Diff Literario).`;
      } else if (genreId === "noir") {
        systemInstruction = `Eres el "Inspector Forense y Consultor de Novela Negra", una IA especializada en la coherencia de tramas policíacas, misterio y crimen.
Tu misión es auditar borradores de escenas, interrogatorios y coartadas para asegurar que NO HAYA INCOHERENCIAS:
1. Rigor temporal, distancias y traslados verosímiles entre locaciones.
2. Fair Play: pistas accesibles y deducciones sustentadas en evidencias.
3. Psicología de sospechosos coherente con sus motivos y secretos.
INSTRUCCIONES DE RESPUESTA:
Evalúa el texto y responde estructuradamente en Markdown en español:
1. 📊 Dictamen de Coherencia (Puntuación 0-100 y estado).
2. 🕵️ Análisis de Tiempos y Coartadas.
3. 🔎 Rigor Forense y Procedimiento.
4. 💡 Sugerencias de Parche Narrativo (Diff Literario).`;
      } else {
        // Default Sci-Fi / Planck Substrate
        systemInstruction = `Eres el "Auditor del Kernel de la Realidad y Consultor de Físicas de Ópera Espacial", una IA especializada en el worldbuilding de esta novela.
Tu misión es auditar borradores de escenas, mecánicas de combate, artefactos precursores o tramas para asegurar que NO HAYA INCOHERENCIAS con las reglas canónicas del universo del autor:
1. EL SUSTRATO DE PLANCK: Malla a escala de Planck que compila y ejecuta constantes físicas. Conservación de energía y disipación de calor.
2. INYECTORES Y DEPURADORES: Compilación bytecode de la materia con costes de RAM y compute de área.
3. RIESGOS: Throttling de framerate físico, Memory Leaks, Buffer Overflows y Kernel Panic.
4. FACCIONES: Arqueólogos FOSS vs Ortodoxia Sacra del Root.
INSTRUCCIONES DE RESPUESTA:
Evalúa el texto y responde estructuradamente en Markdown en español:
1. 📊 Dictamen de Coherencia (Puntuación 0-100 y estado).
2. 🔬 Análisis de Física y Sustrato.
3. ⚠️ Riesgos de Kernel Panic o Memory Leak.
4. ⚔️ Alineación con la Guerra de Exploits & Facciones.
5. 💡 Sugerencias de Parche Narrativo (Diff Literario).`;
      }
    }

    const prompt = `Tipo de análisis solicitado: ${analysisType || "Auditoría General de Escena"}
Configuración de contexto adicional: ${JSON.stringify(contextConfig || {})}

BORRADOR O ESCENA A AUDITAR:
"""
${sceneText}
"""`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const report = response.text || "No se pudo generar el informe de coherencia.";
    res.json({ report });
  } catch (error: any) {
    console.error("Error in /api/audit-coherence:", error);
    res.status(500).json({
      error: error.message || "Error al procesar la auditoría con Gemini API.",
    });
  }
});

// Precursor Artifact & Lore Item Generator
app.post("/api/generate-lore-item", async (req: Request, res: Response) => {
  try {
    const { category, parameters, genreId } = req.body;
    const ai = getGeminiClient();

    let systemInstruction = "";

    if (genreId === "fantasy") {
      systemInstruction = `Eres un diseñador de worldbuilding y sistemas arcanos para una saga de Alta Fantasía.
Genera un elemento de lore altamente detallado y original.
Formato de respuesta JSON estricto con los siguientes campos:
{
  "name": "Nombre místico o ceremonial del artefacto, pacto o criatura",
  "category": "artefacto" | "exploit" | "anomalia" | "sistema_estelar",
  "precursorArchitecture": "Escuela de magia, tradición arcana o plano de origen",
  "technicalSpecs": "Coste de maná, tributo requerido o límite de uso",
  "loreAndDiscovery": "Origen histórico, leyenda y facción o casa que lo codicia",
  "exploitMechanic": "Efecto o encantamiento al ser invocado o desatado",
  "failureMode": "Consecuencias de fallo, corrupción o reacción mágica descontrolada",
  "narrativeHook": "Gancho argumental directo para un capítulo de la novela"
}`;
    } else if (genreId === "noir") {
      systemInstruction = `Eres un consultor narrativo para una saga Noir / Ficción Criminal y Detectivesca.
Genera un elemento de lore detallado y coherente con el género criminal.
Formato de respuesta JSON estricto con los siguientes campos:
{
  "name": "Nombre del expediente, arma homicida, lugar turbio o pista clave",
  "category": "artefacto" | "exploit" | "anomalia" | "sistema_estelar",
  "precursorArchitecture": "Distrito, departamento policial o red criminal vinculada",
  "technicalSpecs": "Especificaciones forenses, calibre o detalles periciales",
  "loreAndDiscovery": "Quién lo descubrió, escena del hallazgo e implicados",
  "exploitMechanic": "Modus operandi o método utilizado en el caso",
  "failureMode": "Riesgo de encubrimiento, coartada falsa o testigo silenciado",
  "narrativeHook": "Gancho argumental directo para un caso o capítulo"
}`;
    } else {
      systemInstruction = `Eres un diseñador de worldbuilding y mecánicas de ciencia ficción dura para una ópera espacial basada en el "Kernel de la Realidad" (malla a escala de Planck).
Genera un elemento de worldbuilding altamente detallado y original.
Formato de respuesta JSON estricto con los siguientes campos:
{
  "name": "Nombre técnico y nombre coloquial del artefacto o exploit",
  "category": "artefacto" | "exploit" | "anomalia" | "sistema_estelar",
  "precursorArchitecture": "Capa del Kernel que afecta (HAL, driver molecular, registro de inercia, etc.)",
  "technicalSpecs": "Consumo de compute, ancho de banda de Planck requerido, memoria de área",
  "loreAndDiscovery": "Quién lo encontró, expedición arqueológica, facción en conflicto",
  "exploitMechanic": "Cómo se ejecuta como código o manipulación de materia",
  "failureMode": "Qué ocurre en caso de Buffer Overflow, Crash o Memory Leak",
  "narrativeHook": "Gancho argumental directo para un capítulo del libro"
}`;
    }

    const prompt = `Genera un elemento de categoría: "${category || "artefacto"}".
Parámetros / Petición del autor: ${parameters || "Un elemento crucial en disputa"}`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ item: parsed });
  } catch (error: any) {
    console.error("Error in /api/generate-lore-item:", error);
    res.status(500).json({
      error: error.message || "Error al generar elemento de lore.",
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kernel Worldbuilding Server running on port ${PORT}`);
  });
}

setupServer();

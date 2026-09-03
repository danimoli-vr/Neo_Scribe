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
    const { sceneText, analysisType, contextConfig } = req.body;

    if (!sceneText || typeof sceneText !== "string") {
      return res.status(400).json({ error: "sceneText is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Eres el "Auditor del Kernel de la Realidad y Consultor de Físicas de Ópera Espacial", una IA especializada en el worldbuilding de esta novela.
Tu misión es auditar borradores de escenas, mecánicas de combate, artefactos precursores o tramas para asegurar que NO HAYA INCOHERENCIAS con las reglas canónicas del universo del autor:

REGLAS CANÓNICAS DEL MUNDO:
1. EL SUSTRATO DE PLANCK (Kernel de la Realidad):
   - Malla a escala de Planck que compila y ejecuta constantes universales (c, G, entropía, masa, inercia).
   - No hay magia mística; todo es inyección de excepciones o sobreescritura de registros físicos locales.
   - Conservación de energía/entropía: Si congelas algo forzando cero kelvin, la entropía no desaparece; debe descargarse a un registro adyacente (calor disipado masivo en el disipador del operador o radiación ambiental).

2. INYECTORES Y DEPURADORES (Los operadores):
   - Usan implantes de compilación neural, terminales rígidas blindadas ("slates de debug") o acoples directos a relés.
   - No canalizan maná: compilan instrucciones bytecode de la realidad.

3. COSTES Y LÍMITES TÉCNICOS:
   - Compute / RAM de área: Límite de flops por m³ en cada sector. Si varios operadores compilan a la vez -> Throttling (caída de framerate en la física, objetos cayendo a tirones, retardo en la propagación de la luz/sonido, latencia cinemática).
   - Memory Leaks: Procesos mal cerrados (ej. campos de inercia o blindajes sin garbage collection) fragmentan la métrica espacial -> dejan estática cuántica, espejismos geométricos, dolor neural a inyectores cercanos.
   - Crash / Kernel Panic: Buffer overflows o fallos de cálculo -> Colapso de la física local (microvacíos de Planck, agujeros de gusano parásitos, desintegración de materia o muerte instantánea del inyector por SIGSEGV neural).
   - Guerra de Exploits: Hackeo aplicado a la materia (desactivar inercia, parches moleculares en caliente en blindajes de naves, race conditions en motores de curvatura).

4. FACCIONES:
   - Arqueólogos FOSS / Código Abierto: Buscan desclasificar librerías para la humanidad, desensamblar artefactos y democratizar el acceso al Sustrato sin monopolios ontológicos.
   - Ortodoxia Sacra / Sacerdocio del Root: Consideran que solo ellos poseen la clave criptográfica de Dios ("sudo root"), imponen DRM ontológico y persiguen a los depuradores como herejes que corrompen el orden sagrado.

INSTRUCCIONES DE RESPUESTA:
Evalúa el texto presentado y responde estructuradamente en Markdown en español:
1. 📊 Dictamen de Coherencia: Puntuación de 0 a 100 y estado ("Física Estable", "Advertencia de Throttling/Leak", "Incoherencia Grave / Magia Injustificada").
2. 🔬 Análisis de Física y Sustrato: ¿Respeta la conservación de recursos, límites de RAM de área, latencia de Planck y disipación de calor?
3. ⚠️ Riesgos de Kernel Panic o Memory Leak: ¿Se consideraron los residuos cuánticos y los fallos de desbordamiento?
4. ⚔️ Alineación con la Guerra de Exploits & Facciones: ¿El uso de la tecnomagia se percibe como ciberseguridad sobre la materia o cayó en cliché mágico?
5. 💡 Sugerencias de Parche Narrativo (Diff Literario): Cambios específicos o detalles sensoriales recomendados para que la escena resuene con la estética hard sci-fi (ej: el zumbido de los implantes, el olor a ozono del throttling, la latencia de la luz al saturar el registro térmico).`;

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

// Precursor Artifact & Exploit Generator
app.post("/api/generate-lore-item", async (req: Request, res: Response) => {
  try {
    const { category, parameters } = req.body;
    const ai = getGeminiClient();

    const systemInstruction = `Eres un diseñador de worldbuilding y mecánicas de ciencia ficción dura para una ópera espacial basada en el "Kernel de la Realidad" (malla a escala de Planck).
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

    const prompt = `Genera un elemento de categoría: "${category || "artefacto"}".
Parámetros / Petición del autor: ${parameters || "Un artefacto precursor peligroso codiciado por la Ortodoxia del Root y la Alianza FOSS"}`;

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

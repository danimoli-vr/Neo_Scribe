import React, { useState, useEffect, useMemo } from 'react';
import { AuditRecord, Chapter, NovelCharacter, LoreItem, TimelineEvent } from '../types';
import { 
  ShieldCheck, 
  Sparkles, 
  History, 
  RefreshCw, 
  BookOpen, 
  Lightbulb, 
  Copy, 
  ExternalLink, 
  Check, 
  Sliders, 
  Eye, 
  FileText, 
  UserCheck, 
  Clock, 
  ScrollText,
  AlertCircle
} from 'lucide-react';
import { getActiveGenre, getActiveGenreTerms } from '../services/genrePresetService';
import { 
  generateOntologicalAuditPrompt, 
  AuditFocusMode 
} from '../services/auditorPromptService';
import { CANONICAL_CHARACTERS } from '../data/canonicalLore';

const GENRE_PRESET_SCENES: Record<string, Array<{ title: string; text: string }>> = {
  scifi: [
    {
      title: 'Combate Espacial: Desfase Inercial y Radiación Térmica',
      text: `La fragata arqueológica 'Génesis Abierta' fue acorralada por un crucero de la Inquisición en los anillos de Saturno. El inyector neural de a bordo, Tarek, conectó su terminal al bus de propulsión y ejecutó un script para anular la inercia del timón a 0.001G durante 4 segundos. La nave giró 180 grados sin aplastar a la tripulación. Sin embargo, no tenían suficiente refrigerante en los radiadores de grafeno, así que la energía desplazada comenzó a sobrecalentar el mamparo de babor, mientras las torretas enemigas disparaban salvas cinéticas que parecieron congelarse a tirones por el throttling del sector.`
    },
    {
      title: 'Excavación Arqueológica: Reliquia con Memory Leak',
      text: `La doctora Vance descendió a la cámara del relé precursor en la luna de Tychos. Nadie había pisado ese sector en ochenta mil años. En el centro flotaba un prisma de cómputo que emitía un zumbido violeta. Al acercar su terminal portátil, los sensores detectaron un memory leak masivo: un bucle de contención cinética que no había ejecutado una orden de liberación de memoria (free) desde la caída de los Arquitectos. Como resultado, la gravedad en la sala oscilaba caóticamente entre 0.2G y 3G cada cinco pasos, y el aire reflejaba halos estáticos como si la luz se negara a propagarse en línea recta.`
    },
    {
      title: 'Escena Sospechosa de Magia Incoherente (Test de Detección de Bugs)',
      text: `El protagonista invocó un rayo de fuego místico de sus manos sin disipador térmico, lanzándolo a trescientos metros contra los guardias de la Inquisición. El fuego no consumió oxígeno ni generó calor de retroceso en su cuerpo, y tras derrotar a los enemigos, el protagonista simplemente guardó su energía para el siguiente conjuro sin que el sector de Planck registrara ningún cambio de entropía ni latencia.`
    }
  ],
  fantasy: [
    {
      title: 'Duelo en el Círculo Rúnico: El Coste de la Sangre',
      text: `Valeria trazó el círculo de confinamiento con polvo de obsidiana y ceniza de tejo. El inquisidor de la Orden Negra avanzaba espada en mano, con la armadura bendecida por el Sumo Sacerdote. Para quebrar la runa de protección de la espada, Valeria tuvo que morderse la muñeca y derramar tres gotas de sangre en el foco arcano. La ley de intercambio equivalente exigió su precio: la visión de su ojo izquierdo se volvió gris y el frío le entumeció los dedos, pero la onda de choque pulverizó la hoja de acero del inquisidor en mil esquirlas incandescentes.`
    },
    {
      title: 'Pacto Roto en la Alta Corte de los Vientos',
      text: `El archiduque juró por el Pozo de las Almas que jamás levantaría el asedio antes del solsticio. Sin embargo, al amanecer del tercer día, sus regimientos de lanceros rompieron las puertas de la ciudad baja aprovechando una niebla sobrenatural. Al quebrar su palabra sagrada, la marca de linaje en su garganta comenzó a arder como hierro candente, tiñéndose de negro azabache mientras los cuervos mensajeros huían en bandada anunciando la maldición de la Casa.`
    }
  ],
  noir: [
    {
      title: 'Interrogatorio a Medianoche: Coartada y Tiempos de Traslado',
      text: `El detective Montero empujó la taza de café frío sobre la mesa de metal. Marcus aseguraba haber estado cenando en el restaurante La Paloma de la zona portuaria hasta las 23:45. Sin embargo, la víctima falleció en el ático de Gran Vía a las 00:02 por un disparo a quemarropa. En noche de lluvia torrencial y con el puente sur cortado por obras, ningún vehículo podía cruzar los nueve kilómetros entre el puerto y el centro en diecisiete minutos.`
    },
    {
      title: 'Hallazgo Forense en el Callejón de las Calderas',
      text: `El forense levantó el casquillo con pinzas de plástico: 9mm Parabellum, percusión limpia, pero sin estrías de pólvora en el abrigo de la víctima. La víctima no forcejeó; conocía a su agresor y le permitió acercarse a menos de medio metro en un callejón sin salida donde supuestamente solo los miembros de la guardia nocturna tenían llave del portón.`
    }
  ],
  romance: [
    {
      title: 'La Grieta bajo la Lluvia: El Miedo a ser Descubierto',
      text: `Clara intentó cerrar la puerta del coche antes de que Julián pudiera alcanzarla. Durante tres meses había fingido que la beca en Viena no le importaba, que podía quedarse en la ciudad cuidando la galería. Pero cuando Julián le sujetó la manga empapada, no vio reproche en sus ojos, sino el mismo terror que ella sentía: si pronunciaban en voz alta lo que había ocurrido en la cabaña de la sierra, tendrían que admitir que todo lo que habían construido con sus familias era una farsa.`
    }
  ],
  history: [
    {
      title: 'Despacho Clandestino en la Corte de Felipe II',
      text: `El secretario de Estado selló el pliego con lacre escarlata y la cruz de San Andrés. El mensajero a caballo debía cruzar los Pirineos antes de las primeras nieves para entregar las instrucciones al duque de Alba en Flandes. Si la carta caía en manos de los corsarios hugonotes en el golfo de Vizcaya, la financiación de los tercios quedaría cortada durante todo el invierno.`
    }
  ],
  minimal: [
    {
      title: 'La Mesa de la Cocina: Ruptura Silenciosa',
      text: `Dejó las dos llaves sobre la encimera junto al correo sin abrir de la semana. No hubo portazo ni reproches. Solo el zumbido constante del frigorífico viejo y el sonido de los neumáticos del taxi sobre la grava húmeda al arrancar hacia la estación de tren.`
    }
  ]
};

interface CoherenceAuditorViewProps {
  initialSceneText?: string;
  initialSceneTitle?: string;
  chapters?: Chapter[];
  characters?: NovelCharacter[];
  loreItems?: LoreItem[];
  customTimelineEvents?: TimelineEvent[];
}

export const CoherenceAuditorView: React.FC<CoherenceAuditorViewProps> = ({
  initialSceneText,
  initialSceneTitle,
  chapters = [],
  characters = CANONICAL_CHARACTERS,
  loreItems = [],
  customTimelineEvents = []
}) => {
  const genre = getActiveGenre();
  const terms = getActiveGenreTerms();

  const activePresets = GENRE_PRESET_SCENES[genre.id] || GENRE_PRESET_SCENES['scifi'];

  const [sceneText, setSceneText] = useState<string>(initialSceneText || activePresets[0]?.text || '');
  const [sceneTitle, setSceneTitle] = useState<string>(initialSceneTitle || activePresets[0]?.title || '');
  const [analysisType, setAnalysisType] = useState<string>('Auditoría Integral de Coherencia');
  const [focusMode, setFocusMode] = useState<AuditFocusMode>('integral');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<string | null>(null);
  const [history, setHistory] = useState<AuditRecord[]>([]);

  // Prompt Customizer Modal state
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [includeCharacters, setIncludeCharacters] = useState<boolean>(true);
  const [includeWorldRules, setIncludeWorldRules] = useState<boolean>(true);
  const [includeTimeline, setIncludeTimeline] = useState<boolean>(true);
  const [includeLore, setIncludeLore] = useState<boolean>(true);
  const [hasCopiedToast, setHasCopiedToast] = useState<boolean>(false);

  useEffect(() => {
    if (initialSceneText) {
      setSceneText(initialSceneText);
    }
    if (initialSceneTitle) {
      setSceneTitle(initialSceneTitle);
    }
  }, [initialSceneText, initialSceneTitle]);

  // Generate full prompt dynamically with current parameters
  const fullAuditPrompt = useMemo(() => {
    return generateOntologicalAuditPrompt({
      sceneTitle,
      sceneText,
      focusMode,
      includeCharacters,
      includeWorldRules,
      includeTimeline,
      includeLore,
      allChapters: chapters,
      allCharacters: characters,
      allLoreItems: loreItems,
      allCustomEvents: customTimelineEvents
    });
  }, [
    sceneTitle,
    sceneText,
    focusMode,
    includeCharacters,
    includeWorldRules,
    includeTimeline,
    includeLore,
    chapters,
    characters,
    loreItems,
    customTimelineEvents,
    genre.id
  ]);

  // Copy prompt and open Gemini Web in a new tab
  const handleCopyAndOpenGemini = async () => {
    if (!sceneText.trim()) return;

    try {
      await navigator.clipboard.writeText(fullAuditPrompt);
      setHasCopiedToast(true);
      setTimeout(() => setHasCopiedToast(false), 5000);

      // Open official Google Gemini Web
      window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleCopyOnly = async () => {
    if (!sceneText.trim()) return;
    try {
      await navigator.clipboard.writeText(fullAuditPrompt);
      setHasCopiedToast(true);
      setTimeout(() => setHasCopiedToast(false), 4000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleRunAudit = async () => {
    if (!sceneText.trim()) return;

    setIsLoading(true);
    setCurrentReport(null);

    try {
      const response = await fetch('/api/audit-coherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneText,
          analysisType,
          genreId: genre.id,
          systemInstruction: fullAuditPrompt,
          contextConfig: {
            title: sceneTitle,
            genre: genre.name,
            universeModel: terms.appName
          }
        })
      });

      const data = await response.json();
      if (data.report) {
        setCurrentReport(data.report);
        const newRecord: AuditRecord = {
          id: `AUDIT_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          title: sceneTitle || 'Borrador de Escena',
          sceneText,
          analysisType,
          markdownReport: data.report
        };
        setHistory([newRecord, ...history]);
      } else {
        setCurrentReport('Nota: Para auditorías instantáneas sin servidor configurado, utiliza el botón "Copiar Dossier y Abrir Gemini Web (1 Clic)" de arriba, que enviará todas las reglas del mundo y fichas de personajes a tu cuenta personal de Gemini de forma gratuita.');
      }
    } catch (err: any) {
      setCurrentReport(`Aviso de conexión local: ${err.message || err}. Puedes usar el botón "Copiar Dossier y Abrir Gemini Web" para auditar directamente con tu sesión de Google.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (preset: { title: string; text: string }) => {
    setSceneTitle(preset.title);
    setSceneText(preset.text);
    setCurrentReport(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {hasCopiedToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-emerald-950 border-2 border-emerald-500 text-white p-4 rounded-md shadow-2xl animate-bounce flex items-start gap-3">
          <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
            <Check className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-emerald-300 uppercase tracking-wider">
              ¡Dossier Ontológico Copiado al Portapapeles!
            </div>
            <p className="text-slate-200 leading-relaxed font-sans">
              Se ha abierto Gemini en tu navegador. Haz clic en el campo de texto de Gemini y pulsa <strong className="text-white underline">Ctrl + V</strong> (o Pegar) para recibir el dictamen con tu modelo favorito o Gemini Advanced.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#111114] border border-[#1e293b] rounded-sm p-5 sm:p-6 bg-grid-dots">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-cyan-950/40 border border-cyan-700/80 text-cyan-400 text-xs font-mono mb-2 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{terms.auditorSectionTitle}</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">{genre.shortName.toUpperCase()}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight uppercase">
            {terms.auditorTitle}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            {terms.auditorDesc}. Puedes auditarlo directamente con la IA integrada o 
            <strong className="text-white"> exportar el dossier ontológico completo a tu cuenta de Gemini Web (1 clic)</strong> sin necesidad de configurar claves API.
          </p>
        </div>
      </div>

      {/* 1-CLICK GEMINI WEB EXPORT HERO CARD (Solución para escritores no técnicos) */}
      <div className="p-5 rounded border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/30 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Para Usuarios & Cuentas de Gemini Advanced (Sin tocar APIs)</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-mono">
              Exportar Dossier Ontológico y Auditar en Gemini Web
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Empaqueta automáticamente las <span className="text-cyan-300 font-semibold">{terms.architectureTitle}</span>, 
              fichas de <span className="text-amber-300 font-semibold">{terms.entityCharacters}</span>, eventos de la línea temporal 
              y el texto del capítulo en un prompt hiper-estructurado listo para pegar.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              onClick={() => setIsPromptModalOpen(true)}
              className="px-3.5 py-2.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Previsualizar o modificar el prompt antes de enviarlo"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Ver Prompt</span>
            </button>

            <button
              onClick={handleCopyOnly}
              disabled={!sceneText.trim()}
              className="px-3.5 py-2.5 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/60 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar prompt al portapapeles sin abrir la web"
            >
              <Copy className="w-4 h-4 text-emerald-400" />
              <span>Solo Copiar</span>
            </button>

            <button
              onClick={handleCopyAndOpenGemini}
              disabled={!sceneText.trim()}
              className={`px-5 py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                !sceneText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black border border-cyan-300 font-bold hover:shadow-cyan-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Copiar y Abrir Gemini (1 Clic)</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Scenes Buttons */}
      <div>
        <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Borradores y Escenas de Prueba ({genre.shortName}):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {activePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset)}
              className="p-3 bg-[#0d0d0f] hover:bg-[#15151a] border border-[#1e293b] hover:border-cyan-500 rounded-sm text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-white mb-1 line-clamp-1 font-mono uppercase tracking-wide">
                {preset.title}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug font-sans">
                {preset.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input & Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Editor Area */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 sm:p-5 space-y-3.5">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Título de la Escena / Capítulo:
              </label>
              <input
                type="text"
                value={sceneTitle}
                onChange={(e) => setSceneTitle(e.target.value)}
                placeholder="Ej. Encuentro en el Sector de Planck..."
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Enfoque del Prompt Experto:
                </label>
                <select
                  value={focusMode}
                  onChange={(e) => setFocusMode(e.target.value as AuditFocusMode)}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                >
                  <option value="integral">Auditoría Integral 360°</option>
                  <option value="rules_and_world">Reglas del Mundo & Costes</option>
                  <option value="characters_psychology">Psicología de Personajes (OOC)</option>
                  <option value="timeline_anachronisms">Cronología & Anacronismos</option>
                  <option value="style_and_pacing">Ritmo Narrativo & Tensión</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  Motor Local Opcional:
                </label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                >
                  <option value="Auditoría Integral de Coherencia">Auditoría Integral</option>
                  <option value="Test de Reglas y Conservación">Test de Reglas y Conservación</option>
                  <option value="Evaluación de Latencia y Continuidad">Evaluación de Continuidad</option>
                  <option value="Detección de Contradicciones">Detección de Contradicciones</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Texto de la Escena o Planteamiento:
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {sceneText.length} carácteres // {sceneText.split(/\s+/).filter(Boolean).length} palabras
                </span>
              </div>
              <textarea
                rows={12}
                value={sceneText}
                onChange={(e) => setSceneText(e.target.value)}
                placeholder="Escribe o pega aquí el fragmento de tu novela..."
                className="w-full bg-[#0a0a0c] border border-[#1e293b] rounded-sm p-3 text-xs sm:text-sm text-slate-200 focus:border-cyan-500 outline-none font-mono leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1e293b]/70">
              <button
                onClick={handleCopyAndOpenGemini}
                disabled={!sceneText.trim()}
                className="px-3.5 py-2 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Copiar y Abrir Gemini Web</span>
              </button>

              <button
                onClick={handleRunAudit}
                disabled={isLoading || !sceneText.trim()}
                className={`px-3 py-2 rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLoading
                    ? 'bg-[#1e293b] text-slate-500 cursor-not-allowed'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="Llama al endpoint interno de la app"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>Auditoria Interna...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auditar en la App</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report Output Area */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 sm:p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs sm:text-sm font-bold font-mono text-white uppercase tracking-wider">
                    Dictamen de Auditoría
                  </h3>
                </div>
                {isLoading && (
                  <span className="text-[10px] font-mono text-cyan-400 animate-pulse uppercase tracking-wider">
                    Calculando tensores ontológicos...
                  </span>
                )}
              </div>

              {currentReport ? (
                <div className="prose prose-invert prose-xs max-w-none space-y-3 text-slate-200 leading-relaxed text-xs sm:text-sm max-h-[540px] overflow-y-auto pr-2">
                  <div className="whitespace-pre-wrap font-mono text-xs bg-[#111114] p-3.5 rounded-sm border border-[#1e293b] text-slate-300">
                    {currentReport}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-800/80 flex items-center justify-center mx-auto text-cyan-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                      ¿Cómo auditar este capítulo?
                    </h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      Elige el método que prefieras:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto pt-2">
                    <div className="p-3 rounded bg-slate-900/80 border border-cyan-500/40 space-y-1">
                      <div className="text-[11px] font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>RECOMENDADO: GEMINI WEB</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-snug">
                        Haz clic en <strong className="text-white">"Copiar y Abrir Gemini (1 Clic)"</strong>. Copiará el dossier con todas las reglas y personajes para pegarlo en tu sesión de Gemini Advanced.
                      </p>
                    </div>

                    <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-300 font-mono flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>AUDITORÍA EN LA APP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-snug">
                        Haz clic en <strong className="text-white">"Auditar en la App"</strong> si tienes una clave de API configurada en el entorno para recibir el informe en esta misma ventana.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick tips footer */}
            <div className="mt-4 pt-3 border-t border-[#1e293b] text-[10px] text-slate-500 flex items-center justify-between font-mono uppercase tracking-wider">
              <span>* Regla de oro: Ninguna acción debe violar los axiomas del mundo.</span>
              <span className="text-cyan-400">{genre.shortName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit History */}
      {history.length > 0 && (
        <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Historial de Dictámenes de esta Sesión
            </h4>
          </div>

          <div className="space-y-2">
            {history.map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  setSceneTitle(record.title);
                  setSceneText(record.sceneText);
                  setCurrentReport(record.markdownReport);
                }}
                className="p-3 bg-[#111114] rounded-sm border border-[#1e293b] hover:border-cyan-500 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-white mr-2">{record.title}</span>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/60 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {record.analysisType}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{record.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PREVISUALIZAR Y PERSONALIZAR PROMPT COMPLETO */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1118] border border-cyan-500/40 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1e293b] flex items-center justify-between bg-[#131824]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Dossier Ontológico de Auditoría para Gemini Web
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Personaliza qué bloques del universo se inyectan en el prompt antes de enviarlo
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Cerrar [ESC]
              </button>
            </div>

            {/* Modal Toggles Bar */}
            <div className="p-4 border-b border-[#1e293b] bg-[#0a0d14] flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider mr-1">Incluir en el Dossier:</span>
              
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeWorldRules}
                  onChange={(e) => setIncludeWorldRules(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Leyes del Mundo</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeCharacters}
                  onChange={(e) => setIncludeCharacters(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Fichas de Personajes</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeTimeline}
                  onChange={(e) => setIncludeTimeline(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Línea Temporal</span>
              </label>

              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={includeLore}
                  onChange={(e) => setIncludeLore(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Glosario & Reliquias</span>
              </label>
            </div>

            {/* Modal Body: Prompt Preview */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#090b10]">
              <div className="mb-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>VISTA PREVIA DEL PROMPT ({fullAuditPrompt.length} caracteres):</span>
                <span className="text-cyan-400">100% Adaptado al género: {genre.name}</span>
              </div>
              <pre className="p-4 rounded bg-[#06070a] border border-[#1e293b] text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                {fullAuditPrompt}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1e293b] bg-[#131824] flex items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 font-sans hidden sm:block">
                Al hacer clic se copiará al portapapeles y se abrirá Gemini en una pestaña nueva.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    handleCopyOnly();
                    setIsPromptModalOpen(false);
                  }}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiar al Portapapeles</span>
                </button>

                <button
                  onClick={() => {
                    handleCopyAndOpenGemini();
                    setIsPromptModalOpen(false);
                  }}
                  className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Copiar y Abrir Gemini Web</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

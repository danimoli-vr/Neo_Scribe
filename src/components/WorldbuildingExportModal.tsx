import React, { useState } from 'react';
import {
  CANONICAL_AXIOMS,
  UNIVERSAL_CONSTANTS,
  CANONICAL_SYSCALLS,
  CANONICAL_EXPLOITS,
  CANONICAL_FACTIONS,
  CANONICAL_STAR_SYSTEMS,
  INITIAL_LORE_ITEMS
} from '../data/canonicalLore';
import {
  Download,
  Copy,
  Check,
  FileText,
  Code,
  ExternalLink,
  FileDown,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { generateGoogleDocsHtml, generateWordDocxBible } from '../utils/googleDocsExporter';
import { useNovelData } from '../store/NovelDataContext';
import { useGenrePreset } from '../services/genrePresetService';
import { slugify } from '../utils/slugify';

interface WorldbuildingExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldbuildingExportModal: React.FC<WorldbuildingExportModalProps> = ({ isOpen, onClose }) => {
  const { chapters, characters, novelTitle, setNovelTitle } = useNovelData();
  const { terms } = useGenrePreset();
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedRich, setCopiedRich] = useState<boolean>(false);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'google-docs' | 'markdown' | 'html' | 'json'>('google-docs');
  // Local draft so typing feels instant; only re-seeded from the saved value
  // when the modal opens (same pattern as the chapter editor's textarea —
  // see GEMINI.md #2 — this field just isn't hot enough to need it, but the
  // "don't fight the debounce while typing" part still applies).
  const [titleDraft, setTitleDraft] = useState<string>(novelTitle);

  React.useEffect(() => {
    if (isOpen) setTitleDraft(novelTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  // What every export actually uses as the document's title: the author's
  // own choice if they've set one, otherwise the name of their active
  // genre/project preset (never a hardcoded universe name).
  const bibleTitle = titleDraft.trim() || terms.appName;

  const handleTitleChange = (value: string) => {
    setTitleDraft(value);
    setNovelTitle(value);
  };

  const generateMarkdownBible = (): string => {
    return `# BIBLIA DE WORLDBUILDING: ${bibleTitle.toUpperCase()}
**Proyecto de Ópera Espacial Dura**
*Documento canónico de físicas, tecnomagia basada en el sustrato de Planck, facciones y leyes estelares.*

---

## 1. AXIOMAS INVIOLABLES DE LA REALIDAD

${CANONICAL_AXIOMS.map(a => `### ${a.id}: ${a.name}
- **Resumen:** ${a.summary}
- **Regla Física:** ${a.rule}
- **Manifestación Sensorial en Prosa:** "${a.narrativeSign}"
`).join('\n')}

---

## 2. ARQUITECTURA DEL SISTEMA DE TECNOMAGIA (EL KERNEL DE LA REALIDAD)

El universo opera sobre una malla a escala de Planck (10⁻³⁵ m). No existe el maná místico ni los conjuros espirituales. Los inyectores son operadores provistos de terminales portátiles rígidas ("slates de debug") o implantes biológicos de compilación.

### Costes y Limitaciones Técnicas:
1. **Consumo de Recursos (Compute / RAM de Área):** Cada sector métrico posee un límite de operaciones cuánticas. Si varios operadores compilan a la vez, ocurre **throttling**: latencia en la propagación de la luz, proyectiles cayendo a tirones y desincronización de marcos inerciales.
2. **Memory Leaks y Fragmentación:** Los procesos que no ejecutan rutinas de liberación de memoria (*garbage collection*) fragmentan la métrica espacial, dejando anomalías gravitacionales residuales y halos estáticos.
3. **Kernel Panic (Crash Ontológico):** Los errores de cálculo o desbordamientos de búfer no se disipan; colapsan la física local provocando microvacíos hiperdensos o la desintegración cuántica del usuario.
4. **La Guerra de Exploits:** Los combates espaciales y personales son batallas de ciberseguridad sobre la materia: anular inercia, parches moleculares en caliente y secuestro criptográfico de registros.

---

## 3. MAPA DE REGISTROS DE CONSTANTES UNIVERSALES

${UNIVERSAL_CONSTANTS.map(c => `### ${c.name} (${c.symbol})
- **Registro:** \`${c.registerAddress}\`
- **Valor Nominal:** ${c.nominalValue}
- **Potencial de Exploit:** ${c.exploitPotential}
- **Riesgo de Kernel Panic:** ${c.panicRisk}
`).join('\n')}

---

## 4. LIBRERÍAS Y SYSCALLS CANÓNICAS

${CANONICAL_SYSCALLS.map(s => `### \`${s.name}\` [${s.category}]
\`\`\`c
${s.signature}
\`\`\`
- **Descripción:** ${s.description}
- **Coste:** ${s.computeCostMFlops} MFlops | RAM: ${s.ramAreaKb} KB | Fuga: ${s.leakRiskPercent}%
- **Trigger de Panic:** ${s.panicTrigger}
- **Sensación Sensorial:** ${s.sensorySensation}
`).join('\n')}

---

## 5. GUERRA DE EXPLOITS Y SCRIPTS TÁCTICOS

${CANONICAL_EXPLOITS.map(e => `### ${e.name}
- **Facción Autora:** ${e.authorFaction}
- **Dominio Objetivo:** ${e.targetDomain}
- **Código:**
\`\`\`c
${e.codePreview}
\`\`\`
- **Efecto Físico:** ${e.physicalManifestation}
- **Aplicación Táctica:** ${e.tacticalApplication}
- **Fallo Catastrófico:** ${e.catastrophicFailure}
`).join('\n')}

---

## 6. FACCIONES Y POLÍTICA DEL KERNEL

${CANONICAL_FACTIONS.map(f => `### ${f.name} (${f.shortName})
- **Lema:** *${f.motto}*
- **Ideología:** ${f.ideology}
- **Postura DRM:** ${f.drmStance}
- **Hardware de Compilación:** ${f.compilerTech}
- **Método de Arqueología:** ${f.archeologyMethod}
- **Doctrina de Combate:** ${f.combatDoctrine}
- **Arquetipos:**
${f.keyArchetypes.map(k => `  - **${k.title}** (${k.role}): ${k.description} [Implantes: ${k.typicalImplants}]`).join('\n')}
`).join('\n')}

---

## 7. ATLAS DE SISTEMAS ESTELARES Y LEYES DE PLANCK

${CANONICAL_STAR_SYSTEMS.map(sys => `### ${sys.name} [${sys.coordinates}]
- **Ancho de Banda de Planck:** ${sys.planckBandwidth} (${sys.bandwidthFlops})
- **Estabilidad del Kernel:** ${sys.kernelStabilityPercent}%
- **Régimen DRM:** ${sys.drmPolicy}
- **Control Político:** ${sys.politicalControl}
- **Latencia de Salto FTL:** ${sys.ftlRoutingLatency}
- **Ruinas Precursoras:** ${sys.precursorRuins}
- **Modelo Económico:** ${sys.economicModel}
- **Anomalías:** ${sys.knownAnomalies.join('; ')}
`).join('\n')}

---

## 8. PERSONAJES PRINCIPALES DEL CANON

${characters.map(char => `### ${char.name} [${char.role}]
- **Facción:** ${char.factionId}
- **Implantes y Disipadores:** ${char.signatureImplants}
- **Resumen:** ${char.summary}
- **Notas de Continuidad:** ${char.notes}
`).join('\n')}

---

## 9. CAPÍTULOS DEL MANUSCRITO Y CONTINUIDAD

${chapters.map(chap => `### Capítulo ${chap.number}: ${chap.title} [${chap.status}]
- **Sistema Estelar:** ${chap.systemId} (${chap.locationDetails})
- **Personajes en Escena:** ${chap.characterIds.join(', ')}
- **Habilidades & Exploits Usados:** ${chap.abilityIds.join(', ')}
- **Palabras:** ${chap.wordCount}
- **Notas del Autor:** ${chap.authorNotes}

\`\`\`markdown
${chap.content}
\`\`\`
`).join('\n')}

---

## 10. RELIQUIAS Y ARTEFACTOS PRECURSORES DESTACADOS

${INITIAL_LORE_ITEMS.map(item => `### ${item.name} [${item.category.toUpperCase()}]
- **Arquitectura Precursora:** ${item.precursorArchitecture}
- **Especificaciones Técnicas:** ${item.technicalSpecs}
- **Descubrimiento:** ${item.loreAndDiscovery}
- **Mecánica de Exploit:** ${item.exploitMechanic}
- **Modo de Fallo:** ${item.failureMode}
- **Gancho para la Novela:** ${item.narrativeHook}
`).join('\n')}
`;
  };

  const generateJsonData = (): string => {
    return JSON.stringify({
      title: `Biblia de Worldbuilding: ${bibleTitle}`,
      exportedAt: new Date().toISOString(),
      axioms: CANONICAL_AXIOMS,
      constants: UNIVERSAL_CONSTANTS,
      syscalls: CANONICAL_SYSCALLS,
      exploits: CANONICAL_EXPLOITS,
      factions: CANONICAL_FACTIONS,
      starSystems: CANONICAL_STAR_SYSTEMS,
      characters: characters,
      chapters: chapters,
      loreItems: INITIAL_LORE_ITEMS
    }, null, 2);
  };

  const googleDocsHtml = generateGoogleDocsHtml(characters, chapters, bibleTitle);
  const markdownContent = generateMarkdownBible();
  const jsonContent = generateJsonData();
  const fileBaseName = slugify(bibleTitle, 'Biblia_de_Worldbuilding');

  // Handle standard clipboard text copy
  const handleCopy = () => {
    let contentToCopy = '';
    if (exportFormat === 'markdown') contentToCopy = markdownContent;
    else if (exportFormat === 'html' || exportFormat === 'google-docs') contentToCopy = googleDocsHtml;
    else contentToCopy = jsonContent;

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy with rich HTML format for direct Google Docs Ctrl+V pasting
  const handleCopyRichForGoogleDocs = async () => {
    try {
      const htmlBlob = new Blob([googleDocsHtml], { type: 'text/html' });
      const textBlob = new Blob([markdownContent], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([clipboardItem]);
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2500);
    } catch (e) {
      console.error('Error copying rich text, falling back to standard copy:', e);
      navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download .docx formatted specifically for Google Docs
  const handleDownloadDocx = async () => {
    try {
      setIsGeneratingDocx(true);
      const docxBlob = await generateWordDocxBible(characters, chapters, bibleTitle);
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileBaseName}_GoogleDocs.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate docx:', e);
      alert('Hubo un problema al generar el archivo .docx. Puedes usar la opción de "Copiar para Google Docs" o descargar en HTML.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // Download HTML or Markdown/JSON
  const handleDownload = () => {
    if (exportFormat === 'google-docs') {
      handleDownloadDocx();
      return;
    }

    let content = '';
    let mimeType = 'text/plain;charset=utf-8';
    let fileName = `${fileBaseName}.md`;

    if (exportFormat === 'html') {
      content = googleDocsHtml;
      mimeType = 'text/html;charset=utf-8';
      fileName = `${fileBaseName}_GoogleDocs.html`;
    } else if (exportFormat === 'markdown') {
      content = markdownContent;
      mimeType = 'text/markdown;charset=utf-8';
      fileName = `${fileBaseName}.md`;
    } else {
      content = jsonContent;
      mimeType = 'application/json;charset=utf-8';
      fileName = `${fileBaseName}_worldbuilding_data.json`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d0d0f] border border-[#1e293b] rounded-sm p-5 sm:p-6 max-w-5xl w-full max-h-[92vh] flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#1e293b] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-blue-950/60 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Exportar Biblia de Worldbuilding</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Google Docs Ready
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Exporta el compendio completo con encabezados, tablas, constantes y manuscrito listo para editar en Google Docs.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          {/* Bible Title — fully author-defined, defaults to the active preset's name */}
          <div className="mb-4">
            <label htmlFor="bible-title-input" className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Título de tu Biblia
            </label>
            <input
              id="bible-title-input"
              type="text"
              value={titleDraft}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={terms.appName}
              maxLength={120}
              className="w-full px-3 py-2 rounded-sm bg-[#0a0a0c] border border-[#1e293b] focus:border-cyan-500/70 outline-none text-sm font-mono text-white placeholder:text-slate-600 transition-colors"
            />
            <p className="text-[10px] font-mono text-slate-500 mt-1">
              Aparece en todas las exportaciones (Google Docs, Markdown, JSON) y en el nombre del archivo descargado. Déjalo vacío para usar el nombre de tu proyecto activo (<span className="text-slate-400">{terms.appName}</span>).
            </p>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setExportFormat('google-docs')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  exportFormat === 'google-docs'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                    : 'bg-[#111114] text-slate-400 hover:bg-[#181820] border border-[#1e293b]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Google Docs (.docx)
              </button>

              <button
                onClick={() => setExportFormat('html')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  exportFormat === 'html'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#111114] text-slate-400 hover:bg-[#181820] border border-[#1e293b]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Web Doc (.html)
              </button>

              <button
                onClick={() => setExportFormat('markdown')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  exportFormat === 'markdown'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#111114] text-slate-400 hover:bg-[#181820] border border-[#1e293b]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Markdown (.md)
              </button>

              <button
                onClick={() => setExportFormat('json')}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  exportFormat === 'json'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#111114] text-slate-400 hover:bg-[#181820] border border-[#1e293b]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                JSON
              </button>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRichForGoogleDocs}
                className="px-3 py-1.5 rounded-sm bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-600/80 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copia el documento con formato enriquecido (H1, tablas, negritas, estilos) para pegar directamente con Ctrl+V en Google Docs"
              >
                {copiedRich ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">¡Formato Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copiar con Formato Docs</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadDocx}
                disabled={isGeneratingDocx}
                className="px-3.5 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isGeneratingDocx ? 'Generando .docx...' : 'Descargar .docx'}</span>
              </button>
            </div>
          </div>

          {/* Informational Banner for Google Docs */}
          {exportFormat === 'google-docs' && (
            <div className="bg-blue-950/30 border border-blue-800/50 rounded-sm p-3 mb-3 text-xs font-mono text-blue-200 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-300">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>¿Cómo editarlo en Google Docs manteniendo todo el formato?</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong>Método 1 (Directo):</strong> Haz clic en <span className="text-blue-300 font-bold">"Copiar con Formato Docs"</span>, ve a Google Docs y pulsa <kbd className="px-1 py-0.5 bg-black/50 border border-slate-700 rounded text-[10px]">Ctrl + V</kbd>. ¡Se pegará con tipografía, tablas y colores intactos!
                </p>
                <p className="text-[11px] text-slate-300">
                  <strong>Método 2 (Archivo .docx):</strong> Pulsa <span className="text-blue-300 font-bold">"Descargar .docx"</span>, entra en tu Google Drive y arrastra el archivo. Al hacer doble clic se abrirá automáticamente como un documento editable de Google Docs.
                </p>
              </div>

              <a
                href="https://docs.new"
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 px-2.5 py-1.5 rounded-sm bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/60 text-blue-200 text-[11px] font-mono flex items-center gap-1.5 transition-colors"
                title="Abrir un nuevo documento en blanco en Google Docs"
              >
                <span>Abrir docs.new</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Document Preview Pane */}
          <div className="bg-[#0a0a0c] rounded-sm border border-[#1e293b] p-4 font-mono text-xs text-slate-300 h-[46vh] overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-blue-500/40">
            {exportFormat === 'google-docs' && (
              <div className="text-slate-300 space-y-4 font-sans max-w-3xl mx-auto">
                <div className="text-center pb-4 border-b border-[#1e293b]">
                  <h1 className="text-xl font-bold text-blue-400 tracking-wider">
                    BIBLIA DE WORLDBUILDING: {bibleTitle.toUpperCase()}
                  </h1>
                  <p className="text-xs text-slate-400 italic mt-1">
                    Proyecto de Ópera Espacial Dura // Tecnomagia basada en el Sustrato de Planck
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    [Previsualización maquetada para Google Docs - 100% editable]
                  </p>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-1 font-mono">
                    1. AXIOMAS INVIOLABLES DE LA REALIDAD ({CANONICAL_AXIOMS.length} LEYES)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {CANONICAL_AXIOMS.map(a => (
                      <div key={a.id} className="p-2.5 bg-[#12131b] border border-blue-950 rounded-sm">
                        <div className="font-bold text-blue-300 font-mono text-[11px]">{a.id}: {a.name}</div>
                        <div className="text-slate-400 text-[10px] mt-1">{a.summary}</div>
                        <div className="text-cyan-400/90 text-[10px] italic mt-1">"{a.narrativeSign}"</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h2 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-1 font-mono">
                    2. REGISTROS DE CONSTANTES UNIVERSALES ({UNIVERSAL_CONSTANTS.length} CONSTANTES)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] font-mono border border-slate-800">
                      <thead className="bg-[#12131b] text-blue-300">
                        <tr>
                          <th className="p-1.5 text-left border border-slate-800">Registro</th>
                          <th className="p-1.5 text-left border border-slate-800">Constante</th>
                          <th className="p-1.5 text-left border border-slate-800">Valor Nominal</th>
                          <th className="p-1.5 text-left border border-slate-800">Potencial Exploit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {UNIVERSAL_CONSTANTS.map(c => (
                          <tr key={c.registerAddress} className="border-b border-slate-800/60">
                            <td className="p-1 text-cyan-400">{c.registerAddress}</td>
                            <td className="p-1 font-bold text-slate-200">{c.name} ({c.symbol})</td>
                            <td className="p-1 text-slate-400">{c.nominalValue}</td>
                            <td className="p-1 text-slate-300">{c.exploitPotential}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h2 className="text-sm font-bold text-white uppercase border-b border-slate-800 pb-1 font-mono">
                    3. CAPÍTULOS DEL MANUSCRITO ({chapters.length} CAPÍTULOS)
                  </h2>
                  {chapters.map(c => (
                    <div key={c.id} className="p-3 bg-[#12131b] border border-slate-800 rounded-sm space-y-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-white text-xs">Capítulo {c.number}: {c.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Sistema: {c.systemId} | {c.wordCount} palabras | {c.characterIds.length} personajes
                      </div>
                      <div className="text-xs text-slate-300 font-serif italic line-clamp-3 bg-black/40 p-2 rounded border border-slate-800/80">
                        {c.content.slice(0, 320)}...
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded text-center text-xs text-slate-400">
                  ... Y más secciones completas: Facciones, Syscalls tácticas, Reliquias precursoras, Atlas de Planck y Cronología.
                </div>
              </div>
            )}

            {exportFormat === 'html' && googleDocsHtml}
            {exportFormat === 'markdown' && markdownContent}
            {exportFormat === 'json' && jsonContent}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#1e293b] mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-sm bg-[#111114] hover:bg-[#181820] text-slate-300 border border-[#1e293b] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded-sm bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {exportFormat === 'google-docs' ? 'Descargar .docx' : `Descargar .${exportFormat === 'markdown' ? 'md' : exportFormat}`}
              </span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1 rounded-sm bg-[#111114] hover:bg-[#181820] text-slate-300 border border-[#1e293b] uppercase cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

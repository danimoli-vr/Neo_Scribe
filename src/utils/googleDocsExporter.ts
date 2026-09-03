import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  AlignmentType, 
  Packer, 
  ShadingType 
} from 'docx';
import { 
  CANONICAL_AXIOMS, 
  UNIVERSAL_CONSTANTS, 
  CANONICAL_SYSCALLS, 
  CANONICAL_EXPLOITS, 
  CANONICAL_FACTIONS, 
  CANONICAL_STAR_SYSTEMS, 
  INITIAL_LORE_ITEMS 
} from '../data/canonicalLore';
import { NovelCharacter, Chapter } from '../types';
import { CANONICAL_TIMELINE_EVENTS } from '../data/canonicalTimeline';

/**
 * Generates an HTML document specially formatted for Google Docs import and copy-pasting.
 * Google Docs recognizes standard HTML tags, CSS styling, table borders, and colors seamlessly.
 */
export function generateGoogleDocsHtml(characters: NovelCharacter[], chapters: Chapter[]): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Biblia de Worldbuilding - El Kernel del Vacío</title>
  <style>
    body {
      font-family: 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 820px;
      margin: 40px auto;
      padding: 0 20px;
      background-color: #ffffff;
    }
    h1.doc-title {
      font-size: 26pt;
      font-weight: bold;
      color: #0d3b66;
      text-align: center;
      margin-top: 30px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .doc-subtitle {
      font-size: 14pt;
      color: #595959;
      text-align: center;
      margin-bottom: 25px;
      font-style: italic;
    }
    .doc-meta {
      background-color: #f0f4f8;
      border: 1px solid #d0dbe5;
      border-radius: 4px;
      padding: 12px 18px;
      margin-bottom: 40px;
      font-size: 10pt;
      color: #333333;
    }
    h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #0d3b66;
      border-bottom: 2px solid #0d3b66;
      padding-bottom: 4px;
      margin-top: 36px;
      margin-bottom: 14px;
      page-break-before: always;
    }
    h1:first-of-type {
      page-break-before: avoid;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      color: #1b4965;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 3px;
      margin-top: 24px;
      margin-bottom: 10px;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      color: #2b2d42;
      margin-top: 18px;
      margin-bottom: 6px;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
      text-align: justify;
    }
    ul, ol {
      margin-top: 4px;
      margin-bottom: 12px;
      padding-left: 24px;
    }
    li {
      margin-bottom: 5px;
    }
    .callout {
      background-color: #f8fafc;
      border-left: 4px solid #0284c7;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 10.5pt;
    }
    .callout-warning {
      background-color: #fffbeb;
      border-left: 4px solid #d97706;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 10.5pt;
    }
    .code-block {
      font-family: 'Courier New', Courier, monospace;
      background-color: #0f172a;
      color: #38bdf8;
      padding: 10px 14px;
      border-radius: 4px;
      font-size: 9.5pt;
      white-space: pre-wrap;
      word-break: break-all;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9.5pt;
    }
    th {
      background-color: #0d3b66;
      color: #ffffff;
      font-weight: bold;
      padding: 8px 10px;
      border: 1px solid #0d3b66;
      text-align: left;
    }
    td {
      padding: 7px 10px;
      border: 1px solid #d1d5db;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background-color: #f9fafb;
    }
    .tag {
      display: inline-block;
      padding: 2px 6px;
      font-size: 8.5pt;
      font-family: monospace;
      font-weight: bold;
      background-color: #e2e8f0;
      color: #1e293b;
      border-radius: 3px;
      margin-right: 4px;
    }
    .chapter-text {
      background-color: #fafaf9;
      border-left: 3px solid #78716c;
      padding: 12px 16px;
      margin: 12px 0;
      font-family: 'Georgia', serif;
      font-size: 11pt;
      white-space: pre-wrap;
      line-height: 1.7;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 30px 0;
    }
  </style>
</head>
<body>

  <h1 class="doc-title">Biblia de Worldbuilding: El Kernel del Vacío</h1>
  <div class="doc-subtitle">Proyecto de Ópera Espacial Dura // Tecnomagia basada en el Sustrato de Planck</div>

  <div class="doc-meta">
    <p><strong>Estado del Documento:</strong> Canónico &amp; Editable en Google Docs</p>
    <p><strong>Exportado:</strong> ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    <p><strong>Alcance:</strong> Físicas del Sustrato, Registros Universales, Syscalls, Exploits, Facciones, Atlas Estelar, Personajes, Cronología de Planck y Manuscrito de Capítulos.</p>
  </div>

  <h1>1. Axiomas Inviolables de la Realidad</h1>
  <p>En el universo de <em>El Kernel del Vacío</em>, la realidad física no es una creación mágica ni una metáfora espiritual: es una estructura computada sobre una malla a escala de Planck (10⁻³⁵ m). Todo inyector, reliquia y nave debe obedecer los siguientes axiomas fundamentales:</p>

  ${CANONICAL_AXIOMS.map(axiom => `
    <div class="callout">
      <h3>${axiom.id}: ${axiom.name}</h3>
      <p><strong>Resumen:</strong> ${axiom.summary}</p>
      <p><strong>Regla Física Inviolable:</strong> ${axiom.rule}</p>
      <p><strong>Manifestación Sensorial en Prosa:</strong> <em>"${axiom.narrativeSign}"</em></p>
    </div>
  `).join('')}

  <h1>2. Arquitectura del Sustrato de Planck</h1>
  <p>El universo opera como un sistema operativo continuo. La materia, la energía y la métrica espacial son variables alojadas en búferes de memoria cuántica.</p>
  
  <h3>Costes, Cuellos de Botella y Limitaciones Físicas:</h3>
  <ol>
    <li><strong>Consumo de Cómputo (Compute / RAM de Área):</strong> Cada sector métrico posee un límite finito de operaciones por segundo. Si varios operadores compilan a la vez, se produce <strong>throttling</strong>: la luz se desacelera perceptiblemente, los proyectiles caen a tirones y los marcos inerciales sufren desincronización.</li>
    <li><strong>Fugas de Memoria (Memory Leaks):</strong> Los procesos que no ejecutan rutinas de liberación de memoria (<em>garbage collection</em>) fragmentan la métrica espacial, dejando anomalías gravitacionales residuales y estática ontológica.</li>
    <li><strong>Kernel Panic (Crash Ontológico):</strong> Las colisiones de punteros o divisiones por cero provocan el colapso inmediato de la física local, generando microvacíos hiperdensos o la desintegración molecular instantánea del operador.</li>
    <li><strong>La Guerra de Exploits:</strong> La guerra espacial no es de artillería convencional; es una confrontación de ciberseguridad sobre la materia prima del cosmos.</li>
  </ol>

  <h1>3. Registros de Constantes Universales</h1>
  <p>Las leyes de la física se almacenan en registros direccionables. La manipulación de estos valores altera la conducta de la materia:</p>

  <table>
    <thead>
      <tr>
        <th>Registro</th>
        <th>Símbolo</th>
        <th>Constante</th>
        <th>Valor Nominal</th>
        <th>Potencial de Exploit</th>
        <th>Riesgo de Panic</th>
      </tr>
    </thead>
    <tbody>
      ${UNIVERSAL_CONSTANTS.map(c => `
        <tr>
          <td><code>${c.registerAddress}</code></td>
          <td><strong>${c.symbol}</strong></td>
          <td>${c.name}</td>
          <td>${c.nominalValue}</td>
          <td>${c.exploitPotential}</td>
          <td><span class="tag">${c.panicRisk}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h1>4. Librerías y Syscalls Canónicas</h1>
  <p>Llamadas al sistema del sustrato utilizadas por inyectores tácticos para compilar efectos físicos directos:</p>

  ${CANONICAL_SYSCALLS.map(s => `
    <h3>${s.name} <span class="tag">${s.category}</span></h3>
    <div class="code-block">${s.signature}</div>
    <ul>
      <li><strong>Descripción:</strong> ${s.description}</li>
      <li><strong>Coste de Cómputo:</strong> ${s.computeCostMFlops} MFlops | <strong>RAM de Área:</strong> ${s.ramAreaKb} KB</li>
      <li><strong>Riesgo de Memory Leak:</strong> ${s.leakRiskPercent}%</li>
      <li><strong>Trigger de Kernel Panic:</strong> <em>${s.panicTrigger}</em></li>
      <li><strong>Manifestación Sensorial:</strong> ${s.sensorySensation}</li>
    </ul>
  `).join('')}

  <h1>5. Guerra de Exploits y Scripts Tácticos</h1>
  <p>Fragmentos de código de ensamblador de Planck desarrollados por las facciones para vulnerar el DRM del sustrato:</p>

  ${CANONICAL_EXPLOITS.map(e => `
    <div class="callout-warning">
      <h3>${e.name}</h3>
      <p><strong>Facción Creadora:</strong> ${e.authorFaction} | <strong>Dominio Objetivo:</strong> ${e.targetDomain}</p>
      <div class="code-block">${e.codePreview}</div>
      <p><strong>Manifestación Física:</strong> ${e.physicalManifestation}</p>
      <p><strong>Aplicación Táctica:</strong> ${e.tacticalApplication}</p>
      <p><strong>Consecuencia de Fallo Catastrófico:</strong> <em>${e.catastrophicFailure}</em></p>
    </div>
  `).join('')}

  <h1>6. Facciones y Geopolítica Estelar</h1>
  <p>Las potencias del Brazo de Perseo enfrentadas por el control de las licencias de compilación y las ruinas precursoras:</p>

  ${CANONICAL_FACTIONS.map(f => `
    <h2>${f.name} (${f.shortName})</h2>
    <p><em>"${f.motto}"</em></p>
    <ul>
      <li><strong>Ideología:</strong> ${f.ideology}</li>
      <li><strong>Postura ante el DRM:</strong> ${f.drmStance}</li>
      <li><strong>Hardware de Compilación:</strong> ${f.compilerTech}</li>
      <li><strong>Doctrina Militar:</strong> ${f.combatDoctrine}</li>
      <li><strong>Método de Arqueología:</strong> ${f.archeologyMethod}</li>
    </ul>
    <h3>Arquetipos Representativos:</h3>
    <ul>
      ${f.keyArchetypes.map(a => `
        <li><strong>${a.title}</strong> (${a.role}): ${a.description} <em>[Implantes típicos: ${a.typicalImplants}]</em></li>
      `).join('')}
    </ul>
  `).join('')}

  <h1>7. Atlas de Sistemas Estelares y Leyes de Planck</h1>
  <p>Topología galáctica, anchos de banda de inyección y regímenes de DRM:</p>

  <table>
    <thead>
      <tr>
        <th>Sistema</th>
        <th>Coord.</th>
        <th>Ancho de Banda</th>
        <th>Estabilidad</th>
        <th>Régimen DRM</th>
        <th>Control</th>
        <th>Latencia FTL</th>
      </tr>
    </thead>
    <tbody>
      ${CANONICAL_STAR_SYSTEMS.map(sys => `
        <tr>
          <td><strong>${sys.name}</strong></td>
          <td><code>${sys.coordinates}</code></td>
          <td>${sys.planckBandwidth}</td>
          <td>${sys.kernelStabilityPercent}%</td>
          <td>${sys.drmPolicy}</td>
          <td>${sys.politicalControl}</td>
          <td>${sys.ftlRoutingLatency}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h1>8. Personajes Principales del Canon</h1>
  <p>Dossiers biográficos, implantes distintivos y notas de continuidad narrativa:</p>

  ${characters.map(char => `
    <div class="callout">
      <h3>${char.name} <span class="tag">${char.role}</span></h3>
      <p><strong>Facción:</strong> ${char.factionId}</p>
      <p><strong>Implantes &amp; Disipadores de Calor:</strong> ${char.signatureImplants}</p>
      <p><strong>Biografía / Resumen:</strong> ${char.summary}</p>
      <p><strong>Notas de Continuidad:</strong> <em>${char.notes}</em></p>
    </div>
  `).join('')}

  <h1>9. Cronología Diegética de Planck</h1>
  <p>Línea temporal estelar desde el Gran Commit hasta la Rebelión del Buffer Libre:</p>

  <table>
    <thead>
      <tr>
        <th>Ciclo</th>
        <th>Época</th>
        <th>Evento / Hito Canónico</th>
        <th>Categoría</th>
        <th>Sistemas Involucrados</th>
      </tr>
    </thead>
    <tbody>
      ${CANONICAL_TIMELINE_EVENTS.map(t => `
        <tr>
          <td><strong>${t.year.toFixed(3)}</strong></td>
          <td><span class="tag">${t.eraId}</span></td>
          <td>
            <strong>${t.title}</strong><br/>
            <small>${t.description}</small>
          </td>
          <td>${t.category}</td>
          <td>${t.systemId || 'Espacio Profundo'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h1>10. Manuscrito: Capítulos y Continuidad</h1>
  <p>Registro de escenas, contenido textual y notas del autor listas para revisión:</p>

  ${chapters.map(chap => `
    <h2>Capítulo ${chap.number}: ${chap.title} <span class="tag">${chap.status}</span></h2>
    <ul>
      <li><strong>Ciclo Diegético:</strong> ${chap.diegeticCycle ? chap.diegeticCycle.toFixed(3) : '3042.188'} (${chap.diegeticDateLabel || 'Estándar'})</li>
      <li><strong>Sistema Estelar:</strong> ${chap.systemId} - ${chap.locationDetails}</li>
      <li><strong>Personajes Presentes:</strong> ${chap.characterIds.join(', ')}</li>
      <li><strong>Syscalls &amp; Exploits Usados:</strong> ${chap.abilityIds.join(', ')}</li>
      <li><strong>Conteo de Palabras:</strong> ${chap.wordCount} palabras</li>
      <li><strong>Notas del Autor:</strong> <em>${chap.authorNotes}</em></li>
    </ul>
    <h3>Texto de la Escena:</h3>
    <div class="chapter-text">${escapeHtml(chap.content)}</div>
  `).join('')}

  <h1>11. Reliquias y Artefactos Precursores</h1>
  <p>Hardware arqueológico rescatado de la civilización de los Arquitectos:</p>

  ${INITIAL_LORE_ITEMS.map(item => `
    <div class="callout">
      <h3>${item.name} <span class="tag">${item.category.toUpperCase()}</span></h3>
      <p><strong>Arquitectura Precursora:</strong> ${item.precursorArchitecture}</p>
      <p><strong>Especificaciones Técnicas:</strong> ${item.technicalSpecs}</p>
      <p><strong>Descubrimiento Canónico:</strong> ${item.loreAndDiscovery}</p>
      <p><strong>Mecánica de Exploit:</strong> ${item.exploitMechanic}</p>
      <p><strong>Modo de Fallo / Riesgo:</strong> <em>${item.failureMode}</em></p>
      <p><strong>Gancho Narrativo:</strong> ${item.narrativeHook}</p>
    </div>
  `).join('')}

  <hr/>
  <p style="text-align: center; color: #888; font-size: 9pt;">
    Fin del Documento Canónico // Generado automáticamente por KRNL.VACUO Worldbuilding Suite
  </p>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Builds a binary Microsoft Word (.docx) document using the `docx` package.
 * Google Docs natively opens, renders, and edits .docx documents with 100% typographic fidelity.
 */
export async function generateWordDocxBible(characters: NovelCharacter[], chapters: Chapter[]): Promise<Blob> {
  const sectionsChildren: any[] = [];

  // Title & Subtitle
  sectionsChildren.push(
    new Paragraph({
      text: 'BIBLIA DE WORLDBUILDING: EL KERNEL DEL VACÍO',
      heading: HeadingLevel.TITLE,
      spacing: { after: 150 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: 'Proyecto de Ópera Espacial Dura // Tecnomagia basada en el Sustrato de Planck',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 300 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Documento de Canon & Manuscrito generado el ${new Date().toLocaleDateString('es-ES')}.`,
          italics: true,
          color: '666666',
        }),
      ],
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    })
  );

  // 1. AXIOMAS INVIOLABLES
  sectionsChildren.push(
    new Paragraph({
      text: '1. AXIOMAS INVIOLABLES DE LA REALIDAD',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'El universo físico opera como un sistema operativo sobre una malla a escala de Planck (10⁻³⁵ m). Todo inyector, reliquia y nave debe obedecer los siguientes axiomas fundamentales:',
        }),
      ],
      spacing: { after: 200 },
    })
  );

  CANONICAL_AXIOMS.forEach(axiom => {
    sectionsChildren.push(
      new Paragraph({
        text: `${axiom.id}: ${axiom.name}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Resumen: ', bold: true }),
          new TextRun({ text: axiom.summary }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Regla Física: ', bold: true }),
          new TextRun({ text: axiom.rule }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Manifestación Sensorial: ', bold: true }),
          new TextRun({ text: `"${axiom.narrativeSign}"`, italics: true }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  // 2. ARQUITECTURA DEL SUSTRATO
  sectionsChildren.push(
    new Paragraph({
      text: '2. ARQUITECTURA DEL SISTEMA DE TECNOMAGIA',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '1. Consumo de Cómputo (Compute / RAM de Área): ',
          bold: true,
        }),
        new TextRun({
          text: 'Cada sector métrico posee un límite de operaciones cuánticas. Si varios operadores compilan a la vez, ocurre throttling: latencia en la propagación de la luz, proyectiles cayendo a tirones y desincronización de marcos inerciales.',
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '2. Memory Leaks y Fragmentación: ',
          bold: true,
        }),
        new TextRun({
          text: 'Los procesos que no ejecutan rutinas de liberación de memoria (garbage collection) fragmentan la métrica espacial, dejando anomalías gravitacionales residuales.',
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '3. Kernel Panic (Crash Ontológico): ',
          bold: true,
        }),
        new TextRun({
          text: 'Los errores de cálculo o desbordamientos de búfer colapsan la física local provocando microvacíos hiperdensos o la desintegración cuántica del usuario.',
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '4. La Guerra de Exploits: ',
          bold: true,
        }),
        new TextRun({
          text: 'Las batallas espaciales y personales son enfrentamientos de ciberseguridad sobre la materia: anular inercia, parches moleculares en caliente y secuestro criptográfico de registros.',
        }),
      ],
      spacing: { after: 250 },
    })
  );

  // 3. REGISTROS DE CONSTANTES UNIVERSALES
  sectionsChildren.push(
    new Paragraph({
      text: '3. MAPA DE REGISTROS DE CONSTANTES UNIVERSALES',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  const tableRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Registro', bold: true, color: 'FFFFFF' })] })],
          shading: { fill: '0d3b66', type: ShadingType.CLEAR, color: 'auto' },
          width: { size: 2000, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Constante', bold: true, color: 'FFFFFF' })] })],
          shading: { fill: '0d3b66', type: ShadingType.CLEAR, color: 'auto' },
          width: { size: 2500, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Valor Nominal', bold: true, color: 'FFFFFF' })] })],
          shading: { fill: '0d3b66', type: ShadingType.CLEAR, color: 'auto' },
          width: { size: 2000, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'Potencial de Exploit', bold: true, color: 'FFFFFF' })] })],
          shading: { fill: '0d3b66', type: ShadingType.CLEAR, color: 'auto' },
          width: { size: 3500, type: WidthType.DXA },
        }),
      ],
    }),
  ];

  UNIVERSAL_CONSTANTS.forEach(c => {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: c.registerAddress })],
            width: { size: 2000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: `${c.name} (${c.symbol})` })],
            width: { size: 2500, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: c.nominalValue })],
            width: { size: 2000, type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({ text: c.exploitPotential })],
            width: { size: 3500, type: WidthType.DXA },
          }),
        ],
      })
    );
  });

  sectionsChildren.push(
    new Table({
      rows: tableRows,
      width: { size: 10000, type: WidthType.DXA },
    }),
    new Paragraph({ text: '', spacing: { after: 300 } })
  );

  // 4. SYSCALLS
  sectionsChildren.push(
    new Paragraph({
      text: '4. LIBRERÍAS Y SYSCALLS CANÓNICAS',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  CANONICAL_SYSCALLS.forEach(s => {
    sectionsChildren.push(
      new Paragraph({
        text: `${s.name} [${s.category}]`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: s.signature,
            font: 'Courier New',
            color: '0284c7',
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Descripción: ', bold: true }),
          new TextRun({ text: s.description }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Coste: ', bold: true }),
          new TextRun({ text: `${s.computeCostMFlops} MFlops | RAM: ${s.ramAreaKb} KB | Riesgo Leak: ${s.leakRiskPercent}%` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Trigger de Kernel Panic: ', bold: true }),
          new TextRun({ text: s.panicTrigger, italics: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Manifestación Sensorial: ', bold: true }),
          new TextRun({ text: s.sensorySensation }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  // 5. EXPLOITS
  sectionsChildren.push(
    new Paragraph({
      text: '5. GUERRA DE EXPLOITS Y SCRIPTS TÁCTICOS',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  CANONICAL_EXPLOITS.forEach(e => {
    sectionsChildren.push(
      new Paragraph({
        text: e.name,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Facción Creadora: ${e.authorFaction} | Objetivo: ${e.targetDomain}`, italics: true }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: e.codePreview,
            font: 'Courier New',
            color: '0369a1',
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Efecto Físico: ', bold: true }),
          new TextRun({ text: e.physicalManifestation }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Aplicación Táctica: ', bold: true }),
          new TextRun({ text: e.tacticalApplication }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Consecuencia de Fallo: ', bold: true }),
          new TextRun({ text: e.catastrophicFailure, italics: true }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  // 6. FACCIONES
  sectionsChildren.push(
    new Paragraph({
      text: '6. FACCIONES Y GEOPOLÍTICA ESTELAR',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  CANONICAL_FACTIONS.forEach(f => {
    sectionsChildren.push(
      new Paragraph({
        text: `${f.name} (${f.shortName})`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `"${f.motto}"`, italics: true, color: '555555' }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Ideología: ', bold: true }),
          new TextRun({ text: f.ideology }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Postura DRM: ', bold: true }),
          new TextRun({ text: f.drmStance }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Hardware de Compilación: ', bold: true }),
          new TextRun({ text: f.compilerTech }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Doctrina Militar: ', bold: true }),
          new TextRun({ text: f.combatDoctrine }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  // 7. ATLAS ESTELAR
  sectionsChildren.push(
    new Paragraph({
      text: '7. ATLAS DE SISTEMAS ESTELARES',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  CANONICAL_STAR_SYSTEMS.forEach(sys => {
    sectionsChildren.push(
      new Paragraph({
        text: `${sys.name} [${sys.coordinates}]`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Ancho de Banda Planck: ', bold: true }),
          new TextRun({ text: `${sys.planckBandwidth} (${sys.bandwidthFlops})` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Estabilidad del Kernel: ', bold: true }),
          new TextRun({ text: `${sys.kernelStabilityPercent}%` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Régimen DRM & Control: ', bold: true }),
          new TextRun({ text: `${sys.drmPolicy} | ${sys.politicalControl}` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Latencia de Salto FTL: ', bold: true }),
          new TextRun({ text: sys.ftlRoutingLatency }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  // 8. PERSONAJES
  sectionsChildren.push(
    new Paragraph({
      text: '8. PERSONAJES PRINCIPALES DEL CANON',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  characters.forEach(char => {
    sectionsChildren.push(
      new Paragraph({
        text: `${char.name} [${char.role}]`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Facción: ', bold: true }),
          new TextRun({ text: char.factionId }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Implantes & Disipadores: ', bold: true }),
          new TextRun({ text: char.signatureImplants }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Resumen Biográfico: ', bold: true }),
          new TextRun({ text: char.summary }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Notas de Continuidad: ', bold: true }),
          new TextRun({ text: char.notes, italics: true }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  // 9. CAPÍTULOS DEL MANUSCRITO
  sectionsChildren.push(
    new Paragraph({
      text: '9. CAPÍTULOS DEL MANUSCRITO',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  chapters.forEach(chap => {
    sectionsChildren.push(
      new Paragraph({
        text: `Capítulo ${chap.number}: ${chap.title} [${chap.status}]`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 250, after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Ubicación: ', bold: true }),
          new TextRun({ text: `${chap.systemId} (${chap.locationDetails})` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Personajes: ', bold: true }),
          new TextRun({ text: chap.characterIds.join(', ') }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Ciclo Diegético: ', bold: true }),
          new TextRun({ text: chap.diegeticDateLabel || `Ciclo ${chap.diegeticCycle || 3042.188}` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Palabras: ', bold: true }),
          new TextRun({ text: `${chap.wordCount} palabras` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Notas del Autor: ', bold: true }),
          new TextRun({ text: chap.authorNotes, italics: true }),
        ],
        spacing: { after: 150 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Texto del Capítulo:', bold: true }),
        ],
        spacing: { after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: chap.content,
            font: 'Georgia',
          }),
        ],
        spacing: { after: 300 },
      })
    );
  });

  // 10. RELIQUIAS
  sectionsChildren.push(
    new Paragraph({
      text: '10. RELIQUIAS Y ARTEFACTOS PRECURSORES',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  INITIAL_LORE_ITEMS.forEach(item => {
    sectionsChildren.push(
      new Paragraph({
        text: `${item.name} [${item.category.toUpperCase()}]`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Arquitectura: ', bold: true }),
          new TextRun({ text: item.precursorArchitecture }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Especificaciones Técnicas: ', bold: true }),
          new TextRun({ text: item.technicalSpecs }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Descubrimiento: ', bold: true }),
          new TextRun({ text: item.loreAndDiscovery }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Mecánica de Exploit: ', bold: true }),
          new TextRun({ text: item.exploitMechanic }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '• Modo de Fallo: ', bold: true }),
          new TextRun({ text: item.failureMode, italics: true }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sectionsChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

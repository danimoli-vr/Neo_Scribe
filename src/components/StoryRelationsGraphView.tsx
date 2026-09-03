import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, Search, ZoomIn, ZoomOut, Maximize2, AlertTriangle, 
  AlertCircle, ShieldAlert, BookOpen, ExternalLink, Filter, 
  RotateCcw, Sparkles, User, Globe, Cpu, Terminal, ArrowRight, 
  ChevronRight, X, Info, Zap, Layers, RefreshCw, CheckCircle2, FileText
} from 'lucide-react';
import { 
  Chapter, 
  NovelCharacter, 
  StarSystem, 
  Syscall, 
  ExploitScript, 
  Faction,
  StoryGraphNode, 
  StoryGraphLink, 
  StoryGraphData, 
  PlotInconsistency,
  GraphNodeType 
} from '../types';
import { 
  INITIAL_CHAPTERS, 
  CANONICAL_CHARACTERS, 
  CANONICAL_STAR_SYSTEMS, 
  CANONICAL_SYSCALLS, 
  CANONICAL_EXPLOITS, 
  CANONICAL_FACTIONS 
} from '../data/canonicalLore';
import { extractStoryGraph } from '../utils/storyGraphExtractor';
import { EntityCardModal } from './EntityCardModal';

interface StoryRelationsGraphViewProps {
  onOpenChapterInEditor?: (chapterNumber: number) => void;
  onSendToAuditor?: (text: string, title: string) => void;
}

export const StoryRelationsGraphView: React.FC<StoryRelationsGraphViewProps> = ({
  onOpenChapterInEditor,
  onSendToAuditor
}) => {
  // 1. Data Loading from LocalStorage with fallbacks
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('krnl_chapters_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading chapters', e);
      }
    }
    return INITIAL_CHAPTERS;
  });

  const [characters, setCharacters] = useState<NovelCharacter[]>(() => {
    const saved = localStorage.getItem('krnl_characters_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading characters', e);
      }
    }
    return CANONICAL_CHARACTERS;
  });

  const starSystems = CANONICAL_STAR_SYSTEMS;
  const syscalls = CANONICAL_SYSCALLS;
  const exploits = CANONICAL_EXPLOITS;
  const factions = CANONICAL_FACTIONS;

  // Refresh handler
  const handleReloadData = () => {
    const savedChaps = localStorage.getItem('krnl_chapters_v1');
    if (savedChaps) {
      try { setChapters(JSON.parse(savedChaps)); } catch (e) { console.error(e); }
    }
    const savedChars = localStorage.getItem('krnl_characters_v1');
    if (savedChars) {
      try { setCharacters(JSON.parse(savedChars)); } catch (e) { console.error(e); }
    }
  };

  // 2. Filter & Timeline States
  const [selectedTimelineChapter, setSelectedTimelineChapter] = useState<number | null>(null);
  const [activeTypes, setActiveTypes] = useState<Record<GraphNodeType, boolean>>({
    PERSONAJE: true,
    PLANETA: true,
    TECNOLOGIA: true
  });
  const [showOnlyInconsistencies, setShowOnlyInconsistencies] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 3. Selection & Inspection States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedInconsistencyId, setSelectedInconsistencyId] = useState<string | null>(null);
  const [sidePanelTab, setSidePanelTab] = useState<'INSPECTOR' | 'INCONSISTENCIAS'>('INCONSISTENCIAS');
  const [inspectingModalNode, setInspectingModalNode] = useState<StoryGraphNode | null>(null);

  // 4. Graph Extraction
  const graphData: StoryGraphData = useMemo(() => {
    return extractStoryGraph(
      chapters,
      characters,
      starSystems,
      syscalls,
      exploits,
      factions,
      selectedTimelineChapter
    );
  }, [chapters, characters, starSystems, syscalls, exploits, factions, selectedTimelineChapter]);

  // Filtered nodes & links for rendering
  const filteredNodes = useMemo(() => {
    return graphData.nodes.filter(node => {
      // Type filter
      if (!activeTypes[node.type]) return false;
      // Inconsistencies only
      if (showOnlyInconsistencies && node.inconsistencyCount === 0) return false;
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = node.name.toLowerCase().includes(q);
        const matchRole = node.roleOrCategory.toLowerCase().includes(q);
        const matchDesc = node.description.toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchDesc) return false;
      }
      return true;
    });
  }, [graphData.nodes, activeTypes, showOnlyInconsistencies, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredLinks = useMemo(() => {
    return graphData.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as StoryGraphNode).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as StoryGraphNode).id;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });
  }, [graphData.links, filteredNodeIds]);

  // Inconsistency counts
  const criticalCount = useMemo(() => graphData.inconsistencies.filter(i => i.severity === 'CRITICA').length, [graphData.inconsistencies]);
  const warningCount = useMemo(() => graphData.inconsistencies.filter(i => i.severity === 'ADVERTENCIA').length, [graphData.inconsistencies]);
  const suggestionCount = useMemo(() => graphData.inconsistencies.filter(i => i.severity === 'SUGERENCIA').length, [graphData.inconsistencies]);

  // Selected node details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graphData.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData.nodes]);

  // Connected links for selected node
  const selectedNodeConnections = useMemo(() => {
    if (!selectedNodeId) return [];
    return graphData.links.filter(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as StoryGraphNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as StoryGraphNode).id;
      return sId === selectedNodeId || tId === selectedNodeId;
    }).map(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as StoryGraphNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as StoryGraphNode).id;
      const otherId = sId === selectedNodeId ? tId : sId;
      const otherNode = graphData.nodes.find(n => n.id === otherId);
      return {
        link: l,
        otherNode
      };
    }).filter(item => item.otherNode !== undefined);
  }, [selectedNodeId, graphData.links, graphData.nodes]);

  // Inconsistencies for selected node
  const selectedNodeInconsistencies = useMemo(() => {
    if (!selectedNodeId) return [];
    return graphData.inconsistencies.filter(i => i.affectedNodeIds.includes(selectedNodeId));
  }, [selectedNodeId, graphData.inconsistencies]);

  // 5. D3 Canvas Rendering & Simulation
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<StoryGraphNode, StoryGraphLink> | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });

  // Handle ResizeObserver for dynamic window resizing and desktop window adjustments
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerDimensions(prev => {
            if (Math.abs(prev.width - width) > 5 || Math.abs(prev.height - height) > 5) {
              return { width: Math.round(width), height: Math.round(height) };
            }
            return prev;
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Focus on a specific node or coordinate
  const focusNode = useCallback((nodeId: string) => {
    const node = filteredNodes.find(n => n.id === nodeId);
    if (!node || node.x === undefined || node.y === undefined || !svgRef.current || !zoomBehaviorRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    svg.transition()
      .duration(750)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(1.3).translate(-node.x, -node.y)
      );
  }, [filteredNodes]);

  // Reset zoom to default
  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  };

  // Zoom In / Out
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.77);
  };

  // D3 Force Simulation Effect
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerDimensions.width || containerRef.current.clientWidth || 800;
    const height = containerDimensions.height || containerRef.current.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Definition of filters and gradients
    const defs = svg.append('defs');

    // Glow filter for inconsistencies
    const glowFilter = defs.append('filter')
      .attr('id', 'inconsistency-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Root Group for Zoom
    const g = svg.append('g').attr('class', 'graph-root');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Prepare deep clones of data for D3 mutation
    const simNodes: StoryGraphNode[] = filteredNodes.map(d => ({ ...d }));
    const nodeMap = new Map(simNodes.map(d => [d.id, d]));

    const simLinks: StoryGraphLink[] = filteredLinks
      .map(d => {
        const sId = typeof d.source === 'string' ? d.source : d.source.id;
        const tId = typeof d.target === 'string' ? d.target : d.target.id;
        return {
          ...d,
          source: nodeMap.get(sId)!,
          target: nodeMap.get(tId)!
        };
      })
      .filter(d => d.source && d.target);

    // Create D3 Force Simulation
    const simulation = d3.forceSimulation<StoryGraphNode>(simNodes)
      .force('link', d3.forceLink<StoryGraphNode, StoryGraphLink>(simLinks)
        .id(d => d.id)
        .distance(d => d.hasInconsistency ? 140 : 90)
      )
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(d => (d as StoryGraphNode).radius + 24).iterations(2));

    simulationRef.current = simulation;

    // Render Links
    const linkGroup = g.append('g').attr('class', 'links');
    const linkElements = linkGroup.selectAll<SVGLineElement, StoryGraphLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', d => d.hasInconsistency ? '#ef4444' : '#1e293b')
      .attr('stroke-width', d => Math.max(1.5, Math.min(5, d.weight * 1.5)))
      .attr('stroke-dasharray', d => d.hasInconsistency ? '4,4' : 'none')
      .attr('stroke-opacity', d => d.hasInconsistency ? 0.85 : 0.6)
      .attr('class', 'transition-all duration-200');

    // Render Nodes Group
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll<SVGGElement, StoryGraphNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'cursor-pointer select-none')
      .call(d3.drag<SVGGElement, StoryGraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        setSidePanelTab('INSPECTOR');
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        setInspectingModalNode(d);
      });

    // Inconsistency Alert Ring (Outer Pulsing Circle)
    nodeElements.filter(d => d.inconsistencyCount > 0)
      .append('circle')
      .attr('r', d => d.radius + 7)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,3')
      .attr('filter', 'url(#inconsistency-glow)')
      .attr('opacity', 0.85)
      .append('animateTransform')
      .attr('attributeName', 'transform')
      .attr('type', 'rotate')
      .attr('from', '0 0 0')
      .attr('to', '360 0 0')
      .attr('dur', '12s')
      .attr('repeatCount', 'indefinite');

    // Base Node Circle (Background)
    nodeElements.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', '#0d0d12')
      .attr('stroke', d => d.inconsistencyCount > 0 ? '#ef4444' : d.color)
      .attr('stroke-width', d => d.id === selectedNodeId ? 3.5 : 2)
      .attr('class', 'hover:brightness-125 transition-all');

    // Inner Glyph / Symbol
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', d => d.radius * 0.9)
      .attr('fill', d => d.color)
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text(d => {
        if (d.type === 'PERSONAJE') return '◈';
        if (d.type === 'PLANETA') return '◉';
        return '⌗';
      });

    // Inconsistency Badge Flag
    nodeElements.filter(d => d.inconsistencyCount > 0)
      .append('circle')
      .attr('cx', d => d.radius * 0.75)
      .attr('cy', d => -d.radius * 0.75)
      .attr('r', 7)
      .attr('fill', '#dc2626')
      .attr('stroke', '#0d0d12')
      .attr('stroke-width', 1.5);

    nodeElements.filter(d => d.inconsistencyCount > 0)
      .append('text')
      .attr('x', d => d.radius * 0.75)
      .attr('y', d => -d.radius * 0.75)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '8px')
      .attr('fill', '#ffffff')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace')
      .text(d => d.inconsistencyCount);

    // Node Label (Bottom text)
    nodeElements.append('text')
      .attr('y', d => d.radius + 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', d => d.id === selectedNodeId ? '#38bdf8' : '#e2e8f0')
      .attr('font-weight', d => d.id === selectedNodeId ? 'bold' : 'normal')
      .attr('font-family', 'monospace')
      .attr('class', 'pointer-events-none drop-shadow-md')
      .text(d => d.name.length > 18 ? `${d.name.slice(0, 16)}…` : d.name);

    // Subtitle label (Category / Role)
    nodeElements.append('text')
      .attr('y', d => d.radius + 24)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#64748b')
      .attr('font-family', 'monospace')
      .attr('class', 'pointer-events-none')
      .text(d => {
        if (d.type === 'PERSONAJE') return d.subType?.slice(0, 20) || 'Personaje';
        if (d.type === 'PLANETA') return d.name;
        return d.subType || 'Tecnología';
      });

    // Tick Handler
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => ((d.source as StoryGraphNode).x ?? 0))
        .attr('y1', d => ((d.source as StoryGraphNode).y ?? 0))
        .attr('x2', d => ((d.target as StoryGraphNode).x ?? 0))
        .attr('y2', d => ((d.target as StoryGraphNode).y ?? 0));

      nodeElements
        .attr('transform', d => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    // Deselect click on background
    svg.on('click', () => {
      setSelectedNodeId(null);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredLinks, selectedNodeId, containerDimensions.width, containerDimensions.height]);

  // Jump to specific inconsistency and focus node
  const handleSelectInconsistency = (inc: PlotInconsistency) => {
    setSelectedInconsistencyId(inc.id);
    if (inc.affectedNodeIds.length > 0) {
      const firstNodeId = inc.affectedNodeIds[0];
      setSelectedNodeId(firstNodeId);
      focusNode(firstNodeId);
    }
  };

  // Dispatch to Gemini Auditor
  const handleAuditorDispatch = (inc: PlotInconsistency) => {
    if (!onSendToAuditor) return;
    const prefill = `INCONSISTENCIA DE TRAMA DETECTADA EN EL GRAFO NARRATIVO:
Tipo: ${inc.type} [Severidad: ${inc.severity}]
Título: ${inc.title}
Descripción del Conflicto: ${inc.description}
Capítulos Implicados: ${inc.affectedChapterNumbers.map(n => `Cap. ${n}`).join(', ') || 'N/A'}
Entidades Involucradas: ${inc.affectedNodeIds.join(', ')}

Recomendación Canónica: ${inc.recommendation}

Por favor, audita este conflicto contra las leyes del Kernel de Planck (entropía, latencia métrica y DRM de la Ortodoxia) y genera 2 propuestas de reconciliación argumental para el autor.`;

    onSendToAuditor(prefill, inc.title);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Quick Metrics Bar */}
      <div className="bg-[#0f1218] border border-[#1e293b] rounded-sm p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-500 rotate-45 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold text-white font-mono uppercase tracking-wide flex items-center gap-2">
                MAPA DE GRAFOS DE RELACIONES & COHERENCIA NARRATIVA
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Topología viva de personajes, planetas y tecnologías extraídos de los manuscritos. Detecta saltos estelares instantáneos, sobrecargas térmicas y violaciones del sustrato.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="bg-[#0a0a0d] border border-[#1e293b] px-3 py-1.5 rounded-sm flex items-center gap-2">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Nodos:</span>
              <span className="text-white font-bold">{filteredNodes.length}</span>
            </div>

            <div className="bg-[#0a0a0d] border border-[#1e293b] px-3 py-1.5 rounded-sm flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Enlaces:</span>
              <span className="text-white font-bold">{filteredLinks.length}</span>
            </div>

            <div className={`border px-3 py-1.5 rounded-sm flex items-center gap-2 ${
              criticalCount > 0 
                ? 'bg-rose-950/40 border-rose-600 text-rose-300' 
                : warningCount > 0 
                  ? 'bg-amber-950/40 border-amber-600 text-amber-300' 
                  : 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Inconsistencias:</span>
              <span className="font-bold">{graphData.inconsistencies.length}</span>
              {criticalCount > 0 && (
                <span className="text-[10px] bg-rose-600 text-black px-1.5 py-0.2 rounded-xs font-bold">
                  {criticalCount} CRÍTICAS
                </span>
              )}
            </div>

            <button
              onClick={handleReloadData}
              className="bg-[#111115] hover:bg-[#1a1a24] text-slate-300 border border-[#1e293b] px-3 py-1.5 rounded-sm flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
              title="Recargar datos del manuscrito"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 pt-2 border-t border-[#1e293b] text-xs font-mono">
          {/* Node Category Filters */}
          <div className="lg:col-span-4 flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-1">Filtrar:</span>
            
            {/* Personajes */}
            <button
              type="button"
              onClick={() => setActiveTypes(prev => ({ ...prev, PERSONAJE: !prev.PERSONAJE }))}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border transition-colors ${
                activeTypes.PERSONAJE
                  ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                  : 'bg-[#111115] border-[#1e293b] text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Personajes</span>
              <span className="text-[10px] opacity-70">({graphData.nodes.filter(n => n.type === 'PERSONAJE').length})</span>
            </button>

            {/* Planetas */}
            <button
              type="button"
              onClick={() => setActiveTypes(prev => ({ ...prev, PLANETA: !prev.PLANETA }))}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border transition-colors ${
                activeTypes.PLANETA
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-[#111115] border-[#1e293b] text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Planetas</span>
              <span className="text-[10px] opacity-70">({graphData.nodes.filter(n => n.type === 'PLANETA').length})</span>
            </button>

            {/* Tecnologías */}
            <button
              type="button"
              onClick={() => setActiveTypes(prev => ({ ...prev, TECNOLOGIA: !prev.TECNOLOGIA }))}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border transition-colors ${
                activeTypes.TECNOLOGIA
                  ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300'
                  : 'bg-[#111115] border-[#1e293b] text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Tecnologías</span>
              <span className="text-[10px] opacity-70">({graphData.nodes.filter(n => n.type === 'TECNOLOGIA').length})</span>
            </button>
          </div>

          {/* Timeline Chapter Filter */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] shrink-0">Línea Temporal:</span>
            <select
              value={selectedTimelineChapter === null ? 'ALL' : selectedTimelineChapter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTimelineChapter(val === 'ALL' ? null : Number(val));
              }}
              className="bg-[#0a0a0d] border border-[#1e293b] text-slate-200 px-2 py-1 rounded-sm text-xs focus:border-cyan-500 outline-none w-full"
            >
              <option value="ALL">Toda la novela (Capítulos 1-{chapters.length})</option>
              {chapters.map(chap => (
                <option key={chap.id} value={chap.number}>
                  Hasta Capítulo {chap.number}: {chap.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box & Inconsistency toggle */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar entidad en grafo..."
                className="w-full bg-[#0a0a0d] border border-[#1e293b] pl-8 pr-2.5 py-1 rounded-sm text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowOnlyInconsistencies(!showOnlyInconsistencies)}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 cursor-pointer border shrink-0 transition-colors ${
                showOnlyInconsistencies
                  ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                  : 'bg-[#111115] border-[#1e293b] text-slate-400 hover:text-slate-200'
              }`}
              title="Mostrar únicamente entidades con inconsistencias detectadas"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Solo Inconsistencias</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Canvas & Side Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left/Center: Interactive D3 Graph Workspace (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0a0a0e] border border-[#1e293b] rounded-sm relative overflow-hidden flex flex-col min-h-[580px] sm:min-h-[660px]">
          {/* Interactive Zoom HUD floating controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-[#0f1218]/90 border border-[#1e293b] rounded-sm p-1 shadow-lg backdrop-blur-xs">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm transition-colors cursor-pointer"
              title="Acercar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm transition-colors cursor-pointer"
              title="Alejar (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm transition-colors cursor-pointer"
              title="Restablecer vista / Centrar"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Legend HUD */}
          <div className="absolute bottom-3 left-3 z-10 bg-[#0f1218]/90 border border-[#1e293b] rounded-sm px-3 py-2 text-[10px] font-mono text-slate-400 shadow-md flex items-center gap-4 flex-wrap backdrop-blur-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Personaje</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>Planeta / Sistema</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              <span>Syscall / Exploit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-rose-500 border-dashed inline-block" />
              <span className="text-rose-400 font-bold">Enlace con Conflicto</span>
            </div>
          </div>

          {/* D3 SVG Container */}
          <div ref={containerRef} className="w-full flex-1 relative bg-radial from-[#0e1626]/20 via-[#0a0a0e] to-[#08080a]">
            <svg ref={svgRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
          </div>
        </div>

        {/* Right: Analytical Inspection Drawer (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0d0d12] border border-[#1e293b] rounded-sm flex flex-col min-h-[580px] sm:min-h-[660px]">
          {/* Drawer Navigation Tabs */}
          <div className="grid grid-cols-2 border-b border-[#1e293b] text-xs font-mono uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setSidePanelTab('INCONSISTENCIAS')}
              className={`py-3 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${
                sidePanelTab === 'INCONSISTENCIAS'
                  ? 'border-rose-500 text-rose-300 bg-rose-950/20 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white bg-[#0a0a0d]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Inconsistencias ({graphData.inconsistencies.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSidePanelTab('INSPECTOR')}
              className={`py-3 px-3 flex items-center justify-center gap-2 cursor-pointer transition-colors border-b-2 ${
                sidePanelTab === 'INSPECTOR'
                  ? 'border-cyan-500 text-cyan-300 bg-cyan-950/20 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white bg-[#0a0a0d]'
              }`}
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span>Inspector {selectedNode ? `(${selectedNode.name.slice(0, 10)}…)` : ''}</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[600px] text-xs font-mono">
            {/* TAB 1: INCONSISTENCIAS DE TRAMA */}
            {sidePanelTab === 'INCONSISTENCIAS' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider">
                    AUDITORÍA DETERMINISTA DE TRAMA
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-rose-400 font-bold">{criticalCount} Críticas</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400 font-bold">{warningCount} Advertencias</span>
                  </div>
                </div>

                {graphData.inconsistencies.length === 0 ? (
                  <div className="p-8 text-center space-y-3 bg-[#0a0a0e] border border-[#1e293b] rounded-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-white font-bold text-sm">COHERENCIA PERFECTA</div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      No se han detectado saltos estelares instantáneos, sobrecargas de entropía ni anomalías DRM entre los capítulos analizados.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {graphData.inconsistencies.map(inc => {
                      const isSelected = selectedInconsistencyId === inc.id;
                      const severityStyles = inc.severity === 'CRITICA'
                        ? 'border-rose-600 bg-rose-950/25 text-rose-300'
                        : inc.severity === 'ADVERTENCIA'
                          ? 'border-amber-600 bg-amber-950/25 text-amber-300'
                          : 'border-cyan-600 bg-cyan-950/25 text-cyan-300';

                      return (
                        <div
                          key={inc.id}
                          onClick={() => handleSelectInconsistency(inc)}
                          className={`border rounded-sm p-3.5 space-y-2.5 transition-all cursor-pointer ${severityStyles} ${
                            isSelected ? 'ring-1 ring-white/50 scale-[1.01]' : 'hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                              {inc.severity === 'CRITICA' ? (
                                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                              ) : inc.severity === 'ADVERTENCIA' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              ) : (
                                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                              )}
                              <span>{inc.title}</span>
                            </div>

                            <span className={`text-[9px] px-1.5 py-0.5 rounded-xs uppercase tracking-wider font-bold ${
                              inc.severity === 'CRITICA'
                                ? 'bg-rose-600 text-black'
                                : inc.severity === 'ADVERTENCIA'
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-cyan-600 text-black'
                            }`}>
                              {inc.severity}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {inc.description}
                          </p>

                          {/* Recommendation Box */}
                          <div className="bg-[#090b10] border border-[#1e293b] p-2 rounded-xs text-[10px] space-y-1">
                            <div className="text-cyan-400 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Sugerencia de Reconciliación:</span>
                            </div>
                            <div className="text-slate-300">
                              {inc.recommendation}
                            </div>
                          </div>

                          {/* Affected chapters & nodes tags */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[9px]">
                            {inc.affectedChapterNumbers.map(n => (
                              <span key={n} className="bg-[#111115] text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded-xs">
                                Cap. {n}
                              </span>
                            ))}

                            {inc.affectedNodeIds.map(nid => (
                              <span key={nid} className="bg-[#111115] text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-xs">
                                {nid}
                              </span>
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-1 border-t border-[#1e293b]/60">
                            {inc.affectedChapterNumbers.length > 0 && onOpenChapterInEditor && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenChapterInEditor(inc.affectedChapterNumbers[0]);
                                }}
                                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[10px] underline cursor-pointer"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Abrir Cap. {inc.affectedChapterNumbers[0]} en Editor</span>
                              </button>
                            )}

                            {onSendToAuditor && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAuditorDispatch(inc);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-xs text-[9px] flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                <span>Auditar con Gemini</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INSPECTOR DE NODO */}
            {sidePanelTab === 'INSPECTOR' && (
              <div className="space-y-4">
                {!selectedNode ? (
                  <div className="p-8 text-center space-y-2 bg-[#0a0a0e] border border-[#1e293b] rounded-sm text-slate-500">
                    <Network className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs">
                      Haz clic en cualquier nodo del grafo (personaje, planeta o tecnología) para inspeccionar sus relaciones y coherencia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Header Card */}
                    <div className="bg-[#0e1219] border border-[#1e293b] rounded-sm p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-xs font-bold uppercase tracking-wider ${
                            selectedNode.type === 'PERSONAJE'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : selectedNode.type === 'PLANETA'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {selectedNode.type} • {selectedNode.subType || selectedNode.roleOrCategory}
                          </span>
                          <h3 className="text-base font-bold text-white font-mono">
                            {selectedNode.name}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedNodeId(null)}
                          className="text-slate-500 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {selectedNode.description}
                      </p>

                      {selectedNode.factionOrSystem && (
                        <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-[#1e293b]">
                          <strong className="text-slate-300">Alineación / Entorno:</strong> {selectedNode.factionOrSystem}
                        </div>
                      )}

                      {/* Prominent Entity Full Data Card Button */}
                      <button
                        type="button"
                        onClick={() => setInspectingModalNode(selectedNode)}
                        className="w-full mt-2 py-2 px-3 rounded-sm bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/70 hover:border-cyan-400 text-cyan-200 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] text-xs"
                      >
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>Ver Tarjeta Completa de la Entidad</span>
                      </button>
                    </div>

                    {/* Node Inconsistencies Alert */}
                    {selectedNodeInconsistencies.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Inconsistencias Asociadas ({selectedNodeInconsistencies.length})</span>
                        </div>

                        <div className="space-y-2">
                          {selectedNodeInconsistencies.map(inc => (
                            <div
                              key={inc.id}
                              onClick={() => {
                                setSelectedInconsistencyId(inc.id);
                                setSidePanelTab('INCONSISTENCIAS');
                              }}
                              className="p-2.5 rounded-sm bg-rose-950/30 border border-rose-600/70 text-rose-200 text-xs space-y-1 cursor-pointer hover:border-rose-400"
                            >
                              <div className="font-bold text-white flex items-center justify-between">
                                <span>{inc.title}</span>
                                <span className="text-[9px] bg-rose-600 text-black px-1 rounded-xs uppercase">
                                  {inc.severity}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300">
                                {inc.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chapter Occurrences */}
                    <div className="space-y-2">
                      <div className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Presencia en Capítulos ({selectedNode.chapterOccurrences.length})</span>
                      </div>

                      {selectedNode.chapterOccurrences.length === 0 ? (
                        <div className="text-[11px] text-slate-500 italic p-2 bg-[#090b10] rounded-sm border border-[#1e293b]">
                          Entidad huérfana: Todavía no aparece en el texto de ningún capítulo.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNode.chapterOccurrences.map(cNum => (
                            <button
                              key={cNum}
                              type="button"
                              onClick={() => onOpenChapterInEditor && onOpenChapterInEditor(cNum)}
                              className="px-2 py-1 rounded-sm bg-[#111116] border border-[#1e293b] hover:border-cyan-500 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs"
                            >
                              <span className="text-cyan-400 font-bold">Capítulo {cNum}</span>
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Connected Nodes List */}
                    <div className="space-y-2">
                      <div className="text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-slate-400" />
                        <span>Relaciones Directas ({selectedNodeConnections.length})</span>
                      </div>

                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {selectedNodeConnections.map(({ link, otherNode }) => {
                          if (!otherNode) return null;
                          return (
                            <div
                              key={link.id}
                              onClick={() => {
                                setSelectedNodeId(otherNode.id);
                                focusNode(otherNode.id);
                              }}
                              className="p-2 rounded-sm bg-[#090b10] border border-[#1e293b] hover:border-cyan-600 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                                  <span className={`w-2 h-2 rounded-full ${
                                    otherNode.type === 'PERSONAJE' ? 'bg-amber-400' :
                                    otherNode.type === 'PLANETA' ? 'bg-emerald-400' : 'bg-cyan-400'
                                  }`} />
                                  <span>{otherNode.name}</span>
                                </div>
                                <div className="text-[9px] text-slate-400">
                                  {link.label} • {link.weight} aparición{link.weight > 1 ? 'es' : ''}
                                </div>
                              </div>

                              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Entity Data Card Modal */}
      {inspectingModalNode && (
        <EntityCardModal
          node={inspectingModalNode}
          onClose={() => setInspectingModalNode(null)}
          onSelectNodeById={(id) => {
            const nextNode = graphData.nodes.find(n => n.id === id);
            if (nextNode) {
              setInspectingModalNode(nextNode);
              setSelectedNodeId(nextNode.id);
              focusNode(nextNode.id);
            }
          }}
          onOpenChapterInEditor={onOpenChapterInEditor}
          onSendToAuditor={onSendToAuditor}
          onFocusNodeInGraph={(id) => {
            setSelectedNodeId(id);
            focusNode(id);
          }}
          inconsistencies={graphData.inconsistencies}
          allNodes={graphData.nodes}
          canonicalCharacters={characters}
          canonicalStarSystems={starSystems}
          canonicalSyscalls={syscalls}
          canonicalExploits={exploits}
          canonicalFactions={factions}
          chapters={chapters}
        />
      )}
    </div>
  );
};

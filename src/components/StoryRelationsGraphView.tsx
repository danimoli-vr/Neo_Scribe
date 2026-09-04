import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import {
  StoryGraphNode,
  StoryGraphLink,
  StoryGraphData,
  PlotInconsistency,
  GraphNodeType
} from '../types';
import {
  CANONICAL_STAR_SYSTEMS,
  CANONICAL_SYSCALLS,
  CANONICAL_EXPLOITS,
  CANONICAL_FACTIONS
} from '../data/canonicalLore';
import { extractStoryGraph } from '../utils/storyGraphExtractor';
import { EntityCardModal } from './EntityCardModal';
import { GraphHeaderControls } from './GraphHeaderControls';
import { GraphInspectorDrawer, SidePanelTab } from './GraphInspectorDrawer';
import { useNovelData } from '../store/NovelDataContext';
import { autosaveService } from '../services/autosaveService';

interface StoryRelationsGraphViewProps {
  onOpenChapterInEditor?: (chapterNumber: number) => void;
  onSendToAuditor?: (text: string, title: string) => void;
}

/**
 * The relations graph screen. Split into:
 * - GraphHeaderControls: header, quick metrics and filter controls
 * - GraphInspectorDrawer: right-hand inconsistencies/inspector tabs
 * - EntityCardModal: full entity detail modal (already its own component)
 *
 * The D3 force-simulation canvas stays inline here — it drives the SVG via
 * refs and is called imperatively (focusNode, zoom controls) from the
 * inspector drawer's callbacks, so splitting it out would mean threading
 * those refs back out through a forwardRef for no real reduction in
 * complexity.
 */
export const StoryRelationsGraphView: React.FC<StoryRelationsGraphViewProps> = ({
  onOpenChapterInEditor,
  onSendToAuditor
}) => {
  // Read-only view: comes straight from the shared novel data context, so it
  // always reflects the latest saved chapters/characters automatically —
  // no more "click Sincronizar or your graph is stale" papercut.
  const { chapters, characters } = useNovelData();

  const starSystems = CANONICAL_STAR_SYSTEMS;
  const syscalls = CANONICAL_SYSCALLS;
  const exploits = CANONICAL_EXPLOITS;
  const factions = CANONICAL_FACTIONS;

  // The graph is now always in sync automatically. This just forces any
  // pending debounced edit (e.g. still mid-typing in the chapter editor a
  // moment ago) to save right now, instead of waiting out the idle timer.
  const handleReloadData = () => {
    autosaveService.flushImmediate();
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
  const [sidePanelTab, setSidePanelTab] = useState<SidePanelTab>('INCONSISTENCIAS');
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

  const nodeCountsByType = useMemo(() => ({
    PERSONAJE: graphData.nodes.filter(n => n.type === 'PERSONAJE').length,
    PLANETA: graphData.nodes.filter(n => n.type === 'PLANETA').length,
    TECNOLOGIA: graphData.nodes.filter(n => n.type === 'TECNOLOGIA').length,
  }), [graphData.nodes]);

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

  // From the node inspector: jump back to an inconsistency affecting this node
  const handleJumpToInconsistency = (incId: string) => {
    setSelectedInconsistencyId(incId);
    setSidePanelTab('INCONSISTENCIAS');
  };

  // From the node inspector's "related nodes" list: select + focus another node
  const handleFocusAndSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    focusNode(nodeId);
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
      <GraphHeaderControls
        filteredNodesCount={filteredNodes.length}
        filteredLinksCount={filteredLinks.length}
        inconsistenciesCount={graphData.inconsistencies.length}
        criticalCount={criticalCount}
        onReloadData={handleReloadData}
        activeTypes={activeTypes}
        onToggleType={(type) => setActiveTypes(prev => ({ ...prev, [type]: !prev[type] }))}
        nodeCountsByType={nodeCountsByType}
        chapters={chapters}
        selectedTimelineChapter={selectedTimelineChapter}
        onSelectTimelineChapter={setSelectedTimelineChapter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showOnlyInconsistencies={showOnlyInconsistencies}
        onToggleShowOnlyInconsistencies={() => setShowOnlyInconsistencies(!showOnlyInconsistencies)}
      />

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

        <GraphInspectorDrawer
          sidePanelTab={sidePanelTab}
          onTabChange={setSidePanelTab}
          inconsistencies={graphData.inconsistencies}
          criticalCount={criticalCount}
          warningCount={warningCount}
          selectedInconsistencyId={selectedInconsistencyId}
          onSelectInconsistency={handleSelectInconsistency}
          onAuditorDispatch={handleAuditorDispatch}
          selectedNode={selectedNode}
          selectedNodeInconsistencies={selectedNodeInconsistencies}
          selectedNodeConnections={selectedNodeConnections}
          onDeselectNode={() => setSelectedNodeId(null)}
          onInspectFullCard={setInspectingModalNode}
          onFocusNode={handleFocusAndSelectNode}
          onJumpToInconsistency={handleJumpToInconsistency}
          onOpenChapterInEditor={onOpenChapterInEditor}
          onSendToAuditor={onSendToAuditor}
        />
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

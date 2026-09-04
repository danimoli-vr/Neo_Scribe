import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Building2, 
  Map, 
  MapPin, 
  Compass, 
  Castle, 
  Landmark, 
  Users, 
  Shield, 
  Layers, 
  Scroll, 
  Flame, 
  Swords, 
  Terminal, 
  Network, 
  BookOpen, 
  Clock, 
  HardDrive, 
  Cpu, 
  Search, 
  Crosshair, 
  Sparkles, 
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Boxes,
  Key
} from 'lucide-react';
import { 
  ModuleId, 
  ModuleCategory, 
  CustomModuleConfig, 
  WorldbuildingCustomization, 
  GenrePresetId 
} from '../types';
import { getActiveGenrePreset, getActiveGenreId } from './genrePresetService';
import { readJSON, writeJSON, isObject } from '../utils/safeStorage';

const STORAGE_CUSTOM_MODULES_KEY = 'krnl_module_customization_v2';

export const MODULE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  building: Building2,
  map: Map,
  mapPin: MapPin,
  compass: Compass,
  castle: Castle,
  landmark: Landmark,
  users: Users,
  shield: Shield,
  layers: Layers,
  scroll: Scroll,
  flame: Flame,
  swords: Swords,
  terminal: Terminal,
  network: Network,
  book: BookOpen,
  clock: Clock,
  'hard-drive': HardDrive,
  cpu: Cpu,
  search: Search,
  crosshair: Crosshair,
  sparkles: Sparkles,
  overview: LayoutDashboard,
  auditor: ShieldCheck,
  fileText: FileText,
  boxes: Boxes,
  key: Key
};

export function getModuleIcon(iconName?: string, defaultIcon: React.ComponentType<{ className?: string }> = Globe): React.ComponentType<{ className?: string }> {
  if (!iconName) return defaultIcon;
  return MODULE_ICON_MAP[iconName] || defaultIcon;
}

export interface WorldbuildingScenarioPreset {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: string;
  sectionTitles: {
    writing: string;
    worldbuilding: string;
    auditor: string;
  };
  modules: Partial<Record<ModuleId, {
    title: string;
    desc: string;
    iconName: string;
    enabled: boolean;
  }>>;
}

export const WORLDBUILDING_SCENARIOS: WorldbuildingScenarioPreset[] = [
  {
    id: 'cyberpunk_metropolis',
    name: 'Metrópolis / Cyberpunk Urbano',
    badge: 'CIUDAD',
    tagline: 'Para novelas que transcurren en una única urbe, distritos o megaciudad',
    description: 'Reemplaza el atlas espacial por distritos de la ciudad, rascacielos y zonas de exclusión; facciones por corporaciones y cárteles; y sustrato por arquitectura de red y ciberimplantes.',
    icon: 'building',
    sectionTitles: {
      writing: 'MANUSCRITO URBANO',
      worldbuilding: 'CONSTRUCCIÓN DE LA METRÓPOLIS',
      auditor: 'AUDITORÍA & CONTRA-HACKEO'
    },
    modules: {
      atlas: {
        title: 'Distritos de la Metrópolis',
        desc: 'Sectores urbanos, niveles de polución, rascacielos corporativos y suburbios marginales.',
        iconName: 'building',
        enabled: true
      },
      factions: {
        title: 'Megacorporaciones & Cárteles',
        desc: 'Juntas directivas, sindicatos de cibercrimen, bandas callejeras y fuerzas policiales privadas.',
        iconName: 'users',
        enabled: true
      },
      architecture: {
        title: 'Arquitectura de Red & Ciberware',
        desc: 'Protocolos de IA autónomas, cortafuegos, biochips neurales y leyes de ciberseguridad.',
        iconName: 'cpu',
        enabled: true
      },
      lore: {
        title: 'Contrabando & Prototipos Ilegales',
        desc: 'Archivos clasificados, armas de contrabando, implantes experimentales y drogas sintéticas.',
        iconName: 'hard-drive',
        enabled: true
      },
      sandbox: {
        title: 'Terminal de Infiltración / Exploits',
        desc: 'Inyección de exploits en terminales corporativas y simulación de contramedidas de red.',
        iconName: 'terminal',
        enabled: true
      }
    }
  },
  {
    id: 'space_opera_hard_sf',
    name: 'Space Opera Galáctica & Vacío',
    badge: 'GALAXIA',
    tagline: 'Para novelas interestelares con física determinista de Planck',
    description: 'Configuración clásica con atlas de sistemas estelares, facciones espaciales, sustrato cósmico de Planck y reliquias de arqueología precursora.',
    icon: 'globe',
    sectionTitles: {
      writing: 'MANUSCRITO DIEGÉTICO',
      worldbuilding: 'SUSTRATO DE PLANCK & MUNDO',
      auditor: 'AUDITORÍA DEL KERNEL'
    },
    modules: {
      atlas: {
        title: 'Atlas de Sistemas Estelares',
        desc: 'Cartografía de sectores, pozos gravitatorios, boyas de salto Taquión y políticas DRM.',
        iconName: 'globe',
        enabled: true
      },
      factions: {
        title: 'Facciones & Arqueología Precursora',
        desc: 'Sacerdocio del Kernel Divino, Alianza de Arqueólogos FOSS y Corsarios del Buffer Libre.',
        iconName: 'landmark',
        enabled: true
      },
      architecture: {
        title: 'Sustrato de Planck & Física Dura',
        desc: 'Las 4 capas de cómputo de la realidad, radiación térmica y axiomas de conservación de entropía.',
        iconName: 'layers',
        enabled: true
      },
      lore: {
        title: 'Banco de Artefactos Precursores',
        desc: 'Reliquias extraterrestres recuperadas con firmas de memoria, modos de fallo y ganchos de trama.',
        iconName: 'hard-drive',
        enabled: true
      },
      sandbox: {
        title: 'Sandbox de Exploits del Vacío',
        desc: 'Consola de ejecución de syscalls para anular inercia, dilatar tiempo o violar la física.',
        iconName: 'terminal',
        enabled: true
      }
    }
  },
  {
    id: 'epic_fantasy_kingdoms',
    name: 'Fantasía Épica / Reinos & Ciudades',
    badge: 'REINOS',
    tagline: 'Para sagas de alta fantasía, reinos feudales o imperios arcanos',
    description: 'Transforma el atlas en mapa de feudos, ciudades y pasos montañosos; facciones en casas nobles y órdenes; y sustrato en el sistema de magia dura.',
    icon: 'castle',
    sectionTitles: {
      writing: 'TOMOS & CRÓNICAS',
      worldbuilding: 'MAPA DEL REINO & LORE ARCANO',
      auditor: 'TRIBUNAL DE LOS ARCHIMAESTRES'
    },
    modules: {
      atlas: {
        title: 'Cartografía de Provincias & Castillos',
        desc: 'Provincias feudales, pasos de montaña, ciudades amuralladas y bosques prohibidos.',
        iconName: 'map',
        enabled: true
      },
      factions: {
        title: 'Casas Nobles & Órdenes Sagradas',
        desc: 'Linajes dinásticos, cofradías de comerciantes, colegios de magos y cultos heréticos.',
        iconName: 'castle',
        enabled: true
      },
      architecture: {
        title: 'Leyes del Sistema de Magia',
        desc: 'Costes de maná, tributos de sangre, leyes de resonancia arcana y juramentos inquebrantables.',
        iconName: 'flame',
        enabled: true
      },
      lore: {
        title: 'Grimorio de Reliquias & Tomos',
        desc: 'Armas bendecidas, grimorios antiguos, talismanes de linaje y profecías de los Ancianos.',
        iconName: 'scroll',
        enabled: true
      },
      sandbox: {
        title: 'Círculo de Alquimia & Hechizos',
        desc: 'Pruebas de compatibilidad mágica para verificar que ningún conjuro viole el canon de costes.',
        iconName: 'sparkles',
        enabled: true
      }
    }
  },
  {
    id: 'noir_investigation',
    name: 'Noir / Policiaco & Crimen Urbano',
    badge: 'MISTERIO',
    tagline: 'Para thrillers criminales, detectives y novelas de misterio',
    description: 'Adapta los módulos a zonas de la ciudad y escenas del crimen, sospechosos y brigadas, procedimientos forenses y archivo de evidencias.',
    icon: 'search',
    sectionTitles: {
      writing: 'EXPEDIENTE & CASOS',
      worldbuilding: 'ESCENARIOS & POLICÍA FORENSE',
      auditor: 'ANÁLISIS DE COARTADAS & MÓVILES'
    },
    modules: {
      atlas: {
        title: 'Zonas Urbanas & Escenas del Crimen',
        desc: 'Pisos francos, callejones de homicidios, comisarías, muelles y locales clandestinos.',
        iconName: 'building',
        enabled: true
      },
      factions: {
        title: 'Sospechosos, Brigadas & Mafias',
        desc: 'Departamentos de homicidios, familias criminales, confidentes callejeros y jueces corruptos.',
        iconName: 'search',
        enabled: true
      },
      architecture: {
        title: 'Procedimiento Forense & Balística',
        desc: 'Protocolos de autopsia, balística comparativa, leyes de arresto y tiempos reales de traslado.',
        iconName: 'crosshair',
        enabled: true
      },
      lore: {
        title: 'Archivo de Evidencias & Pistas',
        desc: 'Cadena de custodia de casquillos, grabaciones telefónicas, cartas de chantaje y llaves maestras.',
        iconName: 'fileText',
        enabled: true
      },
      sandbox: {
        title: 'Reconstrucción de Coartadas',
        desc: 'Cálculo de tiempos de desplazamiento y cruce de horarios para desarmar coartadas falsas.',
        iconName: 'clock',
        enabled: true
      }
    }
  },
  {
    id: 'post_apocalypse_survival',
    name: 'Supervivencia / Yermo Post-Apocalíptico',
    badge: 'SUPERVIVENCIA',
    tagline: 'Para historias de supervivencia, refugios y mundos en ruinas',
    description: 'Centrado en refugios, zonas tóxicas, tribus de carroñeros, reglas de radiación y escasez de comida/agua.',
    icon: 'compass',
    sectionTitles: {
      writing: 'DIARIO DE SUPERVIVENCIA',
      worldbuilding: 'MAPA DEL YERMO & REGLAS',
      auditor: 'CONTROL DE RACIONES & DESGASTE'
    },
    modules: {
      atlas: {
        title: 'Asentamientos & Zonas de Radiación',
        desc: 'Búnkeres subterráneos, fuentes de agua no contaminada, carreteras cortadas y nidos de mutantes.',
        iconName: 'compass',
        enabled: true
      },
      factions: {
        title: 'Clanes, Saqueadores & Comunidades',
        desc: 'Señores de la guerra, tribus del desierto, médicos errantes y cultos del Apocalipsis.',
        iconName: 'swords',
        enabled: true
      },
      architecture: {
        title: 'Reglas del Yermo & Toxicidad',
        desc: 'Límites de dosis de radiación, desgaste de filtros de gas, escasez calórica y balística improvisada.',
        iconName: 'shield',
        enabled: true
      },
      lore: {
        title: 'Suministros, Chatarra & Medicina',
        desc: 'Generadores de combustible, antibióticos caducados, armas artesanales y placas solares.',
        iconName: 'boxes',
        enabled: true
      },
      sandbox: {
        title: 'Simulador de Raciones & Supervivencia',
        desc: 'Estimación de días de agua, munición y cálculo de desgaste físico en travesías a pie.',
        iconName: 'terminal',
        enabled: true
      }
    }
  },
  {
    id: 'intimate_drama_minimal',
    name: 'Drama Íntimo / Novela de Personajes',
    badge: 'ÍNTIMO',
    tagline: 'Para historias centradas en relaciones, sin necesidad de mapas complejos',
    description: 'Oculta el atlas y el sandbox si no los necesitas, enfocando el mundo en escenarios clave, círculos familiares y recuerdos.',
    icon: 'users',
    sectionTitles: {
      writing: 'MANUSCRITO & CAPÍTULOS',
      worldbuilding: 'ESCENARIOS & CÍRCULOS VINCULARES',
      auditor: 'AUDITORÍA DE EMOCIONES & SUBTEXTO'
    },
    modules: {
      atlas: {
        title: 'Escenarios & Espacios Cotidianos',
        desc: 'El apartamento, la casa de verano, el lugar de trabajo y rincones con carga emocional.',
        iconName: 'mapPin',
        enabled: true
      },
      factions: {
        title: 'Círculos Familiares & Vínculos',
        desc: 'Familias políticas, amistades de la infancia, compañeros de trabajo y lealtades cruzadas.',
        iconName: 'users',
        enabled: true
      },
      architecture: {
        title: 'Dinámicas Relacionales & Secretos',
        desc: 'Pactos no dichos, silencios familiares heredados, estatus social y límites morales.',
        iconName: 'shield',
        enabled: true
      },
      lore: {
        title: 'Objetos Simbólicos & Recuerdos',
        desc: 'Cartas guardadas en cajones, fotografías antiguas, herencias y pertenencias que duelen.',
        iconName: 'book',
        enabled: true
      },
      sandbox: {
        title: 'Laboratorio de Diálogos',
        desc: 'Simulación de ensayos de conversaciones difíciles y subtexto.',
        iconName: 'terminal',
        enabled: false // Desactivado por defecto para historias intimistas
      }
    }
  }
];

export function getRawCustomization(): WorldbuildingCustomization {
  return readJSON<WorldbuildingCustomization>(
    STORAGE_CUSTOM_MODULES_KEY,
    { modules: {}, sectionTitles: {} },
    isObject
  );
}

export function saveRawCustomization(data: WorldbuildingCustomization): void {
  writeJSON(STORAGE_CUSTOM_MODULES_KEY, data);
  window.dispatchEvent(new CustomEvent('krnl_module_config_changed'));
}

export function resetRawCustomization(): void {
  try {
    localStorage.removeItem(STORAGE_CUSTOM_MODULES_KEY);
    window.dispatchEvent(new CustomEvent('krnl_module_config_changed'));
  } catch (e) {}
}

/**
 * Returns the effective configuration of all modules, merging genre terms with user custom overrides.
 */
export function getEffectiveModulesConfig(): Record<ModuleId, CustomModuleConfig> {
  const genre = getActiveGenrePreset();
  const terms = genre.terms;
  const raw = getRawCustomization();
  const overrides = raw.modules || {};

  const baseConfigs: Record<ModuleId, CustomModuleConfig> = {
    overview: {
      id: 'overview',
      title: terms.overviewTitle,
      desc: terms.overviewDesc,
      enabled: true,
      iconName: 'overview',
      code: '00',
      category: 'main'
    },
    chapters: {
      id: 'chapters',
      title: terms.chaptersTitle,
      desc: terms.chaptersDesc,
      enabled: true,
      iconName: 'book',
      code: '01',
      category: 'writing'
    },
    characters: {
      id: 'characters',
      title: terms.entityCharacters || 'Personajes',
      desc: 'Fichas completas, roles dramáticos, facciones y arcos narrativos.',
      enabled: true,
      iconName: 'users',
      code: '01b',
      category: 'writing'
    },
    graph: {
      id: 'graph',
      title: terms.graphTitle,
      desc: terms.graphDesc,
      enabled: true,
      iconName: 'network',
      code: '02',
      category: 'writing'
    },
    timeline: {
      id: 'timeline',
      title: terms.timelineTitle,
      desc: terms.timelineDesc,
      enabled: true,
      iconName: 'clock',
      code: '03',
      category: 'writing'
    },
    architecture: {
      id: 'architecture',
      title: terms.architectureTitle,
      desc: terms.architectureDesc,
      enabled: true,
      iconName: 'layers',
      code: '04',
      category: 'worldbuilding'
    },
    atlas: {
      id: 'atlas',
      title: terms.atlasTitle,
      desc: terms.atlasDesc,
      enabled: true,
      iconName: 'globe',
      code: '05',
      category: 'worldbuilding'
    },
    factions: {
      id: 'factions',
      title: terms.factionsTitle,
      desc: terms.factionsDesc,
      enabled: true,
      iconName: 'users',
      code: '06',
      category: 'worldbuilding'
    },
    lore: {
      id: 'lore',
      title: terms.loreTitle,
      desc: terms.loreDesc,
      enabled: true,
      iconName: 'hard-drive',
      code: '07',
      category: 'worldbuilding'
    },
    sandbox: {
      id: 'sandbox',
      title: terms.sandboxTitle,
      desc: terms.sandboxDesc,
      enabled: true,
      iconName: 'terminal',
      code: '08',
      category: 'auditor'
    },
    auditor: {
      id: 'auditor',
      title: terms.auditorTitle,
      desc: terms.auditorDesc,
      enabled: true,
      iconName: 'auditor',
      code: '09',
      category: 'auditor'
    }
  };

  // Merge overrides
  const result = { ...baseConfigs };
  (Object.keys(result) as ModuleId[]).forEach(moduleId => {
    const override = overrides[moduleId];
    if (override) {
      result[moduleId] = {
        ...result[moduleId],
        title: override.title !== undefined && override.title.trim() !== '' ? override.title : result[moduleId].title,
        desc: override.desc !== undefined && override.desc.trim() !== '' ? override.desc : result[moduleId].desc,
        enabled: override.enabled !== undefined ? override.enabled : result[moduleId].enabled,
        iconName: override.iconName !== undefined ? override.iconName : result[moduleId].iconName
      };
    }
  });

  return result;
}

export function getEffectiveSectionTitles(): { writing: string; worldbuilding: string; auditor: string } {
  const genre = getActiveGenrePreset();
  const terms = genre.terms;
  const raw = getRawCustomization();
  const overrides = raw.sectionTitles || {};

  return {
    writing: overrides.writing?.trim() || terms.writingSectionTitle,
    worldbuilding: overrides.worldbuilding?.trim() || terms.worldbuildingSectionTitle,
    auditor: overrides.auditor?.trim() || terms.auditorSectionTitle
  };
}

/**
 * Custom React hook that reacts to module configuration changes
 */
export function useModuleConfig() {
  const [modules, setModules] = useState<Record<ModuleId, CustomModuleConfig>>(() => getEffectiveModulesConfig());
  const [sectionTitles, setSectionTitles] = useState(() => getEffectiveSectionTitles());

  const refresh = () => {
    setModules(getEffectiveModulesConfig());
    setSectionTitles(getEffectiveSectionTitles());
  };

  useEffect(() => {
    refresh();

    const handleConfigChange = () => refresh();
    const handleGenreChange = () => refresh();

    window.addEventListener('krnl_module_config_changed', handleConfigChange);
    window.addEventListener('krnl_genre_changed', handleGenreChange);

    return () => {
      window.removeEventListener('krnl_module_config_changed', handleConfigChange);
      window.removeEventListener('krnl_genre_changed', handleGenreChange);
    };
  }, []);

  const updateModule = (moduleId: ModuleId, updates: Partial<CustomModuleConfig>) => {
    const raw = getRawCustomization();
    const current = raw.modules[moduleId] || {};
    raw.modules[moduleId] = {
      ...current,
      ...updates
    };
    saveRawCustomization(raw);
  };

  const updateSectionTitle = (sectionKey: 'writing' | 'worldbuilding' | 'auditor', title: string) => {
    const raw = getRawCustomization();
    if (!raw.sectionTitles) raw.sectionTitles = {};
    raw.sectionTitles[sectionKey] = title;
    saveRawCustomization(raw);
  };

  const applyScenario = (scenarioId: string) => {
    const scenario = WORLDBUILDING_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    const raw = getRawCustomization();
    raw.sectionTitles = { ...scenario.sectionTitles };
    
    // Apply module overrides
    (Object.keys(scenario.modules) as ModuleId[]).forEach(mId => {
      const mData = scenario.modules[mId];
      if (mData) {
        raw.modules[mId] = {
          title: mData.title,
          desc: mData.desc,
          iconName: mData.iconName,
          enabled: mData.enabled
        };
      }
    });

    saveRawCustomization(raw);
  };

  const resetAllToDefault = () => {
    resetRawCustomization();
  };

  return {
    modules,
    sectionTitles,
    updateModule,
    updateSectionTitle,
    applyScenario,
    resetAllToDefault,
    getModuleIcon
  };
}

import React, { useState, useEffect } from 'react';
import { 
  UserCustomModule, 
  UserModuleItem, 
  CustomModuleField, 
  CustomModuleTemplateType, 
  ModuleCategory 
} from '../types';
import { autosaveService } from './autosaveService';
import { readJSON, writeJSON, isArray } from '../utils/safeStorage';

const STORAGE_KEY = 'krnl_user_custom_modules_v1';
const EVENT_NAME = 'krnl_custom_modules_changed';

export interface CustomModulePresetTemplate {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  category: ModuleCategory;
  templateType: CustomModuleTemplateType;
  defaultCode: string;
  defaultFields: Array<{ key: string; label: string; value: string }>;
  seedItem?: {
    title: string;
    subtitle: string;
    category: string;
    tags: string[];
    importance: 'baja' | 'media' | 'alta' | 'critica';
    fields: CustomModuleField[];
    content: string;
  };
}

export const CUSTOM_MODULE_PRESETS: CustomModulePresetTemplate[] = [
  {
    id: 'bestiary',
    name: 'Bestiario & Criaturas',
    tagline: 'Fauna alienígena, monstruos, bioformas y mutaciones',
    iconName: 'flame',
    category: 'worldbuilding',
    templateType: 'catalog',
    defaultCode: '10',
    defaultFields: [
      { key: 'habitat', label: 'Hábitat Natural', value: 'Planetas rocosos / Subsuelo' },
      { key: 'threat_level', label: 'Nivel de Amenaza', value: 'Catastrófico / Nivel IV' },
      { key: 'diet', label: 'Dieta / Energía', value: 'Radiación gamma & metales' },
      { key: 'vulnerability', label: 'Vulnerabilidad Conocida', value: 'Sobrecarga térmica y frío criogénico' }
    ],
    seedItem: {
      title: 'Quimera de Grafeno',
      subtitle: 'Depredador apex de las lunas mineras de Oort',
      category: 'Bioformas Alfa',
      tags: ['Sustrato Biológico', 'Radiotrófico', 'Hostil'],
      importance: 'alta',
      fields: [
        { key: 'habitat', label: 'Hábitat Natural', value: 'Cavernas de condensación de metano' },
        { key: 'threat_level', label: 'Nivel de Amenaza', value: 'Nivel IV (Peligro Letal)' },
        { key: 'diet', label: 'Dieta / Energía', value: 'Consumo de silicato y radiación estelar' },
        { key: 'vulnerability', label: 'Vulnerabilidad Conocida', value: 'Frecuencias armónicas superiores a 40 kHz' }
      ],
      content: 'Especie simbiótica que metaboliza el polvo de grafito y genera exoesqueletos capaces de desviar pulsos de plasma ligero. Cazan en manada mediante resonancia sísmica de baja frecuencia.'
    }
  },
  {
    id: 'grimoire_magic',
    name: 'Grimorio & Sistema de Magia',
    tagline: 'Hechizos, ritos arcanos, alquimia y costes de entropía',
    iconName: 'scroll',
    category: 'worldbuilding',
    templateType: 'catalog',
    defaultCode: '11',
    defaultFields: [
      { key: 'energy_cost', label: 'Coste de Maná / Entropía', value: '45 unidades térmicas' },
      { key: 'school', label: 'Escuela / Disciplina', value: 'Transmutación de Planck' },
      { key: 'casting_time', label: 'Tiempo de Invocación', value: 'Instantáneo' },
      { key: 'drawback', label: 'Contraefecto / Riesgo', value: 'Fiebre cerebral y sangrado corneal' }
    ],
    seedItem: {
      title: 'Fisura de Entropía Negativa',
      subtitle: 'Conjuro de colapso térmico selectivo',
      category: 'Alta Transmutación',
      tags: ['Axioma II', 'Prohibido', 'Peligro de Fuga'],
      importance: 'critica',
      fields: [
        { key: 'energy_cost', label: 'Coste de Maná / Entropía', value: 'Sobrecarga del 80% en el canal sináptico' },
        { key: 'school', label: 'Escuela / Disciplina', value: 'Manipulación del Sustrato L0' },
        { key: 'casting_time', label: 'Tiempo de Invocación', value: '2 ciclos respiratorios completos' },
        { key: 'drawback', label: 'Contraefecto / Riesgo', value: 'Riesgo de cristalización del fluido cefalorraquídeo' }
      ],
      content: 'Crea un vacío absoluto de 3 metros cúbicos donde la temperatura cae instantáneamente al cero de Planck. Cualquier materia en el foco sufre fragilización molecular inmediata.'
    }
  },
  {
    id: 'conlang_lexicon',
    name: 'Glosario & Lenguas (Conlang)',
    tagline: 'Diccionario diegético, etimologías, modismos y escrituras',
    iconName: 'book',
    category: 'worldbuilding',
    templateType: 'lexicon',
    defaultCode: '12',
    defaultFields: [
      { key: 'pronunciation', label: 'Pronunciación IPA', value: '/kaɪl.θɑːs/' },
      { key: 'pos', label: 'Categoría Gramatical', value: 'Sustantivo arcaico' },
      { key: 'origin', label: 'Dialecto / Origen', value: 'Dialecto Sacro de los Registradores' },
      { key: 'cultural_note', label: 'Importancia Cultural', value: 'Considerado blasfemo si se pronuncia ante no iniciados' }
    ],
    seedItem: {
      title: 'Kael-Venn',
      subtitle: 'Término de despedida ritual entre pilotos de vacío',
      category: 'Dialecto de Corredores',
      tags: ['Cultura Espacial', 'Léxico Cotidiano'],
      importance: 'media',
      fields: [
        { key: 'pronunciation', label: 'Pronunciación IPA', value: '/keɪl.vɛn/' },
        { key: 'pos', label: 'Categoría Gramatical', value: 'Fórmula de despedida ritual' },
        { key: 'origin', label: 'Dialecto / Origen', value: 'Argot naval de los Primeros Vuelos' },
        { key: 'cultural_note', label: 'Importancia Cultural', value: 'Traducible como "Que tu disipador nunca alcance el punto de Curie"' }
      ],
      content: 'Expresión adoptada tras la Gran Purga de Crio-Tanques. Se acompaña comúnmente con un golpe cerrado del puño derecho sobre la válvula de pecho del traje de presión.'
    }
  },
  {
    id: 'fleet_vehicles',
    name: 'Flota, Naves & Vehículos',
    tagline: 'Cruceros, mechas, cazas estelares, armamento y blindajes',
    iconName: 'shield',
    category: 'worldbuilding',
    templateType: 'catalog',
    defaultCode: '13',
    defaultFields: [
      { key: 'propulsion', label: 'Sistema de Propulsión', value: 'Motor de antimateria pulsada' },
      { key: 'armor', label: 'Blindaje & Escudos', value: 'Aleación de carburo-tungsteno con jaula Faraday' },
      { key: 'crew', label: 'Dotación de Tripulación', value: '1 Comandante + 4 Operadores' },
      { key: 'weapons', label: 'Armamento Primario', value: 'Batería de aceleradores de masa de 80mm' }
    ],
    seedItem: {
      title: 'Nodriza Clase Eclipse',
      subtitle: 'Buque insignia de la Flota de Contención',
      category: 'Naves Capitales',
      tags: ['Blindaje Pesado', 'Salto FTL', 'Militar'],
      importance: 'alta',
      fields: [
        { key: 'propulsion', label: 'Sistema de Propulsión', value: 'Doble reactor de fusión de helio-3 y estatorreactor Bussard' },
        { key: 'armor', label: 'Blindaje & Escudos', value: 'Matriz activa de dispersión de neutrones de 1.4m' },
        { key: 'crew', label: 'Dotación de Tripulación', value: '450 oficiales + 1200 drones de mantenimiento' },
        { key: 'weapons', label: 'Armamento Primario', value: 'Cañón spinal de haz de leptones relativistas' }
      ],
      content: 'Plataforma estratégica capaz de desplegar 3 escuadrones de intercepción y generar burbujas de inhibición de saltos taquiónicos en un radio de 50.000 kilómetros.'
    }
  },
  {
    id: 'treaties_diplomacy',
    name: 'Tratados & Diplomacia',
    tagline: 'Pactos, acuerdos interestelares, leyes marciales y treguas',
    iconName: 'landmark',
    category: 'worldbuilding',
    templateType: 'matrix',
    defaultCode: '14',
    defaultFields: [
      { key: 'signatories', label: 'Estados Firmantes', value: 'Imperio Central y Consorcio Libre' },
      { key: 'status', label: 'Estado del Acuerdo', value: 'Vigente / Tensión creciente' },
      { key: 'clause', label: 'Cláusula de Quiebre', value: 'Movilización armada a menos de 2 UA de la frontera' },
      { key: 'penalty', label: 'Sanción por Incumplimiento', value: 'Bloqueo económico total y casus belli automático' }
    ],
    seedItem: {
      title: 'Tratado del Meridiano de Planck',
      subtitle: 'Armisticio que puso fin a la Guerra de los Compiladores',
      category: 'Tratados Multilaterales',
      tags: ['Derecho Interestelar', 'Desmilitarización'],
      importance: 'critica',
      fields: [
        { key: 'signatories', label: 'Estados Firmantes', value: 'Sacerdocio del Kernel y Alianza FOSS de Arqueólogos' },
        { key: 'status', label: 'Estado del Acuerdo', value: 'Vigente con violaciones encubiertas reportadas' },
        { key: 'clause', label: 'Cláusula de Quiebre', value: 'Extracción de reliquias en los Sectores 7 a 9 sin veedores cruzados' },
        { key: 'penalty', label: 'Sanción por Incumplimiento', value: 'Anulación de licencias de tránsito estelar e inicio de hostilidades' }
      ],
      content: 'Firmado a bordo de la estación neutral Null-Zero. Estableció la desmilitarización del Cinturón del Silicio y la prohibición absoluta de sobreescribir axiomas de entropía en mundos habitados.'
    }
  },
  {
    id: 'tech_tree',
    name: 'Árbol Tecnológico & Gadgets',
    tagline: 'Inventos revolucionarios, patentes, implantes y armamento exótico',
    iconName: 'cpu',
    category: 'worldbuilding',
    templateType: 'catalog',
    defaultCode: '15',
    defaultFields: [
      { key: 'tier', label: 'Nivel Tecnológico (Tier)', value: 'Tier III (Precursor Inestable)' },
      { key: 'developer', label: 'Desarrollador / Inventor', value: 'Laboratorios Clandestinos de Null-Bay' },
      { key: 'power_source', label: 'Fuente de Alimentación', value: 'Microcélula de tritio de 50 años' },
      { key: 'legal_status', label: 'Estatus Legal', value: 'Prohibido por la Convención DRM' }
    ],
    seedItem: {
      title: 'Decodificador Neuronal Subvocal',
      subtitle: 'Bioimplante coclear para comunicación cifrada silenciosa',
      category: 'Ciberimplantes Tácticos',
      tags: ['Clandestino', 'Infiltración', 'Espionaje'],
      importance: 'alta',
      fields: [
        { key: 'tier', label: 'Nivel Tecnológico (Tier)', value: 'Tier II (Consolidado)' },
        { key: 'developer', label: 'Desarrollador / Inventor', value: 'Sindicato de Cripto-Pilotos' },
        { key: 'power_source', label: 'Fuente de Alimentación', value: 'Parásito bioeléctrico del nervio vago' },
        { key: 'legal_status', label: 'Estatus Legal', value: 'Ilegal bajo jurisdicción de las Megacorporaciones' }
      ],
      content: 'Captura los microimpulsos neuromusculares de la laringe antes de que se produzca sonido audible, transmitiendo paquetes telemétricos cifrados mediante conducción ósea.'
    }
  },
  {
    id: 'custom_blank',
    name: 'Módulo en Blanco (Personalizado)',
    tagline: 'Crea tu propia categoría de datos con campos a medida',
    iconName: 'boxes',
    category: 'worldbuilding',
    templateType: 'catalog',
    defaultCode: '16',
    defaultFields: [
      { key: 'property_1', label: 'Propiedad Clave', value: 'Valor' },
      { key: 'property_2', label: 'Clasificación', value: 'Estándar' }
    ]
  }
];

function loadFromStorage(): UserCustomModule[] {
  return readJSON<UserCustomModule[]>(STORAGE_KEY, [], isArray);
}

function saveToStorage(modules: UserCustomModule[]) {
  writeJSON(STORAGE_KEY, modules);
  autosaveService.scheduleSave(STORAGE_KEY, modules, true);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: modules }));
}

export const userCustomModuleService = {
  getAll(): UserCustomModule[] {
    return loadFromStorage();
  },

  getById(id: string): UserCustomModule | undefined {
    return loadFromStorage().find(m => m.id === id);
  },

  createFromPreset(presetId: string, customTitle?: string, customCategory?: ModuleCategory): UserCustomModule {
    const preset = CUSTOM_MODULE_PRESETS.find(p => p.id === presetId) || CUSTOM_MODULE_PRESETS[CUSTOM_MODULE_PRESETS.length - 1];
    const existing = loadFromStorage();
    
    // Generate clean unique ID
    const uniqueSuffix = Date.now().toString(36).slice(-4);
    const id = `custom_${preset.id}_${uniqueSuffix}`;
    const nextCode = (10 + existing.length).toString().padStart(2, '0');

    const newModule: UserCustomModule = {
      id,
      title: customTitle?.trim() || preset.name,
      desc: preset.tagline,
      code: nextCode,
      iconName: preset.iconName,
      category: customCategory || preset.category,
      templateType: preset.templateType,
      enabled: true,
      items: preset.seedItem ? [
        {
          id: `item_${Date.now()}_1`,
          title: preset.seedItem.title,
          subtitle: preset.seedItem.subtitle,
          category: preset.seedItem.category,
          tags: [...preset.seedItem.tags],
          importance: preset.seedItem.importance,
          fields: [...preset.seedItem.fields],
          content: preset.seedItem.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...existing, newModule];
    saveToStorage(updated);
    return newModule;
  },

  createCustom(params: {
    title: string;
    desc: string;
    code?: string;
    iconName?: string;
    category?: ModuleCategory;
    templateType?: CustomModuleTemplateType;
    initialFields?: CustomModuleField[];
  }): UserCustomModule {
    const existing = loadFromStorage();
    const uniqueSuffix = Date.now().toString(36);
    const id = `custom_${uniqueSuffix}`;
    const code = params.code || (10 + existing.length).toString().padStart(2, '0');

    const newModule: UserCustomModule = {
      id,
      title: params.title.trim() || 'Nuevo Módulo',
      desc: params.desc.trim() || 'Módulo personalizado de narrador',
      code,
      iconName: params.iconName || 'boxes',
      category: params.category || 'worldbuilding',
      templateType: params.templateType || 'catalog',
      enabled: true,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...existing, newModule];
    saveToStorage(updated);
    return newModule;
  },

  update(id: string, updates: Partial<UserCustomModule>): UserCustomModule | null {
    const existing = loadFromStorage();
    const index = existing.findIndex(m => m.id === id);
    if (index === -1) return null;

    const updatedModule = {
      ...existing[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    existing[index] = updatedModule;
    saveToStorage(existing);
    return updatedModule;
  },

  delete(id: string): boolean {
    const existing = loadFromStorage();
    const filtered = existing.filter(m => m.id !== id);
    if (filtered.length === existing.length) return false;
    saveToStorage(filtered);
    return true;
  },

  addItem(moduleId: string, itemData: {
    title: string;
    subtitle?: string;
    category?: string;
    tags?: string[];
    importance?: 'baja' | 'media' | 'alta' | 'critica';
    fields?: CustomModuleField[];
    content?: string;
    status?: string;
  }): UserModuleItem | null {
    const existing = loadFromStorage();
    const mod = existing.find(m => m.id === moduleId);
    if (!mod) return null;

    const newItem: UserModuleItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: itemData.title.trim() || 'Entrada Sin Título',
      subtitle: itemData.subtitle?.trim() || '',
      category: itemData.category?.trim() || 'General',
      tags: itemData.tags || [],
      importance: itemData.importance || 'media',
      fields: itemData.fields || [],
      content: itemData.content || '',
      status: itemData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mod.items.unshift(newItem);
    mod.updatedAt = new Date().toISOString();
    saveToStorage(existing);
    return newItem;
  },

  updateItem(moduleId: string, itemId: string, updates: Partial<UserModuleItem>): boolean {
    const existing = loadFromStorage();
    const mod = existing.find(m => m.id === moduleId);
    if (!mod) return false;

    const itemIdx = mod.items.findIndex(i => i.id === itemId);
    if (itemIdx === -1) return false;

    mod.items[itemIdx] = {
      ...mod.items[itemIdx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    mod.updatedAt = new Date().toISOString();
    saveToStorage(existing);
    return true;
  },

  deleteItem(moduleId: string, itemId: string): boolean {
    const existing = loadFromStorage();
    const mod = existing.find(m => m.id === moduleId);
    if (!mod) return false;

    const prevCount = mod.items.length;
    mod.items = mod.items.filter(i => i.id !== itemId);
    if (mod.items.length === prevCount) return false;

    mod.updatedAt = new Date().toISOString();
    saveToStorage(existing);
    return true;
  },

  exportAllAsJson(): string {
    return JSON.stringify(loadFromStorage(), null, 2);
  }
};

/**
 * Custom React Hook for live synchronization of user-created custom modules
 */
export function useUserCustomModules() {
  const [customModules, setCustomModules] = useState<UserCustomModule[]>(() => userCustomModuleService.getAll());

  useEffect(() => {
    const handleUpdate = () => {
      setCustomModules(userCustomModuleService.getAll());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
    };
  }, []);

  return {
    customModules,
    createFromPreset: userCustomModuleService.createFromPreset,
    createCustom: userCustomModuleService.createCustom,
    updateModule: userCustomModuleService.update,
    deleteModule: userCustomModuleService.delete,
    addItem: userCustomModuleService.addItem,
    updateItem: userCustomModuleService.updateItem,
    deleteItem: userCustomModuleService.deleteItem,
    refresh: () => setCustomModules(userCustomModuleService.getAll())
  };
}

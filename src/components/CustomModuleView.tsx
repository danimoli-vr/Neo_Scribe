import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Download, 
  Tag, 
  Sparkles, 
  Sliders, 
  Layers, 
  Check, 
  ExternalLink, 
  Copy, 
  FileText,
  AlertCircle,
  Hash
} from 'lucide-react';
import { 
  UserCustomModule, 
  UserModuleItem, 
  CustomModuleField 
} from '../types';
import { 
  userCustomModuleService, 
  useUserCustomModules 
} from '../services/userCustomModuleService';
import { MODULE_ICON_MAP } from '../services/moduleConfigService';

interface CustomModuleViewProps {
  module: UserCustomModule;
  onSendToAuditor?: (text: string, title?: string) => void;
  onOpenCustomizer?: () => void;
}

export const CustomModuleView: React.FC<CustomModuleViewProps> = ({
  module,
  onSendToAuditor,
  onOpenCustomizer
}) => {
  const { addItem, updateItem, deleteItem } = useUserCustomModules();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  
  // Active item for viewing / editing in the right pane or modal
  const [activeItemId, setActiveItemId] = useState<string | null>(
    module.items.length > 0 ? module.items[0].id : null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formImportance, setFormImportance] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [formFields, setFormFields] = useState<CustomModuleField[]>([]);
  const [formContent, setFormContent] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const IconComp = MODULE_ICON_MAP[module.iconName] || Layers;

  // Categories extracted from items
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    module.items.forEach(i => {
      if (i.category && i.category.trim()) cats.add(i.category.trim());
    });
    return Array.from(cats);
  }, [module.items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return module.items.filter(item => {
      const matchesSearch = 
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.fields.some(f => f.label.toLowerCase().includes(searchTerm.toLowerCase()) || f.value.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesImportance = selectedImportance === 'all' || item.importance === selectedImportance;

      return matchesSearch && matchesCat && matchesImportance;
    });
  }, [module.items, searchTerm, selectedCategory, selectedImportance]);

  const activeItem = useMemo(() => {
    return module.items.find(i => i.id === activeItemId) || null;
  }, [module.items, activeItemId]);

  const startCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing(true);
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory(availableCategories[0] || 'General');
    setFormTags([]);
    setTagInput('');
    setFormImportance('media');
    
    // Pre-populate fields from last item or default template
    if (activeItem && activeItem.fields.length > 0) {
      setFormFields(activeItem.fields.map(f => ({ ...f, value: '' })));
    } else {
      setFormFields([
        { key: 'prop_1', label: 'Propiedad 1', value: '' },
        { key: 'prop_2', label: 'Propiedad 2', value: '' }
      ]);
    }
    setFormContent('');
  };

  const startEditItem = (item: UserModuleItem) => {
    setIsCreatingNew(false);
    setIsEditing(true);
    setActiveItemId(item.id);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle || '');
    setFormCategory(item.category || 'General');
    setFormTags([...item.tags]);
    setTagInput('');
    setFormImportance(item.importance || 'media');
    setFormFields([...item.fields]);
    setFormContent(item.content);
  };

  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formTitle.trim()) return;

    if (isCreatingNew) {
      const newItem = addItem(module.id, {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        category: formCategory.trim() || 'General',
        tags: formTags,
        importance: formImportance,
        fields: formFields.filter(f => f.label.trim() !== ''),
        content: formContent.trim()
      });

      if (newItem) {
        setActiveItemId(newItem.id);
      }
    } else if (activeItemId) {
      updateItem(module.id, activeItemId, {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        category: formCategory.trim() || 'General',
        tags: formTags,
        importance: formImportance,
        fields: formFields.filter(f => f.label.trim() !== ''),
        content: formContent.trim()
      });
    }

    setIsEditing(false);
    setIsCreatingNew(false);
  };

  const handleDeleteActive = () => {
    if (!activeItemId) return;
    if (window.confirm('¿Seguro que deseas eliminar esta entrada del módulo?')) {
      deleteItem(module.id, activeItemId);
      const remaining = module.items.filter(i => i.id !== activeItemId);
      setActiveItemId(remaining.length > 0 ? remaining[0].id : null);
      setIsEditing(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!formTags.includes(cleanTag)) {
      setFormTags([...formTags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter(t => t !== tagToRemove));
  };

  const handleAddField = () => {
    const newKey = `field_${Date.now()}`;
    setFormFields([...formFields, { key: newKey, label: 'Nueva Propiedad', value: '' }]);
  };

  const handleRemoveField = (index: number) => {
    setFormFields(formFields.filter((_, idx) => idx !== index));
  };

  const handleFieldChange = (index: number, key: 'label' | 'value', val: string) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [key]: val };
    setFormFields(updated);
  };

  const handleExportMarkdown = () => {
    const md = [
      `# ${module.title.toUpperCase()} [${module.code}]`,
      `*${module.desc}*`,
      `\nTotal de Entradas: ${module.items.length}\n`,
      '---\n'
    ];

    module.items.forEach(item => {
      md.push(`## ${item.title}`);
      if (item.subtitle) md.push(`*${item.subtitle}*`);
      md.push(`\n**Categoría:** ${item.category || 'General'} | **Importancia:** ${(item.importance || 'media').toUpperCase()}`);
      if (item.tags.length > 0) md.push(`**Etiquetas:** ${item.tags.map(t => `#${t}`).join(' ')}`);
      
      if (item.fields.length > 0) {
        md.push('\n### Parámetros & Atributos:');
        item.fields.forEach(f => {
          md.push(`- **${f.label}:** ${f.value || 'N/A'}`);
        });
      }

      if (item.content) {
        md.push('\n### Descripción & Notas:');
        md.push(item.content);
      }
      md.push('\n---\n');
    });

    const blob = new Blob([md.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${module.title.toLowerCase().replace(/\s+/g, '_')}_biblia.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSendActiveToAuditor = () => {
    if (!activeItem || !onSendToAuditor) return;
    const text = `ENTRADA DE WORLDBUILDING [${module.title} / ${activeItem.title}]:\n${activeItem.subtitle ? activeItem.subtitle + '\n' : ''}Atributos:\n${activeItem.fields.map(f => `${f.label}: ${f.value}`).join('\n')}\n\nDescripción:\n${activeItem.content}`;
    onSendToAuditor(text, `Auditoría: ${activeItem.title}`);
  };

  const getImportanceBadge = (importance?: string) => {
    switch (importance) {
      case 'critica':
        return <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/50 text-[10px] font-bold">CRÍTICA</span>;
      case 'alta':
        return <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-600/50 text-[10px] font-bold">ALTA</span>;
      case 'baja':
        return <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">BAJA</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 text-[10px]">MEDIA</span>;
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Module Banner Header */}
      <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-4 sm:p-5 relative overflow-hidden shadow-xl">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <IconComp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-bold">[{module.code}]</span>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {module.title}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 text-[10px] font-bold">
                  {module.items.length} {module.items.length === 1 ? 'Entrada' : 'Entradas'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                  {module.category.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                {module.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={startCreateNew}
              className="px-3.5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nueva Entrada</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="px-3 py-2 rounded bg-[#121622] hover:bg-[#1b2234] border border-[#2d3748] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar compendio en formato Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar MD</span>
            </button>

            {onOpenCustomizer && (
              <button
                onClick={onOpenCustomizer}
                className="p-2 rounded bg-[#121622] hover:bg-[#1b2234] border border-[#2d3748] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Personalizar nombre, icono o configuración de este módulo"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-3 border-t border-[#1a2233] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, atributo, tag..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-slate-200 text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {/* Category selector */}
            <span className="text-[10px] text-slate-500 uppercase">Cat:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'bg-[#0e121a] text-slate-400 hover:text-white border border-[#1e293b]'
              }`}
            >
              Todas
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 font-bold'
                    : 'bg-[#0e121a] text-slate-400 hover:text-white border border-[#1e293b]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid / Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: List of items */}
        <div className={`${isEditing ? 'lg:col-span-5' : 'lg:col-span-5'} space-y-2.5`}>
          {filteredItems.length === 0 ? (
            <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <IconComp className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">
                {searchTerm ? 'No se encontraron resultados' : 'Módulo Vacío'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm 
                  ? 'Prueba a cambiar el término de búsqueda o restablecer los filtros.' 
                  : `Comienza agregando la primera entrada a tu compendio de ${module.title}.`}
              </p>
              {!searchTerm && (
                <button
                  onClick={startCreateNew}
                  className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Primera Entrada</span>
                </button>
              )}
            </div>
          ) : (
            filteredItems.map(item => {
              const isSelected = item.id === activeItemId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveItemId(item.id);
                    if (isEditing) {
                      startEditItem(item);
                    }
                  }}
                  className={`
                    p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden
                    ${isSelected 
                      ? 'bg-[#101622] border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.12)] ring-1 ring-cyan-500/30' 
                      : 'bg-[#0b0e14] border-[#1e293b] hover:border-slate-700 hover:bg-[#0e121a]'}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs truncate">
                          {item.title}
                        </span>
                        {getImportanceBadge(item.importance)}
                        {item.category && (
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditItem(item);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                        title="Editar entrada"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Attributes snippet */}
                  {item.fields && item.fields.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#182030] grid grid-cols-2 gap-1.5 text-[10px]">
                      {item.fields.slice(0, 2).map((f, idx) => (
                        <div key={idx} className="truncate">
                          <span className="text-slate-500">{f.label}: </span>
                          <span className="text-slate-300 font-mono">{f.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900/80 text-cyan-400/80 border border-cyan-950">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[9px] text-slate-500">+{item.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detail View or Edit Form */}
        <div className="lg:col-span-7">
          {isEditing ? (
            /* Editing / Creating Form */
            <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-lg p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <h3 className="font-bold text-white text-sm">
                    {isCreatingNew ? `Nueva Entrada en ${module.title}` : `Editar: ${formTitle || 'Sin Título'}`}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Title and Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Nombre / Título de Entrada *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ej: Quimera de Grafeno, Pacto de Null..."
                      className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Subtítulo / Epígrafe
                    </label>
                    <input
                      type="text"
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      placeholder="Ej: Depredador de las lunas de Oort..."
                      className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category and Importance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="Ej: Bioformas Alfa, Hechizos..."
                      className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                      Nivel de Relevancia
                    </label>
                    <select
                      value={formImportance}
                      onChange={(e) => setFormImportance(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none cursor-pointer"
                    >
                      <option value="baja">Baja (Mención de fondo)</option>
                      <option value="media">Media (Elemento recurrente)</option>
                      <option value="alta">Alta (Relevante para trama)</option>
                      <option value="critica">Crítica (Eje principal de la historia)</option>
                    </select>
                  </div>
                </div>

                {/* Tags Management */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                    Etiquetas de Búsqueda
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Escribe un tag y pulsa Enter o Añadir..."
                      className="flex-1 px-3 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
                    >
                      Añadir
                    </button>
                  </div>
                  {formTags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {formTags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Fields (Dynamic Key-Value Properties) */}
                <div className="space-y-2 pt-2 border-t border-[#1e293b]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Atributos y Parámetros Personalizados
                    </label>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir Atributo</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                          placeholder="Nombre del Atributo (ej: Hábitat)"
                          className="w-1/3 px-2.5 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-slate-300 text-xs font-bold focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleFieldChange(idx, 'value', e.target.value)}
                          placeholder="Valor (ej: Cuadrante de Planck)"
                          className="flex-1 px-2.5 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs focus:border-cyan-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
                          title="Eliminar campo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lore / Description */}
                <div className="space-y-1 pt-2 border-t border-[#1e293b]">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider">
                    Descripción Diegética & Lore Narrativo
                  </label>
                  <textarea
                    rows={6}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Escribe aquí los detalles narrativos, historia, modos de fallo, impacto en la trama o datos para el manuscrito..."
                    className="w-full px-3 py-2 bg-[#080a0f] border border-[#1e293b] rounded text-slate-200 text-xs focus:border-cyan-500 focus:outline-none font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
                <div>
                  {!isCreatingNew && (
                    <button
                      type="button"
                      onClick={handleDeleteActive}
                      className="px-3 py-1.5 rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-700/50 text-rose-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveForm()}
                    disabled={!formTitle.trim()}
                    className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Entrada</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeItem ? (
            /* Selected Item Inspector / Detail View */
            <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-5 space-y-5 shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#1e293b]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {activeItem.title}
                    </h2>
                    {getImportanceBadge(activeItem.importance)}
                    {activeItem.category && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                        {activeItem.category}
                      </span>
                    )}
                  </div>
                  {activeItem.subtitle && (
                    <p className="text-xs text-slate-400 italic">
                      {activeItem.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEditItem(activeItem)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1 text-xs cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {onSendToAuditor && (
                    <button
                      onClick={handleSendActiveToAuditor}
                      className="px-3 py-1.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 flex items-center gap-1 text-xs cursor-pointer transition-colors"
                      title="Enviar a la pantalla de Auditoría IA para verificar coherencia"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Auditar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {activeItem.tags && activeItem.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {activeItem.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Key-Value Fields Grid */}
              {activeItem.fields && activeItem.fields.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Parámetros & Atributos Clave
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeItem.fields.map((field, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-[#07090e] border border-[#1a2333] space-y-0.5"
                      >
                        <div className="text-[10px] text-slate-500 font-bold uppercase truncate">
                          {field.label}
                        </div>
                        <div className="text-xs text-slate-200 font-mono break-words">
                          {field.value || <span className="text-slate-600 italic">No especificado</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content / Narrative Lore */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Descripción Diegética & Lore
                </h4>
                <div className="p-4 rounded bg-[#07090e] border border-[#1a2333] text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {activeItem.content || (
                    <span className="text-slate-600 italic">
                      Sin descripción detallada. Pulsa "Editar" para añadir contexto narrativo.
                    </span>
                  )}
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-[10px] text-slate-500">
                <span>ID: {activeItem.id}</span>
                <span>Última modificación: {new Date(activeItem.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            /* Nothing selected */
            <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-12 text-center text-slate-500">
              <IconComp className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Selecciona una entrada a la izquierda para inspeccionar sus datos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

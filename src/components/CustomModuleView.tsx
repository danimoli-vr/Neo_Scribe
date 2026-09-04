import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Sliders, 
  Layers, 
  X,
  LucideIcon
} from 'lucide-react';
import { 
  UserCustomModule, 
  UserModuleItem, 
  CustomModuleField 
} from '../types';
import { 
  useUserCustomModules 
} from '../services/userCustomModuleService';
import { MODULE_ICON_MAP } from '../services/moduleConfigService';
import { CustomModuleItemDrawer } from './CustomModuleItemDrawer';
import { CustomModuleItemEditor } from './CustomModuleItemEditor';

interface CustomModuleViewProps {
  module?: UserCustomModule;
  moduleId?: string;
  onSendToAuditor?: (text: string, title?: string) => void;
  onOpenCustomizer?: () => void;
  onBackToOverview?: () => void;
}

export const CustomModuleView: React.FC<CustomModuleViewProps> = ({
  module: propModule,
  moduleId,
  onSendToAuditor,
  onOpenCustomizer,
  onBackToOverview
}) => {
  const { customModules, addItem, updateItem, deleteItem } = useUserCustomModules();

  const module = propModule || (moduleId ? customModules.find(m => m.id === moduleId) : null);
  const items = useMemo(() => module?.items || [], [module?.items]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  
  // Active item for viewing / editing in the right pane or modal
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      if (!activeItemId || !items.some(i => i.id === activeItemId)) {
        setActiveItemId(items[0].id);
      }
    } else {
      setActiveItemId(null);
    }
  }, [items]);

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

  const IconComp = (module && MODULE_ICON_MAP[module.iconName]) || Layers;

  // Categories extracted from items
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(i => {
      if (i.category && i.category.trim()) cats.add(i.category.trim());
    });
    return Array.from(cats);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
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
  }, [items, searchTerm, selectedCategory, selectedImportance]);

  const activeItem = useMemo(() => {
    return items.find(i => i.id === activeItemId) || null;
  }, [items, activeItemId]);

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
    if (items.length > 0 && items[0].fields.length > 0) {
      setFormFields(items[0].fields.map(f => ({ ...f, value: '' })));
    } else {
      setFormFields([
        { key: 'attr_1', label: 'Tipo / Naturaleza', value: '', type: 'text' },
        { key: 'attr_2', label: 'Origen / Región', value: '', type: 'text' }
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
    if (!formTitle.trim() || !module) return;

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
    if (!activeItemId || !module) return;
    if (window.confirm('¿Seguro que deseas eliminar esta entrada del módulo?')) {
      deleteItem(module.id, activeItemId);
      setIsEditing(false);
      setIsCreatingNew(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed || formTags.includes(trimmed)) return;
    setFormTags([...formTags, trimmed]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter(t => t !== tagToRemove));
  };

  const handleAddField = () => {
    const newField: CustomModuleField = {
      key: `custom_${Date.now()}`,
      label: 'Nuevo Atributo',
      value: '',
      type: 'text'
    };
    setFormFields([...formFields, newField]);
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
    if (!module) return;
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
    if (!activeItem || !onSendToAuditor || !module) return;
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

  if (!module) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 font-mono">
        <Layers className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">Módulo no disponible</h3>
        <p className="text-xs text-slate-500 mb-6 text-center max-w-md">
          El módulo personalizado solicitado no existe o ha sido eliminado.
        </p>
        {onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-lg shadow-indigo-950/30"
          >
            Volver al Panel Principal
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* Module Banner Header */}
      <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-4 sm:p-5 relative overflow-hidden shadow-xl">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-inner">
              <IconComp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-500 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                  {module.code}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {module.title}
                </h1>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {items.length} {items.length === 1 ? 'entrada' : 'entradas'}
                </span>
              </div>
              <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
                {module.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={startCreateNew}
              className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-lg shadow-cyan-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Entrada</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              disabled={items.length === 0}
              className="px-3 py-1.5 rounded bg-[#10141d] hover:bg-[#161c28] border border-[#1e293b] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs disabled:opacity-40"
              title="Descargar compendio en formato Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar MD</span>
            </button>

            {onOpenCustomizer && (
              <button
                onClick={onOpenCustomizer}
                className="px-3 py-1.5 rounded bg-[#10141d] hover:bg-[#161c28] border border-[#1e293b] text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                title="Configurar módulos del universo"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Configurar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b0e14] border border-[#1e293b] rounded-lg p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, etiquetas, contenido..."
              className="w-full pl-8 pr-8 py-1.5 bg-[#080a0f] border border-[#1e293b] rounded text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
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
        <div className="lg:col-span-5 space-y-2.5">
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
            <CustomModuleItemEditor
              isCreatingNew={isCreatingNew}
              moduleTitle={module.title}
              formTitle={formTitle}
              setFormTitle={setFormTitle}
              formSubtitle={formSubtitle}
              setFormSubtitle={setFormSubtitle}
              formCategory={formCategory}
              setFormCategory={setFormCategory}
              formImportance={formImportance}
              setFormImportance={setFormImportance}
              formTags={formTags}
              tagInput={tagInput}
              setTagInput={setTagInput}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              formFields={formFields}
              onFieldChange={handleFieldChange}
              onAddField={handleAddField}
              onRemoveField={handleRemoveField}
              formContent={formContent}
              setFormContent={setFormContent}
              onCancel={() => setIsEditing(false)}
              onSave={() => handleSaveForm()}
              onDelete={!isCreatingNew ? handleDeleteActive : undefined}
            />
          ) : (
            <CustomModuleItemDrawer
              activeItem={activeItem}
              moduleTitle={module.title}
              IconComp={IconComp}
              getImportanceBadge={getImportanceBadge}
              onEditItem={startEditItem}
              onSendToAuditor={onSendToAuditor ? handleSendActiveToAuditor : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
};

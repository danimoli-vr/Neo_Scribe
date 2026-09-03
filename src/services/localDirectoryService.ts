import { Chapter, NovelCharacter, TimelineEvent, LoreItem } from '../types';

export interface LocalDirectoryState {
  isSupported: boolean;
  hasHandle: boolean;
  folderName: string | null;
  lastSynced: Date | null;
  error?: string;
}

// In-memory directory handle reference for current session
let directoryHandle: any = null;

export class LocalDirectoryService {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  public static getFolderName(): string | null {
    if (directoryHandle) {
      return directoryHandle.name || 'Carpeta seleccionada';
    }
    return localStorage.getItem('krnl_local_folder_name');
  }

  public static hasSelectedFolder(): boolean {
    return directoryHandle !== null;
  }

  /**
   * Prompt user to pick a folder on their device
   */
  public static async pickDirectory(): Promise<{ success: boolean; folderName?: string; error?: string }> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: 'Tu navegador actual no soporta File System Access API. Te recomendamos usar Chrome, Edge u Opera en escritorio, o usar la opción de Google Drive / Descarga directa.'
      };
    }

    try {
      // @ts-ignore - native browser API
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });

      if (!handle) {
        return { success: false, error: 'No se seleccionó ninguna carpeta.' };
      }

      directoryHandle = handle;
      const folderName = handle.name || 'Carpeta Local';
      localStorage.setItem('krnl_local_folder_name', folderName);
      localStorage.setItem('krnl_local_folder_selected', 'true');

      return { success: true, folderName };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'Selección de carpeta cancelada por el usuario.' };
      }
      if (err.name === 'SecurityError') {
        return { 
          success: false, 
          error: 'El navegador bloqueó la selección de disco dentro del marco embebido. Abre la aplicación en una pestaña nueva para otorgar permiso al disco local.' 
        };
      }
      console.error('Error selecting directory:', err);
      return { success: false, error: err.message || 'Error al seleccionar carpeta local' };
    }
  }

  /**
   * Write all chapters, bible and lore into the selected local directory
   */
  public static async syncToLocalDirectory(
    chapters: Chapter[],
    characters: NovelCharacter[],
    customEvents: TimelineEvent[] = [],
    loreItems: LoreItem[] = []
  ): Promise<{ success: boolean; filesSaved: string[]; error?: string }> {
    if (!directoryHandle) {
      return {
        success: false,
        filesSaved: [],
        error: 'No hay ninguna carpeta local vinculada. Haz clic en "Seleccionar carpeta local" primero.'
      };
    }

    try {
      // Verify or request readwrite permission if needed
      if (typeof directoryHandle.queryPermission === 'function') {
        let perm = await directoryHandle.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted' && typeof directoryHandle.requestPermission === 'function') {
          perm = await directoryHandle.requestPermission({ mode: 'readwrite' });
        }
        if (perm !== 'granted') {
          return { success: false, filesSaved: [], error: 'Permiso de escritura en la carpeta denegado.' };
        }
      }

      const filesSaved: string[] = [];

      // 1. Crear subdirectorio 'capitulos' para archivos individuales en Markdown
      const chaptersDir = await directoryHandle.getDirectoryHandle('capitulos', { create: true });

      for (const ch of chapters) {
        const safeTitle = (ch.title || `capitulo_${ch.number}`)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 40);
        const fileName = `cap_${String(ch.number).padStart(2, '0')}_${safeTitle}.md`;

        const fileHandle = await chaptersDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();

        const mdContent = `---
numero: ${ch.number}
titulo: "${ch.title}"
fecha_diegetica: "${ch.diegeticDateLabel || ''}"
palabras: ${ch.wordCount || 0}
estado: "${ch.status}"
---

# CAPÍTULO ${ch.number}: ${ch.title}

${ch.authorNotes ? `> **Notas del autor**: ${ch.authorNotes}\n\n` : ''}
${ch.content || ''}
`;
        await writable.write(mdContent);
        await writable.close();
        filesSaved.push(`capitulos/${fileName}`);
      }

      // 2. Archivo completo del Manuscrito consolidado
      const fullManuscriptHandle = await directoryHandle.getFileHandle('MANUSCRITO_COMPLETO.md', { create: true });
      const fullWritable = await fullManuscriptHandle.createWritable();

      let fullText = `# EL KERNEL DEL VACÍO\n*Manuscrito diegético completo*\n*Actualizado: ${new Date().toLocaleString()}*\n\n---\n\n`;
      chapters
        .slice()
        .sort((a, b) => a.number - b.number)
        .forEach((c) => {
          fullText += `## CAPÍTULO ${c.number}: ${c.title.toUpperCase()}\n\n${c.content || ''}\n\n---\n\n`;
        });
      await fullWritable.write(fullText);
      await fullWritable.close();
      filesSaved.push('MANUSCRITO_COMPLETO.md');

      // 3. Biblia de Worldbuilding y Lore en JSON
      const bibleHandle = await directoryHandle.getFileHandle('WORLDBUILDING_BIBLIA.json', { create: true });
      const bibleWritable = await bibleHandle.createWritable();
      const bibleData = {
        novelTitle: 'El Kernel del Vacío',
        syncedAt: new Date().toISOString(),
        characters,
        chapters,
        customEvents,
        loreItems
      };
      await bibleWritable.write(JSON.stringify(bibleData, null, 2));
      await bibleWritable.close();
      filesSaved.push('WORLDBUILDING_BIBLIA.json');

      localStorage.setItem('krnl_local_folder_last_sync', new Date().toISOString());

      return { success: true, filesSaved };
    } catch (err: any) {
      console.error('Error writing to local folder:', err);
      return { success: false, filesSaved: [], error: err.message || 'Error escribiendo en el disco local' };
    }
  }

  /**
   * Fallback export as a downloadable bundle in case File System Access API is unavailable or blocked
   */
  public static exportDirectJsonBundle(chapters: Chapter[], characters: NovelCharacter[], customEvents: TimelineEvent[] = [], loreItems: LoreItem[] = []) {
    const bundle = {
      app: 'El Kernel del Vacío',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      chapters,
      characters,
      customEvents,
      loreItems
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `el_kernel_del_vacio_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Chapter, NovelCharacter, LoreItem, TimelineEvent } from '../types';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentAuthUser: User | null = null;

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface DriveSyncResult {
  success: boolean;
  folderId?: string;
  folderLink?: string;
  files: DriveFileInfo[];
  syncedAt: Date;
  error?: string;
}

// Initialize auth state listener
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentAuthUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Drive');
    }

    cachedAccessToken = credential.accessToken;
    currentAuthUser = result.user;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('krnl_drive_reconnected'));
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return currentAuthUser || auth.currentUser;
};

export const signOutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  currentAuthUser = null;
};

/**
 * Drive API Helper: Find or create app root folder
 */
export async function findOrCreateDriveFolder(folderName = 'Neo_Scribe - Manuscrito & Biblia'): Promise<DriveFileInfo> {
  const token = await getAccessToken();
  if (!token) throw new Error('No estás autenticado en Google Drive. Inicia sesión primero.');

  // Check if folder exists
  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!searchRes.ok) {
    const err = await searchRes.json();
    throw new Error(err.error?.message || 'Error buscando carpeta en Google Drive');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Error creando carpeta en Google Drive');
  }

  return await createRes.json();
}

/**
 * Drive API Helper: Upload or update an existing file
 */
export async function uploadOrUpdateDriveFile(
  folderId: string, 
  fileName: string, 
  content: string, 
  mimeType = 'text/plain'
): Promise<DriveFileInfo> {
  const token = await getAccessToken();
  if (!token) throw new Error('Sin token de acceso a Google Drive');

  // Search if file already exists in folder
  const query = encodeURIComponent(`'${folderId}' in parents and name='${fileName}' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink)`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  let existingFileId: string | null = null;
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      existingFileId = data.files[0].id;
    }
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata = existingFileId 
    ? { name: fileName, mimeType } 
    : { name: fileName, parents: [folderId], mimeType };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelim;

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime`;

  const method = existingFileId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Error subiendo archivo ${fileName} a Google Drive`);
  }

  return await res.json();
}

/**
 * Synchronize full novel data to Google Drive
 */
export async function syncAllToGoogleDrive(
  chapters: Chapter[],
  characters: NovelCharacter[],
  customTimelineEvents: TimelineEvent[] = [],
  loreItems: LoreItem[] = [],
  novelTitle: string = 'Mi Novela'
): Promise<DriveSyncResult> {
  try {
    const folder = await findOrCreateDriveFolder(`${novelTitle} - Manuscrito & Biblia`);
    const uploadedFiles: DriveFileInfo[] = [];

    // 1. Manuscrito Completo (.md)
    let fullManuscript = `# ${novelTitle.toUpperCase()}\n*Manuscrito diegético generado automáticamente*\n*Fecha de sincronización: ${new Date().toISOString()}*\n\n---\n\n`;
    chapters
      .slice()
      .sort((a, b) => a.number - b.number)
      .forEach((ch) => {
        fullManuscript += `## CAPÍTULO ${ch.number}: ${ch.title.toUpperCase()}\n`;
        fullManuscript += `> Fecha diegética: ${ch.diegeticDateLabel || 'No asignada'} | Palabras: ${ch.wordCount || 0} | Estado: ${ch.status}\n\n`;
        if (ch.authorNotes) {
          fullManuscript += `*Notas del autor:* ${ch.authorNotes}\n\n`;
        }
        fullManuscript += `${ch.content || ''}\n\n---\n\n`;
      });

    const docFile = await uploadOrUpdateDriveFile(folder.id, 'manuscrito_completo.md', fullManuscript, 'text/markdown');
    uploadedFiles.push(docFile);

    // 2. Capítulos en JSON estructurado
    const chaptersJson = JSON.stringify(chapters, null, 2);
    const chaptersFile = await uploadOrUpdateDriveFile(folder.id, 'capitulos_backup.json', chaptersJson, 'application/json');
    uploadedFiles.push(chaptersFile);

    // 3. Personajes y Relaciones
    const charactersJson = JSON.stringify(characters, null, 2);
    const charsFile = await uploadOrUpdateDriveFile(folder.id, 'personajes_lore.json', charactersJson, 'application/json');
    uploadedFiles.push(charsFile);

    // 4. Biblia de Worldbuilding y Eventos
    const bibleData = {
      exportedAt: new Date().toISOString(),
      novelTitle,
      charactersCount: characters.length,
      chaptersCount: chapters.length,
      customTimelineEvents,
      loreItems,
    };
    const bibleFile = await uploadOrUpdateDriveFile(folder.id, 'worldbuilding_biblia.json', JSON.stringify(bibleData, null, 2), 'application/json');
    uploadedFiles.push(bibleFile);

    return {
      success: true,
      folderId: folder.id,
      folderLink: folder.webViewLink,
      files: uploadedFiles,
      syncedAt: new Date()
    };
  } catch (error: any) {
    console.error('Error sincronizando con Google Drive:', error);
    return {
      success: false,
      files: [],
      syncedAt: new Date(),
      error: error?.message || 'Fallo de sincronización con Google Drive'
    };
  }
}

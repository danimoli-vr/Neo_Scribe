/**
 * Turns a free-form, author-chosen title into a safe filename/slug fragment
 * (no extension, no diacritics, no spaces). Shared by every export path that
 * needs to turn `novelTitle` (see `NovelDataContext`) into a file or folder
 * name: `WorldbuildingExportModal`, `localDirectoryService`, `googleDriveService`.
 */
export function slugify(title: string, fallback: string): string {
  const slug = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || fallback;
}

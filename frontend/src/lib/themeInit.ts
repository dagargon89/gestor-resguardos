/** Tema UI alineado con identidad (`data-theme="light"` | `"dark"`). */
const STORAGE_KEY = 'gr-theme';

export type AppTheme = 'light' | 'dark';

export function readStoredTheme(): AppTheme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* ignore */
  }
  return 'dark';
}

export function applyTheme(theme: AppTheme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function initThemeFromStorage(): void {
  applyTheme(readStoredTheme());
}

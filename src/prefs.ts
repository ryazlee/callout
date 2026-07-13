const PREFS_KEY = 'callout-prefs'

export type Prefs = {
  historyVisible: boolean
}

const DEFAULT_PREFS: Prefs = {
  historyVisible: true,
}

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS

    const parsed = JSON.parse(raw) as Partial<Prefs>
    return {
      historyVisible:
        typeof parsed.historyVisible === 'boolean'
          ? parsed.historyVisible
          : DEFAULT_PREFS.historyVisible,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(prefs: Prefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

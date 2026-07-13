const STORAGE_KEY = 'callout-game'
const MAX_HISTORY = 50

export type CalloutEntry = {
  text: string
  at: number
}

export type GameState = {
  history: CalloutEntry[]
}

const EMPTY_GAME: GameState = {
  history: [],
}

function isEntry(value: unknown): value is CalloutEntry {
  if (!value || typeof value !== 'object') return false
  const entry = value as Partial<CalloutEntry>
  return typeof entry.text === 'string' && typeof entry.at === 'number'
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_GAME

    const parsed = JSON.parse(raw) as Partial<GameState> & {
      lastSaid?: string
      updatedAt?: number | null
    }

    if (Array.isArray(parsed.history)) {
      return {
        history: parsed.history.filter(isEntry).slice(0, MAX_HISTORY),
      }
    }

    // Migrate older single-lastSaid shape.
    if (typeof parsed.lastSaid === 'string' && parsed.lastSaid.trim()) {
      return {
        history: [
          {
            text: parsed.lastSaid,
            at: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
          },
        ],
      }
    }

    return EMPTY_GAME
  } catch {
    return EMPTY_GAME
  }
}

export function saveGame(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearGame(): GameState {
  localStorage.removeItem(STORAGE_KEY)
  return EMPTY_GAME
}

export function appendCallout(state: GameState, text: string): GameState {
  const entry: CalloutEntry = {
    text: text.trim(),
    at: Date.now(),
  }

  return {
    history: [entry, ...state.history].slice(0, MAX_HISTORY),
  }
}

export function latestCallout(state: GameState): CalloutEntry | null {
  return state.history[0] ?? null
}

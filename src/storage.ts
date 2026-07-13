const STORAGE_KEY = 'callout-game'

export type GameState = {
  lastSaid: string
  updatedAt: number | null
}

const EMPTY_GAME: GameState = {
  lastSaid: '',
  updatedAt: null,
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_GAME

    const parsed = JSON.parse(raw) as Partial<GameState>
    return {
      lastSaid: typeof parsed.lastSaid === 'string' ? parsed.lastSaid : '',
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : null,
    }
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

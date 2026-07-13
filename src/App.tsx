import { useEffect, useState } from 'react'
import { containsNumber } from './numbers'
import {
  appendCallout,
  clearGame,
  latestCallout,
  loadGame,
  saveGame,
  type GameState,
} from './storage'
import { applyTheme, loadTheme, saveTheme, type Theme } from './theme'
import { useSpeechListener } from './useSpeechListener'
import './App.css'

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
}

function App() {
  const [game, setGame] = useState<GameState>(() => loadGame())
  const [theme, setTheme] = useState<Theme>(() => loadTheme())

  useEffect(() => {
    saveGame(game)
  }, [game])

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  const speech = useSpeechListener({
    onFinalTranscript: (transcript) => {
      if (!containsNumber(transcript)) return
      setGame((current) => appendCallout(current, transcript))
    },
  })

  function handleListenToggle() {
    if (speech.listening) {
      speech.stop()
    } else {
      speech.start()
    }
  }

  function handleNewGame() {
    speech.stop()
    setGame(clearGame())
  }

  function handleThemeToggle() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  const latest = latestCallout(game)
  const interimHasNumber = containsNumber(speech.interim)
  const displayText = interimHasNumber ? speech.interim : latest?.text
  const isLive = interimHasNumber
  const pastHistory = game.history.slice(1)

  return (
    <div className="app">
      <header className="pageHeader">
        <div className="brand">
          <h1>Callout</h1>
          <p className="subtitle">Only saves when a number is said.</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={handleThemeToggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      <main className="stage">
        <div className="scoreboard">
          <p className={`said ${displayText ? 'has-text' : ''}`}>
            {displayText || '—'}
          </p>
          {latest && !isLive ? <p className="meta">{formatTime(latest.at)}</p> : null}
        </div>

        {pastHistory.length > 0 ? (
          <section className="history" aria-label="Callout history">
            <p className="section-label">History</p>
            <ul className="history-list">
              {pastHistory.map((entry) => (
                <li key={`${entry.at}-${entry.text}`} className="history-item">
                  <span className="history-text">{entry.text}</span>
                  <span className="history-time">{formatTime(entry.at)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>

      <footer className="controls">
        {!speech.supported ? (
          <p className="status error">Needs Chrome or Safari for speech.</p>
        ) : speech.error ? (
          <p className="status error">{speech.error}</p>
        ) : speech.listening ? (
          <p className="status">Listening for numbers — keep this page open</p>
        ) : null}

        <button
          type="button"
          className={`btn btn-primary ${speech.listening ? 'listening' : ''}`}
          onClick={handleListenToggle}
          disabled={!speech.supported}
        >
          {speech.listening ? 'Stop' : 'Listen'}
        </button>

        <button type="button" className="btn btn-secondary" onClick={handleNewGame}>
          New game
        </button>
      </footer>
    </div>
  )
}

export default App

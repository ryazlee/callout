import { useEffect, useState } from 'react'
import { containsNumber } from './numbers'
import { loadPrefs, savePrefs } from './prefs'
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
  const [historyVisible, setHistoryVisible] = useState(
    () => loadPrefs().historyVisible,
  )

  useEffect(() => {
    saveGame(game)
  }, [game])

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  useEffect(() => {
    savePrefs({ historyVisible })
  }, [historyVisible])

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
  const isEmpty = !displayText
  const recentHistory = game.history.slice(1)
  const hasHistory = recentHistory.length > 0

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
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </header>

      <main className="stage">
        <div className="scoreboard">
          {isEmpty ? (
            <p className="empty-prompt">
              {speech.listening ? (
                <>
                  <span className="empty-emoji" aria-hidden="true">
                    👂
                  </span>
                  Listening… call out that score!
                </>
              ) : (
                <>
                  <span className="empty-emoji" aria-hidden="true">
                    🏐
                  </span>
                  Hit Listen and yell the score
                </>
              )}
            </p>
          ) : (
            <>
              <p className="said has-text">{displayText}</p>
              {latest && !isLive ? <p className="meta">{formatTime(latest.at)}</p> : null}
            </>
          )}
        </div>

        {hasHistory && historyVisible ? (
          <section className="history" aria-label="Callout history">
            <div className="history-header">
              <p className="section-label">History</p>
              <button
                type="button"
                className="text-btn"
                onClick={() => setHistoryVisible(false)}
              >
                Hide
              </button>
            </div>
            <ul className="history-list">
              {recentHistory.map((entry) => (
                <li key={`${entry.at}-${entry.text}`} className="history-item">
                  <span className="history-text">{entry.text}</span>
                  <span className="history-time">{formatTime(entry.at)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasHistory && !historyVisible ? (
          <button
            type="button"
            className="text-btn history-reopen"
            onClick={() => setHistoryVisible(true)}
          >
            Show history
          </button>
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

        <div className="actions">
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
        </div>
      </footer>
    </div>
  )
}

export default App

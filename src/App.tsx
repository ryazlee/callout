import { useEffect, useState } from 'react'
import { clearGame, loadGame, saveGame, type GameState } from './storage'
import { useSpeechListener } from './useSpeechListener'
import './App.css'

function formatTime(timestamp: number | null): string {
  if (!timestamp) return ''
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
}

function App() {
  const [game, setGame] = useState<GameState>(() => loadGame())

  useEffect(() => {
    saveGame(game)
  }, [game])

  const speech = useSpeechListener({
    onFinalTranscript: (transcript) => {
      setGame({
        lastSaid: transcript,
        updatedAt: Date.now(),
      })
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

  const displayText = speech.interim || game.lastSaid
  const isLive = Boolean(speech.interim)

  return (
    <div className="app">
      <header className="pageHeader">
        <h1>Callout</h1>
        <p className="subtitle">Last thing said during the game.</p>
      </header>

      <main className="stage">
        <p className="section-label">{isLive ? 'Hearing' : 'Last said'}</p>
        <p className={`said ${displayText ? 'has-text' : ''}`}>
          {displayText || 'Nothing yet'}
        </p>
        {game.updatedAt && !isLive ? (
          <p className="meta">{formatTime(game.updatedAt)}</p>
        ) : null}
      </main>

      <footer className="controls">
        {!speech.supported ? (
          <p className="status error">Needs Chrome or Safari for speech.</p>
        ) : speech.error ? (
          <p className="status error">{speech.error}</p>
        ) : speech.listening ? (
          <p className="status">Listening — keep this page open</p>
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

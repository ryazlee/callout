import { useEffect, useRef, useState } from 'react'

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function isSpeechSupported(): boolean {
  return getSpeechRecognition() !== null
}

type UseSpeechListenerOptions = {
  onFinalTranscript: (transcript: string) => void
}

export function useSpeechListener({ onFinalTranscript }: UseSpeechListenerOptions) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const shouldListenRef = useRef(false)
  const onFinalRef = useRef(onFinalTranscript)

  useEffect(() => {
    onFinalRef.current = onFinalTranscript
  }, [onFinalTranscript])

  useEffect(() => {
    return () => {
      shouldListenRef.current = false
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  function start() {
    const Recognition = getSpeechRecognition()
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Safari.')
      return
    }

    setError(null)
    shouldListenRef.current = true

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const text = result[0]?.transcript.trim() ?? ''
        if (!text) continue

        if (result.isFinal) {
          finalTranscript = text
        } else {
          interimTranscript = text
        }
      }

      if (finalTranscript) {
        setInterim('')
        onFinalRef.current(finalTranscript)
      } else {
        setInterim(interimTranscript)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return
      if (event.error === 'not-allowed') {
        setError('Microphone access was blocked. Allow mic access and try again.')
        shouldListenRef.current = false
        setListening(false)
        return
      }
      setError(`Listening error: ${event.error}`)
    }

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start()
        } catch {
          shouldListenRef.current = false
          setListening(false)
        }
      } else {
        setListening(false)
        setInterim('')
      }
    }

    recognitionRef.current?.abort()
    recognitionRef.current = recognition

    try {
      recognition.start()
      setListening(true)
    } catch {
      setError('Could not start listening. Try again.')
      shouldListenRef.current = false
      setListening(false)
    }
  }

  function stop() {
    shouldListenRef.current = false
    setInterim('')
    recognitionRef.current?.stop()
    setListening(false)
  }

  return {
    supported: isSpeechSupported(),
    listening,
    interim,
    error,
    start,
    stop,
  }
}

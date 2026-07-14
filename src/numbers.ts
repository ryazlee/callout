const DIGIT = /\d/

const ONES: Record<string, number> = {
  zero: 0,
  oh: 0,
  o: 0,
  nil: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
}

const TEENS: Record<string, number> = {
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
}

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
}

/** "oh" / "o" only count as numbers when paired with another number. */
const WEAK_ZEROS = new Set(['oh', 'o'])

const NUMBER_WORDS = new Set([
  ...Object.keys(ONES),
  ...Object.keys(TEENS),
  ...Object.keys(TENS),
  'hundred',
  'a',
])

function isNumberWord(word: string): boolean {
  return NUMBER_WORDS.has(word.toLowerCase())
}

function skipAnd(words: string[], index: number): number {
  return words[index] === 'and' ? index + 1 : index
}

/** Parse one number starting at words[index]. Returns value + how many words used. */
function parseNumberAt(
  words: string[],
  index: number,
): { value: number; consumed: number } | null {
  if (index >= words.length) return null

  const first = words[index]

  // "two hundred" / "one hundred" [and] rest
  if (
    ONES[first] != null &&
    !WEAK_ZEROS.has(first) &&
    first !== 'zero' &&
    first !== 'nil' &&
    words[index + 1] === 'hundred'
  ) {
    let value = ONES[first] * 100
    let next = skipAnd(words, index + 2)
    const rest = parseNumberAt(words, next)
    if (rest) {
      value += rest.value
      next += rest.consumed
    }
    return { value, consumed: next - index }
  }

  // "a hundred" [and] rest
  if (first === 'a' && words[index + 1] === 'hundred') {
    let value = 100
    let next = skipAnd(words, index + 2)
    const rest = parseNumberAt(words, next)
    if (rest) {
      value += rest.value
      next += rest.consumed
    }
    return { value, consumed: next - index }
  }

  if (first === 'hundred') {
    let value = 100
    let next = skipAnd(words, index + 1)
    const rest = parseNumberAt(words, next)
    if (rest) {
      value += rest.value
      next += rest.consumed
    }
    return { value, consumed: next - index }
  }

  if (TENS[first] != null) {
    let value = TENS[first]
    let consumed = 1
    if (words[index + 1] && ONES[words[index + 1]] != null) {
      value += ONES[words[index + 1]]
      consumed = 2
    }
    return { value, consumed }
  }

  if (TEENS[first] != null) {
    return { value: TEENS[first], consumed: 1 }
  }

  if (ONES[first] != null) {
    return { value: ONES[first], consumed: 1 }
  }

  return null
}

function numberWordTokens(transcript: string): string[] {
  return (transcript.toLowerCase().match(/[a-z]+/g) ?? []).filter(isNumberWord)
}

/**
 * True if the transcript should be logged as a number callout.
 * Standalone "oh" / "o" are ignored unless paired with another number.
 */
export function containsNumber(transcript: string): boolean {
  const text = transcript.trim()
  if (!text) return false

  if (DIGIT.test(text)) return true

  const words = numberWordTokens(text).filter((word) => word !== 'a')
  if (words.length === 0) return false

  const strong = words.filter((word) => !WEAK_ZEROS.has(word))
  const weak = words.filter((word) => WEAK_ZEROS.has(word))

  if (strong.length > 0) return true
  // "oh five" already counted via strong; "oh oh" / only weak zeros need a pair
  return weak.length >= 2
}

/**
 * Convert spoken number words to digits.
 * "fifteen twelve" → "15 12", "twenty one" → "21", "oh five" → "0 5"
 */
export function toNumberForm(transcript: string): string {
  const text = transcript.trim()
  if (!text) return text

  const tokens = text.match(/[A-Za-z]+|\d+|[^A-Za-z\d]+/g)
  if (!tokens) return text

  const result: string[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    if (/^\d+$/.test(token)) {
      result.push(token)
      i += 1
      continue
    }

    if (/^[A-Za-z]+$/.test(token) && isNumberWord(token)) {
      const words: string[] = []
      let j = i

      while (j < tokens.length) {
        const current = tokens[j]

        if (/^[A-Za-z]+$/.test(current) && isNumberWord(current)) {
          words.push(current.toLowerCase())
          j += 1
          continue
        }

        if (
          /^[\s-]+$/.test(current) &&
          j + 1 < tokens.length &&
          /^[A-Za-z]+$/.test(tokens[j + 1]) &&
          isNumberWord(tokens[j + 1])
        ) {
          j += 1
          continue
        }

        if (
          /^and$/i.test(current) &&
          j + 1 < tokens.length &&
          /^[A-Za-z]+$/.test(tokens[j + 1]) &&
          isNumberWord(tokens[j + 1])
        ) {
          words.push('and')
          j += 1
          continue
        }

        break
      }

      const parsedNumbers: string[] = []
      let wordIndex = 0
      while (wordIndex < words.length) {
        if (words[wordIndex] === 'and') {
          wordIndex += 1
          continue
        }
        const parsed = parseNumberAt(words, wordIndex)
        if (!parsed) break
        parsedNumbers.push(String(parsed.value))
        wordIndex += parsed.consumed
      }

      if (parsedNumbers.length > 0 && wordIndex === words.length) {
        result.push(parsedNumbers.join(' '))
        i = j
        continue
      }
    }

    result.push(token)
    i += 1
  }

  return result.join('').replace(/\s+/g, ' ').trim()
}

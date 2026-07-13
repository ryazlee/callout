const DIGIT = /\d/

/** Common English number words people say when calling a score. */
const NUMBER_WORDS = [
  'zero',
  'oh',
  'nil',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
  'hundred',
]

const NUMBER_WORD_PATTERN = new RegExp(
  `\\b(?:${NUMBER_WORDS.join('|')})\\b`,
  'i',
)

/** True if the transcript contains a digit or a spoken number word. */
export function containsNumber(transcript: string): boolean {
  const text = transcript.trim()
  if (!text) return false
  return DIGIT.test(text) || NUMBER_WORD_PATTERN.test(text)
}

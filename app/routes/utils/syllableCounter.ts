export function splitIntoSyllables(text: string): string[] {
  const syllables = text.split(/[\\s་།]+/);
  return syllables.filter(s => s !== "");
}
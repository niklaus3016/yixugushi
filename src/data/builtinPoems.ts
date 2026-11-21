import { BuiltinSet, Poem } from '../types/poetry';
import { SONG_CI } from './songCi';
import { TANG_POEMS } from './tangPoems';

export const BUILTIN_SETS: BuiltinSet[] = [
  {
    setId: 'tang-01',
    setName: '唐诗选辑',
    subtitle: '气象万千，格律精严',
    coverImage: '/src/assets/images/tang_poetry_ink_1794924296771.jpg',
    poems: TANG_POEMS,
  },
  {
    setId: 'song-01',
    setName: '宋词选辑',
    subtitle: '长短舒卷，婉约豪放',
    coverImage: '/src/assets/images/song_ci_ink_1794924297718.jpg',
    poems: SONG_CI,
  },
];

export const ALL_BUILTIN_POEMS: Poem[] = BUILTIN_SETS.flatMap((s) => s.poems);

export const POEM_MAP: Record<string, Poem> = Object.fromEntries(
  ALL_BUILTIN_POEMS.map((p) => [p.poemId, p])
);

export function getPoemById(poemId: string): Poem | undefined {
  return POEM_MAP[poemId];
}

/**
 * Splits a classical poem's content into individual sentences (preserving ending punctuation).
 */
export function splitPoemSentences(content: string): string[] {
  const matches = content.match(/[^。？！]+[。？！]?/g);
  if (!matches) return [content];
  return matches.map((s) => s.trim()).filter(Boolean);
}

/**
 * Strips trailing period/question/exclamation marks for uniform display in 诗文选配 options.
 */
export function normalizeSentenceOption(sentence: string): string {
  return sentence.replace(/[。？！]+$/, '').trim();
}

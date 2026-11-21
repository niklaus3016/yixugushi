import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
  normalizeSentenceOption,
  splitPoemSentences,
} from '../data/builtinPoems';
import { FontLevel, Poem } from '../types/poetry';

interface PoemMatchViewProps {
  poem: Poem;
  fontLevel: FontLevel;
  onBackToRead: () => void;
}

interface MatchRound {
  targetIndex: number;
  targetOriginal: string;
  targetNormalized: string;
  options: string[];
}

function splitClauses(sentence: string): string[] {
  const parts = sentence.match(/[^，；]+[，；]?/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [sentence];
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createRound(poem: Poem, previousTargetIndex?: number): MatchRound {
  const sentences = splitPoemSentences(poem.content);
  const candidateIndices: number[] = [];
  for (let i = 1; i < sentences.length; i++) {
    candidateIndices.push(i);
  }
  if (candidateIndices.length === 0) {
    candidateIndices.push(0);
  }

  let pool = candidateIndices;
  if (candidateIndices.length > 1 && previousTargetIndex !== undefined) {
    const filtered = candidateIndices.filter((idx) => idx !== previousTargetIndex);
    if (filtered.length > 0) pool = filtered;
  }

  const targetIndex = pool[Math.floor(Math.random() * pool.length)];
  const targetOriginal = sentences[targetIndex];
  const targetNormalized = normalizeSentenceOption(targetOriginal);

  const distractors = poem.distractSentences
    .slice(0, 3)
    .map((d) => normalizeSentenceOption(d));

  const options = shuffleArray([targetNormalized, ...distractors]);

  return {
    targetIndex,
    targetOriginal,
    targetNormalized,
    options,
  };
}

export const PoemMatchView: React.FC<PoemMatchViewProps> = ({
  poem,
  fontLevel,
  onBackToRead,
}) => {
  const sentences = splitPoemSentences(poem.content);
  const [round, setRound] = useState<MatchRound>(() => createRound(poem));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    setRound(createRound(poem));
    setSelectedOption(null);
  }, [poem]);

  const handleNextRound = useCallback(() => {
    setRound((prev) => createRound(poem, prev.targetIndex));
    setSelectedOption(null);
  }, [poem]);

  const hasPicked = selectedOption !== null;
  const isMatched = selectedOption === round.targetNormalized;

  const poemTextSizeClass =
    fontLevel === 1
      ? 'text-[15px] sm:text-base leading-8'
      : fontLevel === 3
      ? 'text-[19px] sm:text-2xl leading-9 sm:leading-10'
      : 'text-[17px] sm:text-xl leading-8 sm:leading-9';

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-6">
      <div className="flex items-center justify-between gap-4 min-h-11">
        <button
          type="button"
          onClick={onBackToRead}
          className="min-h-11 inline-flex items-center gap-1.5 text-sm font-medium text-(--accent) hover:underline cursor-pointer whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          返回阅览
        </button>
        <span className="text-xs text-(--text-muted)">选句补诗</span>
      </div>

      <article className="rounded-2xl bg-(--bg-surface) border border-(--border-hairline) px-5 py-6 sm:px-8 sm:py-8">
        <header className="text-center max-w-lg mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold font-poetry text-(--text-primary) leading-snug text-balance">
            {poem.title}
          </h1>
          <p className="mt-2 text-sm text-(--text-muted) tracking-wider">
            〔{poem.dynasty}〕{poem.author}
          </p>
          <div className="w-10 h-px bg-(--border-hairline) mx-auto mt-4" />
        </header>

        <div className={`mt-6 font-poetry text-center space-y-3 ${poemTextSizeClass}`}>
          {sentences.map((sentence, idx) => {
            const isTarget = idx === round.targetIndex;
            if (!isTarget) {
              const clauses = splitClauses(sentence);
              return (
                <p key={idx} className="text-(--text-primary)">
                  {clauses.map((clause, cIdx) => (
                    <span
                      key={cIdx}
                      className={
                        clause.length <= 12
                          ? 'inline-block whitespace-nowrap'
                          : 'inline'
                      }
                    >
                      {clause}
                    </span>
                  ))}
                </p>
              );
            }

            if (hasPicked) {
              return (
                <p
                  key={idx}
                  className="inline-block px-3 py-1 rounded-xl bg-(--accent-soft) text-(--accent) font-semibold"
                >
                  {round.targetOriginal}
                </p>
              );
            }

            return (
              <p
                key={idx}
                className="inline-block px-4 py-1.5 rounded-xl border border-dashed border-(--accent) bg-(--bg-canvas) text-(--text-muted) text-sm sm:text-base"
              >
                〔 待选原句 〕
              </p>
            );
          })}
        </div>
      </article>

      <section className="rounded-2xl bg-(--bg-surface) border border-(--border-hairline) p-5 sm:p-6">
        <p className="text-sm font-medium text-(--text-primary) mb-4">
          下方哪一句属于本篇诗文？
        </p>

        <div className="space-y-2.5">
          {round.options.map((opt, idx) => {
            const isCorrectOpt = opt === round.targetNormalized;
            const isUserChoice = selectedOption === opt;

            let btnStyle =
              'bg-(--bg-canvas) border-(--border-hairline) text-(--text-primary) hover:border-(--accent)';
            if (hasPicked) {
              if (isCorrectOpt) {
                btnStyle =
                  'bg-(--success-soft) border-(--success) text-(--success) font-medium';
              } else if (isUserChoice && !isCorrectOpt) {
                btnStyle =
                  'bg-(--danger-soft) border-(--danger) text-(--danger)';
              } else {
                btnStyle =
                  'bg-(--bg-canvas) border-(--border-hairline) text-(--text-muted) opacity-65';
              }
            }

            return (
              <button
                key={`${idx}-${opt}`}
                type="button"
                disabled={hasPicked}
                onClick={() => setSelectedOption(opt)}
                className={`w-full min-h-12.5 px-4 py-3 rounded-xl border text-left font-poetry text-[15px] sm:text-base transition-colors flex items-center justify-between gap-3 ${btnStyle} ${
                  hasPicked ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span>{opt}</span>
                {hasPicked && isCorrectOpt && (
                  <span className="text-xs font-ui shrink-0">本篇原句</span>
                )}
              </button>
            );
          })}
        </div>

        {hasPicked && (
          <div className="mt-5 pt-4 border-t border-(--border-hairline) space-y-4">
            <div
              className={`rounded-xl p-3.5 text-sm ${
                isMatched
                  ? 'bg-(--success-soft) text-(--success)'
                  : 'bg-(--danger-soft) text-(--danger)'
              }`}
            >
              {isMatched ? (
                <p className="font-medium">✅ 契合原文：{round.targetOriginal}</p>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium">❌ 并非此篇</p>
                  <p className="text-xs opacity-90">
                    本篇对应原句为：<span className="font-poetry">{round.targetOriginal}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleNextRound}
                className="min-h-11 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-(--accent) text-(--accent-text) hover:bg-(--accent-hover) transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                再来一组
              </button>
              <button
                type="button"
                onClick={onBackToRead}
                className="min-h-11 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-(--bg-subtle) text-(--text-primary) hover:bg-(--bg-hover) transition-colors cursor-pointer"
              >
                返回阅览
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

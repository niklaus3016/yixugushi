import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FolderPlus,
  Pause,
  Plus,
  Puzzle,
  Star,
  Type,
  Volume2,
  X,
} from 'lucide-react';
import { splitPoemSentences } from '../data/builtinPoems';
import {
  ActiveContext,
  FontLevel,
  GlobalConfig,
  Poem,
  PoemUserState,
  ThemeMode,
  UserList,
} from '../types/poetry';
import { PoemMatchView } from './PoemMatchView';

interface ReadViewProps {
  poem: Poem;
  context: ActiveContext;
  sequenceIds: string[];
  poemState?: PoemUserState;
  userLists: UserList[];
  config: GlobalConfig;
  onSelectPoem: (poemId: string) => void;
  onToggleStar: (poemId: string) => void;
  onUpdateConfig: (partial: Partial<GlobalConfig>) => void;
  onAddPoemToList: (listId: string, poemId: string) => void;
  onRemovePoemFromList: (listId: string, poemId: string) => void;
  onCreateList: (name: string, desc: string) => UserList;
}

type AnnotationTab = 'note' | 'trans' | 'intro';

/**
 * Splits a sentence into comma/semicolon-delimited clauses so narrow mobile screens
 * wrap gracefully at punctuation boundaries instead of stranding a single orphan character.
 */
function splitClauses(sentence: string): string[] {
  const parts = sentence.match(/[^，；]+[，；]?/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [sentence];
}

// ---- Speech synthesis helpers (module-level, shared across mounts) ----
// `getVoices()` is populated asynchronously in most browsers (and is often
// empty on a cold Android WebView load), so we cache it and refresh when the
// `voiceschanged` event fires. Without selecting a zh voice, speak() may fall
// back to a non-Chinese voice or fail silently.
let cachedVoices: SpeechSynthesisVoice[] = [];
function refreshVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    cachedVoices = window.speechSynthesis.getVoices();
  } catch {
    cachedVoices = [];
  }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}
function pickChineseVoice(): SpeechSynthesisVoice | undefined {
  if (cachedVoices.length === 0) refreshVoices();
  return (
    cachedVoices.find((v) => /^zh|cmn/i.test(v.lang) || /中文|普通话|Chinese/i.test(v.name)) ??
    cachedVoices.find((v) => v.default) ??
    cachedVoices[0]
  );
}

export const ReadView: React.FC<ReadViewProps> = ({
  poem,
  context,
  sequenceIds,
  poemState,
  userLists,
  config,
  onSelectPoem,
  onToggleStar,
  onUpdateConfig,
  onAddPoemToList,
  onRemovePoemFromList,
  onCreateList,
}) => {
  const [showMatchPage, setShowMatchPage] = useState(false);

  const [occlusionMode, setOcclusionMode] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());

  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [annotationTab, setAnnotationTab] = useState<AnnotationTab>('note');
  const [listSheetOpen, setListSheetOpen] = useState(false);
  const [quickListName, setQuickListName] = useState('');

  const speechSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const clearResumeTimer = () => {
    if (resumeTimerRef.current !== null) {
      window.clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const speak = (text: string, rate: number) => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    clearResumeTimer();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = rate;
    const voice = pickChineseVoice();
    if (voice) utter.voice = voice;
    utter.onend = () => {
      setIsSpeaking(false);
      clearResumeTimer();
    };
    utter.onerror = () => {
      setIsSpeaking(false);
      clearResumeTimer();
    };
    utteranceRef.current = utter;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
    // Browsers (notably Android WebView) may auto-stop long utterances after
    // ~15s; nudge resume periodically while speaking to keep it going.
    resumeTimerRef.current = window.setInterval(() => {
      try {
        if (window.speechSynthesis.speaking) window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }
    }, 10000);
  };

  const sentences = useMemo(() => splitPoemSentences(poem.content), [poem.content]);

  useEffect(() => {
    setShowMatchPage(false);
    setOcclusionMode(false);
    setHiddenIndices(new Set());
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    clearResumeTimer();
    setIsSpeaking(false);
  }, [poem.poemId]);

  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
      clearResumeTimer();
    };
  }, [speechSupported]);

  const currentIndex = sequenceIds.indexOf(poem.poemId);
  const prevPoemId = currentIndex > 0 ? sequenceIds[currentIndex - 1] : null;
  const nextPoemId =
    currentIndex >= 0 && currentIndex < sequenceIds.length - 1
      ? sequenceIds[currentIndex + 1]
      : null;

  const isStarred = Boolean(poemState?.isStar);

  const enterOcclusion = () => {
    setOcclusionMode(true);
    setHiddenIndices(new Set(sentences.map((_, i) => i)));
  };

  const exitOcclusion = () => {
    setOcclusionMode(false);
    setHiddenIndices(new Set());
  };

  const toggleSentenceVisibility = (idx: number) => {
    if (!occlusionMode) return;
    setHiddenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const allHidden = occlusionMode && hiddenIndices.size === sentences.length;

  const toggleHideAll = () => {
    if (allHidden) {
      setHiddenIndices(new Set());
    } else {
      setHiddenIndices(new Set(sentences.map((_, i) => i)));
    }
  };

  const buildSpeechText = () =>
    `${poem.title}。${poem.dynasty}，${poem.author}。${poem.content}`;

  const handleToggleSpeech = () => {
    if (!speechSupported) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      clearResumeTimer();
      setIsSpeaking(false);
      return;
    }
    speak(buildSpeechText(), config.audioSpeed);
  };

  const handleSpeedChange = (speed: number) => {
    onUpdateConfig({ audioSpeed: speed });
    if (isSpeaking && speechSupported) {
      speak(buildSpeechText(), speed);
    }
  };

  const handleQuickCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickListName.trim()) return;
    const created = onCreateList(quickListName, '');
    onAddPoemToList(created.listId, poem.poemId);
    setQuickListName('');
  };

  if (showMatchPage) {
    return (
      <PoemMatchView
        poem={poem}
        fontLevel={config.fontLevel}
        onBackToRead={() => setShowMatchPage(false)}
      />
    );
  }

  const poemTextSizeClass =
    config.fontLevel === 1
      ? 'text-[15px] sm:text-base leading-8'
      : config.fontLevel === 3
      ? 'text-[19px] sm:text-2xl leading-9 sm:leading-10'
      : 'text-[17px] sm:text-xl leading-8 sm:leading-9';

  const isLongCi = poem.genre === '词' && sentences.length > 4;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-6">
      {/* Slim Top Context & Utility Bar */}
      <div className="flex items-center justify-between gap-2 min-h-[44px]">
        <div className="min-w-0 flex items-center gap-2 text-xs text-[var(--text-muted)] truncate tabular-nums">
          <span className="truncate">{context.name}</span>
          {currentIndex >= 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">
                {currentIndex + 1} / {sequenceIds.length}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleStar(poem.poemId)}
            aria-label={isStarred ? '取消收藏' : '收藏此篇'}
            className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
              isStarred
                ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Star className={`w-[18px] h-[18px] ${isStarred ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setListSheetOpen(true)}
            aria-label="加入自建清单"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            <FolderPlus className="w-[18px] h-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setShowDisplaySettings((v) => !v)}
            aria-label="字号与主题设置"
            className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
              showDisplaySettings
                ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <Type className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      {/* Collapsible Font & Theme Panel */}
      {showDisplaySettings && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
              字号
            </span>
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-subtle)]">
              {([1, 2, 3] as FontLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onUpdateConfig({ fontLevel: lvl })}
                  className={`min-h-[34px] px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    config.fontLevel === lvl
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {lvl === 1 ? '小' : lvl === 2 ? '中' : '大'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
              主题
            </span>
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-subtle)]">
              {(
                [
                  { id: 'day', label: '日间' },
                  { id: 'eye', label: '豆沙绿' },
                  { id: 'night', label: '夜间' },
                ] as { id: ThemeMode; label: string }[]
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateConfig({ theme: t.id })}
                  className={`min-h-[34px] px-3 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    config.theme === t.id
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Poem Sheet */}
      <article className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-5 py-7 sm:px-8 sm:py-9">
        <header className="text-center max-w-lg mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-[26px] font-semibold font-poetry text-[var(--text-primary)] leading-snug [text-wrap:balance]">
            {poem.title}
          </h1>
          <p className="mt-2.5 text-sm text-[var(--text-muted)] tracking-wider">
            〔{poem.dynasty}〕{poem.author}
          </p>
          <div className="w-10 h-px bg-[var(--border-hairline)] mx-auto mt-5" />
        </header>

        {/* Occlusion Controls Banner when Active */}
        {occlusionMode && (
          <div className="mt-5 px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-hairline)] flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--text-secondary)]">
              轻点诗句可显隐回味
            </span>
            <button
              type="button"
              onClick={toggleHideAll}
              className="min-h-[36px] px-3 rounded-lg text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)] hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0"
            >
              {allHidden ? '全部显现' : '全篇隐藏'}
            </button>
          </div>
        )}

        {/* Poem Content */}
        <div
          className={`mt-6 font-poetry ${
            isLongCi ? 'text-left sm:text-center' : 'text-center'
          } space-y-3 ${poemTextSizeClass}`}
        >
          {sentences.map((sentence, idx) => {
            const isHidden = occlusionMode && hiddenIndices.has(idx);
            if (!occlusionMode) {
              const clauses = splitClauses(sentence);
              return (
                <p key={idx} className="text-[var(--text-primary)]">
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

            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleSentenceVisibility(idx)}
                className={`w-full py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                  isHidden
                    ? 'bg-[var(--bg-subtle)] text-transparent select-none border border-dashed border-[var(--border-hairline)] relative'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]'
                }`}
              >
                <span>{sentence}</span>
                {isHidden && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-ui text-[var(--text-muted)]">
                    轻点显现第 {idx + 1} 句
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Clean Tool Strip (Fits comfortably on 1 row on 360px+ mobile with zero overflow) */}
        <div className="mt-8 pt-4 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={occlusionMode ? exitOcclusion : enterOcclusion}
              className={`min-h-[40px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                occlusionMode
                  ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              {occlusionMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  退出遮挡
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 shrink-0" />
                  遮挡默记
                </>
              )}
            </button>

            {config.showQuizBtn && (
              <button
                type="button"
                onClick={() => setShowMatchPage(true)}
                className="min-h-[40px] inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--accent)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Puzzle className="w-3.5 h-3.5 shrink-0" />
                选句补诗
              </button>
            )}
          </div>

          {speechSupported && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleSpeech}
                aria-label={isSpeaking ? '暂停朗读' : '朗读'}
                className={`min-h-[40px] inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isSpeaking
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isSpeaking ? (
                  <Pause className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{isSpeaking ? '暂停' : '朗读'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const speeds = [0.75, 1, 1.25, 1.5];
                  const idx = speeds.indexOf(config.audioSpeed);
                  const nextSpeed = speeds[(idx + 1) % speeds.length];
                  handleSpeedChange(nextSpeed);
                }}
                aria-label={`切换朗读语速，当前 ${config.audioSpeed} 倍速`}
                className="min-h-[36px] px-2 py-1 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] tabular-nums transition-colors cursor-pointer whitespace-nowrap"
              >
                {config.audioSpeed}x
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Ergonomic Prev / Next Poem Bar below the Poem Sheet */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!prevPoemId}
          onClick={() => prevPoemId && onSelectPoem(prevPoemId)}
          className="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-default whitespace-nowrap"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          上一篇
        </button>
        <button
          type="button"
          disabled={!nextPoemId}
          onClick={() => nextPoemId && onSelectPoem(nextPoemId)}
          className="min-h-[46px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-default whitespace-nowrap"
        >
          下一篇
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      {/* Annotations / Translation / Appreciation */}
      <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden">
        <div
          className="grid grid-cols-3 border-b border-[var(--border-hairline)]"
          role="tablist"
          aria-label="诗文解析"
        >
          {(
            [
              { id: 'note', label: '注释' },
              { id: 'trans', label: '白话译文' },
              { id: 'intro', label: '赏析' },
            ] as { id: AnnotationTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={annotationTab === tab.id}
              onClick={() => setAnnotationTab(tab.id)}
              className={`min-h-[44px] px-3 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                annotationTab === tab.id
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6 text-sm md:text-base leading-7 text-[var(--text-secondary)] whitespace-pre-line">
          {annotationTab === 'note' && (poem.note || '暂无注释')}
          {annotationTab === 'trans' && (poem.trans || '暂无白话译文')}
          {annotationTab === 'intro' && (poem.intro || '暂无赏析')}
        </div>
      </section>

      {/* Add to Custom List Centered Modal */}
      {listSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setListSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xl overflow-hidden"
          >
            <div className="p-5 border-b border-[var(--border-hairline)] flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                收入自建清单
              </h3>
              <button
                type="button"
                onClick={() => setListSheetOpen(false)}
                aria-label="关闭"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-hairline)]">
              {userLists.length === 0 ? (
                <div className="p-6 text-center text-sm text-[var(--text-muted)]">
                  暂无自建清单，可在下方直接新建
                </div>
              ) : (
                userLists.map((list) => {
                  const included = list.sortIds.includes(poem.poemId);
                  return (
                    <button
                      key={list.listId}
                      type="button"
                      onClick={() =>
                        included
                          ? onRemovePoemFromList(list.listId, poem.poemId)
                          : onAddPoemToList(list.listId, poem.poemId)
                      }
                      className="w-full px-5 py-3.5 min-h-[56px] flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {list.listName}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] tabular-nums">
                          {list.sortIds.length} 篇
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium shrink-0 ${
                          included
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {included ? '已收入' : '加入'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleQuickCreateList}
              className="p-4 border-t border-[var(--border-hairline)] flex items-center gap-2 bg-[var(--bg-surface)]"
            >
              <input
                type="text"
                maxLength={30}
                value={quickListName}
                onChange={(e) => setQuickListName(e.target.value)}
                placeholder="新建清单并收入此篇..."
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl text-sm bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                disabled={!quickListName.trim()}
                className="min-h-[44px] inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                新建
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

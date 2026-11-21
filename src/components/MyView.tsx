import React, { useMemo, useState } from 'react';
import { ChevronRight, FileText, ShieldCheck, Star } from 'lucide-react';
import { getPoemById } from '../data/builtinPoems';
import {
  ActiveContext,
  APP_VERSION,
  GlobalConfig,
  Poem,
  PoemUserState,
  ThemeMode,
} from '../types/poetry';
import { ConfirmDialog } from './ConfirmDialog';
import { DocumentModal } from './DocumentModal';
import { PrivacyPolicyContent } from './PrivacyPolicyContent';
import { UserAgreementContent } from './UserAgreementContent';

interface MyViewProps {
  poemStates: Record<string, PoemUserState>;
  config: GlobalConfig;
  userListsCount: number;
  onOpenPoem: (poemId: string, context: ActiveContext) => void;
  onToggleStar: (poemId: string) => void;
  onClearAllUserLists: () => void;
  onClearAllUserMarks: () => void;
  onUpdateConfig: (partial: Partial<GlobalConfig>) => void;
}

type ConfirmAction = { type: 'clearAllLists' } | { type: 'clearAllMarks' } | null;

export const MyView: React.FC<MyViewProps> = ({
  poemStates,
  config,
  userListsCount,
  onOpenPoem,
  onToggleStar,
  onClearAllUserLists,
  onClearAllUserMarks,
  onUpdateConfig,
}) => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [docModal, setDocModal] = useState<'privacy' | 'agreement' | null>(null);

  const speechSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const starredPoems = useMemo(() => {
    const list: Poem[] = [];
    for (const state of Object.values(poemStates)) {
      if (state.isStar) {
        const poem = getPoemById(state.poemId);
        if (poem) list.push(poem);
      }
    }
    return list;
  }, [poemStates]);

  const starContext: ActiveContext = {
    type: 'star',
    id: 'my-stars',
    name: '我的收藏',
  };

  const confirmDialogConfig = useMemo(() => {
    if (!confirmAction) return null;
    if (confirmAction.type === 'clearAllLists') {
      return {
        title: '确认清空全部自建清单',
        description:
          '此操作将永久移除您创建的所有自建清单及篇目排序，不可恢复（内置合集不受影响）。',
        confirmLabel: '确认清空',
        onConfirm: () => {
          onClearAllUserLists();
          setConfirmAction(null);
        },
      };
    }
    return {
      title: '确认清空全部收藏标记',
      description: '此操作将永久清除所有诗文的收藏标记，不可恢复。',
      confirmLabel: '确认重置',
      onConfirm: () => {
        onClearAllUserMarks();
        setConfirmAction(null);
      },
    };
  }, [confirmAction, onClearAllUserLists, onClearAllUserMarks]);

  return (
    <div className="space-y-6 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 我的收藏 */}
        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-hairline)] flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              我的收藏
            </h2>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {starredPoems.length} 篇
            </span>
          </div>

          {starredPoems.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">
              暂无收藏诗文，可在阅览时点击星标收存
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-hairline)]">
              {starredPoems.map((poem) => (
                <div
                  key={poem.poemId}
                  className="px-5 min-h-[58px] flex items-center justify-between gap-3 hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onOpenPoem(poem.poemId, starContext)}
                    className="flex-1 min-w-0 py-3 text-left cursor-pointer"
                  >
                    <div className="text-sm font-medium font-poetry text-[var(--text-primary)] truncate">
                      {poem.title}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                      {poem.dynasty} · {poem.author}
                    </div>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleStar(poem.poemId)}
                      aria-label="取消收藏"
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--accent)] hover:opacity-75 cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 全局设置（已移除字体设置） */}
        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border-hairline)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              全局设置
            </h2>
          </div>

          <div className="divide-y divide-[var(--border-hairline)]">
            {/* 默认阅览主题 */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--text-primary)]">默认阅览主题</span>
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
                    className={`min-h-[36px] px-3 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
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

            {/* 选句补诗按钮开关 */}
            <div className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[var(--text-primary)]">
                  选句补诗按钮
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  在阅览详情页展示「选句补诗」闲趣入口
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.showQuizBtn}
                onClick={() =>
                  onUpdateConfig({ showQuizBtn: !config.showQuizBtn })
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  config.showQuizBtn
                    ? 'bg-[var(--accent)]'
                    : 'bg-[var(--bg-subtle)] border-[var(--border-hairline)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs transition duration-200 ${
                    config.showQuizBtn ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 朗读默认语速 */}
            {speechSupported && (
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <span className="text-sm text-[var(--text-primary)]">
                  朗读默认语速
                </span>
                <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-subtle)]">
                  {[0.75, 1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => onUpdateConfig({ audioSpeed: speed })}
                      className={`min-h-[36px] px-2.5 rounded-md text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                        config.audioSpeed === speed
                          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 隐私政策 + 本机数据重置 + 关于 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          {/* 用户服务协议 */}
          <button
            type="button"
            onClick={() => setDocModal('agreement')}
            className="w-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-5 py-4 min-h-[60px] flex items-center justify-between gap-4 text-left hover:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  用户服务协议
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                  查看《忆序古诗》用户服务协议全文
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          </button>

          {/* 隐私政策 */}
          <button
            type="button"
            onClick={() => setDocModal('privacy')}
            className="w-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] px-5 py-4 min-h-[60px] flex items-center justify-between gap-4 text-left hover:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  隐私政策
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                  查看完整的《忆序古诗》隐私保护说明
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          </button>

          {/* 本机数据重置 */}
          <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-hairline)]">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                本机数据重置
              </h2>
            </div>

            <div className="divide-y divide-[var(--border-hairline)]">
              <button
                type="button"
                disabled={userListsCount === 0}
                onClick={() => setConfirmAction({ type: 'clearAllLists' })}
                className="w-full px-5 py-4 min-h-[56px] flex items-center justify-between gap-4 text-left hover:bg-[var(--bg-subtle)] disabled:opacity-45 transition-colors cursor-pointer disabled:cursor-default"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--danger)]">
                    清空全部自建清单
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5 tabular-nums">
                    当前共有 {userListsCount} 份自建清单
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </button>

              <button
                type="button"
                disabled={starredPoems.length === 0}
                onClick={() => setConfirmAction({ type: 'clearAllMarks' })}
                className="w-full px-5 py-4 min-h-[56px] flex items-center justify-between gap-4 text-left hover:bg-[var(--bg-subtle)] disabled:opacity-45 transition-colors cursor-pointer disabled:cursor-default"
              >
                <div>
                  <div className="text-sm font-medium text-[var(--danger)]">
                    清空全部收藏标记
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5 tabular-nums">
                    当前共收藏 {starredPoems.length} 篇
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </button>
            </div>
          </section>
        </div>

        <section className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-5 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              关于忆序古诗
            </h2>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {APP_VERSION}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            诗文素材来源：内置选辑整理自公开传世古典诗文文献，仅作品读与整理之用。
          </p>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            隐私说明：本应用为诗词整理工具，不会收集、上传任何用户输入内容与个人信息，自建清单与收藏仅保存在本机本地。
          </p>
        </section>
      </div>

      {/* 用户协议 / 隐私政策 全文弹窗（与首次启动弹窗共用同一份正文） */}
      {docModal === 'agreement' && (
        <DocumentModal
          title="《忆序古诗》用户服务协议"
          onClose={() => setDocModal(null)}
        >
          <UserAgreementContent />
        </DocumentModal>
      )}

      {docModal === 'privacy' && (
        <DocumentModal
          title="《忆序古诗》隐私政策"
          onClose={() => setDocModal(null)}
        >
          <PrivacyPolicyContent />
        </DocumentModal>
      )}

      {confirmDialogConfig && (
        <ConfirmDialog
          open={Boolean(confirmDialogConfig)}
          title={confirmDialogConfig.title}
          description={confirmDialogConfig.description}
          confirmLabel={confirmDialogConfig.confirmLabel}
          destructive
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmDialogConfig.onConfirm}
        />
      )}
    </div>
  );
};

import React from 'react';
import { ArrowRight, BookOpen, Compass, ListOrdered } from 'lucide-react';
import { BUILTIN_SETS, getPoemById } from '../data/builtinPoems';
import { ActiveContext, LastReadState, UserList } from '../types/poetry';
import { ArtworkImage } from './ArtworkImage';

interface HomeViewProps {
  lastRead: LastReadState;
  userLists: UserList[];
  onOpenLastRead: () => void;
  onGoCustomLists: () => void;
  onGoBuiltinCollections: (setId?: string) => void;
  onOpenPoemInBuiltin: (poemId: string, context: ActiveContext) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lastRead,
  userLists,
  onOpenLastRead,
  onGoCustomLists,
  onGoBuiltinCollections,
  onOpenPoemInBuiltin,
}) => {
  const lastPoem = getPoemById(lastRead.poemId) ?? BUILTIN_SETS[0].poems[0];

  return (
    <div className="space-y-10 pb-8">
      {/* Top Slogan & Editorial Hero */}
      <section className="pt-2 md:pt-4">
        <div className="rounded-2xl bg-(--bg-surface) border border-(--border-hairline) p-6 md:p-8">
          <p className="text-xs text-(--text-muted) tracking-widest">
            忆序古诗 · 整理阅览
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold font-poetry tracking-wide text-(--text-primary) text-balance">
            集诗成序，静以忆之
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-(--text-secondary)">
            按心意编排专属诗文序列，于案头静心品读回味，随心收存喜爱篇目。
          </p>

          {/* 3 Quick Cards */}
          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: 上次阅览 */}
            <button
              type="button"
              onClick={onOpenLastRead}
              className="group text-left rounded-2xl bg-(--bg-canvas) border border-(--border-hairline) p-5 hover:border-(--accent) transition-colors cursor-pointer min-h-28 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-(--accent)">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  上次阅览
                </span>
                <ArrowRight className="w-4 h-4 text-(--text-muted) group-hover:text-(--accent) group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
              <div className="mt-3">
                <div className="text-base font-semibold font-poetry text-(--text-primary) truncate">
                  {lastPoem.title}
                </div>
                <div className="mt-1 text-xs text-(--text-muted) truncate">
                  {lastPoem.dynasty} · {lastPoem.author} · {lastRead.context.name}
                </div>
              </div>
            </button>

            {/* Card 2: 我的清单 */}
            <button
              type="button"
              onClick={onGoCustomLists}
              className="group text-left rounded-2xl bg-(--bg-canvas) border border-(--border-hairline) p-5 hover:border-(--accent) transition-colors cursor-pointer min-h-28 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-(--accent)">
                  <ListOrdered className="w-4 h-4 shrink-0" />
                  我的清单
                </span>
                <ArrowRight className="w-4 h-4 text-(--text-muted) group-hover:text-(--accent) group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
              <div className="mt-3">
                <div className="text-base font-semibold text-(--text-primary) truncate">
                  自建有序诗单
                </div>
                <div className="mt-1 text-xs text-(--text-muted) truncate tabular-nums">
                  {userLists.length > 0
                    ? `已建 ${userLists.length} 份清单 · 可自由编排顺序`
                    : '新建专属清单 · 自由收录编排'}
                </div>
              </div>
            </button>

            {/* Card 3: 精选合集 */}
            <button
              type="button"
              onClick={() => onGoBuiltinCollections()}
              className="group text-left rounded-2xl bg-(--bg-canvas) border border-(--border-hairline) p-5 hover:border-(--accent) transition-colors cursor-pointer min-h-28 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-(--accent)">
                  <Compass className="w-4 h-4 shrink-0" />
                  精选合集
                </span>
                <ArrowRight className="w-4 h-4 text-(--text-muted) group-hover:text-(--accent) group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
              <div className="mt-3">
                <div className="text-base font-semibold text-(--text-primary) truncate">
                  内置只读诗文选辑
                </div>
                <div className="mt-1 text-xs text-(--text-muted) truncate">
                  唐诗选辑 · 宋词选辑
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Built-in Collections Preview */}
      <section>
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-(--text-primary)">
            精选合集一览
          </h2>
          <button
            type="button"
            onClick={() => onGoBuiltinCollections()}
            className="min-h-11 px-2 text-sm text-(--accent) hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            进入清单库
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BUILTIN_SETS.map((set) => {
            const firstPoem = set.poems[0];
            return (
              <div
                key={set.setId}
                className="rounded-2xl bg-(--bg-surface) border border-(--border-hairline) overflow-hidden flex flex-col"
              >
                <div
                  onClick={() => onGoBuiltinCollections(set.setId)}
                  className="aspect-4/3 w-full overflow-hidden bg-(--bg-subtle) cursor-pointer"
                >
                  <ArtworkImage
                    src={set.coverImage}
                    alt={`${set.setName}水墨插图`}
                    title={set.setName}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold font-poetry text-(--text-primary)">
                        {set.setName}
                      </h3>
                      <span className="text-xs text-(--text-muted) tabular-nums shrink-0">
                        {set.poems.length} 篇
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-(--text-secondary)">
                      {set.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-(--border-hairline) flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPoemInBuiltin(firstPoem.poemId, {
                          type: 'builtin',
                          id: set.setId,
                          name: set.setName,
                        })
                      }
                      className="min-h-11 text-xs text-(--text-secondary) hover:text-(--accent) transition-colors truncate cursor-pointer"
                    >
                      试读：{firstPoem.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => onGoBuiltinCollections(set.setId)}
                      className="min-h-11 px-3 rounded-lg text-xs font-medium text-(--accent) bg-(--accent-soft) hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      浏览目录
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Offline Note */}
      <footer className="pt-2 text-center">
        <p className="text-xs text-(--text-muted)">
          全部内容保存在本机
        </p>
      </footer>
    </div>
  );
};

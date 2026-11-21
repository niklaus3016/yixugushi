import React, { useMemo, useState } from 'react';
import { BookOpen, Compass, ListOrdered, User } from 'lucide-react';
import { HomeView } from './components/HomeView';
import { ListCategory, ListsView } from './components/ListsView';
import { MyView } from './components/MyView';
import { PrivacyConsentGate } from './components/PrivacyConsentGate';
import { ReadView } from './components/ReadView';
import { BUILTIN_SETS, getPoemById } from './data/builtinPoems';
import { useLocalPoetryStore } from './hooks/useLocalPoetryStore';
import { ActiveContext, AppTab } from './types/poetry';

export default function App() {
  const {
    userLists,
    poemStates,
    config,
    lastRead,
    updateConfig,
    setLastRead,
    createList,
    updateList,
    deleteList,
    addPoemToList,
    addPoemsToList,
    removePoemFromList,
    reorderList,
    toggleStar,
    clearAllUserLists,
    clearAllUserMarks,
    privacyAccepted,
    acceptPrivacy,
  } = useLocalPoetryStore();

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [listsEntryConfig, setListsEntryConfig] = useState<{
    category: ListCategory;
    selectedId: string | null;
    key: number;
  }>({
    category: 'custom',
    selectedId: null,
    key: 0,
  });

  const { activePoem, activeContext, sequenceIds } = useMemo(() => {
    const ctx = lastRead.context;
    let ids: string[] = [];
    let resolvedContext: ActiveContext = ctx;

    if (ctx.type === 'builtin') {
      const set = BUILTIN_SETS.find((s) => s.setId === ctx.id) ?? BUILTIN_SETS[0];
      ids = set.poems.map((p) => p.poemId);
      resolvedContext = { type: 'builtin', id: set.setId, name: set.setName };
    } else if (ctx.type === 'custom') {
      const list = userLists.find((l) => l.listId === ctx.id);
      if (list && list.sortIds.length > 0) {
        ids = list.sortIds.filter((id) => Boolean(getPoemById(id)));
        resolvedContext = {
          type: 'custom',
          id: list.listId,
          name: list.listName,
        };
      } else {
        ids = BUILTIN_SETS[0].poems.map((p) => p.poemId);
        resolvedContext = {
          type: 'builtin',
          id: BUILTIN_SETS[0].setId,
          name: BUILTIN_SETS[0].setName,
        };
      }
    } else if (ctx.type === 'star') {
      ids = Object.values(poemStates)
        .filter((s) => s.isStar && Boolean(getPoemById(s.poemId)))
        .map((s) => s.poemId);
    }

    const currentPoem =
      getPoemById(lastRead.poemId) ??
      getPoemById(ids[0]) ??
      BUILTIN_SETS[0].poems[0];

    if (ids.length === 0 || !ids.includes(currentPoem.poemId)) {
      ids = [currentPoem.poemId];
    }

    return {
      activePoem: currentPoem,
      activeContext: resolvedContext,
      sequenceIds: ids,
    };
  }, [lastRead, userLists, poemStates]);

  const handleOpenPoem = (poemId: string, context: ActiveContext) => {
    setLastRead(poemId, context);
    setActiveTab('read');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoLists = (category: ListCategory, selectedId: string | null = null) => {
    setListsEntryConfig((prev) => ({
      category,
      selectedId,
      key: prev.key + 1,
    }));
    setActiveTab('lists');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchTab = (tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'home', label: '忆序', icon: Compass },
    { id: 'lists', label: '清单库', icon: ListOrdered },
    { id: 'read', label: '阅览', icon: BookOpen },
    { id: 'my', label: '我的', icon: User },
  ];

  const mobilePageTitle =
    activeTab === 'home'
      ? '忆序古诗'
      : activeTab === 'lists'
      ? '清单库'
      : activeTab === 'read'
      ? '阅览'
      : '我的';

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-canvas) text-(--text-primary)">
      {/* Desktop Top Navigation Bar */}
      <header className="hidden md:block sticky top-0 z-30 bg-(--bg-surface)/95 backdrop-blur-md border-b border-(--border-hairline)">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => handleSwitchTab('home')}
            className="text-lg font-bold font-poetry tracking-wider text-(--text-primary) whitespace-nowrap shrink-0 cursor-pointer"
          >
            忆序古诗
          </button>

          <nav className="flex items-center gap-8" aria-label="主导航">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSwitchTab(item.id)}
                  className={`min-h-11 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    isActive
                      ? 'border-(--accent) text-(--accent)'
                      : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => handleSwitchTab('read')}
            className="min-h-10 px-4 py-2 rounded-xl text-xs font-medium bg-(--accent) text-(--accent-text) hover:bg-(--accent-hover) transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            继续阅览
          </button>
        </div>
      </header>

      {/* Mobile Compact Header */}
      {activeTab !== 'read' && (
        <header className="md:hidden px-4 pt-4 pb-2 flex items-center justify-between">
          <span className="text-lg font-bold font-poetry tracking-wide text-(--text-primary)">
            {mobilePageTitle}
          </span>
        </header>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 ${
          activeTab === 'read' ? 'pt-3 md:pt-7' : 'pt-2 md:pt-7'
        } pb-24 md:pb-12`}
      >
        {activeTab === 'home' && (
          <HomeView
            lastRead={lastRead}
            userLists={userLists}
            onOpenLastRead={() => handleSwitchTab('read')}
            onGoCustomLists={() => handleGoLists('custom')}
            onGoBuiltinCollections={(setId) =>
              handleGoLists('builtin', setId ?? null)
            }
            onOpenPoemInBuiltin={(poemId, ctx) => handleOpenPoem(poemId, ctx)}
          />
        )}

        {activeTab === 'lists' && (
          <ListsView
            key={listsEntryConfig.key}
            userLists={userLists}
            initialCategory={listsEntryConfig.category}
            initialSelectedId={listsEntryConfig.selectedId}
            onCreateList={createList}
            onUpdateList={updateList}
            onDeleteList={deleteList}
            onAddPoemsToList={addPoemsToList}
            onRemovePoemFromList={removePoemFromList}
            onReorderList={reorderList}
            onOpenPoem={(poemId, ctx) => handleOpenPoem(poemId, ctx)}
          />
        )}

        {activeTab === 'read' && (
          <ReadView
            poem={activePoem}
            context={activeContext}
            sequenceIds={sequenceIds}
            poemState={poemStates[activePoem.poemId]}
            userLists={userLists}
            config={config}
            onSelectPoem={(poemId) => {
              setLastRead(poemId, activeContext);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToggleStar={toggleStar}
            onUpdateConfig={updateConfig}
            onAddPoemToList={addPoemToList}
            onRemovePoemFromList={removePoemFromList}
            onCreateList={createList}
          />
        )}

        {activeTab === 'my' && (
          <MyView
            poemStates={poemStates}
            config={config}
            userListsCount={userLists.length}
            onOpenPoem={(poemId, ctx) => handleOpenPoem(poemId, ctx)}
            onToggleStar={toggleStar}
            onClearAllUserLists={clearAllUserLists}
            onClearAllUserMarks={clearAllUserMarks}
            onUpdateConfig={updateConfig}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-(--bg-surface)/95 backdrop-blur-md border-t border-(--border-hairline) pb-safe"
        aria-label="底部导航"
      >
        <div className="grid grid-cols-4 h-16 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSwitchTab(item.id)}
                className={`min-h-12 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-(--accent)'
                    : 'text-(--text-muted) hover:text-(--text-primary)'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 首次启动用户协议与隐私政策同意拦截 */}
      {!privacyAccepted && <PrivacyConsentGate onAccept={acceptPrivacy} />}
    </div>
  );
}

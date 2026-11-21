import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronRight,
  Edit3,
  GripVertical,
  Lock,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ALL_BUILTIN_POEMS, BUILTIN_SETS, getPoemById } from '../data/builtinPoems';
import { ActiveContext, Poem, UserList } from '../types/poetry';
import { ConfirmDialog } from './ConfirmDialog';

export type ListCategory = 'custom' | 'builtin';

interface ListsViewProps {
  userLists: UserList[];
  initialCategory: ListCategory;
  initialSelectedId: string | null;
  onCreateList: (name: string, desc: string) => UserList;
  onUpdateList: (listId: string, name: string, desc: string) => void;
  onDeleteList: (listId: string) => void;
  onAddPoemsToList: (listId: string, poemIds: string[]) => void;
  onRemovePoemFromList: (listId: string, poemId: string) => void;
  onReorderList: (listId: string, newSortIds: string[]) => void;
  onOpenPoem: (poemId: string, context: ActiveContext) => void;
}

export const ListsView: React.FC<ListsViewProps> = ({
  userLists,
  initialCategory,
  initialSelectedId,
  onCreateList,
  onUpdateList,
  onDeleteList,
  onAddPoemsToList,
  onRemovePoemFromList,
  onReorderList,
  onOpenPoem,
}) => {
  const [category, setCategory] = useState<ListCategory>(initialCategory);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialSelectedId) return initialSelectedId;
    if (initialCategory === 'custom') return userLists[0]?.listId ?? null;
    return BUILTIN_SETS[0].setId;
  });
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(
    Boolean(initialSelectedId)
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit List Modal
  const [listModalMode, setListModalMode] = useState<'create' | 'edit' | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalTargetId, setModalTargetId] = useState<string | null>(null);

  // Delete List Confirm
  const [deleteTarget, setDeleteTarget] = useState<UserList | null>(null);

  // Add Poems Modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerGenre, setPickerGenre] = useState<'all' | '诗' | '词'>('all');
  const [pickerSelectedIds, setPickerSelectedIds] = useState<string[]>([]);

  // Pointer Drag-and-Drop Reorder State
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragSortIdsRef = useRef<string[]>([]);

  const handleCategoryChange = (nextCat: ListCategory) => {
    setCategory(nextCat);
    setSearchQuery('');
    setMobileShowDetail(false);
    if (nextCat === 'custom') {
      setSelectedId(userLists[0]?.listId ?? null);
    } else {
      setSelectedId(BUILTIN_SETS[0].setId);
    }
  };

  const activeCustomList = useMemo(
    () =>
      category === 'custom'
        ? userLists.find((l) => l.listId === selectedId) ?? userLists[0] ?? null
        : null,
    [category, userLists, selectedId]
  );

  const activeBuiltinSet = useMemo(
    () =>
      category === 'builtin'
        ? BUILTIN_SETS.find((s) => s.setId === selectedId) ?? BUILTIN_SETS[0]
        : null,
    [category, selectedId]
  );

  const activePoems: Poem[] = useMemo(() => {
    if (category === 'custom' && activeCustomList) {
      return activeCustomList.sortIds
        .map((id) => getPoemById(id))
        .filter((p): p is Poem => Boolean(p));
    }
    if (category === 'builtin' && activeBuiltinSet) {
      return activeBuiltinSet.poems;
    }
    return [];
  }, [category, activeCustomList, activeBuiltinSet]);

  const filteredPoems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activePoems;
    return activePoems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.dynasty.toLowerCase().includes(q)
    );
  }, [activePoems, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const openCreateModal = () => {
    setListModalMode('create');
    setModalName('');
    setModalDesc('');
    setModalTargetId(null);
  };

  const openEditModal = (list: UserList) => {
    setListModalMode('edit');
    setModalName(list.listName);
    setModalDesc(list.desc);
    setModalTargetId(list.listId);
  };

  const handleSaveListModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim()) return;
    if (listModalMode === 'create') {
      const created = onCreateList(modalName, modalDesc);
      setCategory('custom');
      setSelectedId(created.listId);
      setMobileShowDetail(true);
    } else if (listModalMode === 'edit' && modalTargetId) {
      onUpdateList(modalTargetId, modalName, modalDesc);
    }
    setListModalMode(null);
  };

  const openPicker = () => {
    setPickerSearch('');
    setPickerGenre('all');
    setPickerSelectedIds([]);
    setPickerOpen(true);
  };

  const existingIdsSet = useMemo(
    () => new Set(activeCustomList?.sortIds ?? []),
    [activeCustomList]
  );

  const pickerFilteredPoems = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return ALL_BUILTIN_POEMS.filter((p) => {
      if (pickerGenre !== 'all' && p.genre !== pickerGenre) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.dynasty.toLowerCase().includes(q)
      );
    });
  }, [pickerSearch, pickerGenre]);

  const togglePickerPoem = (poemId: string) => {
    if (existingIdsSet.has(poemId)) return;
    setPickerSelectedIds((prev) =>
      prev.includes(poemId) ? prev.filter((id) => id !== poemId) : [...prev, poemId]
    );
  };

  const handleConfirmPicker = () => {
    if (activeCustomList && pickerSelectedIds.length > 0) {
      onAddPoemsToList(activeCustomList.listId, pickerSelectedIds);
    }
    setPickerOpen(false);
  };

  const movePoem = (index: number, delta: -1 | 1) => {
    if (!activeCustomList) return;
    const ids = [...activeCustomList.sortIds];
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    const [moved] = ids.splice(index, 1);
    ids.splice(targetIdx, 0, moved);
    onReorderList(activeCustomList.listId, ids);
  };

  // Pointer drag handlers for custom list rows (works on touch & desktop mouse)
  const handleDragPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (!activeCustomList || isSearching) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingIndex(index);
    dragSortIdsRef.current = [...activeCustomList.sortIds];
  };

  const handleDragPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggingIndex === null || !activeCustomList) return;
    const clientY = e.clientY;
    for (let i = 0; i < rowRefs.current.length; i++) {
      const el = rowRefs.current[i];
      if (!el || i === draggingIndex) continue;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (
        (i < draggingIndex && clientY < mid) ||
        (i > draggingIndex && clientY > mid)
      ) {
        const nextIds = [...dragSortIdsRef.current];
        const [item] = nextIds.splice(draggingIndex, 1);
        nextIds.splice(i, 0, item);
        dragSortIdsRef.current = nextIds;
        setDraggingIndex(i);
        onReorderList(activeCustomList.listId, nextIds);
        break;
      }
    }
  };

  const handleDragPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (draggingIndex === null) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }
    setDraggingIndex(null);
  };

  const activeContext: ActiveContext | null = useMemo(() => {
    if (category === 'custom' && activeCustomList) {
      return {
        type: 'custom',
        id: activeCustomList.listId,
        name: activeCustomList.listName,
      };
    }
    if (category === 'builtin' && activeBuiltinSet) {
      return {
        type: 'builtin',
        id: activeBuiltinSet.setId,
        name: activeBuiltinSet.setName,
      };
    }
    return null;
  }, [category, activeCustomList, activeBuiltinSet]);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Category Segmented Control & Create Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]"
          role="tablist"
          aria-label="清单分类"
        >
          <button
            type="button"
            role="tab"
            aria-selected={category === 'custom'}
            onClick={() => handleCategoryChange('custom')}
            className={`min-h-[40px] px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              category === 'custom'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            自建清单
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={category === 'builtin'}
            onClick={() => handleCategoryChange('builtin')}
            className={`min-h-[40px] px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              category === 'builtin'
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            内置合集
          </button>
        </div>

        {category === 'custom' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            新建清单
          </button>
        )}
      </div>

      {/* Main Split Layout: Sidebar List Selector + Right Poem Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: List / Collection Directory */}
        <aside
          className={`lg:col-span-4 space-y-2 ${
            mobileShowDetail ? 'hidden lg:block' : 'block'
          }`}
        >
          {category === 'custom' ? (
            userLists.length === 0 ? (
              <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-6 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  尚未建立自建清单
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  可新建专属诗单，按心意归集与编排顺序
                </p>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-4 min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  新建清单
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] divide-y divide-[var(--border-hairline)] overflow-hidden">
                {userLists.map((list) => {
                  const isActive = activeCustomList?.listId === list.listId;
                  return (
                    <button
                      key={list.listId}
                      type="button"
                      onClick={() => {
                        setSelectedId(list.listId);
                        setSearchQuery('');
                        setMobileShowDetail(true);
                      }}
                      className={`w-full text-left px-5 py-4 min-h-[60px] flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--accent-soft)]'
                          : 'hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {list.listName}
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--text-muted)] truncate tabular-nums">
                          {list.desc ? `${list.desc} · ` : ''}
                          {list.sortIds.length} 篇
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] divide-y divide-[var(--border-hairline)] overflow-hidden">
              {BUILTIN_SETS.map((set) => {
                const isActive = activeBuiltinSet?.setId === set.setId;
                return (
                  <button
                    key={set.setId}
                    type="button"
                    onClick={() => {
                      setSelectedId(set.setId);
                      setSearchQuery('');
                      setMobileShowDetail(true);
                    }}
                    className={`w-full text-left px-5 py-4 min-h-[60px] flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--accent-soft)]'
                        : 'hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold font-poetry text-[var(--text-primary)] truncate">
                        {set.setName}
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--text-muted)] truncate tabular-nums">
                        {set.subtitle} · {set.poems.length} 篇
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right: Active List Detail & Poems */}
        <section
          className={`lg:col-span-8 ${
            !mobileShowDetail && (category === 'builtin' || userLists.length > 0)
              ? 'hidden lg:block'
              : 'block'
          }`}
        >
          {(category === 'custom' && !activeCustomList) ? (
            <div className="hidden lg:flex rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-10 flex-col items-center justify-center text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                暂无自建清单，点击右上角「新建清单」开始编排
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-hidden">
              {/* Mobile Back Button */}
              <div className="lg:hidden px-4 pt-3 pb-1 border-b border-[var(--border-hairline)]">
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回清单目录
                </button>
              </div>

              {/* List Header */}
              <div className="p-5 md:p-6 border-b border-[var(--border-hairline)]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                  <div className="min-w-0">
                    <h2 className="text-lg md:text-xl font-semibold font-poetry text-[var(--text-primary)]">
                      {category === 'custom'
                        ? activeCustomList?.listName
                        : activeBuiltinSet?.setName}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)] tabular-nums">
                      {category === 'custom' ? (
                        <>
                          {activeCustomList?.desc
                            ? `${activeCustomList.desc} · `
                            : ''}
                          共 {activePoems.length} 篇 · 拖动左侧手柄可调序
                        </>
                      ) : (
                        <>
                          {activeBuiltinSet?.subtitle} · 共 {activePoems.length} 篇 · 内置只读
                        </>
                      )}
                    </p>
                  </div>

                  {category === 'custom' && activeCustomList ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={openPicker}
                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        添加诗文
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(activeCustomList)}
                        aria-label="重命名或修改备注"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[var(--text-secondary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(activeCustomList)}
                        aria-label="删除清单"
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl text-[var(--danger)] bg-[var(--danger-soft)] hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] py-2">
                      <Lock className="w-3.5 h-3.5" />
                      只读合集
                    </div>
                  )}
                </div>

                {/* Local Search Box */}
                <div className="mt-4 relative">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="在当前清单内检索标题或作者"
                    className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl text-sm bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="清空检索"
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Poems List Rows */}
              {filteredPoems.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {activePoems.length === 0
                      ? '此清单尚未收入诗文'
                      : '当前清单内未找到匹配的诗文'}
                  </p>
                  {category === 'custom' && activePoems.length === 0 && (
                    <button
                      type="button"
                      onClick={openPicker}
                      className="mt-4 min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      添加诗文
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-hairline)]">
                  {filteredPoems.map((poem, idx) => {
                    const isDragging = draggingIndex === idx;
                    return (
                      <div
                        key={poem.poemId}
                        ref={(el) => {
                          rowRefs.current[idx] = el;
                        }}
                        className={`flex items-center gap-2 px-4 md:px-5 min-h-[60px] transition-colors ${
                          isDragging
                            ? 'bg-[var(--accent-soft)]'
                            : 'hover:bg-[var(--bg-subtle)]'
                        }`}
                      >
                        {/* Drag Handle + Order Number for Custom Lists */}
                        {category === 'custom' && !isSearching && (
                          <button
                            type="button"
                            onPointerDown={(e) => handleDragPointerDown(e, idx)}
                            onPointerMove={handleDragPointerMove}
                            onPointerUp={handleDragPointerUp}
                            onPointerCancel={handleDragPointerUp}
                            aria-label="拖拽调整顺序"
                            style={{ touchAction: 'none' }}
                            className="min-h-[44px] min-w-[36px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing shrink-0"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                        )}

                        <span className="w-7 text-xs text-[var(--text-muted)] tabular-nums shrink-0 text-center">
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        {/* Poem Entry Clickable Area */}
                        <button
                          type="button"
                          onClick={() => {
                            if (activeContext) {
                              onOpenPoem(poem.poemId, activeContext);
                            }
                          }}
                          className="flex-1 min-w-0 py-3 text-left flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-base font-medium font-poetry text-[var(--text-primary)] truncate">
                              {poem.title}
                            </div>
                            <div className="mt-0.5 text-xs text-[var(--text-muted)] truncate">
                              {poem.dynasty} · {poem.author}
                            </div>
                          </div>
                        </button>

                        {/* Custom List Row Controls: Move Up/Down & Remove */}
                        {category === 'custom' && activeCustomList && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            {!isSearching && (
                              <>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => movePoem(idx, -1)}
                                  aria-label="上移一篇"
                                  className="min-h-[44px] min-w-[36px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-25 cursor-pointer disabled:cursor-default"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === filteredPoems.length - 1}
                                  onClick={() => movePoem(idx, 1)}
                                  aria-label="下移一篇"
                                  className="min-h-[44px] min-w-[36px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-25 cursor-pointer disabled:cursor-default"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                onRemovePoemFromList(
                                  activeCustomList.listId,
                                  poem.poemId
                                )
                              }
                              aria-label="从清单移除"
                              className="min-h-[44px] min-w-[36px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {category === 'builtin' && (
                          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Create / Rename Custom List Modal */}
      {listModalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setListModalMode(null)}
        >
          <form
            onSubmit={handleSaveListModal}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] p-6 shadow-xl"
          >
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {listModalMode === 'create' ? '新建自建清单' : '编辑清单信息'}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  清单名称
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="例如：月夜怀人集"
                  autoFocus
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-sm bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  简短备注（可选）
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  placeholder="随手记录收录缘由"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl text-sm bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setListModalMode(null)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Poems to List Picker Modal */}
      {pickerOpen && activeCustomList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setPickerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[82vh] flex flex-col rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-hairline)] shadow-xl overflow-hidden"
          >
            <div className="p-5 border-b border-[var(--border-hairline)] flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  添加诗文至「{activeCustomList.listName}」
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 tabular-nums">
                  已选 {pickerSelectedIds.length} 篇
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="关闭"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-[var(--border-hairline)] space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="检索标题或作者"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl text-sm bg-[var(--bg-canvas)] border border-[var(--border-hairline)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>
              <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-subtle)]">
                {(
                  [
                    { id: 'all', label: '全部' },
                    { id: '诗', label: '唐诗' },
                    { id: '词', label: '宋词' },
                  ] as const
                ).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPickerGenre(g.id)}
                    className={`min-h-[34px] px-3 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      pickerGenre === g.id
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-hairline)]">
              {pickerFilteredPoems.map((poem) => {
                const alreadyIn = existingIdsSet.has(poem.poemId);
                const selected = pickerSelectedIds.includes(poem.poemId);
                return (
                  <button
                    key={poem.poemId}
                    type="button"
                    disabled={alreadyIn}
                    onClick={() => togglePickerPoem(poem.poemId)}
                    className={`w-full px-5 py-3.5 min-h-[56px] text-left flex items-center justify-between gap-3 transition-colors ${
                      alreadyIn
                        ? 'opacity-50 cursor-default'
                        : selected
                        ? 'bg-[var(--accent-soft)] cursor-pointer'
                        : 'hover:bg-[var(--bg-subtle)] cursor-pointer'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium font-poetry text-[var(--text-primary)] truncate">
                        {poem.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                        {poem.dynasty} · {poem.author}
                      </div>
                    </div>
                    <span className="text-xs font-medium shrink-0 text-[var(--accent)]">
                      {alreadyIn ? '已在清单' : selected ? '已勾选' : '选择'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-[var(--border-hairline)] flex items-center justify-end gap-3 bg-[var(--bg-surface)]">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={pickerSelectedIds.length === 0}
                onClick={handleConfirmPicker}
                className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] disabled:opacity-40 cursor-pointer disabled:cursor-default"
              >
                加入清单
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete List Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="确认删除清单"
        description={
          deleteTarget
            ? `删除「${deleteTarget.listName}」后无法恢复，清单内包含的篇目顺序也将移除（内置诗文库不受影响）。`
            : ''
        }
        confirmLabel="确认删除"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            const deletedId = deleteTarget.listId;
            onDeleteList(deletedId);
            if (selectedId === deletedId) {
              const remaining = userLists.filter((l) => l.listId !== deletedId);
              setSelectedId(remaining[0]?.listId ?? null);
              setMobileShowDetail(false);
            }
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

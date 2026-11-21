import { useCallback, useEffect, useState } from 'react';
import { BUILTIN_SETS, getPoemById } from '../data/builtinPoems';
import {
  ActiveContext,
  APP_PACKAGE_NAME,
  GlobalConfig,
  LastReadState,
  PoemUserState,
  UserList,
} from '../types/poetry';

const KEYS = {
  INITIALIZED: `${APP_PACKAGE_NAME}.initialized_v1`,
  USER_LISTS: `${APP_PACKAGE_NAME}.user_lists_v1`,
  POEM_STATES: `${APP_PACKAGE_NAME}.poem_states_v1`,
  CONFIG: `${APP_PACKAGE_NAME}.global_config_v1`,
  LAST_READ: `${APP_PACKAGE_NAME}.last_read_v1`,
  PRIVACY_ACCEPTED: `${APP_PACKAGE_NAME}.privacy_accepted_v1`,
};

const LEGACY_KEYS = {
  INITIALIZED: 'yixu_initialized_v1',
  USER_LISTS: 'yixu_user_lists_v1',
  POEM_STATES: 'yixu_poem_states_v1',
  CONFIG: 'yixu_global_config_v1',
  LAST_READ: 'yixu_last_read_v1',
};

const DEFAULT_CONFIG: GlobalConfig = {
  fontLevel: 2,
  theme: 'day',
  showQuizBtn: true,
  audioSpeed: 1,
};

const DEFAULT_USER_LISTS: UserList[] = [
  {
    listId: 'u_starter_1',
    listName: '案头常读',
    desc: '静夜品读，随序收存',
    sortIds: ['t002', 's001', 's005'],
  },
];

const DEFAULT_LAST_READ: LastReadState = {
  poemId: BUILTIN_SETS[0].poems[0].poemId,
  context: {
    type: 'builtin',
    id: BUILTIN_SETS[0].setId,
    name: BUILTIN_SETS[0].setName,
  },
};

function safeReadJSON<T>(key: string, legacyKey: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    const legacyRaw = window.localStorage.getItem(legacyKey);
    if (legacyRaw) {
      window.localStorage.setItem(key, legacyRaw);
      return JSON.parse(legacyRaw) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function useLocalPoetryStore() {
  const [userLists, setUserLists] = useState<UserList[]>(() => {
    try {
      const initialized =
        window.localStorage.getItem(KEYS.INITIALIZED) ||
        window.localStorage.getItem(LEGACY_KEYS.INITIALIZED);
      if (!initialized) {
        window.localStorage.setItem(KEYS.INITIALIZED, '1');
        safeWriteJSON(KEYS.USER_LISTS, DEFAULT_USER_LISTS);
        return DEFAULT_USER_LISTS;
      }
      window.localStorage.setItem(KEYS.INITIALIZED, '1');
    } catch {
      return DEFAULT_USER_LISTS;
    }
    const stored = safeReadJSON<UserList[]>(
      KEYS.USER_LISTS,
      LEGACY_KEYS.USER_LISTS,
      []
    );
    return stored.map((list) => ({
      ...list,
      sortIds: list.sortIds.filter((id) => Boolean(getPoemById(id))),
    }));
  });

  const [poemStates, setPoemStates] = useState<Record<string, PoemUserState>>(() =>
    safeReadJSON<Record<string, PoemUserState>>(
      KEYS.POEM_STATES,
      LEGACY_KEYS.POEM_STATES,
      {}
    )
  );

  const [config, setConfig] = useState<GlobalConfig>(() =>
    safeReadJSON<GlobalConfig>(KEYS.CONFIG, LEGACY_KEYS.CONFIG, DEFAULT_CONFIG)
  );

  const [lastRead, setLastReadState] = useState<LastReadState>(() => {
    const saved = safeReadJSON<LastReadState>(
      KEYS.LAST_READ,
      LEGACY_KEYS.LAST_READ,
      DEFAULT_LAST_READ
    );
    if (!getPoemById(saved.poemId)) {
      return DEFAULT_LAST_READ;
    }
    return saved;
  });

  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(KEYS.PRIVACY_ACCEPTED) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', config.theme);
  }, [config.theme]);

  const updateConfig = useCallback((partial: Partial<GlobalConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      safeWriteJSON(KEYS.CONFIG, next);
      return next;
    });
  }, []);

  const setLastRead = useCallback((poemId: string, context: ActiveContext) => {
    const next: LastReadState = { poemId, context };
    setLastReadState(next);
    safeWriteJSON(KEYS.LAST_READ, next);
  }, []);

  const createList = useCallback((listName: string, desc: string): UserList => {
    const newList: UserList = {
      listId: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      listName: listName.trim(),
      desc: desc.trim(),
      sortIds: [],
    };
    setUserLists((prev) => {
      const next = [newList, ...prev];
      safeWriteJSON(KEYS.USER_LISTS, next);
      return next;
    });
    return newList;
  }, []);

  const updateList = useCallback((listId: string, listName: string, desc: string) => {
    setUserLists((prev) => {
      const next = prev.map((l) =>
        l.listId === listId ? { ...l, listName: listName.trim(), desc: desc.trim() } : l
      );
      safeWriteJSON(KEYS.USER_LISTS, next);
      return next;
    });
  }, []);

  const deleteList = useCallback((listId: string) => {
    setUserLists((prev) => {
      const next = prev.filter((l) => l.listId !== listId);
      safeWriteJSON(KEYS.USER_LISTS, next);
      return next;
    });
  }, []);

  const addPoemToList = useCallback((listId: string, poemId: string) => {
    setUserLists((prev) => {
      const next = prev.map((l) => {
        if (l.listId !== listId) return l;
        if (l.sortIds.includes(poemId)) return l;
        return { ...l, sortIds: [...l.sortIds, poemId] };
      });
      safeWriteJSON(KEYS.USER_LISTS, next);
      return next;
    });
  }, []);

  const addPoemsToList = useCallback((listId: string, poemIds: string[]) => {
    setUserLists((prev) => {
      const next = prev.map((l) => {
        if (l.listId !== listId) return l;
        const merged = [...l.sortIds];
        for (const pid of poemIds) {
          if (!merged.includes(pid)) merged.push(pid);
        }
        return { ...l, sortIds: merged };
      });
      safeWriteJSON(KEYS.USER_LISTS, next);
      return next;
    });
  }, []);

  const removePoemFromList = useCallback((listId: string, poemId: string) => {
    setUserLists((prev) => {
      const next = prev.map((l) =>
        l.listId === listId
          ? { ...l, sortIds: l.sortIds.filter((id) => id !== poemId) }
          : l
      );
      safeWriteJSON(KEYS.USER_LISTS, next);
      return next;
    });
  }, []);

  const reorderList = useCallback((listId: string, newSortIds: string[]) => {
    setUserLists((prev) => {
      const next = prev.map((l) =>
        l.listId === listId ? { ...l, sortIds: newSortIds } : l
      );
      safeWriteJSON(KEYS.USER_LISTS, next);
      return next;
    });
  }, []);

  const toggleStar = useCallback((poemId: string) => {
    setPoemStates((prev) => {
      const existing = prev[poemId] ?? { poemId, isStar: false };
      const nextStar = !existing.isStar;
      const next = { ...prev };
      if (!nextStar) {
        delete next[poemId];
      } else {
        next[poemId] = { poemId, isStar: true };
      }
      safeWriteJSON(KEYS.POEM_STATES, next);
      return next;
    });
  }, []);

  const clearAllUserLists = useCallback(() => {
    setUserLists([]);
    safeWriteJSON(KEYS.USER_LISTS, []);
  }, []);

  const clearAllUserMarks = useCallback(() => {
    setPoemStates({});
    safeWriteJSON(KEYS.POEM_STATES, {});
  }, []);

  const acceptPrivacy = useCallback(() => {
    setPrivacyAccepted(true);
    try {
      window.localStorage.setItem(KEYS.PRIVACY_ACCEPTED, '1');
    } catch {
      // Ignore storage quota errors gracefully
    }
  }, []);

  return {
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
  };
}

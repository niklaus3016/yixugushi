export const APP_PACKAGE_NAME = 'com.yxgs.app';
export const APP_VERSION = '1.0';

export type ThemeMode = 'day' | 'eye' | 'night';

export type FontLevel = 1 | 2 | 3;

export type AppTab = 'home' | 'lists' | 'read' | 'my';

export interface Poem {
  poemId: string;
  title: string;
  author: string;
  dynasty: string;
  genre: '诗' | '词';
  content: string;
  note: string;
  trans: string;
  intro: string;
  distractSentences: string[];
}

export interface BuiltinSet {
  setId: string;
  setName: string;
  subtitle: string;
  coverImage: string;
  poems: Poem[];
}

export interface UserList {
  listId: string;
  listName: string;
  desc: string;
  sortIds: string[];
}

export interface PoemUserState {
  poemId: string;
  isStar: boolean;
}

export interface GlobalConfig {
  fontLevel: FontLevel;
  theme: ThemeMode;
  showQuizBtn: boolean;
  audioSpeed: number;
}

export interface ActiveContext {
  type: 'builtin' | 'custom' | 'star';
  id: string;
  name: string;
}

export interface LastReadState {
  poemId: string;
  context: ActiveContext;
}

/**
 * Zustand store for saved/bookmarked posts
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarksStore {
  savedPostIds: Set<string>;
  toggleSave: (postId: string) => void;
  isSaved: (postId: string) => boolean;
  getSavedCount: () => number;
  clearAll: () => void;
}

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set, get) => ({
      savedPostIds: new Set<string>(),

      toggleSave: (postId: string) => {
        set(state => {
          const newSaved = new Set(state.savedPostIds);
          if (newSaved.has(postId)) {
            newSaved.delete(postId);
          } else {
            newSaved.add(postId);
          }
          return { savedPostIds: newSaved };
        });
      },

      isSaved: (postId: string) => {
        return get().savedPostIds.has(postId);
      },

      getSavedCount: () => {
        return get().savedPostIds.size;
      },

      clearAll: () => {
        set({ savedPostIds: new Set() });
      },
    }),
    {
      name: 'cs182-bookmarks',
      // Custom serialization for Set
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              savedPostIds: new Set(state.savedPostIds || []),
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              ...value.state,
              savedPostIds: Array.from(value.state.savedPostIds),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

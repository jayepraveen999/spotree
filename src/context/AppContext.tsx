import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TreeEntry, UserProfile } from '../types';
import { MOCK_TREES } from '../data/mockTrees';

interface AppContextType {
  trees: TreeEntry[];
  addTree: (tree: TreeEntry) => void;
  user: UserProfile;
}

const defaultUser: UserProfile = {
  id: 'current-user',
  name: 'You',
  treesCount: 0,
  neighborhoodsCovered: [],
  songsShared: 0,
  joinedAt: '2026-05-13T00:00:00Z',
};

const AppContext = createContext<AppContextType>({
  trees: [],
  addTree: () => {},
  user: defaultUser,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [trees, setTrees] = useState<TreeEntry[]>(MOCK_TREES);
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const addTree = (tree: TreeEntry) => {
    setTrees((prev) => [tree, ...prev]);
    setUser((prev) => ({
      ...prev,
      treesCount: prev.treesCount + 1,
      songsShared: tree.spotifyUrl ? prev.songsShared + 1 : prev.songsShared,
    }));
  };

  return (
    <AppContext.Provider value={{ trees, addTree, user }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TreeEntry, UserProfile } from '../types';
import { MOCK_TREES } from '../data/mockTrees';
import { useAuth } from './AuthContext';

interface AppContextType {
  trees: TreeEntry[];
  addTree: (tree: TreeEntry) => void;
  user: UserProfile;
}

const AppContext = createContext<AppContextType>({
  trees: [],
  addTree: () => {},
  user: {
    id: 'anonymous',
    name: 'Guest',
    treesCount: 0,
    neighborhoodsCovered: [],
    songsShared: 0,
    joinedAt: new Date().toISOString(),
  },
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [trees, setTrees] = useState<TreeEntry[]>(MOCK_TREES);

  const user: UserProfile = {
    id: authUser?.uid ?? 'anonymous',
    name: authUser?.displayName ?? 'Guest',
    treesCount: trees.filter((t) => t.userId === (authUser?.uid ?? 'anonymous')).length,
    neighborhoodsCovered: [],
    songsShared: trees.filter(
      (t) => t.userId === (authUser?.uid ?? 'anonymous') && t.spotifyUrl
    ).length,
    joinedAt: new Date().toISOString(),
  };

  const addTree = (tree: TreeEntry) => {
    const treeWithUser = {
      ...tree,
      userId: authUser?.uid ?? 'anonymous',
      userName: authUser?.displayName ?? 'Guest',
    };
    setTrees((prev) => [treeWithUser, ...prev]);
  };

  return (
    <AppContext.Provider value={{ trees, addTree, user }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

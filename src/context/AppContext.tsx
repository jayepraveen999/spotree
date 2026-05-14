import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TreeEntry, UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

interface AppContextType {
  trees: TreeEntry[];
  loading: boolean;
  addTree: (tree: Omit<TreeEntry, 'id' | 'userId' | 'userName'>) => Promise<void>;
  refreshTrees: () => Promise<void>;
  user: UserProfile;
}

const AppContext = createContext<AppContextType>({
  trees: [],
  loading: true,
  addTree: async () => {},
  refreshTrees: async () => {},
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
  const [trees, setTrees] = useState<TreeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrees = useCallback(async () => {
    const { data, error } = await supabase
      .from('trees_with_user')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrees(
        data.map((row: any) => ({
          id: String(row.id),
          latitude: row.latitude,
          longitude: row.longitude,
          photoUri: row.photo_url || '',
          species: row.species,
          speciesConfidence: row.species_confidence,
          healthStatus: row.health_status,
          healthConfidence: row.health_confidence,
          estimatedHeight: row.estimated_height,
          heightConfidence: row.height_confidence,
          trunkDiameter: row.trunk_diameter,
          diameterConfidence: row.diameter_confidence,
          notes: row.notes,
          spotifyUrl: row.spotify_url,
          spotifyTrackName: row.spotify_track_name,
          spotifyArtist: row.spotify_artist,
          createdAt: row.created_at,
          userId: row.user_id,
          userName: row.user_name,
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrees();
  }, [fetchTrees]);

  const user: UserProfile = {
    id: authUser?.uid ?? 'anonymous',
    name: authUser?.displayName ?? 'Guest',
    treesCount: trees.filter((t) => t.userId === authUser?.uid).length,
    neighborhoodsCovered: [],
    songsShared: trees.filter((t) => t.userId === authUser?.uid && t.spotifyUrl).length,
    joinedAt: new Date().toISOString(),
  };

  const addTree = async (tree: Omit<TreeEntry, 'id' | 'userId' | 'userName'>) => {
    if (!authUser) return;

    const { error } = await supabase.from('trees').insert({
      user_id: authUser.uid,
      location: `POINT(${tree.longitude} ${tree.latitude})`,
      photo_url: tree.photoUri,
      species: tree.species,
      species_confidence: tree.speciesConfidence,
      health_status: tree.healthStatus,
      health_confidence: tree.healthConfidence,
      estimated_height: tree.estimatedHeight,
      height_confidence: tree.heightConfidence,
      trunk_diameter: tree.trunkDiameter,
      diameter_confidence: tree.diameterConfidence,
      notes: tree.notes,
      spotify_url: tree.spotifyUrl,
      spotify_track_name: tree.spotifyTrackName,
      spotify_artist: tree.spotifyArtist,
    });

    if (error) throw error;
    await fetchTrees();
  };

  return (
    <AppContext.Provider value={{ trees, loading, addTree, refreshTrees: fetchTrees, user }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { TreeEntry } from '../types';

function TreeCard({ tree, onViewMap }: { tree: TreeEntry; onViewMap: () => void }) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
          <View>
            <Text style={styles.userName}>{tree.userName}</Text>
            <Text style={styles.timeText}>{timeAgo(tree.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.speciesBadge}>
          <Ionicons name="leaf" size={14} color="#2d6a4f" />
          <Text style={styles.speciesText}>{tree.species}</Text>
        </View>
      </View>

      {tree.photoUri ? (
        <Image source={{ uri: tree.photoUri }} style={styles.cardImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="leaf" size={48} color="#b7e4c7" />
        </View>
      )}

      <View style={styles.cardBody}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="heart-circle-outline" size={16} color="#52b788" />
            <Text style={styles.statText}>{tree.healthStatus || 'Unknown'}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="resize-outline" size={16} color="#52b788" />
            <Text style={styles.statText}>{tree.estimatedHeight || 'Unknown'}</Text>
          </View>
        </View>

        {tree.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {tree.notes}
          </Text>
        ) : null}

        <View style={styles.confidenceRow}>
          <Text style={styles.confidenceLabel}>Species confidence:</Text>
          <View style={styles.confidenceBarOuter}>
            <View
              style={[
                styles.confidenceBarInner,
                { width: `${tree.speciesConfidence}%` },
              ]}
            />
          </View>
          <Text style={styles.confidenceValue}>{tree.speciesConfidence}%</Text>
        </View>

        {tree.spotifyUrl ? (
          <TouchableOpacity
            style={styles.spotifyRow}
            onPress={() => Linking.openURL(tree.spotifyUrl)}
          >
            <Ionicons name="musical-notes" size={18} color="#1DB954" />
            <View style={styles.spotifyInfo}>
              <Text style={styles.spotifyTrack}>{tree.spotifyTrackName}</Text>
              <Text style={styles.spotifyArtist}>{tree.spotifyArtist}</Text>
            </View>
            <Ionicons name="play-circle" size={22} color="#1DB954" />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.mapButton} onPress={onViewMap}>
          <Ionicons name="map-outline" size={16} color="#2d6a4f" />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ExploreScreen({ navigation }: any) {
  const { trees } = useApp();

  const sorted = [...trees].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.subtitle}>Recently mapped trees and their songs</Text>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TreeCard tree={item} onViewMap={() => navigation.navigate('Map', { focusLat: item.latitude, focusLng: item.longitude })} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No trees mapped yet. Be the first!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf8' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b4332',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#52b788',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontSize: 14, fontWeight: '600', color: '#333' },
  timeText: { fontSize: 12, color: '#999' },
  speciesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speciesText: { fontSize: 12, fontWeight: '600', color: '#2d6a4f' },
  cardImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 14 },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, color: '#555' },
  notes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  confidenceLabel: { fontSize: 12, color: '#888' },
  confidenceBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: '#e8e8e8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarInner: {
    height: '100%',
    backgroundColor: '#52b788',
    borderRadius: 3,
  },
  confidenceValue: { fontSize: 12, fontWeight: '600', color: '#52b788', width: 35 },
  spotifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  spotifyInfo: { flex: 1 },
  spotifyTrack: { fontSize: 14, fontWeight: '600', color: '#333' },
  spotifyArtist: { fontSize: 12, color: '#888' },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    backgroundColor: '#f0fdf4',
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d6a4f',
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyText: { fontSize: 15, color: '#999' },
});

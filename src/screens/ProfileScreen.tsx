import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { trees, user } = useApp();

  const myTrees = trees.filter((t) => t.userId === user.id);
  const mySongs = myTrees.filter((t) => t.spotifyUrl);
  const speciesSet = new Set(myTrees.map((t) => t.species));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="leaf" size={28} color="#2d6a4f" />
          <Text style={styles.statNumber}>{myTrees.length}</Text>
          <Text style={styles.statLabel}>Trees Mapped</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="musical-notes" size={28} color="#1DB954" />
          <Text style={styles.statNumber}>{mySongs.length}</Text>
          <Text style={styles.statLabel}>Songs Shared</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flower" size={28} color="#f59e0b" />
          <Text style={styles.statNumber}>{speciesSet.size}</Text>
          <Text style={styles.statLabel}>Species Found</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Trees</Text>

      <FlatList
        data={myTrees}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>
              You haven't mapped any trees yet.{'\n'}Head to the Capture tab to start!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.treeRow}>
            <View style={styles.treeIcon}>
              <Ionicons name="leaf" size={20} color="#fff" />
            </View>
            <View style={styles.treeInfo}>
              <Text style={styles.treeName}>{item.species}</Text>
              <Text style={styles.treeDate}>
                {new Date(item.createdAt).toLocaleDateString()} ·{' '}
                {item.healthStatus || 'Unknown health'}
              </Text>
            </View>
            {item.spotifyUrl ? (
              <TouchableOpacity onPress={() => Linking.openURL(item.spotifyUrl)}>
                <Ionicons name="musical-notes" size={20} color="#1DB954" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
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
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b4332',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4332',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  treeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  treeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#52b788',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeInfo: { flex: 1 },
  treeName: { fontSize: 15, fontWeight: '600', color: '#333' },
  treeDate: { fontSize: 12, color: '#888', marginTop: 2 },
  empty: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { trees, user: appUser } = useApp();
  const { user: authUser, signOut, updateSchoolName } = useAuth();
  const [editingSchool, setEditingSchool] = useState(false);
  const [schoolInput, setSchoolInput] = useState(authUser?.schoolName || '');

  const myTrees = trees.filter((t) => t.userId === appUser.id);
  const mySongs = myTrees.filter((t) => t.spotifyUrl);
  const speciesSet = new Set(myTrees.map((t) => t.species));

  const handleSaveSchool = async () => {
    try {
      await updateSchoolName(schoolInput.trim());
      setEditingSchool(false);
    } catch {
      Alert.alert('Error', 'Failed to update school name.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>

      {authUser && (
        <View style={styles.userCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {authUser.displayName || 'Spotree Explorer'}
            </Text>
            <Text style={styles.userEmail}>{authUser.email}</Text>
          </View>
        </View>
      )}

      <View style={styles.schoolCard}>
        <View style={styles.schoolHeader}>
          <Ionicons name="school" size={20} color="#2d6a4f" />
          <Text style={styles.schoolLabel}>School</Text>
          {(!authUser?.schoolName || editingSchool) && (
            <TouchableOpacity
              onPress={() => {
                if (editingSchool) {
                  handleSaveSchool();
                } else {
                  setSchoolInput('');
                  setEditingSchool(true);
                }
              }}
            >
              <Ionicons
                name={editingSchool ? 'checkmark-circle' : 'pencil'}
                size={20}
                color="#2d6a4f"
              />
            </TouchableOpacity>
          )}
        </View>
        {editingSchool ? (
          <TextInput
            style={styles.schoolInput}
            placeholder="e.g. Gymnasium München Nord"
            value={schoolInput}
            onChangeText={setSchoolInput}
            autoFocus
            onSubmitEditing={handleSaveSchool}
            placeholderTextColor="#aaa"
          />
        ) : (
          <Text style={styles.schoolValue}>
            {authUser?.schoolName || 'No school added — tap pencil to add'}
          </Text>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="leaf" size={28} color="#2d6a4f" />
          <Text style={styles.statNumber}>{myTrees.length}</Text>
          <Text style={styles.statLabel}>Trees Spotted</Text>
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
              You haven't spotted any trees yet.{'\n'}Head to the Capture tab to start!
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b4332',
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#52b788',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#1b4332' },
  userEmail: { fontSize: 13, color: '#888', marginTop: 2 },
  schoolCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  schoolLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1b4332',
  },
  schoolValue: {
    fontSize: 15,
    color: '#555',
  },
  schoolInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
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

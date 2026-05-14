import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { TreeEntry } from '../types';

const MUNICH_REGION = {
  latitude: 48.1351,
  longitude: 11.582,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen({ navigation }: any) {
  const { trees, refreshTrees } = useApp();
  const mapRef = useRef<MapView>(null);
  const route = useRoute<any>();

  useFocusEffect(
    useCallback(() => {
      refreshTrees();
      if (route.params?.focusLat && route.params?.focusLng) {
        mapRef.current?.animateToRegion({
          latitude: route.params.focusLat,
          longitude: route.params.focusLng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 600);
        navigation.setParams({ focusLat: undefined, focusLng: undefined });
      }
    }, [refreshTrees, route.params?.focusLat, route.params?.focusLng]),
  );
  const [selected, setSelected] = useState<TreeEntry | null>(null);

  const openSpotify = (url: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={MUNICH_REGION}>
        {trees.map((tree) => (
          <Marker
            key={tree.id}
            coordinate={{ latitude: tree.latitude, longitude: tree.longitude }}
            onPress={() => setSelected(tree)}
          >
            <View style={styles.markerContainer}>
              <Ionicons
                name="leaf"
                size={24}
                color="#2d6a4f"
              />
              {tree.spotifyUrl ? (
                <View style={styles.musicBadge}>
                  <Ionicons name="musical-notes" size={10} color="#fff" />
                </View>
              ) : null}
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('Capture')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selected.species}</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Ionicons name="close-circle" size={28} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="heart-circle" size={18} color="#52b788" />
                  <Text style={styles.infoText}>
                    {selected.healthStatus} ({selected.healthConfidence}% confident)
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="resize-outline" size={18} color="#52b788" />
                  <Text style={styles.infoText}>{selected.estimatedHeight}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person" size={18} color="#52b788" />
                  <Text style={styles.infoText}>
                    Mapped by {selected.userName} on{' '}
                    {new Date(selected.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {selected.notes ? (
                  <Text style={styles.notes}>{selected.notes}</Text>
                ) : null}

                {selected.spotifyUrl ? (
                  <TouchableOpacity
                    style={styles.spotifyButton}
                    onPress={() => openSpotify(selected.spotifyUrl)}
                  >
                    <Ionicons name="musical-notes" size={20} color="#fff" />
                    <View style={styles.spotifyInfo}>
                      <Text style={styles.spotifyTrack}>
                        {selected.spotifyTrackName}
                      </Text>
                    </View>
                    <Ionicons name="play-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.noMusic}>
                    <Ionicons name="musical-notes-outline" size={18} color="#999" />
                    <Text style={styles.noMusicText}>No song linked yet</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#1DB954',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 280,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b4332',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  spotifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 12,
  },
  spotifyInfo: { flex: 1 },
  spotifyTrack: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  spotifyArtist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  noMusic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  noMusicText: {
    color: '#999',
    fontSize: 14,
  },
});

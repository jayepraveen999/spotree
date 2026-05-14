import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MUNICH_TREE_SPECIES } from '../data/treeSpecies';
import { TreeSpeciesInfo } from '../types';

function SpeciesCard({
  species,
  onPress,
}: {
  species: TreeSpeciesInfo;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: species.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardName}>{species.name}</Text>
        <Text style={styles.cardScientific}>{species.scientificName}</Text>
      </View>
      <View style={styles.prevalenceBadge}>
        <Text style={styles.prevalenceText}>{species.prevalence.split(' ')[0]}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TreeGuideScreen() {
  const [selected, setSelected] = useState<TreeSpeciesInfo | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tree Guide</Text>
      <Text style={styles.subtitle}>
        Learn about Munich's most common tree species before you map
      </Text>

      <FlatList
        data={MUNICH_TREE_SPECIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SpeciesCard species={item} onPress={() => setSelected(item)} />
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selected.name}</Text>
                    <Text style={styles.modalScientific}>
                      {selected.scientificName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Ionicons name="close-circle" size={28} color="#666" />
                  </TouchableOpacity>
                </View>

                <Image
                  source={{ uri: selected.imageUrl }}
                  style={styles.modalImage}
                />

                <Text style={styles.modalDescription}>
                  {selected.description}
                </Text>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Ionicons name="leaf" size={18} color="#52b788" />
                    <Text style={styles.detailLabel}>Leaf Type</Text>
                    <Text style={styles.detailValue}>{selected.leafType}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="resize" size={18} color="#52b788" />
                    <Text style={styles.detailLabel}>Max Height</Text>
                    <Text style={styles.detailValue}>{selected.maxHeight}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location" size={18} color="#52b788" />
                    <Text style={styles.detailLabel}>In Munich</Text>
                    <Text style={styles.detailValue}>{selected.prevalence}</Text>
                  </View>
                </View>

                <View style={styles.tipsSection}>
                  <Text style={styles.tipsTitle}>How to Identify</Text>
                  {selected.identificationTips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Ionicons name="eye" size={16} color="#52b788" />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.funFactBox}>
                  <Ionicons name="bulb" size={20} color="#f59e0b" />
                  <Text style={styles.funFactText}>{selected.funFact}</Text>
                </View>

                {selected.easyscapeUrl ? (
                  <TouchableOpacity
                    style={styles.easyscapeButton}
                    onPress={() => Linking.openURL(selected.easyscapeUrl)}
                  >
                    <Ionicons name="earth" size={18} color="#fff" />
                    <Text style={styles.easyscapeButtonText}>
                      Learn more on Easyscape
                    </Text>
                    <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                ) : null}

                <View style={{ height: 30 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#e8f5e9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cardName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  cardScientific: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  prevalenceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(45,106,79,0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  prevalenceText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b4332',
  },
  modalScientific: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
  },
  detailsGrid: { gap: 12, marginBottom: 20 },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  tipsSection: { marginBottom: 20 },
  tipsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  funFactBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  funFactText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  easyscapeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  easyscapeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
});

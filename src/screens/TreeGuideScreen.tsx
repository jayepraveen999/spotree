import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MUNICH_TREE_SPECIES } from '../data/treeSpecies';
import { TreeSpeciesInfo } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_IMAGE_WIDTH = (SCREEN_WIDTH - 52) / 2;

function ImageCarousel({ images, height, onImagePress }: { images: number[]; height: number; onImagePress?: (index: number) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const width = SCREEN_WIDTH - 48;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress?.(index)}>
            <Image
              source={item as ImageSourcePropType}
              style={{ width, height, borderRadius: 16 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />
      {images.length > 1 && (
        <View style={styles.dots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function InfoChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value || value === 'N/A') return null;
  return (
    <View style={styles.chip}>
      <Ionicons name={icon as any} size={14} color="#2d6a4f" />
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

function SpeciesCard({ species, onPress, onImagePress }: { species: TreeSpeciesInfo; onPress: () => void; onImagePress: () => void }) {
  const firstImage = species.images[0];
  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.9} onPress={onImagePress} style={StyleSheet.absoluteFill}>
        <Image
          source={firstImage as ImageSourcePropType}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.cardOverlay} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.cardName}>{species.name}</Text>
        <Text style={styles.cardScientific}>{species.scientificName}</Text>
      </TouchableOpacity>
      {species.images.length > 1 && (
        <View style={styles.imageCountBadge}>
          <Ionicons name="images" size={10} color="#fff" />
          <Text style={styles.imageCountText}>{species.images.length}</Text>
        </View>
      )}
    </View>
  );
}

export default function TreeGuideScreen() {
  const [selected, setSelected] = useState<TreeSpeciesInfo | null>(null);
  const [viewerImage, setViewerImage] = useState<{ images: number[]; index: number } | null>(null);
  const viewerRef = useRef<FlatList>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tree Guide</Text>
      <Text style={styles.subtitle}>
        Learn about Munich's native tree species before you map
      </Text>

      <FlatList
        data={MUNICH_TREE_SPECIES}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SpeciesCard
            species={item}
            onPress={() => setSelected(item)}
            onImagePress={() => setViewerImage({ images: item.images, index: 0 })}
          />
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selected.name}</Text>
                    <Text style={styles.modalScientific}>
                      {selected.scientificName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Ionicons name="close-circle" size={28} color="#666" />
                  </TouchableOpacity>
                </View>

                <ImageCarousel
                  images={selected.images}
                  height={220}
                  onImagePress={(index) => setViewerImage({ images: selected.images, index })}
                />

                <Text style={styles.sectionLabel}>About</Text>
                <Text style={styles.summaryText}>{selected.summary}</Text>

                <Text style={styles.sectionLabel}>Plant Description</Text>
                <View style={styles.chipsContainer}>
                  <InfoChip icon="resize" label="Height" value={selected.height} />
                  <InfoChip icon="swap-horizontal" label="Width" value={selected.width} />
                  <InfoChip icon="speedometer" label="Growth" value={selected.growthRate} />
                  <InfoChip icon="color-palette" label="Flower" value={selected.flowerColor} />
                  <InfoChip icon="calendar" label="Blooms" value={selected.floweringSeason} />
                  <InfoChip icon="leaf" label="Leaves" value={selected.leafRetention} />
                </View>

                <Text style={styles.sectionLabel}>Growth Requirements</Text>
                <View style={styles.growthRow}>
                  <View style={styles.growthItem}>
                    <Ionicons name="sunny" size={20} color="#f59e0b" />
                    <Text style={styles.growthText}>{selected.sun}</Text>
                  </View>
                  <View style={styles.growthItem}>
                    <Ionicons name="water" size={20} color="#3b82f6" />
                    <Text style={styles.growthText}>{selected.drainage}</Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Natural Habitat</Text>
                <View style={styles.habitatBox}>
                  <Ionicons name="earth" size={18} color="#52b788" />
                  <Text style={styles.habitatText}>{selected.naturalHabitat}</Text>
                </View>

                <Text style={styles.sectionLabel}>Common Uses</Text>
                <View style={styles.usesContainer}>
                  {selected.commonUses.split(', ').map((use, i) => (
                    <View key={i} style={styles.useBadge}>
                      <Text style={styles.useText}>{use}</Text>
                    </View>
                  ))}
                </View>

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

                <View style={{ height: 30 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={!!viewerImage} transparent animationType="fade">
        <View style={styles.viewerOverlay}>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerImage(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {viewerImage && (
            <>
              <FlatList
                ref={viewerRef}
                data={viewerImage.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
                initialScrollIndex={viewerImage.index}
                renderItem={({ item }) => (
                  <View style={styles.viewerPage}>
                    <Image
                      source={item as ImageSourcePropType}
                      style={styles.viewerImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
              />
              <Text style={styles.viewerHint}>Swipe to browse</Text>
            </>
          )}
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
  imageCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 11,
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
    maxHeight: '90%',
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
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  dotActive: {
    backgroundColor: '#2d6a4f',
    width: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4332',
    marginTop: 18,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  chipLabel: {
    fontSize: 11,
    color: '#888',
  },
  chipValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  growthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  growthItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  growthText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
  },
  habitatBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  habitatText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    lineHeight: 19,
  },
  usesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  useBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  useText: {
    fontSize: 12,
    color: '#2d6a4f',
    fontWeight: '500',
  },
  easyscapeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  easyscapeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  viewerPage: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH - 16,
    height: SCREEN_WIDTH - 16,
    borderRadius: 8,
  },
  viewerHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 16,
  },
});

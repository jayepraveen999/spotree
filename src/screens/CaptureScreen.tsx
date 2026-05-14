import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { HEALTH_OPTIONS, HEIGHT_OPTIONS, TRUNK_DIAMETER_OPTIONS } from '../data/treeSpecies';
import { ALL_MUNICH_SPECIES } from '../data/speciesNames';
import { validateTreeImage } from '../services/treeValidator';

interface ConfidenceFieldProps {
  label: string;
  value: string;
  confidence: number;
  options: string[];
  onValueChange: (v: string) => void;
  onConfidenceChange: (c: number) => void;
}

function ConfidenceField({
  label,
  value,
  confidence,
  options,
  onValueChange,
  onConfidenceChange,
}: ConfidenceFieldProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
          {value || `Select ${label.toLowerCase()}...`}
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#666" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.optionsList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.option, opt === value && styles.optionSelected]}
              onPress={() => {
                onValueChange(opt);
                setExpanded(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  opt === value && styles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {value ? (
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>
            How confident are you? {confidence}%
          </Text>
          <View style={styles.confidenceBar}>
            {[20, 40, 60, 80, 100].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.confidenceDot,
                  confidence >= level && styles.confidenceDotActive,
                ]}
                onPress={() => onConfidenceChange(level)}
              >
                <Text
                  style={[
                    styles.confidenceDotText,
                    confidence >= level && styles.confidenceDotTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function CaptureScreen({ navigation }: any) {
  const { addTree } = useApp();
  const [photoUri, setPhotoUri] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [species, setSpecies] = useState('');
  const [speciesConfidence, setSpeciesConfidence] = useState(60);
  const [health, setHealth] = useState('');
  const [healthConfidence, setHealthConfidence] = useState(60);
  const [height, setHeight] = useState('');
  const [heightConfidence, setHeightConfidence] = useState(60);
  const [diameter, setDiameter] = useState('');
  const [diameterConfidence, setDiameterConfidence] = useState(60);
  const [notes, setNotes] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [spotifyTrackName, setSpotifyTrackName] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const [photoConfirmed, setPhotoConfirmed] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to photograph trees.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoConfirmed(false);
      await getLocation();
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.7,
      exif: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setPhotoConfirmed(false);

      const exif = asset.exif;
      const gpsLat = exif?.GPSLatitude;
      const gpsLng = exif?.GPSLongitude;

      if (gpsLat != null && gpsLng != null) {
        const lat = exif?.GPSLatitudeRef === 'S' ? -gpsLat : gpsLat;
        const lng = exif?.GPSLongitudeRef === 'W' ? -gpsLng : gpsLng;
        setLocation({ lat, lng });
      } else {
        Alert.alert(
          'No location data',
          'This photo doesn\'t have GPS info. Would you like to use your current location instead?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => { setPhotoUri(''); } },
            {
              text: 'Use Current Location',
              onPress: () => { getLocation(); },
            },
          ],
        );
      }
    }
  };

  const clearPhoto = () => {
    setPhotoUri('');
    setPhotoConfirmed(false);
  };

  const confirmPhoto = async () => {
    setValidating(true);
    try {
      const result = await validateTreeImage(photoUri);
      console.log('Tree validation result:', JSON.stringify(result));
      if (!result.isTree) {
        Alert.alert(
          'No tree detected',
          result.message || 'This image doesn\'t appear to contain a tree. Please take or select a different photo.',
        );
        return;
      }
      setPhotoConfirmed(true);
    } catch (e: any) {
      console.error('Tree validation error:', e?.message || e);
      Alert.alert(
        'Verification failed',
        'Could not verify the image. Please check your connection and try again.',
      );
    } finally {
      setValidating(false);
    }
  };

  const getLocation = async () => {
    setLocationLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location access is required to map trees.');
      setLocationLoading(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setLocationLoading(false);
  };

  useEffect(() => {
    getLocation();
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!photoConfirmed) {
      Alert.alert('Photo required', 'Please add a photo and verify it contains a tree.');
      return;
    }
    if (!species) {
      Alert.alert('Missing info', 'Please select at least a tree species.');
      return;
    }

    setSubmitting(true);
    try {
      await addTree({
        latitude: location?.lat ?? 48.1351,
        longitude: location?.lng ?? 11.582,
        photoUri,
        species,
        speciesConfidence,
        healthStatus: health,
        healthConfidence,
        estimatedHeight: height,
        heightConfidence,
        trunkDiameter: diameter,
        diameterConfidence,
        notes,
        spotifyUrl,
        spotifyTrackName,
        spotifyArtist: '',
        createdAt: new Date().toISOString(),
      });
      setPhotoUri('');
      setPhotoConfirmed(false);
      setSpecies('');
      setSpeciesConfidence(60);
      setHealth('');
      setHealthConfidence(60);
      setHeight('');
      setHeightConfidence(60);
      setDiameter('');
      setDiameterConfidence(60);
      setNotes('');
      setSpotifyUrl('');
      setSpotifyTrackName('');
      Alert.alert('Tree spotted!', 'Your tree has been added to the Spotree map.', [
        { text: 'View Map', onPress: () => navigation.navigate('Map') },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save tree. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const speciesNames = ALL_MUNICH_SPECIES;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Spot a Tree</Text>
        <Text style={styles.subtitle}>
          Snap a photo, answer what you can, and drop a beat
        </Text>

        {/* Photo Section */}
        <View style={styles.photoSection}>
          {photoUri ? (
            <View>
              <Image source={{ uri: photoUri }} style={styles.photo} />
              <TouchableOpacity style={styles.clearPhotoButton} onPress={clearPhoto}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              {!photoConfirmed && (
                validating ? (
                  <View style={styles.addTreeButton}>
                    <Ionicons name="leaf" size={18} color="#fff" />
                    <Text style={styles.addTreeText}>Checking for trees...</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.addTreeButton} onPress={confirmPhoto}>
                    <Ionicons name="leaf" size={18} color="#fff" />
                    <Text style={styles.addTreeText}>Add Tree</Text>
                  </TouchableOpacity>
                )
              )}
              {photoConfirmed && (
                <View style={styles.confirmedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#2d6a4f" />
                  <Text style={styles.confirmedText}>Tree verified</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#2d6a4f" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={pickPhoto}>
                <Ionicons name="images" size={32} color="#2d6a4f" />
                <Text style={styles.photoButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons
            name={location ? 'location' : 'location-outline'}
            size={20}
            color={location ? '#2d6a4f' : '#999'}
          />
          <Text style={styles.locationText}>
            {locationLoading
              ? 'Getting your location...'
              : location
              ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : 'Location unavailable'}
          </Text>
          {!location && !locationLoading && (
            <TouchableOpacity onPress={getLocation}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tree Questions with Confidence */}
        <Text style={styles.sectionTitle}>Tree Information</Text>
        <Text style={styles.sectionHint}>
          Answer what you can — use the confidence score to tell us how sure you are
        </Text>

        <ConfidenceField
          label="Species"
          value={species}
          confidence={speciesConfidence}
          options={speciesNames}
          onValueChange={setSpecies}
          onConfidenceChange={setSpeciesConfidence}
        />

        <ConfidenceField
          label="Health Status"
          value={health}
          confidence={healthConfidence}
          options={HEALTH_OPTIONS}
          onValueChange={setHealth}
          onConfidenceChange={setHealthConfidence}
        />

        <ConfidenceField
          label="Estimated Height"
          value={height}
          confidence={heightConfidence}
          options={HEIGHT_OPTIONS}
          onValueChange={setHeight}
          onConfidenceChange={setHeightConfidence}
        />

        <ConfidenceField
          label="Trunk Diameter"
          value={diameter}
          confidence={diameterConfidence}
          options={TRUNK_DIAMETER_OPTIONS}
          onValueChange={setDiameter}
          onConfidenceChange={setDiameterConfidence}
        />

        {/* Notes */}
        <Text style={styles.fieldLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Anything else about this tree..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Spotify Section */}
        <View style={styles.spotifySection}>
          <View style={styles.spotifyHeader}>
            <Ionicons name="musical-notes" size={22} color="#1DB954" />
            <Text style={styles.spotifySectionTitle}>Drop a Song</Text>
          </View>
          <Text style={styles.spotifyHint}>
            Link a Spotify track to this spot — others will discover it on the map
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="Paste Spotify link..."
            value={spotifyUrl}
            onChangeText={setSpotifyUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <TextInput
            style={styles.textInput}
            placeholder="Song name"
            value={spotifyTrackName}
            onChangeText={setSpotifyTrackName}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="leaf" size={20} color="#fff" />
          <Text style={styles.submitText}>Add Tree to Map</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8faf8' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b4332',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    marginTop: 4,
  },
  photoSection: { marginBottom: 16 },
  clearPhotoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTreeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  addTreeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  confirmedText: {
    color: '#2d6a4f',
    fontSize: 14,
    fontWeight: '600',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    height: 120,
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#b7e4c7',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoButtonText: {
    color: '#2d6a4f',
    fontSize: 14,
    fontWeight: '600',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  locationText: { flex: 1, fontSize: 14, color: '#444' },
  retryText: { color: '#2d6a4f', fontWeight: '600', fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownText: { fontSize: 15, color: '#333' },
  dropdownPlaceholder: { fontSize: 15, color: '#aaa' },
  optionsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: { backgroundColor: '#e8f5e9' },
  optionText: { fontSize: 14, color: '#444' },
  optionTextSelected: { color: '#2d6a4f', fontWeight: '600' },
  confidenceContainer: { marginTop: 10 },
  confidenceLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  confidenceBar: {
    flexDirection: 'row',
    gap: 8,
  },
  confidenceDot: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  confidenceDotActive: {
    backgroundColor: '#52b788',
  },
  confidenceDotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  confidenceDotTextActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
    marginBottom: 10,
    minHeight: 48,
  },
  spotifySection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  spotifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  spotifySectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4332',
  },
  spotifyHint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d6a4f',
    borderRadius: 16,
    padding: 18,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

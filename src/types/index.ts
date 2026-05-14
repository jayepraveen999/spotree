export interface TreeEntry {
  id: string;
  latitude: number;
  longitude: number;
  photoUri: string;
  species: string;
  speciesConfidence: number; // 0-100
  healthStatus: string;
  healthConfidence: number; // 0-100
  estimatedHeight: string;
  heightConfidence: number; // 0-100
  trunkDiameter: string;
  diameterConfidence: number; // 0-100
  notes: string;
  spotifyUrl: string;
  spotifyTrackName: string;
  spotifyArtist: string;
  createdAt: string;
  userId: string;
  userName: string;
}

export interface TreeSpeciesInfo {
  id: string;
  name: string;
  scientificName: string;
  summary: string;
  plantType: string;
  height: string;
  width: string;
  growthRate: string;
  flowerColor: string;
  floweringSeason: string;
  leafRetention: string;
  sun: string;
  drainage: string;
  commonUses: string;
  naturalHabitat: string;
  images: number[]; // require() image sources
  easyscapeUrl: string;
}

export interface UserProfile {
  id: string;
  name: string;
  treesCount: number;
  neighborhoodsCovered: string[];
  songsShared: number;
  joinedAt: string;
}

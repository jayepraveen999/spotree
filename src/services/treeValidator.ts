import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const WORKER_URL = 'https://treequest-ai.jayepraveen999.workers.dev';

const TREE_KEYWORDS = [
  'tree', 'trees', 'trunk', 'bark', 'branch', 'branches', 'canopy',
  'oak', 'pine', 'birch', 'beech', 'maple', 'willow', 'cedar', 'spruce',
  'fir', 'elm', 'ash', 'poplar', 'yew', 'juniper', 'alder', 'hazel',
  'holly', 'hornbeam', 'lime tree', 'linden', 'cypress', 'redwood',
  'forest', 'woodland', 'foliage', 'leaves', 'leaf', 'shrub', 'bush',
  'hedge', 'plant', 'sapling', 'conifer', 'deciduous', 'evergreen',
  'blossom', 'roots',
];

export interface ValidationResult {
  isTree: boolean;
  message: string;
}

export async function validateTreeImage(imageUri: string): Promise<ValidationResult> {
  const resized = await manipulateAsync(
    imageUri,
    [{ resize: { width: 512 } }],
    { compress: 0.6, format: SaveFormat.JPEG, base64: true },
  );

  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64: resized.base64 }),
  });

  const text = await response.text();
  console.log('Tree AI response:', text.substring(0, 300));

  const data = JSON.parse(text);

  if (!data.description) {
    throw new Error(data.error || 'AI model returned no result');
  }

  const description = data.description.toLowerCase();
  const matched = TREE_KEYWORDS.some((kw) => description.includes(kw));

  return {
    isTree: matched,
    message: matched ? 'Tree detected' : 'No tree detected in this image',
  };
}

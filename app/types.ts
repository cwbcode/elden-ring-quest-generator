export const routes = [
  'armors',
  'ashes',
  'bosses',
  'creatures',
  'incantations',
  'items',
  'locations',
  'npcs',
  'shields',
  'sorceries',
  'spirits',
  'talismans',
  'weapons',
]

export type Route = typeof routes[number];

export type EldenRingListResponseItem = {
  id: string;
  name: string;
  image: string;
  description: string;
  location?: string;
}

export type IdListItem = EldenRingListResponseItem & {
  questId: string | number;
  route: Route;
}

export type QuestLogItem = IdListItem & {
  completed: boolean;
  unobtainable?: boolean;
  isJourneyMarker?: boolean;
  inLog?: boolean;
}

export type EldenRingListResponse = {
  success: boolean;
  count: number;
  total: number;
  data: EldenRingListResponseItem[];
};

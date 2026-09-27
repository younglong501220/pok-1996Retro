export type PokemonType =
  | 'NORMAL'
  | 'FIRE'
  | 'WATER'
  | 'GRASS'
  | 'ELECTRIC'
  | 'ROCK'
  | 'STEEL'
  | 'FLYING'
  | 'GROUND'
  | 'ICE'
  | 'PSYCHIC'
  | 'FIGHTING'
  | 'GHOST'
  | 'DRAGON'
  | 'BUG'
  | 'POISON'
  | 'DARK'
  | 'FAIRY';

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  typeLabel: string;
  pwr: number;
  accuracy: number;
  description: string;
  isSpecial?: boolean;
}

export interface Pokemon {
  id: string;
  name: string;
  nameEn: string;
  sprite: string;
  type: PokemonType;
  typeLabel: string;
  secondaryType?: PokemonType;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  speed: number;
  moves: Move[];
  description: string;
}

export type GameStage =
  | 'TITLE'
  | 'STAGE_1_OAK'
  | 'STAGE_2_GYM'
  | 'STAGE_2_MT_MOON'
  | 'STAGE_2_TRAINING'
  | 'STAGE_3_CHAMPION'
  | 'HALL_OF_FAME'
  | 'GAME_OVER';

export interface ActionButtonConfig {
  text: string;
  subText?: string;
  disabled?: boolean;
  variant?: 'default' | 'accent' | 'danger' | 'special';
  onClick: () => void;
}

export type ScreenPalette = 'dmg' | 'pocket' | 'color' | 'crimson';

export interface PaletteTheme {
  id: ScreenPalette;
  name: string;
  description: string;
  bg: string;
  screenBg: string;
  screenDark: string;
  screenMid: string;
  screenLight: string;
  screenHighlight: string;
}

export interface BattleLogEntry {
  id: string;
  text: string;
  type?: 'player' | 'enemy' | 'system' | 'super' | 'weak';
}

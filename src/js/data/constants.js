/* Stałe: adresy, limity, nazwy i wartości domyślne. */
const WORKER_URL = 'https://genshin-proxy.klaun970.workers.dev/uid/';
const STORE_URL = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/gi/';
const IMG_URL = 'https://enka.network/ui/';

const DMG_PROPS = {
  30: 'FIGHT_PROP_PHYSICAL_ADD_HURT',
  40: 'FIGHT_PROP_FIRE_ADD_HURT',
  41: 'FIGHT_PROP_ELEC_ADD_HURT',
  42: 'FIGHT_PROP_WATER_ADD_HURT',
  43: 'FIGHT_PROP_GRASS_ADD_HURT',
  44: 'FIGHT_PROP_WIND_ADD_HURT',
  45: 'FIGHT_PROP_ROCK_ADD_HURT',
  46: 'FIGHT_PROP_ICE_ADD_HURT'
};

const MAX_ROLLS = {
  FIGHT_PROP_CRITICAL: 3.9,
  FIGHT_PROP_CRITICAL_HURT: 7.8,
  FIGHT_PROP_ATTACK_PERCENT: 5.8,
  FIGHT_PROP_HP_PERCENT: 5.8,
  FIGHT_PROP_DEFENSE_PERCENT: 7.3,
  FIGHT_PROP_CHARGE_EFFICIENCY: 6.5,
  FIGHT_PROP_ELEMENT_MASTERY: 23,
  FIGHT_PROP_ATTACK: 19,
  FIGHT_PROP_HP: 299,
  FIGHT_PROP_DEFENSE: 23
};

const DEFAULT_RV = ['FIGHT_PROP_CRITICAL', 'FIGHT_PROP_CRITICAL_HURT', 'FIGHT_PROP_ATTACK_PERCENT'];
const DEFAULT_TARGETS = { critRate: 70, critDmg: 140, er: 100 };
const SLOT_ORDER = ['EQUIP_BRACER', 'EQUIP_NECKLACE', 'EQUIP_SHOES', 'EQUIP_RING', 'EQUIP_DRESS'];
const PERCENT_PATTERN = /PERCENT|CRITICAL|CHARGE_EFFICIENCY|HEAL_ADD|ADD_HURT/;

const NAME_FIX = {
  Qin: 'Jean',
  Shougun: 'Raiden Shogun',
  Tohma: 'Thoma',
  Hutao: 'Hu Tao',
  Heizo: 'Shikanoin Heizou',
  Feiyan: 'Yanfei',
  Ambor: 'Amber',
  Itto: 'Arataki Itto',
  Yae: 'Yae Miko',
  Kazuha: 'Kaedehara Kazuha',
  Sara: 'Kujou Sara',
  Ayaka: 'Kamisato Ayaka',
  Ayato: 'Kamisato Ayato',
  Shinobu: 'Kuki Shinobu',
  Baizhuer: 'Baizhu',
  Liuyun: 'Xianyun',
  Alhatham: 'Alhaitham',
  SkirkNew: 'Skirk'
};

const ELEMENT_EMOJI = {
  Fire: '🔥',
  Water: '💧',
  Grass: '🌿',
  Electric: '⚡',
  Ice: '❄️',
  Wind: '🌪️',
  Rock: '🪨'
};

const HERO_CHARACTERS = [
  { icon: 'UI_AvatarIcon_Furina_Circle', name: 'Furina' },
  { icon: 'UI_AvatarIcon_Zhongli_Circle', name: 'Zhongli' },
  { icon: 'UI_AvatarIcon_Nahida_Circle', name: 'Nahida' },
  { icon: 'UI_AvatarIcon_Shougun_Circle', name: 'Raiden Shogun' },
  { icon: 'UI_AvatarIcon_Venti_Circle', name: 'Venti' },
  { icon: 'UI_AvatarIcon_Hutao_Circle', name: 'Hu Tao' }
];

const HANDLED_KEYS = [
  'nickname', 'signature', 'level', 'worldLevel', 'finishAchievementNum',
  'towerFloorIndex', 'towerLevelIndex', 'towerStarIndex', 'nameCardId', 'namecardId',
  'showAvatarInfoList', 'showNameCardIdList', 'profilePicture', 'isShowAvatarTalent',
  'fetterCount', 'stygianIndex', 'stygianSeconds', 'stygianId'
];

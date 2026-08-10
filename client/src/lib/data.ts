export interface Anime {
  id: string
  title: string
  titleJp: string
  synopsis: string
  posterColor: string   // CSS gradient string for poster bg
  heroBg: string        // CSS gradient for hero section
  accentColor: string   // dominant color for glow effects
  genres: string[]
  tags: string[]
  rating: number
  episodes: number
  currentEpisode: number
  status: 'Airing' | 'Completed' | 'Upcoming'
  studio: string
  producer: string
  year: number
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter'
  type: 'TV' | 'Movie' | 'OVA' | 'ONA'
  duration: string
  language: 'Sub' | 'Dub' | 'Both'
  isNew?: boolean
  popularity: number
  aired: string
  nextEpisode?: string
  score?: number
  characters?: Character[]
  relations?: Relation[]
}

export interface Character {
  id: string
  name: string
  nameJp: string
  role: 'Main' | 'Supporting'
  color: string
}

export interface Relation {
  id: string
  title: string
  type: string
  relationType: 'Sequel' | 'Prequel' | 'Side Story' | 'Alternative' | 'Other'
  color: string
}

export interface Episode {
  number: number
  title: string
  duration: string
  thumbnail: string
  aired: string
  isFiller?: boolean
}

export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Isekai', 'Magic', 'Mecha', 'Military', 'Music', 'Mystery',
  'Psychological', 'Romance', 'School', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Historical',
]

export const GENRE_COLORS: Record<string, string> = {
  Action: '#FF4D4D',
  Adventure: '#FF8C42',
  Comedy: '#FFD700',
  Drama: '#FF4DB8',
  Fantasy: '#6D3BFF',
  Horror: '#8B0000',
  Isekai: '#4A8DFF',
  Magic: '#A855F7',
  Mecha: '#64748B',
  Military: '#4B5320',
  Music: '#EC4899',
  Mystery: '#1E40AF',
  Psychological: '#7C3AED',
  Romance: '#F43F5E',
  School: '#06B6D4',
  'Sci-Fi': '#0EA5E9',
  'Slice of Life': '#22C55E',
  Sports: '#F97316',
  Supernatural: '#8B5CF6',
  Historical: '#92400E',
}

export const animeList: Anime[] = [
  {
    id: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    titleJp: '鬼滅の刃',
    synopsis: 'In Taisho-era Japan, Tanjiro Kamado is a kindhearted boy who sells charcoal for a living. After his family is slaughtered by demons and his younger sister Nezuko is turned into one, Tanjiro sets off on a dangerous journey to find a way to return his sister to normal and avenge his family.',
    posterColor: 'linear-gradient(160deg, #1a0505 0%, #4a0a0a 35%, #1a0a2e 100%)',
    heroBg: 'linear-gradient(135deg, #2d0505 0%, #1a0520 50%, #09090B 100%)',
    accentColor: '#C22B2B',
    genres: ['Action', 'Fantasy', 'Historical'],
    tags: ['Demons', 'Swordsmanship', 'Siblings', 'Tragedy'],
    rating: 9.1,
    episodes: 26,
    currentEpisode: 26,
    status: 'Completed',
    studio: 'ufotable',
    producer: 'Aniplex',
    year: 2023,
    season: 'Spring',
    type: 'TV',
    duration: '23 min',
    language: 'Both',
    popularity: 98,
    aired: 'Apr 9, 2023 – Jun 18, 2023',
    score: 8.7,
    characters: [
      { id: 'c1', name: 'Tanjiro Kamado', nameJp: '竈門炭治郎', role: 'Main', color: 'linear-gradient(135deg, #1a3a6e, #0a1a3d)' },
      { id: 'c2', name: 'Nezuko Kamado', nameJp: '竈門禰豆子', role: 'Main', color: 'linear-gradient(135deg, #6e1a3a, #3d0a1a)' },
      { id: 'c3', name: 'Zenitsu Agatsuma', nameJp: '我妻善逸', role: 'Supporting', color: 'linear-gradient(135deg, #6e5a1a, #3d300a)' },
      { id: 'c4', name: 'Inosuke Hashibira', nameJp: '嘴平伊之助', role: 'Supporting', color: 'linear-gradient(135deg, #1a6e4a, #0a3d24)' },
    ],
    relations: [
      { id: 'ds-movie', title: 'Demon Slayer: Mugen Train', type: 'Movie', relationType: 'Sequel', color: 'linear-gradient(135deg, #4a0a0a, #1a0505)' },
    ],
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan: Final Season',
    titleJp: '進撃の巨人 The Final Season',
    synopsis: 'Eren and his friends face the devastating truths behind their world as the war between Eldia and Marley reaches its catastrophic conclusion. With humanity\'s fate hanging by a thread, alliances fracture and former enemies must unite.',
    posterColor: 'linear-gradient(160deg, #0a1a0a 0%, #1a2e1a 35%, #0d0820 100%)',
    heroBg: 'linear-gradient(135deg, #0d1a0d 0%, #0a0a2a 50%, #09090B 100%)',
    accentColor: '#4B5320',
    genres: ['Action', 'Drama', 'Military', 'Mystery'],
    tags: ['Giants', 'War', 'Post-Apocalyptic', 'Revolution'],
    rating: 9.4,
    episodes: 28,
    currentEpisode: 28,
    status: 'Completed',
    studio: 'MAPPA',
    producer: 'Kodansha',
    year: 2022,
    season: 'Winter',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 99,
    aired: 'Jan 10, 2022 – Nov 4, 2023',
    score: 9.0,
    characters: [
      { id: 'e1', name: 'Eren Yeager', nameJp: 'エレン・イェーガー', role: 'Main', color: 'linear-gradient(135deg, #1a3a1a, #0a1a0a)' },
      { id: 'e2', name: 'Mikasa Ackerman', nameJp: 'ミカサ・アッカーマン', role: 'Main', color: 'linear-gradient(135deg, #3a1a1a, #1a0a0a)' },
      { id: 'e3', name: 'Levi Ackerman', nameJp: 'リヴァイ・アッカーマン', role: 'Supporting', color: 'linear-gradient(135deg, #1a1a3a, #0a0a1a)' },
      { id: 'e4', name: 'Armin Arlert', nameJp: 'アルミン・アルレルト', role: 'Supporting', color: 'linear-gradient(135deg, #3a321a, #1a190a)' },
    ],
    relations: [],
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen Season 2',
    titleJp: '呪術廻戦 第2期',
    synopsis: 'The hidden truth about Satoru Gojo\'s past and the Shibuya Incident—a battle that will change the jujutsu world forever. As cursed spirits evolve and sorcerers fall, Yuji Itadori is thrust into a war beyond his imagination.',
    posterColor: 'linear-gradient(160deg, #0d0520 0%, #1a0a3d 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #0d0520 0%, #1a0a3d 50%, #09090B 100%)',
    accentColor: '#6D3BFF',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    tags: ['Curses', 'Sorcery', 'School', 'Dark Fantasy'],
    rating: 9.0,
    episodes: 23,
    currentEpisode: 23,
    status: 'Completed',
    studio: 'MAPPA',
    producer: 'Shueisha',
    year: 2023,
    season: 'Summer',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 97,
    aired: 'Jul 6, 2023 – Dec 28, 2023',
    score: 8.6,
    isNew: true,
    characters: [
      { id: 'j1', name: 'Yuji Itadori', nameJp: '虎杖悠仁', role: 'Main', color: 'linear-gradient(135deg, #1a0a3d, #09090B)' },
      { id: 'j2', name: 'Satoru Gojo', nameJp: '五条悟', role: 'Main', color: 'linear-gradient(135deg, #0a2a4a, #0a0a1a)' },
      { id: 'j3', name: 'Megumi Fushiguro', nameJp: '伏黒恵', role: 'Supporting', color: 'linear-gradient(135deg, #1a1a2a, #09090B)' },
      { id: 'j4', name: 'Nobara Kugisaki', nameJp: '釘崎野薔薇', role: 'Supporting', color: 'linear-gradient(135deg, #3a1a1a, #1a0a0a)' },
    ],
    relations: [],
  },
  {
    id: 'frieren',
    title: 'Frieren: Beyond Journey\'s End',
    titleJp: '葬送のフリーレン',
    synopsis: 'The adventure is over but life goes on for an elf mage. Long-lived mage Frieren begins a new journey to fulfill her promise to her late friends as she reflects on the decades she\'d spent with the hero\'s party.',
    posterColor: 'linear-gradient(160deg, #1a1a3d 0%, #2a2a5a 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #151530 0%, #1a1a4a 50%, #09090B 100%)',
    accentColor: '#4A8DFF',
    genres: ['Adventure', 'Drama', 'Fantasy'],
    tags: ['Elves', 'Magic', 'Journey', 'Slow Life'],
    rating: 9.3,
    episodes: 28,
    currentEpisode: 28,
    status: 'Completed',
    studio: 'Madhouse',
    producer: 'Aniplex',
    year: 2023,
    season: 'Fall',
    type: 'TV',
    duration: '24 min',
    language: 'Sub',
    popularity: 95,
    aired: 'Sep 29, 2023 – Mar 22, 2024',
    score: 9.0,
    characters: [
      { id: 'f1', name: 'Frieren', nameJp: 'フリーレン', role: 'Main', color: 'linear-gradient(135deg, #2a2a5a, #1a1a3d)' },
      { id: 'f2', name: 'Fern', nameJp: 'フェルン', role: 'Main', color: 'linear-gradient(135deg, #1a3a1a, #0a1a0a)' },
      { id: 'f3', name: 'Stark', nameJp: 'シュタルク', role: 'Supporting', color: 'linear-gradient(135deg, #3a1a0a, #1a0a05)' },
    ],
    relations: [],
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    titleJp: '俺だけレベルアップな件',
    synopsis: 'In a world where hunters—humans who have awakened magical abilities—must battle deadly monsters to protect humanity, Sung Jin-Woo is known as the weakest hunter. One fateful day, he encounters a Double Dungeon and faces a mysterious System that only he can see.',
    posterColor: 'linear-gradient(160deg, #030d1a 0%, #071a33 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #030d1a 0%, #071a33 50%, #09090B 100%)',
    accentColor: '#4A8DFF',
    genres: ['Action', 'Adventure', 'Fantasy'],
    tags: ['Hunters', 'Dungeons', 'Level Up', 'OP Protagonist'],
    rating: 8.8,
    episodes: 12,
    currentEpisode: 12,
    status: 'Completed',
    studio: 'A-1 Pictures',
    producer: 'Kakao Entertainment',
    year: 2024,
    season: 'Winter',
    type: 'TV',
    duration: '23 min',
    language: 'Both',
    popularity: 96,
    aired: 'Jan 6, 2024 – Mar 30, 2024',
    score: 8.2,
    isNew: true,
    characters: [
      { id: 's1', name: 'Sung Jin-Woo', nameJp: '成ジン=ウー', role: 'Main', color: 'linear-gradient(135deg, #071a33, #030d1a)' },
    ],
    relations: [],
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    titleJp: 'チェンソーマン',
    synopsis: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he was forced to work as a Devil Hunter for the yakuza while also raising Pochita. One day, the yakuza boss that he was working for turned into a devil and killed Denji.',
    posterColor: 'linear-gradient(160deg, #1a0505 0%, #3a0a0a 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #2a0808 0%, #1a0515 50%, #09090B 100%)',
    accentColor: '#FF4D4D',
    genres: ['Action', 'Fantasy', 'Horror'],
    tags: ['Devils', 'Gore', 'Dark', 'Hunting'],
    rating: 8.5,
    episodes: 12,
    currentEpisode: 12,
    status: 'Completed',
    studio: 'MAPPA',
    producer: 'Shueisha',
    year: 2022,
    season: 'Fall',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 92,
    aired: 'Oct 12, 2022 – Dec 28, 2022',
    score: 8.5,
    characters: [
      { id: 'cm1', name: 'Denji', nameJp: 'デンジ', role: 'Main', color: 'linear-gradient(135deg, #3a0a0a, #1a0505)' },
      { id: 'cm2', name: 'Makima', nameJp: 'マキマ', role: 'Main', color: 'linear-gradient(135deg, #1a0a2a, #09090B)' },
    ],
    relations: [],
  },
  {
    id: 'vinland-saga',
    title: 'Vinland Saga Season 2',
    titleJp: 'ヴィンランド・サガ SEASON2',
    synopsis: 'After the events that led to Askeladd\'s death, Thorfinn finds himself enslaved on a Danish farm. As he learns to live peacefully and reconcile with his violent past, new forces are set in motion that will once again reshape his destiny.',
    posterColor: 'linear-gradient(160deg, #0a1505 0%, #1a2e0a 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #0d1a0a 0%, #1a2a10 50%, #09090B 100%)',
    accentColor: '#22C55E',
    genres: ['Action', 'Adventure', 'Drama', 'Historical'],
    tags: ['Vikings', 'War', 'Revenge', 'Redemption'],
    rating: 9.2,
    episodes: 24,
    currentEpisode: 24,
    status: 'Completed',
    studio: 'MAPPA',
    producer: 'Kodansha',
    year: 2023,
    season: 'Winter',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 88,
    aired: 'Jan 10, 2023 – Jun 27, 2023',
    score: 8.7,
    characters: [
      { id: 'v1', name: 'Thorfinn', nameJp: 'トルフィン', role: 'Main', color: 'linear-gradient(135deg, #1a2a0a, #0a1505)' },
    ],
    relations: [],
  },
  {
    id: 'bleach-tybw',
    title: 'Bleach: Thousand-Year Blood War',
    titleJp: 'BLEACH 千年血戦篇',
    synopsis: 'A thousand years ago, Yhwach and his Wandenreich Quincies were defeated by the Soul King and banished to the shadows. Now they have returned for revenge, invading the Soul Society with the greatest army ever assembled.',
    posterColor: 'linear-gradient(160deg, #050505 0%, #1a0a0a 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #0a0505 0%, #1a0a1a 50%, #09090B 100%)',
    accentColor: '#EC4899',
    genres: ['Action', 'Adventure', 'Supernatural'],
    tags: ['Soul Reapers', 'Spirits', 'Swords', 'War'],
    rating: 9.0,
    episodes: 13,
    currentEpisode: 13,
    status: 'Airing',
    studio: 'Pierrot',
    producer: 'TV Tokyo',
    year: 2024,
    season: 'Summer',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 94,
    aired: 'Jul 11, 2022 – Ongoing',
    score: 8.9,
    isNew: true,
    characters: [
      { id: 'b1', name: 'Ichigo Kurosaki', nameJp: '黒崎一護', role: 'Main', color: 'linear-gradient(135deg, #1a0a0a, #050505)' },
    ],
    relations: [],
  },
  {
    id: 'spy-x-family',
    title: 'Spy x Family',
    titleJp: 'スパイファミリー',
    synopsis: 'A spy on an undercover mission must find a wife and adopt a child within a week. Little does he know that the girl he adopts is a telepath, and the woman he marries is a deadly assassin. They form a fake family while each harboring a secret.',
    posterColor: 'linear-gradient(160deg, #1a1a05 0%, #2a2a0a 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #1a1a08 0%, #2a2a10 50%, #09090B 100%)',
    accentColor: '#F59E0B',
    genres: ['Action', 'Comedy', 'Romance'],
    tags: ['Spies', 'Family', 'Fake Marriage', 'Cute'],
    rating: 8.4,
    episodes: 25,
    currentEpisode: 25,
    status: 'Airing',
    studio: 'Wit Studio',
    producer: 'Shueisha',
    year: 2022,
    season: 'Spring',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 91,
    aired: 'Apr 9, 2022 – Ongoing',
    score: 8.1,
    characters: [
      { id: 'sx1', name: 'Loid Forger', nameJp: 'ロイド・フォージャー', role: 'Main', color: 'linear-gradient(135deg, #1a1a2a, #09090B)' },
    ],
    relations: [],
  },
  {
    id: 'one-piece',
    title: 'One Piece: Egghead Arc',
    titleJp: 'ワンピース エッグヘッド編',
    synopsis: 'The Straw Hat Pirates arrive on Egghead Island, a futuristic island 500 years in the future, and meet the legendary scientist Dr. Vegapunk. An encounter that will shake the foundations of the world begins here.',
    posterColor: 'linear-gradient(160deg, #051520 0%, #0a2a3d 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #051520 0%, #0a2a3d 50%, #09090B 100%)',
    accentColor: '#F97316',
    genres: ['Action', 'Adventure', 'Comedy'],
    tags: ['Pirates', 'Treasure', 'Devil Fruits', 'Crew'],
    rating: 8.9,
    episodes: 1122,
    currentEpisode: 1089,
    status: 'Airing',
    studio: 'Toei Animation',
    producer: 'Fuji TV',
    year: 1999,
    season: 'Fall',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 99,
    aired: 'Oct 20, 1999 – Ongoing',
    score: 8.7,
    isNew: true,
    characters: [
      { id: 'op1', name: 'Monkey D. Luffy', nameJp: 'モンキー・D・ルフィ', role: 'Main', color: 'linear-gradient(135deg, #3a0a0a, #1a0505)' },
    ],
    relations: [],
  },
  {
    id: 'fullmetal-alchemist',
    title: 'Fullmetal Alchemist: Brotherhood',
    titleJp: '鋼の錬金術師 BROTHERHOOD',
    synopsis: 'Two brothers search for a Philosopher\'s Stone after an attempt to revive their deceased mother goes wrong and leaves them in damaged physical forms. The elder brother, Edward, becomes a state alchemist to fund their journey.',
    posterColor: 'linear-gradient(160deg, #1a0f05 0%, #2a1a08 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #1a0f05 0%, #2a1a08 50%, #09090B 100%)',
    accentColor: '#F59E0B',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    tags: ['Alchemy', 'Sacrifice', 'Brothers', 'Military'],
    rating: 9.7,
    episodes: 64,
    currentEpisode: 64,
    status: 'Completed',
    studio: 'Bones',
    producer: 'Aniplex',
    year: 2009,
    season: 'Spring',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 97,
    aired: 'Apr 5, 2009 – Jul 4, 2010',
    score: 9.1,
    characters: [
      { id: 'fma1', name: 'Edward Elric', nameJp: 'エドワード・エルリック', role: 'Main', color: 'linear-gradient(135deg, #2a1a08, #1a0f05)' },
    ],
    relations: [],
  },
  {
    id: 'steinsgate',
    title: 'Steins;Gate',
    titleJp: 'シュタインズ・ゲート',
    synopsis: 'A self-proclaimed mad scientist discovers a way to send text messages to the past, creating a device that can alter the course of history. But with great power comes great responsibility—and catastrophic consequences.',
    posterColor: 'linear-gradient(160deg, #051a1a 0%, #0a2a2a 35%, #09090B 100%)',
    heroBg: 'linear-gradient(135deg, #051a1a 0%, #0a2a2a 50%, #09090B 100%)',
    accentColor: '#06B6D4',
    genres: ['Drama', 'Mystery', 'Sci-Fi'],
    tags: ['Time Travel', 'Science', 'Thriller', 'Romance'],
    rating: 9.5,
    episodes: 24,
    currentEpisode: 24,
    status: 'Completed',
    studio: 'White Fox',
    producer: 'Frontier Works',
    year: 2011,
    season: 'Spring',
    type: 'TV',
    duration: '24 min',
    language: 'Both',
    popularity: 93,
    aired: 'Apr 6, 2011 – Sep 14, 2011',
    score: 9.1,
    characters: [
      { id: 'sg1', name: 'Rintaro Okabe', nameJp: '岡部倫太郎', role: 'Main', color: 'linear-gradient(135deg, #0a2a2a, #051a1a)' },
    ],
    relations: [],
  },
]

export const heroAnime = animeList.slice(0, 5)

export const trendingAnime = [...animeList].sort((a, b) => b.popularity - a.popularity).slice(0, 10)

export const recentlyUpdated = animeList.filter(a => a.status === 'Airing' || a.isNew).slice(0, 12)

export const popularThisWeek = [...animeList].sort((a, b) => b.rating - a.rating).slice(0, 8)

export const topRated = [...animeList].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8)

export const continueWatching = [
  { ...animeList[0], watchProgress: 72, watchedEpisode: 18, remainingMin: 11 },
  { ...animeList[2], watchProgress: 45, watchedEpisode: 10, remainingMin: 14 },
  { ...animeList[3], watchProgress: 30, watchedEpisode: 8, remainingMin: 17 },
  { ...animeList[7], watchProgress: 88, watchedEpisode: 21, remainingMin: 3 },
  { ...animeList[5], watchProgress: 60, watchedEpisode: 7, remainingMin: 10 },
]

export const upcomingAnime = [
  {
    id: 'upcoming-1',
    title: 'Jujutsu Kaisen Season 3',
    titleJp: '呪術廻戦 第3期',
    color: 'linear-gradient(135deg, #1a0a3d, #09090B)',
    accentColor: '#6D3BFF',
    releaseDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    genres: ['Action', 'Fantasy', 'Supernatural'],
  },
  {
    id: 'upcoming-2',
    title: 'Assassination Classroom: Revisited',
    titleJp: 'Ansatsu Kyoushitsu: Revisited',
    color: 'linear-gradient(135deg, #1a2a1a, #09090B)',
    accentColor: '#22C55E',
    releaseDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    genres: ['Action', 'Comedy', 'School'],
  },
  {
    id: 'upcoming-3',
    title: 'Solo Leveling Season 2',
    titleJp: '俺だけレベルアップな件 Season 2',
    color: 'linear-gradient(135deg, #030d1a, #09090B)',
    accentColor: '#4A8DFF',
    releaseDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
    genres: ['Action', 'Adventure', 'Fantasy'],
  },
  {
    id: 'upcoming-4',
    title: 'Danmachi Season 5',
    titleJp: 'ダンまち Season 5',
    color: 'linear-gradient(135deg, #1a1505, #09090B)',
    accentColor: '#F59E0B',
    releaseDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
    genres: ['Action', 'Fantasy', 'Adventure'],
  },
]

export const generateEpisodes = (anime: Anime): Episode[] => {
  return Array.from({ length: anime.currentEpisode }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1}`,
    duration: anime.duration,
    thumbnail: anime.posterColor,
    aired: `${anime.year}-${String(Math.floor(i / 4) + 1).padStart(2, '0')}-${String((i % 4) * 7 + 1).padStart(2, '0')}`,
    isFiller: false,
  }))
}

export const seasonalAnime = {
  Spring: animeList.filter(a => a.season === 'Spring'),
  Summer: animeList.filter(a => a.season === 'Summer'),
  Fall: animeList.filter(a => a.season === 'Fall'),
  Winter: animeList.filter(a => a.season === 'Winter'),
}

export const weekSchedule = {
  Monday: [animeList[2], animeList[7]],
  Tuesday: [animeList[4]],
  Wednesday: [animeList[0], animeList[9]],
  Thursday: [animeList[3]],
  Friday: [animeList[1], animeList[5]],
  Saturday: [animeList[6], animeList[8]],
  Sunday: [animeList[10], animeList[11]],
}

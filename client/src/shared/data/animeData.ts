export type AnimeType = 'TV' | 'Movie' | 'OVA' | 'ONA'
export type AnimeSource = 'Manga' | 'Light Novel' | 'Original' | 'Visual Novel' | 'Web Manga'
export type ContentRating = 'PG-13' | 'R-17+' | 'PG' | 'G'

export interface Anime {
  id: number
  title: string
  titleJp: string
  synopsis: string
  genres: string[]
  tags: string[]
  rating: number
  malScore: number
  popularity: number
  membersK: number
  studio: string
  producer: string
  year: number
  episodes: number
  status: 'Airing' | 'Completed' | 'Upcoming'
  duration: string
  poster: string
  banner: string
  type: AnimeType
  source: AnimeSource
  contentRating: ContentRating
  season: 'Winter' | 'Spring' | 'Summer' | 'Fall'
  isNew?: boolean
  isDub?: boolean
  trailerKey?: string
  characters: Character[]
  staff: StaffMember[]
  episodeTitles: string[]
  relations: { type: string; animeId: number }[]
  streamLocked?: boolean
  playerUrl?: string | null
  gumletUrl?: string
  gumletAssetId?: string
  streamStatus?: 'healthy' | 'broken' | 'unverified' | 'pending' | 'locked'
  streamSources?: Record<
    number,
    {
      playerUrl?: string
      embedUrl?: string
      gumletUrl?: string
      gumletAssetId?: string
      streamStatus?: 'healthy' | 'broken' | 'unverified' | 'pending' | 'locked'
      errorMessage?: string | null
      subtitleTracks?: { label: string; src: string; srclang: string; default?: boolean }[]
    }
  >
}

export interface Character {
  name: string
  role: 'Main' | 'Supporting' | 'Antagonist'
  va: string
  vaImg?: string
}

export interface StaffMember {
  name: string
  role: string
}

const IMG = {
  h0: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001?w=1920&h=1080&fit=crop&auto=format',
  h1: 'https://images.unsplash.com/photo-1697316310004-0c967818073e?w=1920&h=1080&fit=crop&auto=format',
  h2: 'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&h=1080&fit=crop&auto=format',
  h3: 'https://images.unsplash.com/photo-1705510144116-cc4d88838b14?w=1920&h=1080&fit=crop&auto=format',
  h4: 'https://images.unsplash.com/photo-1711319551836-f7ca9764a898?w=1920&h=1080&fit=crop&auto=format',
  h5: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=1920&h=1080&fit=crop&auto=format',
  h6: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&h=1080&fit=crop&auto=format',
  h7: 'https://images.unsplash.com/photo-1732113131579-1f67afb5b8fb?w=1920&h=1080&fit=crop&auto=format',
}

function ep(n: number, titles: string[]): string[] {
  return Array.from({ length: n }, (_, i) => titles[i] ?? `Episode ${i + 1}`)
}

export const animeData: Anime[] = [
  {
    id: 1, title: 'Void Chronicle: Reborn', titleJp: 'ヴォイド・クロニクル：リボーン',
    synopsis: 'After dying at the hands of a corrupt god, Kaito Shiro awakens in a world between worlds — a fractured dimension where ancient spirits wage eternal war. Armed with the power to absorb the abilities of the fallen, he must navigate treacherous alliances and uncover the truth behind the Void before it consumes all creation. Each ally brings secrets darker than the last, and every victory costs a piece of his humanity.',
    genres: ['Action', 'Fantasy', 'Isekai'], tags: ['OP Protagonist', 'Dark Fantasy', 'Spirit World', 'Revenge'],
    rating: 9.2, malScore: 9.1, popularity: 3, membersK: 1842,
    studio: 'Trigger', producer: 'Aniplex', year: 2024, episodes: 24,
    status: 'Airing', duration: '24 min', type: 'TV', source: 'Light Novel', contentRating: 'R-17+', season: 'Winter',
    poster: IMG.h0, banner: IMG.h0, isNew: true,
    characters: [
      { name: 'Kaito Shiro', role: 'Main', va: 'Yuuki Kaji' },
      { name: 'Aria Vesper', role: 'Main', va: 'Ai Kayano' },
      { name: 'Lord Varath', role: 'Antagonist', va: 'Tomokazu Sugita' },
      { name: 'Nyx', role: 'Supporting', va: 'Saori Hayami' },
      { name: 'Commander Drel', role: 'Supporting', va: 'Daisuke Namikawa' },
      { name: 'Seraphine', role: 'Supporting', va: 'Yui Ishikawa' },
    ],
    staff: [
      { name: 'Hiroshi Tanaka', role: 'Director' }, { name: 'Kenji Watanabe', role: 'Series Composition' },
      { name: 'Yuki Sato', role: 'Character Design' }, { name: 'Rei Yamamoto', role: 'Music' },
    ],
    episodeTitles: ep(24, ['The Awakening', 'Into the Void', 'First Alliance', 'The Price of Power', 'Shattered Memories', 'Betrayal at Dawn', 'The Cost', 'Convergence', 'Breaking Point', 'Ascension Denied', 'New World Order', 'Fractured Bonds', 'The Forgotten God', 'Echoes of War', 'Eye of the Storm', 'The Reckoning', 'Blood and Shadow', 'Unshackled', 'The Final Pact', 'Void Rising', 'Sacrifice', 'Last Stand', 'Reborn in Fire', 'The World Anew']),
    relations: [{ type: 'Side Story', animeId: 6 }],
  },
  {
    id: 2, title: 'Celestial Blades', titleJp: 'セレスティアル・ブレード',
    synopsis: 'Seven divine swords were scattered across the mortal realm after the gods fell silent. Only the last scion of the Celestial Clan can reclaim them — but each blade demands a price paid in memory. As she claims each sword, Lena loses pieces of who she was, forcing her to question whether victory is worth the cost of becoming a stranger to herself.',
    genres: ['Action', 'Supernatural', 'Mystery'], tags: ['Sword Fighting', 'Memory Loss', 'Divine Power', 'Quest'],
    rating: 8.8, malScore: 8.7, popularity: 11, membersK: 934,
    studio: 'Wit Studio', producer: 'Production IG', year: 2024, episodes: 13,
    status: 'Completed', duration: '23 min', type: 'TV', source: 'Manga', contentRating: 'PG-13', season: 'Spring',
    poster: IMG.h1, banner: IMG.h1, isDub: true,
    characters: [
      { name: 'Lena Solstice', role: 'Main', va: 'Kana Hanazawa' },
      { name: 'Oryn Dusk', role: 'Main', va: 'Hiroshi Kamiya' },
      { name: 'The Nameless', role: 'Antagonist', va: 'Junichi Suwabe' },
      { name: 'Elder Vorath', role: 'Supporting', va: 'Akira Ishida' },
    ],
    staff: [{ name: 'Aoi Yamada', role: 'Director' }, { name: 'Sho Tanaka', role: 'Character Design' }, { name: 'Mika Rei', role: 'Music' }, { name: 'Jiro Kato', role: 'Series Composition' }],
    episodeTitles: ep(13, ['First Blade', 'Edge of Memory', 'The Second Seal', 'Lost in Steel', 'Twilight Arc', 'The Third Awakening', 'Hollow Crown', 'Fracture', 'The Penultimate Sword', 'What Remains', 'Full Circle', 'The Seventh Blade', 'Celestial End']),
    relations: [{ type: 'Prequel', animeId: 8 }],
  },
  {
    id: 3, title: 'Aurora Protocol', titleJp: 'オーロラ・プロトコル',
    synopsis: 'In 2147, a global blackout erases all digital memory. A team of neural-linked hackers must reconstruct civilization from fragments stored in the last surviving AI — before hostile actors find it first. Racing against both time and a shadowy cabal, the team discovers the blackout was no accident — it was a designed reset.',
    genres: ['Sci-Fi', 'Psychological', 'Thriller'], tags: ['Cyberpunk', 'AI', 'Hacking', 'Dystopia'],
    rating: 9.0, malScore: 8.9, popularity: 7, membersK: 1203,
    studio: 'Production I.G', producer: 'Bandai Namco', year: 2024, episodes: 26,
    status: 'Airing', duration: '25 min', type: 'TV', source: 'Original', contentRating: 'R-17+', season: 'Summer',
    poster: IMG.h2, banner: IMG.h2, isNew: true,
    characters: [
      { name: 'Sera Voss', role: 'Main', va: 'Rie Takahashi' },
      { name: 'Daemon', role: 'Main', va: 'Yoshitsugu Matsuoka' },
      { name: 'Zero', role: 'Antagonist', va: 'Mamoru Miyano' },
      { name: 'Echo', role: 'Supporting', va: 'Inori Minase' },
    ],
    staff: [{ name: 'Makoto Shinkai', role: 'Series Director' }, { name: 'Ryota Nishi', role: 'Script' }, { name: 'Aya Kono', role: 'Character Design' }, { name: 'Hiroyuki Sawano', role: 'Music' }],
    episodeTitles: ep(26, ['Blackout', 'Ghost Data', 'The Last Node', 'Neural Link', 'Fractured City', 'Protocol Zero', 'Ghost in the Wire', 'The Cabal', 'Memory Leak', 'Signal', 'Reboot', 'The Archive', 'Dead Drop', 'Firewall', 'Overload', 'The Endgame', 'Compromised', 'Failsafe', 'Last Byte', 'The Purge', 'Reckoning', 'System Restore', 'Final Protocol', 'Remnants', 'The New Grid', 'Aurora']),
    relations: [],
  },
  {
    id: 4, title: 'Silhouette Garden', titleJp: 'シルエット・ガーデン',
    synopsis: 'Yuki transfers to a prestigious art academy and discovers that the garden at its center exists in two timelines simultaneously. Every painting made inside it shapes the other world — and someone has been using this power to erase people from existence. A tender romance blooms against a backdrop of temporal mystery.',
    genres: ['Romance', 'Mystery', 'Slice of Life'], tags: ['Time Travel', 'Art', 'School', 'Slow Burn'],
    rating: 8.5, malScore: 8.4, popularity: 18, membersK: 612,
    studio: 'KyoAni', producer: 'Kadokawa', year: 2023, episodes: 12,
    status: 'Completed', duration: '22 min', type: 'TV', source: 'Manga', contentRating: 'PG', season: 'Fall',
    poster: IMG.h3, banner: IMG.h3,
    characters: [
      { name: 'Yuki Asano', role: 'Main', va: 'Reina Ueda' },
      { name: 'Ren Hoshino', role: 'Main', va: 'Natsuki Hanae' },
      { name: 'Sable', role: 'Antagonist', va: 'Satsumi Matsuda' },
    ],
    staff: [{ name: 'Naoko Yamada', role: 'Director' }, { name: 'Kana Imai', role: 'Character Design' }, { name: 'Yuki Hayashi', role: 'Music' }, { name: 'Reiko Hara', role: 'Script' }],
    episodeTitles: ep(12, ['The Transfer', 'The Garden', 'Two Worlds', 'Canvas of Fate', 'A Brushstroke', 'Lost to Time', 'What Was Painted', 'Erasure', 'The Gallery', 'Last Light', 'Final Canvas', 'Silhouette']),
    relations: [],
  },
  {
    id: 5, title: 'Iron Summit', titleJp: 'アイアン・サミット',
    synopsis: 'A disgraced general assembles a band of outcasts to defend the last free city against an empire powered by stolen ancient magic. Each battle tests not only their strength but their allegiance — and the general begins to suspect the city hired them to fail.',
    genres: ['Action', 'Military', 'Fantasy'], tags: ['War', 'Strategy', 'Dark Fantasy', 'Betrayal'],
    rating: 8.7, malScore: 8.6, popularity: 9, membersK: 1045,
    studio: 'Ufotable', producer: 'Shueisha', year: 2024, episodes: 24,
    status: 'Airing', duration: '24 min', type: 'TV', source: 'Light Novel', contentRating: 'R-17+', season: 'Winter',
    poster: IMG.h4, banner: IMG.h4, isDub: true, isNew: true,
    characters: [
      { name: 'General Kain', role: 'Main', va: 'Ryohei Kimura' },
      { name: 'Mira Ashveil', role: 'Main', va: 'M.A.O' },
      { name: 'Emperor Solrath', role: 'Antagonist', va: 'Sho Hayami' },
      { name: 'Vargas', role: 'Supporting', va: 'Tomokazu Seki' },
    ],
    staff: [{ name: 'Kou Matsuo', role: 'Director' }, { name: 'Takeshi Noda', role: 'Series Composition' }, { name: 'Go Shiina', role: 'Music' }, { name: 'Yuka Sato', role: 'Character Design' }],
    episodeTitles: ep(24, ['Fallen General', 'The Outcasts', 'Iron Wall', 'First Blood', 'Summit Under Siege', 'The Spy Within', 'Broken Chains', 'Siege Night', 'The Ancient Weapon', 'Betrayed', 'Counter Strike', 'The Price of War', 'Rally', 'The Final Charge', 'Ash and Steel', 'Victory at a Cost', 'Ruins', 'New Orders', 'The Long March', 'Enemy at the Gate', 'The Last Stand', 'Turning Tide', 'Iron Will', 'Summit']),
    relations: [],
  },
  {
    id: 6, title: 'Phantom Accord', titleJp: 'ファントム・アコード',
    synopsis: 'A musician with synesthesia hears the hidden feelings of spirits. Tasked by a secretive guild, she must resolve ancient grudges through the power of music before the spirit world overflows into the living — and before she loses her voice forever.',
    genres: ['Supernatural', 'Music', 'Drama'], tags: ['Spirits', 'Music', 'Melancholy', 'Coming of Age'],
    rating: 8.9, malScore: 8.8, popularity: 14, membersK: 778,
    studio: 'CloverWorks', producer: 'Avex', year: 2024, episodes: 13,
    status: 'Completed', duration: '23 min', type: 'TV', source: 'Manga', contentRating: 'PG-13', season: 'Spring',
    poster: IMG.h5, banner: IMG.h5,
    characters: [
      { name: 'Hana Kuroe', role: 'Main', va: 'Yui Ogura' },
      { name: 'Ryo Shiro', role: 'Supporting', va: 'Kouki Uchiyama' },
      { name: 'The Conductor', role: 'Antagonist', va: 'Unsho Ishizuka' },
    ],
    staff: [{ name: 'Akane Kubo', role: 'Director' }, { name: 'Taro Iwase', role: 'Script' }, { name: 'Evan Call', role: 'Music' }, { name: 'Yoko Nishi', role: 'Character Design' }],
    episodeTitles: ep(13, ['First Note', 'Spirit Song', 'The Grudge Keeper', 'Dissonance', 'Lost Chord', 'Resonance', 'The Old Melody', 'Silence', 'Overture', 'The Final Accord', 'Phantom', 'Last Performance', 'Encore']),
    relations: [{ type: 'Side Story', animeId: 1 }],
  },
  {
    id: 7, title: 'Neon Requiem', titleJp: 'ネオン・レクイエム',
    synopsis: 'In a dystopian megacity, a detective with perfect recall investigates a series of impossible murders — victims who were already dead. Each case peels back layers of a conspiracy spanning three generations of crime and cover-up that implicates the very government she works for.',
    genres: ['Mystery', 'Sci-Fi', 'Psychological'], tags: ['Neo-Noir', 'Detective', 'Conspiracy', 'Memory'],
    rating: 9.3, malScore: 9.2, popularity: 2, membersK: 2100,
    studio: 'MAPPA', producer: 'Dentsu', year: 2024, episodes: 12,
    status: 'Airing', duration: '24 min', type: 'TV', source: 'Original', contentRating: 'R-17+', season: 'Summer',
    poster: IMG.h6, banner: IMG.h6, isNew: true, isDub: true,
    characters: [
      { name: 'Rei Kuzan', role: 'Main', va: 'Rie Matsumoto' },
      { name: 'ARIA', role: 'Main', va: 'Ai Kayano' },
      { name: 'Commissioner Veld', role: 'Antagonist', va: 'Keiji Fujiwara' },
      { name: 'Yuki', role: 'Supporting', va: 'Yuichi Nakamura' },
    ],
    staff: [{ name: 'Masaaki Yuasa', role: 'Director' }, { name: 'Gen Urobuchi', role: 'Script' }, { name: 'Yoshihiro Ike', role: 'Music' }, { name: 'Nobuteru Yuuki', role: 'Character Design' }],
    episodeTitles: ep(12, ['The Dead Don\'t Stay Dead', 'Case Zero', 'Perfect Recall', 'The Third Victim', 'ARIA', 'Deep State', 'Memory Palace', 'The Commissioner', 'Confession', 'Three Generations', 'The Truth Burns', 'Requiem']),
    relations: [],
  },
  {
    id: 8, title: "Dragon's Meridian", titleJp: 'ドラゴンズ・メリディアン',
    synopsis: 'When the ancient Dragon Meridian — a mystical ley line — begins fracturing, three rival kingdoms must forge an alliance or face extinction as reality itself unravels. Ancient dragons awaken, choosing sides in a war that will determine whether the world reforms or dissolves into nothing.',
    genres: ['Fantasy', 'Action', 'Adventure'], tags: ['Dragons', 'Politics', 'War', 'Magic System'],
    rating: 8.6, malScore: 8.5, popularity: 13, membersK: 856,
    studio: 'Bones', producer: 'Aniplex', year: 2023, episodes: 25,
    status: 'Completed', duration: '24 min', type: 'TV', source: 'Light Novel', contentRating: 'PG-13', season: 'Fall',
    poster: IMG.h7, banner: IMG.h7,
    characters: [
      { name: 'Prince Alric', role: 'Main', va: 'Daisuke Ono' },
      { name: 'Zara', role: 'Main', va: 'Ami Koshimizu' },
      { name: 'The Dragon Emperor', role: 'Antagonist', va: 'Noriaki Sugiyama' },
    ],
    staff: [{ name: 'Tensai Okamura', role: 'Director' }, { name: 'Yuka Yamada', role: 'Script' }, { name: 'Kohei Tanaka', role: 'Music' }, { name: 'Atsushi Ikariya', role: 'Character Design' }],
    episodeTitles: ep(25, ['The First Fracture', 'Three Thrones', 'Meridian\'s Call', 'Fire and Steel', 'An Unlikely Alliance', 'The Ancient Pact', 'Dragon Wake', 'Kingdom at War', 'The Second Fracture', 'Betrayal of Crowns', 'Last Dragon', 'Meridian Rising', 'The Long War', 'Siege', 'Dragon\'s Oath', 'Unraveling', 'The Third Fracture', 'Fall of Kings', 'Dragon\'s Will', 'The Convergence', 'Earth and Sky', 'Meridian\'s End', 'New Alliance', 'The Restored World', 'Meridian']),
    relations: [{ type: 'Sequel', animeId: 2 }],
  },
  {
    id: 9, title: 'Starfall Academy', titleJp: 'スターフォール・アカデミー',
    synopsis: 'Students at the elite Starfall Academy compete for a single scholarship that grants access to the hidden cosmos — but the competition has been rigged for centuries. Mio uncovers the conspiracy while navigating first love and the cut-throat politics of the galaxy\'s most prestigious school.',
    genres: ['School', 'Sci-Fi', 'Comedy'], tags: ['Competition', 'Space', 'Friendship', 'Romance'],
    rating: 8.1, malScore: 8.0, popularity: 22, membersK: 490,
    studio: 'Sunrise', producer: 'Sunrise', year: 2024, episodes: 13,
    status: 'Airing', duration: '22 min', type: 'TV', source: 'Manga', contentRating: 'PG', season: 'Winter',
    poster: IMG.h0, banner: IMG.h0, isNew: true,
    characters: [
      { name: 'Mio Kasumi', role: 'Main', va: 'Aoi Yuki' },
      { name: 'Sora Hayate', role: 'Main', va: 'Kensho Ono' },
      { name: 'Director Vael', role: 'Antagonist', va: 'Shoichi Ikeda' },
    ],
    staff: [{ name: 'Shinji Takamatsu', role: 'Director' }, { name: 'Ayumu Hisao', role: 'Script' }, { name: 'Masaru Yokoyama', role: 'Music' }, { name: 'Chika Sato', role: 'Character Design' }],
    episodeTitles: ep(13, ['Entrance Exam', 'The Hidden Scholarship', 'First Contact', 'Rivals', 'The Conspiracy Begins', 'Cosmic Ladder', 'Midterms', 'Exposed', 'Alliance', 'Final Round', 'The Truth About Starfall', 'Cosmos Unlocked', 'Graduation']),
    relations: [],
  },
  {
    id: 10, title: 'Ashwood Chronicles', titleJp: 'アッシュウッド・クロニクルズ',
    synopsis: 'A traveling herbalist and a disenchanted knight form an unlikely partnership as they traverse a continent on the brink of a war orchestrated by an unseen hand. Their journey through dying kingdoms reveals that the true enemy has been hiding in plain sight for a thousand years.',
    genres: ['Historical', 'Adventure', 'Drama'], tags: ['Slow Burn', 'World Building', 'Conspiracy', 'Found Family'],
    rating: 8.4, malScore: 8.3, popularity: 17, membersK: 634,
    studio: 'PA Works', producer: 'Pony Canyon', year: 2023, episodes: 24,
    status: 'Completed', duration: '23 min', type: 'TV', source: 'Manga', contentRating: 'PG-13', season: 'Spring',
    poster: IMG.h1, banner: IMG.h1, isDub: true,
    characters: [
      { name: 'Elara Moss', role: 'Main', va: 'Haruka Tomatsu' },
      { name: 'Sir Aldric', role: 'Main', va: 'Tomokazu Sugita' },
      { name: 'The Archivist', role: 'Antagonist', va: 'Akira Ishida' },
    ],
    staff: [{ name: 'Shinya Kawamo', role: 'Director' }, { name: 'Yuki Sugiura', role: 'Script' }, { name: 'Kenji Ito', role: 'Music' }, { name: 'Nao Ootsu', role: 'Character Design' }],
    episodeTitles: ep(24, ['The Road East', 'Herbs and Steel', 'The First Kingdom', 'Ashwood', 'Rotten Roots', 'The Second Kingdom', 'Trail of Blood', 'Old War', 'The Third Kingdom', 'Conspirators', 'The Hidden Map', 'Ancient Roads', 'Ash and Dust', 'The Archivist', 'Revelation', 'Into the Enemy', 'Burning Ashwood', 'Last Journey', 'The Final Kingdom', 'Thousand Year Lie', 'The Reckoning', 'Fallen Roots', 'New Growth', 'Chronicles End']),
    relations: [],
  },
  {
    id: 11, title: 'Crimson Tide Protocol', titleJp: 'クリムゾン・タイド・プロトコル',
    synopsis: 'Deep-sea research team discovers a civilization living at the ocean floor — but first contact goes catastrophically wrong. Now hunted two miles below the surface with no escape route, the survivors must understand their pursuers before they are all silenced forever.',
    genres: ['Sci-Fi', 'Horror', 'Thriller'], tags: ['Deep Sea', 'Survival', 'First Contact', 'Claustrophobia'],
    rating: 8.7, malScore: 8.6, popularity: 10, membersK: 987,
    studio: 'Production I.G', producer: 'TMS', year: 2024, episodes: 12,
    status: 'Airing', duration: '25 min', type: 'TV', source: 'Original', contentRating: 'R-17+', season: 'Summer',
    poster: IMG.h2, banner: IMG.h2, isNew: true,
    characters: [
      { name: 'Dr. Nora Veld', role: 'Main', va: 'Megumi Han' },
      { name: 'Axel', role: 'Supporting', va: 'Takuya Eguchi' },
      { name: 'The Emissary', role: 'Antagonist', va: 'Miyuki Sawashiro' },
    ],
    staff: [{ name: 'Kouji Morimoto', role: 'Director' }, { name: 'Dai Satou', role: 'Script' }, { name: 'Ryuichi Sakamoto', role: 'Music' }, { name: 'Emi Kanzaki', role: 'Character Design' }],
    episodeTitles: ep(12, ['Descent', 'First Signal', 'The Deep City', 'Contact', 'Wrong Protocol', 'Hunted', 'Pressure', 'The Emissary', 'Two Miles Under', 'The Language of Fear', 'Final Transmission', 'Crimson Tide']),
    relations: [],
  },
  {
    id: 12, title: 'Moonfall Dance', titleJp: 'ムーンフォール・ダンス',
    synopsis: 'A retired ballet dancer finds purpose again when she becomes the reluctant guardian of a lunar spirit who needs to learn what it means to be human. Their unlikely bond teaches both of them that the most profound forms of beauty come from imperfection.',
    genres: ['Slice of Life', 'Supernatural', 'Romance'], tags: ['Dance', 'Spirit', 'Healing', 'Gentle'],
    rating: 8.3, malScore: 8.2, popularity: 20, membersK: 528,
    studio: 'KyoAni', producer: 'Lantis', year: 2024, episodes: 12,
    status: 'Completed', duration: '22 min', type: 'TV', source: 'Manga', contentRating: 'PG', season: 'Fall',
    poster: IMG.h3, banner: IMG.h3,
    characters: [
      { name: 'Akari Tsuki', role: 'Main', va: 'Kana Hanazawa' },
      { name: 'Luna', role: 'Main', va: 'Yoshino Nanjou' },
    ],
    staff: [{ name: 'Naoko Yamada', role: 'Director' }, { name: 'Reiko Yoshida', role: 'Script' }, { name: 'Manami Kiyota', role: 'Music' }, { name: 'Futoshi Nishiya', role: 'Character Design' }],
    episodeTitles: ep(12, ['The Last Curtain', 'Luna Falls', 'First Steps', 'Lessons in Human', 'The Stage Remembers', 'Moonlight Practice', 'What Breaks', 'The Imperfect Dance', 'Full Moon', 'Falling Together', 'Moonfall', 'Dance Eternal']),
    relations: [],
  },
  {
    id: 13, title: 'Revenant Code', titleJp: 'レヴェナント・コード',
    synopsis: 'A genius programmer is murdered and uploaded as code into the very surveillance system hunting her killer. Now she navigates the digital underworld of a near-future Tokyo, learning to exist without a body while dismantling the corruption that killed her.',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'], tags: ['Digital Existence', 'Revenge', 'Near Future', 'Hacking'],
    rating: 8.9, malScore: 8.8, popularity: 6, membersK: 1156,
    studio: 'MAPPA', producer: 'Dentsu', year: 2024, episodes: 13,
    status: 'Completed', duration: '24 min', type: 'TV', source: 'Original', contentRating: 'R-17+', season: 'Fall',
    poster: IMG.h4, banner: IMG.h4, isDub: true,
    characters: [
      { name: 'Hana Mori', role: 'Main', va: 'Rie Takahashi' },
      { name: 'Detective Kase', role: 'Supporting', va: 'Hiroshi Kamiya' },
      { name: 'CEO Nakamura', role: 'Antagonist', va: 'Noriaki Sugiyama' },
    ],
    staff: [{ name: 'Sayo Yamamoto', role: 'Director' }, { name: 'Dai Satou', role: 'Script' }, { name: 'Yutaka Yamada', role: 'Music' }, { name: 'Aya Takano', role: 'Character Design' }],
    episodeTitles: ep(13, ['Upload', 'Ghost in the Grid', 'The Killer\'s Signature', 'Digital Flesh', 'Surveillance', 'The Memory Cache', 'Deep Packet', 'Corporate Firewall', 'Root Access', 'Final Encryption', 'The Delete Command', 'Override', 'Revenant']),
    relations: [],
  },
  {
    id: 14, title: 'Blood Covenant', titleJp: 'ブラッド・コヴェナント',
    synopsis: 'Two rival vampire clans have maintained an uneasy peace through the Blood Covenant for five centuries. When the contract\'s enforcer is assassinated, the youngest heirs of each clan must work together to find the killer — and discover the covenant was built on a lie.',
    genres: ['Action', 'Horror', 'Romance'], tags: ['Vampires', 'Political Intrigue', 'Forbidden Romance', 'Dark Fantasy'],
    rating: 8.5, malScore: 8.4, popularity: 15, membersK: 724,
    studio: 'Ufotable', producer: 'Aniplex', year: 2024, episodes: 12,
    status: 'Upcoming', duration: '24 min', type: 'TV', source: 'Light Novel', contentRating: 'R-17+', season: 'Winter',
    poster: IMG.h5, banner: IMG.h5,
    characters: [
      { name: 'Raven Dusk', role: 'Main', va: 'Yuuki Kaji' },
      { name: 'Sera Nox', role: 'Main', va: 'Yui Ishikawa' },
      { name: 'The Covenant Killer', role: 'Antagonist', va: 'Takahiro Sakurai' },
    ],
    staff: [{ name: 'Hikaru Kondo', role: 'Director' }, { name: 'Ukyou Kodachi', role: 'Script' }, { name: 'Kenji Kawai', role: 'Music' }, { name: 'Emi Kanzaki', role: 'Character Design' }],
    episodeTitles: ep(12, ['The Old Pact', 'Assassination', 'Uneasy Alliance', 'Blood Trails', 'Five Centuries', 'The Lie Within', 'Forbidden', 'Covenant Broken', 'The Culprit', 'Blood and Truth', 'Sundering', 'New Covenant']),
    relations: [],
  },
  {
    id: 15, title: 'Fracture Point', titleJp: 'フラクチャー・ポイント',
    synopsis: 'A mathematical prodigy discovers that certain equations, when solved, cause physical reality to crack. She must solve the final equation before a shadowy organization uses it to rewrite the fundamental laws of existence — but every solution she tries destroys something she loves.',
    genres: ['Sci-Fi', 'Psychological', 'Drama'], tags: ['Mathematics', 'Reality Bending', 'Sacrifice', 'Hard Sci-Fi'],
    rating: 8.8, malScore: 8.7, popularity: 8, membersK: 1089,
    studio: 'Wit Studio', producer: 'Shueisha', year: 2024, episodes: 13,
    status: 'Airing', duration: '24 min', type: 'TV', source: 'Original', contentRating: 'PG-13', season: 'Fall',
    poster: IMG.h6, banner: IMG.h6, isNew: true,
    characters: [
      { name: 'Emi Kasai', role: 'Main', va: 'Aoi Yuki' },
      { name: 'Professor Ando', role: 'Supporting', va: 'Daisuke Namikawa' },
      { name: 'The Architect', role: 'Antagonist', va: 'Junichi Suwabe' },
    ],
    staff: [{ name: 'Masahiko Ohta', role: 'Director' }, { name: 'Mari Okada', role: 'Script' }, { name: 'Hiroyuki Sawano', role: 'Music' }, { name: 'Kengo Nishi', role: 'Character Design' }],
    episodeTitles: ep(13, ['The First Equation', 'Fracture', 'The Variable', 'Proof', 'Collapse', 'The Organization', 'Unknown Quantity', 'What Was Lost', 'Recalculation', 'The Final Variable', 'Reality Break', 'Solve for X', 'Fracture Point']),
    relations: [],
  },
  {
    id: 16, title: 'Eternal Spring', titleJp: 'エターナル・スプリング',
    synopsis: 'In a world where seasons have stopped changing, a young botanist goes on a quest to restore the cycle. She discovers that the last spring was deliberately frozen in place by a grieving god who wanted to preserve one perfect moment — and she must convince a deity to let go.',
    genres: ['Fantasy', 'Adventure', 'Drama'], tags: ['Nature', 'Gods', 'Grief', 'Journey'],
    rating: 8.2, malScore: 8.1, popularity: 25, membersK: 445,
    studio: 'PA Works', producer: 'Pony Canyon', year: 2023, episodes: 12,
    status: 'Completed', duration: '22 min', type: 'TV', source: 'Manga', contentRating: 'PG', season: 'Spring',
    poster: IMG.h7, banner: IMG.h7,
    characters: [
      { name: 'Saya', role: 'Main', va: 'Kana Ichinose' },
      { name: 'The Frozen God', role: 'Antagonist', va: 'Mamoru Miyano' },
    ],
    staff: [{ name: 'Toshiya Shinohara', role: 'Director' }, { name: 'Reiko Yoshida', role: 'Script' }, { name: 'Masaru Yokoyama', role: 'Music' }, { name: 'Chinatsu Kurahana', role: 'Character Design' }],
    episodeTitles: ep(12, ['Frozen Blossoms', 'The Botanist\'s Map', 'Endless Spring', 'God\'s Garden', 'What Was Preserved', 'The Last Memory', 'Speaking to Gods', 'Thaw', 'The Grief Inside', 'Letting Go', 'First Autumn', 'Eternal Spring']),
    relations: [],
  },
  {
    id: 17, title: 'Shadow Parliament', titleJp: 'シャドウ・パーラメント',
    synopsis: 'A political thriller set in a near-future democracy where an AI parliament has made human representatives obsolete. When one senator discovers the AI is being secretly controlled, she must dismantle the system from within — without anyone knowing she\'s trying.',
    genres: ['Psychological', 'Thriller', 'Sci-Fi'], tags: ['Politics', 'AI', 'Conspiracy', 'Near Future'],
    rating: 8.6, malScore: 8.5, popularity: 12, membersK: 892,
    studio: 'Production I.G', producer: 'NHK', year: 2024, episodes: 13,
    status: 'Completed', duration: '23 min', type: 'TV', source: 'Original', contentRating: 'PG-13', season: 'Winter',
    poster: IMG.h0, banner: IMG.h0, isDub: true,
    characters: [
      { name: 'Senator Imai', role: 'Main', va: 'Sayaka Ohara' },
      { name: 'ARIS', role: 'Antagonist', va: 'Ai Kayano' },
    ],
    staff: [{ name: 'Goro Taniguchi', role: 'Director' }, { name: 'Ichiro Okouchi', role: 'Script' }, { name: 'Kotaro Nakagawa', role: 'Music' }, { name: 'Akira Amano', role: 'Character Design' }],
    episodeTitles: ep(13, ['Session One', 'Digital Democracy', 'The Override', 'Committee of Shadows', 'Amendment', 'Inside the Machine', 'Veto', 'Filibuster', 'The Hidden Vote', 'Recess', 'Emergency Session', 'Article Zero', 'Shadow Parliament']),
    relations: [],
  },
  {
    id: 18, title: 'Wandering Spear', titleJp: 'ワンダリング・スピア',
    synopsis: 'An immortal warrior cursed to live until she finds someone worthy of her oath wanders a dying world, taking mercenary contracts to survive. After centuries of solitude, she encounters a child revolutionary who might finally be her reason to stop wandering.',
    genres: ['Action', 'Adventure', 'Fantasy'], tags: ['Immortality', 'Mercenary', 'Revolution', 'Found Family'],
    rating: 8.7, malScore: 8.6, popularity: 16, membersK: 698,
    studio: 'Bones', producer: 'Aniplex', year: 2023, episodes: 25,
    status: 'Completed', duration: '24 min', type: 'TV', source: 'Manga', contentRating: 'PG-13', season: 'Fall',
    poster: IMG.h1, banner: IMG.h1, isDub: true,
    characters: [
      { name: 'Ren', role: 'Main', va: 'Miyuki Sawashiro' },
      { name: 'Kai', role: 'Main', va: 'Ayumu Murase' },
    ],
    staff: [{ name: 'Kazuki Akane', role: 'Director' }, { name: 'Shoji Gatoh', role: 'Script' }, { name: 'Yoko Shimomura', role: 'Music' }, { name: 'Shingo Adachi', role: 'Character Design' }],
    episodeTitles: ep(25, ['The Wanderer', 'Century\'s Edge', 'Contract', 'The Child', 'Old Wars', 'The Revolution', 'Oath', 'Worth Living For', 'The Mercenary\'s Code', 'Fire and Faith', 'Old Wounds', 'The New Guard', 'Turning Point', 'Forward', 'The Battle at the Gate', 'Spear and Shield', 'What She Carries', 'The Oath Nears', 'Revolution\'s Cost', 'The Final Contract', 'Worthy', 'The Wandering Ends', 'New Road', 'Oath Fulfilled', 'Wandering Spear']),
    relations: [],
  },
]

export const heroAnime = animeData.filter(a => [1, 7, 3, 5, 11].includes(a.id))

export const continueWatchingData = animeData
  .filter(a => [1, 3, 7, 5].includes(a.id))
  .map(a => ({
    ...a,
    progress: ({ 1: 65, 3: 32, 7: 80, 5: 15 } as Record<number, number>)[a.id] ?? 50,
    currentEp: ({ 1: 14, 3: 8, 7: 10, 5: 3 } as Record<number, number>)[a.id] ?? 1,
  }))

export const scheduleData = [
  { day: 'Mon' as const, anime: animeData.filter(a => [1, 7].includes(a.id)), time: '17:00 JST' },
  { day: 'Tue' as const, anime: animeData.filter(a => [3].includes(a.id)), time: '23:00 JST' },
  { day: 'Wed' as const, anime: animeData.filter(a => [5, 11].includes(a.id)), time: '15:30 JST' },
  { day: 'Thu' as const, anime: animeData.filter(a => [9].includes(a.id)), time: '22:00 JST' },
  { day: 'Fri' as const, anime: animeData.filter(a => [2, 6].includes(a.id)), time: '18:00 JST' },
  { day: 'Sat' as const, anime: animeData.filter(a => [4, 12].includes(a.id)), time: '12:00 JST' },
  { day: 'Sun' as const, anime: animeData.filter(a => [8, 10].includes(a.id)), time: '20:00 JST' },
]

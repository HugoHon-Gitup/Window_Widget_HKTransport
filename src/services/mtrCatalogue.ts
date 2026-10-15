export interface MTRStation {
  code: string;
  nameEN: string;
  nameTC: string;
}

export interface MTRDirection {
  code: 'UP' | 'DOWN';
  destinationEN: string;
  destinationTC: string;
  branchTermini?: MTRStation[];
}

export interface MTRLine {
  code: string;
  nameEN: string;
  nameTC: string;
  stations: MTRStation[];
  directions: MTRDirection[];
}

export const MTR_LINES: MTRLine[] = [
  // 1. Island Line
  {
    code: 'ISL',
    nameEN: 'Island Line',
    nameTC: '港島綫',
    stations: [
      { code: 'KET', nameEN: 'Kennedy Town', nameTC: '堅尼地城' },
      { code: 'HKU', nameEN: 'HKU', nameTC: '香港大學' },
      { code: 'SYP', nameEN: 'Sai Ying Pun', nameTC: '西營盤' },
      { code: 'SHW', nameEN: 'Sheung Wan', nameTC: '上環' },
      { code: 'CEN', nameEN: 'Central', nameTC: '中環' },
      { code: 'ADM', nameEN: 'Admiralty', nameTC: '金鐘' },
      { code: 'WAC', nameEN: 'Wan Chai', nameTC: '灣仔' },
      { code: 'CAB', nameEN: 'Causeway Bay', nameTC: '銅鑼灣' },
      { code: 'TIH', nameEN: 'Tin Hau', nameTC: '天后' },
      { code: 'FOH', nameEN: 'Fortress Hill', nameTC: '炮台山' },
      { code: 'NOP', nameEN: 'North Point', nameTC: '北角' },
      { code: 'QUB', nameEN: 'Quarry Bay', nameTC: '鰂魚涌' },
      { code: 'TAK', nameEN: 'Tai Koo', nameTC: '太古' },
      { code: 'SWH', nameEN: 'Sai Wan Ho', nameTC: '西灣河' },
      { code: 'SKW', nameEN: 'Shau Kei Wan', nameTC: '筲箕灣' },
      { code: 'HFC', nameEN: 'Heng Fa Chuen', nameTC: '杏花邨' },
      { code: 'CHW', nameEN: 'Chai Wan', nameTC: '柴灣' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'Chai Wan', destinationTC: '柴灣' },
      { code: 'DOWN', destinationEN: 'Kennedy Town', destinationTC: '堅尼地城' },
    ],
  },

  // 2. Tsuen Wan Line
  {
    code: 'TWL',
    nameEN: 'Tsuen Wan Line',
    nameTC: '荃灣綫',
    stations: [
      { code: 'CEN', nameEN: 'Central', nameTC: '中環' },
      { code: 'ADM', nameEN: 'Admiralty', nameTC: '金鐘' },
      { code: 'TST', nameEN: 'Tsim Sha Tsui', nameTC: '尖沙咀' },
      { code: 'JOR', nameEN: 'Jordan', nameTC: '佐敦' },
      { code: 'YMT', nameEN: 'Yau Ma Tei', nameTC: '油麻地' },
      { code: 'MOK', nameEN: 'Mong Kok', nameTC: '旺角' },
      { code: 'PRE', nameEN: 'Prince Edward', nameTC: '太子' },
      { code: 'SSP', nameEN: 'Sham Shui Po', nameTC: '深水埗' },
      { code: 'CSW', nameEN: 'Cheung Sha Wan', nameTC: '長沙灣' },
      { code: 'LCK', nameEN: 'Lai Chi Kok', nameTC: '茘枝角' },
      { code: 'MEF', nameEN: 'Mei Foo', nameTC: '美孚' },
      { code: 'LAK', nameEN: 'Lai King', nameTC: '茘景' },
      { code: 'KWF', nameEN: 'Kwai Fong', nameTC: '葵芳' },
      { code: 'KWH', nameEN: 'Kwai Hing', nameTC: '葵興' },
      { code: 'TWH', nameEN: 'Tai Wo Hau', nameTC: '大窩口' },
      { code: 'TSW', nameEN: 'Tsuen Wan', nameTC: '荃灣' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'Tsuen Wan', destinationTC: '荃灣' },
      { code: 'DOWN', destinationEN: 'Central', destinationTC: '中環' },
    ],
  },

  // 3. Kwun Tong Line
  {
    code: 'KTL',
    nameEN: 'Kwun Tong Line',
    nameTC: '觀塘綫',
    stations: [
      { code: 'WHA', nameEN: 'Whampoa', nameTC: '黃埔' },
      { code: 'HOM', nameEN: 'Ho Man Tin', nameTC: '何文田' },
      { code: 'YMT', nameEN: 'Yau Ma Tei', nameTC: '油麻地' },
      { code: 'MOK', nameEN: 'Mong Kok', nameTC: '旺角' },
      { code: 'PRE', nameEN: 'Prince Edward', nameTC: '太子' },
      { code: 'SKM', nameEN: 'Shek Kip Mei', nameTC: '石硤尾' },
      { code: 'KOT', nameEN: 'Kowloon Tong', nameTC: '九龍塘' },
      { code: 'LOF', nameEN: 'Lok Fu', nameTC: '樂富' },
      { code: 'WTS', nameEN: 'Wong Tai Sin', nameTC: '黃大仙' },
      { code: 'DIH', nameEN: 'Diamond Hill', nameTC: '鑽石山' },
      { code: 'CHH', nameEN: 'Choi Hung', nameTC: '彩虹' },
      { code: 'KOB', nameEN: 'Kowloon Bay', nameTC: '九龍灣' },
      { code: 'NTK', nameEN: 'Ngau Tau Kok', nameTC: '牛頭角' },
      { code: 'KWT', nameEN: 'Kwun Tong', nameTC: '觀塘' },
      { code: 'LAT', nameEN: 'Lam Tin', nameTC: '藍田' },
      { code: 'YAT', nameEN: 'Yau Tong', nameTC: '油塘' },
      { code: 'TIK', nameEN: 'Tiu Keng Leng', nameTC: '調景嶺' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'Tiu Keng Leng', destinationTC: '調景嶺' },
      { code: 'DOWN', destinationEN: 'Whampoa', destinationTC: '黃埔' },
    ],
  },

  // 4. Tseung Kwan O Line (Branching UP: Po Lam & LOHAS Park)
  {
    code: 'TKL',
    nameEN: 'Tseung Kwan O Line',
    nameTC: '將軍澳綫',
    stations: [
      { code: 'NOP', nameEN: 'North Point', nameTC: '北角' },
      { code: 'QUB', nameEN: 'Quarry Bay', nameTC: '鰂魚涌' },
      { code: 'YAT', nameEN: 'Yau Tong', nameTC: '油塘' },
      { code: 'TIK', nameEN: 'Tiu Keng Leng', nameTC: '調景嶺' },
      { code: 'TKO', nameEN: 'Tseung Kwan O', nameTC: '將軍澳' },
      { code: 'HAH', nameEN: 'Hang Hau', nameTC: '坑口' },
      { code: 'POA', nameEN: 'Po Lam', nameTC: '寶琳' },
      { code: 'LHP', nameEN: 'LOHAS Park', nameTC: '康城' },
    ],
    directions: [
      {
        code: 'UP',
        destinationEN: 'Po Lam / LOHAS Park',
        destinationTC: '寶琳 / 康城',
        branchTermini: [
          { code: 'POA', nameEN: 'Po Lam', nameTC: '寶琳' },
          { code: 'LHP', nameEN: 'LOHAS Park', nameTC: '康城' },
        ],
      },
      { code: 'DOWN', destinationEN: 'North Point', destinationTC: '北角' },
    ],
  },

  // 5. East Rail Line (Branching UP: Lo Wu & Lok Ma Chau)
  {
    code: 'EAL',
    nameEN: 'East Rail Line',
    nameTC: '東鐵綫',
    stations: [
      { code: 'ADM', nameEN: 'Admiralty', nameTC: '金鐘' },
      { code: 'EXC', nameEN: 'Exhibition Centre', nameTC: '會展' },
      { code: 'HUH', nameEN: 'Hung Hom', nameTC: '紅磡' },
      { code: 'MKK', nameEN: 'Mong Kok East', nameTC: '旺角東' },
      { code: 'KOT', nameEN: 'Kowloon Tong', nameTC: '九龍塘' },
      { code: 'TAW', nameEN: 'Tai Wai', nameTC: '大圍' },
      { code: 'SHT', nameEN: 'Sha Tin', nameTC: '沙田' },
      { code: 'FOT', nameEN: 'Fo Tan', nameTC: '火炭' },
      { code: 'RAC', nameEN: 'Racecourse', nameTC: '馬場' },
      { code: 'UNI', nameEN: 'University', nameTC: '大學' },
      { code: 'TAP', nameEN: 'Tai Po Market', nameTC: '大埔墟' },
      { code: 'TWO', nameEN: 'Tai Wo', nameTC: '太和' },
      { code: 'FAN', nameEN: 'Fanling', nameTC: '粉嶺' },
      { code: 'SHS', nameEN: 'Sheung Shui', nameTC: '上水' },
      { code: 'LOW', nameEN: 'Lo Wu', nameTC: '羅湖' },
      { code: 'LMC', nameEN: 'Lok Ma Chau', nameTC: '落馬洲' },
    ],
    directions: [
      {
        code: 'UP',
        destinationEN: 'Lo Wu / Lok Ma Chau',
        destinationTC: '羅湖 / 落馬洲',
        branchTermini: [
          { code: 'LOW', nameEN: 'Lo Wu', nameTC: '羅湖' },
          { code: 'LMC', nameEN: 'Lok Ma Chau', nameTC: '落馬洲' },
          { code: 'SHS', nameEN: 'Sheung Shui', nameTC: '上水' },
          { code: 'TAP', nameEN: 'Tai Po Market', nameTC: '大埔墟' },
          { code: 'FOT', nameEN: 'Fo Tan', nameTC: '火炭' },
        ],
      },
      { code: 'DOWN', destinationEN: 'Admiralty', destinationTC: '金鐘' },
    ],
  },

  // 6. Tuen Ma Line
  {
    code: 'TML',
    nameEN: 'Tuen Ma Line',
    nameTC: '屯馬綫',
    stations: [
      { code: 'WKS', nameEN: 'Wu Kai Sha', nameTC: '烏溪沙' },
      { code: 'MOS', nameEN: 'Ma On Shan', nameTC: '馬鞍山' },
      { code: 'HEO', nameEN: 'Heng On', nameTC: '恆安' },
      { code: 'TSH', nameEN: 'Tai Shui Hang', nameTC: '大水坑' },
      { code: 'SHM', nameEN: 'Shek Mun', nameTC: '石門' },
      { code: 'CIO', nameEN: 'City One', nameTC: '第一城' },
      { code: 'STW', nameEN: 'Sha Tin Wai', nameTC: '沙田圍' },
      { code: 'CKT', nameEN: 'Che Kung Temple', nameTC: '車公廟' },
      { code: 'TAW', nameEN: 'Tai Wai', nameTC: '大圍' },
      { code: 'HXD', nameEN: 'Hin Keng', nameTC: '顯徑' },
      { code: 'DIH', nameEN: 'Diamond Hill', nameTC: '鑽石山' },
      { code: 'KAT', nameEN: 'Kai Tak', nameTC: '啟德' },
      { code: 'SUW', nameEN: 'Sung Wong Toi', nameTC: '宋皇臺' },
      { code: 'TKW', nameEN: 'To Kwa Wan', nameTC: '土瓜灣' },
      { code: 'HOM', nameEN: 'Ho Man Tin', nameTC: '何文田' },
      { code: 'HUH', nameEN: 'Hung Hom', nameTC: '紅磡' },
      { code: 'ETS', nameEN: 'East Tsim Sha Tsui', nameTC: '尖東' },
      { code: 'AUS', nameEN: 'Austin', nameTC: '柯士甸' },
      { code: 'NAC', nameEN: 'Nam Cheong', nameTC: '南昌' },
      { code: 'MEF', nameEN: 'Mei Foo', nameTC: '美孚' },
      { code: 'TWW', nameEN: 'Tsuen Wan West', nameTC: '荃灣西' },
      { code: 'KSR', nameEN: 'Kam Sheung Road', nameTC: '錦上路' },
      { code: 'YUL', nameEN: 'Yuen Long', nameTC: '元朗' },
      { code: 'LOP', nameEN: 'Long Ping', nameTC: '朗屏' },
      { code: 'TIS', nameEN: 'Tin Shui Wai', nameTC: '天水圍' },
      { code: 'SIH', nameEN: 'Siu Hong', nameTC: '兆康' },
      { code: 'TUM', nameEN: 'Tuen Mun', nameTC: '屯門' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'Tuen Mun', destinationTC: '屯門' },
      { code: 'DOWN', destinationEN: 'Wu Kai Sha', destinationTC: '烏溪沙' },
    ],
  },

  // 7. Tung Chung Line
  {
    code: 'TCL',
    nameEN: 'Tung Chung Line',
    nameTC: '東涌綫',
    stations: [
      { code: 'HOK', nameEN: 'Hong Kong', nameTC: '香港' },
      { code: 'KOW', nameEN: 'Kowloon', nameTC: '九龍' },
      { code: 'OLY', nameEN: 'Olympic', nameTC: '奧運' },
      { code: 'NAC', nameEN: 'Nam Cheong', nameTC: '南昌' },
      { code: 'LAK', nameEN: 'Lai King', nameTC: '茘景' },
      { code: 'TSY', nameEN: 'Tsing Yi', nameTC: '青衣' },
      { code: 'SUN', nameEN: 'Sunny Bay', nameTC: '欣澳' },
      { code: 'TUC', nameEN: 'Tung Chung', nameTC: '東涌' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'Tung Chung', destinationTC: '東涌' },
      { code: 'DOWN', destinationEN: 'Hong Kong', destinationTC: '香港' },
    ],
  },

  // 8. Airport Express
  {
    code: 'AEL',
    nameEN: 'Airport Express',
    nameTC: '機場快綫',
    stations: [
      { code: 'HOK', nameEN: 'Hong Kong', nameTC: '香港' },
      { code: 'KOW', nameEN: 'Kowloon', nameTC: '九龍' },
      { code: 'TSY', nameEN: 'Tsing Yi', nameTC: '青衣' },
      { code: 'AIR', nameEN: 'Airport', nameTC: '機場' },
      { code: 'AWE', nameEN: 'AsiaWorld-Expo', nameTC: '博覽館' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'AsiaWorld-Expo', destinationTC: '博覽館' },
      { code: 'DOWN', destinationEN: 'Hong Kong', destinationTC: '香港' },
    ],
  },

  // 9. South Island Line
  {
    code: 'SIL',
    nameEN: 'South Island Line',
    nameTC: '南港島綫',
    stations: [
      { code: 'ADM', nameEN: 'Admiralty', nameTC: '金鐘' },
      { code: 'OCP', nameEN: 'Ocean Park', nameTC: '海洋公園' },
      { code: 'WCH', nameEN: 'Wong Chuk Hang', nameTC: '黃竹坑' },
      { code: 'LET', nameEN: 'Lei Tung', nameTC: '利東' },
      { code: 'SOH', nameEN: 'South Horizons', nameTC: '海怡半島' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'South Horizons', destinationTC: '海怡半島' },
      { code: 'DOWN', destinationEN: 'Admiralty', destinationTC: '金鐘' },
    ],
  },

  // 10. Disneyland Resort Line
  {
    code: 'DRL',
    nameEN: 'Disneyland Resort Line',
    nameTC: '迪士尼綫',
    stations: [
      { code: 'SUN', nameEN: 'Sunny Bay', nameTC: '欣澳' },
      { code: 'DIS', nameEN: 'Disneyland Resort', nameTC: '迪士尼' },
    ],
    directions: [
      { code: 'UP', destinationEN: 'Disneyland Resort', destinationTC: '迪士尼' },
      { code: 'DOWN', destinationEN: 'Sunny Bay', destinationTC: '欣澳' },
    ],
  },
];

export function getMTRLine(lineCode: string): MTRLine | undefined {
  return MTR_LINES.find((l) => l.code === lineCode);
}

export function getMTRStation(stationCode: string): MTRStation | undefined {
  for (const line of MTR_LINES) {
    const s = line.stations.find((sta) => sta.code === stationCode);
    if (s) return s;
  }
  return undefined;
}

export function getMTRStationName(stationCode: string, isZH: boolean = true): string {
  const sta = getMTRStation(stationCode);
  if (!sta) return stationCode;
  return isZH ? sta.nameTC : sta.nameEN;
}


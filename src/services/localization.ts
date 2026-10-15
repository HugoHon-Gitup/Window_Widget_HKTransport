export const AppStrings = {
  // Tabs & Global
  appTitle: (isZH: boolean) => (isZH ? '上車易' : 'EasyBoard'),
  appSubtitle: (isZH: boolean) => (isZH ? '香港即時交通到站' : 'HK Transport Live Arrival'),
  tabFavourites: (isZH: boolean) => (isZH ? '常用路線' : 'Favourites'),
  tabAddTransport: (isZH: boolean) => (isZH ? '新增路線' : 'Add Transport'),
  tabGuide: (isZH: boolean) => (isZH ? '小工具教學' : 'Widget Guide'),
  tabSettings: (isZH: boolean) => (isZH ? '設定' : 'Settings'),

  // Actions
  cancel: (isZH: boolean) => (isZH ? '取消' : 'Cancel'),
  save: (isZH: boolean) => (isZH ? '儲存' : 'Save'),
  delete: (isZH: boolean) => (isZH ? '刪除' : 'Delete'),
  change: (isZH: boolean) => (isZH ? '更改' : 'Change'),
  refresh: (isZH: boolean) => (isZH ? '重新整理' : 'Refresh'),
  addTransport: (isZH: boolean) => (isZH ? '新增路線' : 'Add Transport'),
  openManager: (isZH: boolean) => (isZH ? '管理路線' : 'Manage Routes'),

  // Favourites Screen
  noSavedTransportsTitle: (isZH: boolean) => (isZH ? '暫無已儲存路線' : 'No Saved Transports'),
  noSavedTransportsDesc: (isZH: boolean) =>
    isZH
      ? '新增您常用的港鐵綫路或巴士站，即可在桌面小工具上查看即時到站時間。'
      : 'Add your everyday MTR lines and bus stops to track arrivals on your Desktop widget.',
  boardingStop: (isZH: boolean) => (isZH ? '上車站點' : 'Boarding Stop'),
  direction: (isZH: boolean) => (isZH ? '開往方向' : 'Direction'),
  loadingArrivals: (isZH: boolean) => (isZH ? '正在載入到站時間...' : 'Loading arrivals...'),
  fetchErrorRetry: (isZH: boolean) => (isZH ? '無法取得班次，點擊重試' : 'Could not fetch ETA, tap to retry'),
  noArrivalsScheduled: (isZH: boolean) => (isZH ? '暫無班次' : 'No arrivals scheduled'),
  platformSuffix: (isZH: boolean, platform: string) => (isZH ? `${platform}號月台` : `Plat ${platform}`),

  // Add Transport Screen
  operatorHeader: (isZH: boolean) => (isZH ? '交通營運商' : 'Transport Operator'),
  mtrLineHeader: (isZH: boolean) => (isZH ? '港鐵綫路' : 'MTR Line'),
  mtrStationHeader: (isZH: boolean) => (isZH ? '上車站點' : 'Boarding Station'),
  mtrDirectionHeader: (isZH: boolean) => (isZH ? '開往方向' : 'Direction'),
  mtrBranchHeader: (isZH: boolean) => (isZH ? '特定目的地 (選填)' : 'Specific Destination (Optional)'),
  allDestinations: (isZH: boolean) => (isZH ? '所有目的地' : 'All Destinations'),
  kmbRouteHeader: (isZH: boolean) => (isZH ? '九巴路線' : 'KMB Route'),
  citybusRouteHeader: (isZH: boolean) => (isZH ? '城巴路線' : 'Citybus Route'),
  gmbRouteHeader: (isZH: boolean) => (isZH ? '專線小巴路線' : 'Minibus Route'),
  gmbRegionHeader: (isZH: boolean) => (isZH ? '地區' : 'Region'),
  gmbRegionHKI: (isZH: boolean) => (isZH ? '港島' : 'Hong Kong Island'),
  gmbRegionKLN: (isZH: boolean) => (isZH ? '九龍' : 'Kowloon'),
  gmbRegionNT: (isZH: boolean) => (isZH ? '新界' : 'New Territories'),
  searchPlaceholder: (isZH: boolean) => (isZH ? '搜尋路線 (例如 1A, 89, 98D)' : 'Search route (e.g. 1A, 89, 98D)'),
  selectRoute: (isZH: boolean) => (isZH ? '選擇路線' : 'Select Route'),
  selectStop: (isZH: boolean) => (isZH ? '選擇站點' : 'Select Stop'),
  selectDirection: (isZH: boolean) => (isZH ? '選擇方向' : 'Select Direction'),
  customLabelHeader: (isZH: boolean) => (isZH ? '自訂標籤 (選填)' : 'Custom Label (Optional)'),
  customLabelPlaceholder: (isZH: boolean) => (isZH ? '例如：上班、回家' : 'e.g. To Work, Home'),
  selectedRoute: (isZH: boolean) => (isZH ? '已選路線' : 'Selected Route'),
  towards: (isZH: boolean, destination: string) => (isZH ? `往 ${destination}` : `Towards ${destination}`),
  outbound: (isZH: boolean) => (isZH ? '去程' : 'Outbound'),
  inbound: (isZH: boolean) => (isZH ? '回程' : 'Inbound'),

  // Settings Screen
  languageSection: (isZH: boolean) => (isZH ? '語言' : 'Language'),
  appLanguage: (isZH: boolean) => (isZH ? '介面語言' : 'App Language'),
  appearanceSection: (isZH: boolean) => (isZH ? '外觀主題' : 'Appearance'),
  theme: (isZH: boolean) => (isZH ? '主題模式' : 'Theme'),
  themeSystem: (isZH: boolean) => (isZH ? '跟隨系統' : 'System Default'),
  themeLight: (isZH: boolean) => (isZH ? '淺色模式' : 'Light Mode'),
  themeDark: (isZH: boolean) => (isZH ? '深色模式' : 'Dark Mode'),
  widgetOptionsSection: (isZH: boolean) => (isZH ? '桌面小工具設定' : 'Desktop Widget Options'),
  defaultWidgetSize: (isZH: boolean) => (isZH ? '預設尺寸' : 'Default Size'),
  sizeMedium: (isZH: boolean) => (isZH ? '中尺寸 (顯示最多 3 班車)' : 'Medium (Up to 3 arrivals)'),
  sizeSmall: (isZH: boolean) => (isZH ? '小尺寸 (緊湊方形)' : 'Small (Compact Square)'),
  alwaysOnTop: (isZH: boolean) => (isZH ? '小工具固定最上層 (置頂)' : 'Always on Top (Pin Widget)'),
  widgetOpacity: (isZH: boolean) => (isZH ? '小工具背景透明度' : 'Widget Opacity'),
  refreshInterval: (isZH: boolean) => (isZH ? '自動更新間隔' : 'Auto Refresh Interval'),
  sec30: (isZH: boolean) => (isZH ? '30 秒' : '30 seconds'),
  sec60: (isZH: boolean) => (isZH ? '60 秒 (建議)' : '60 seconds (Recommended)'),
  sec120: (isZH: boolean) => (isZH ? '2 分鐘' : '2 minutes'),

  privacySection: (isZH: boolean) => (isZH ? '隱私保證' : 'Privacy'),
  privacyTitle: (isZH: boolean) => (isZH ? '100% 裝置端運行與保護' : '100% On-Device & Private'),
  privacyDesc: (isZH: boolean) =>
    isZH
      ? '所有路線及到站快照均僅儲存在您的本機裝置內，不設任何帳號登入、第三方分析或遠端追蹤。'
      : 'All your saved routes and arrival caches are stored locally on your device in your private AppData directory. No user accounts, analytics, ads, or remote tracking are used.',

  dataSourcesSection: (isZH: boolean) => (isZH ? '開放數據來源' : 'Data Sources & Attribution'),
  dataSourcesFooter: (isZH: boolean) =>
    isZH
      ? '即時到站班次數據由香港政府資料一線通 (data.gov.hk) 及各交通營運商提供，實際時間可能受路面交通狀況影響。'
      : 'Arrival times are estimates provided directly by the respective transport operators through data.gov.hk Open Data APIs and are subject to traffic conditions.',

  aboutSection: (isZH: boolean) => (isZH ? '關於程式' : 'About'),
  version: (isZH: boolean) => (isZH ? '版本' : 'Version'),
  build: (isZH: boolean) => (isZH ? '內部版本' : 'Build'),

  // Detail Screen
  detailTitle: (isZH: boolean) => (isZH ? '路線詳情' : 'Transport Details'),
  changeStop: (isZH: boolean) => (isZH ? '更換站點' : 'Change Stop'),
  editStopTitle: (isZH: boolean) => (isZH ? '更換上車站點' : 'Change Boarding Stop'),
  saveChanges: (isZH: boolean) => (isZH ? '儲存變更' : 'Save Changes'),
  deleteRoute: (isZH: boolean) => (isZH ? '刪除此路線' : 'Delete Route'),
  upcomingArrivals: (isZH: boolean) => (isZH ? '即將到達班次' : 'Upcoming Arrivals'),
  deleteConfirmTitle: (isZH: boolean) => (isZH ? '確認刪除此路線？' : 'Delete this transport?'),
  deleteConfirmMessage: (isZH: boolean) =>
    isZH
      ? '刪除後，桌面小工具將無法再顯示此路線到站時間。'
      : 'This will remove the route from your saved list and desktop widget.',

  // Widget Guide
  guideTitle: (isZH: boolean) => (isZH ? '桌面小工具指南' : 'Desktop Widget Guide'),
  guideFeature1Title: (isZH: boolean) => (isZH ? '懸浮置頂與自由拖曳' : 'Floating & Free Dragging'),
  guideFeature1Desc: (isZH: boolean) =>
    isZH
      ? '小工具窗口可隨意拖曳至螢幕任意位置，並會自動記住上次關閉前的位置。點擊頂部的釘子圖示即可隨時切換「固定在最上層」或「貼在桌面」。'
      : 'Drag the widget anywhere on your screen. The app automatically remembers your custom position. Click the pin icon to toggle Always on Top or rest on your desktop.',
  guideFeature2Title: (isZH: boolean) => (isZH ? '多路線一鍵切換 (◀ / ▶)' : 'Multi-Route 1-Click Cycling'),
  guideFeature2Desc: (isZH: boolean) =>
    isZH
      ? '儲存 2 條或以上路線後，小工具頂部會顯示 [◀] 和 [▶] 按鈕及計數器 (例如 1/3)。點擊即可立即輪換不同港鐵或巴士到站資訊。'
      : 'When you save 2 or more routes, [◀] and [▶] arrows and counter (e.g. 1/3) appear on the widget. Tap them to cycle between all saved routes instantly.',
  guideFeature3Title: (isZH: boolean) => (isZH ? '中/小尺寸自由切換' : 'Medium & Small Size Switching'),
  guideFeature3Desc: (isZH: boolean) =>
    isZH
      ? '點擊小工具頂部尺寸按鈕，即可在中尺寸 (最多 3 班車及月台) 與小尺寸 (緊湊方塊單班車) 之間瞬間變換。'
      : 'Tap the size toggle button to switch smoothly between Medium (up to 3 arrivals with platform info) and Small (compact square with primary arrival).',
  guideFeature4Title: (isZH: boolean) => (isZH ? '即時更新與即將到達警示' : 'Live Refresh & Urgent Alert'),
  guideFeature4Desc: (isZH: boolean) =>
    isZH
      ? '到站時間即時以分鐘倒數。少於 5 分鐘的急迫班次會以亮紅色醒目標註；點擊重新整理按鈕可立即發送請求同步最新班次。'
      : 'Arrivals count down in real time. Arrivals within 5 minutes are highlighted in bold red. Tap refresh anytime to fetch the latest schedule.',
};


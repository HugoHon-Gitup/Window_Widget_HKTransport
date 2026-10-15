# 上車易 EasyBoard - 香港公共交通桌面小工具 (Windows)
> Hong Kong Public Transport Desktop Widget for Windows

A faithful port of the iOS HKTransportWidget (`EasyBoard` / `上車易`) to Windows, providing a native **Desktop Widget-style experience** with live arrival countdowns, platform badges, multi-route cycling, and full route management.

---

## 🌟 Key Features

### 1. 🪟 Desktop Floating Widget (桌面懸浮小工具)
- **Frameless Acrylic Glass Look**: Translucent glassmorphism styled with rounded corners, subtle shadows, and authentic transport operator brand badges.
- **Dual Widget Sizes**:
  - **Medium (360×170px)**: Displays route badge, boarding stop, destination, 3 upcoming arrivals with live countdowns, scheduled times, and platform badges (`1號月台`).
  - **Small (170×170px)**: Compact square card displaying prominent primary countdown, second arrival preview, and boarding stop.
  - Switch between Medium and Small instantly via the top size button.
- **Real-time Live Countdowns**: Minutes tick down in real time. Arrivals within 5 minutes are highlighted in bold red.
- **Route Switcher (`◀ 1/3 ▶`)**: Cycle between all your favourite routes directly on the widget without opening any full windows.
- **Instant Refresh (`↻`)**: Direct refresh with rotating animation.
- **Always on Top (📌 Pin to Desktop)**: Toggle between keeping the widget pinned on top of all windows or resting on your desktop.
- **Window Position Memory**: Automatically remembers where you placed the widget on your screen across restarts.

### 2. 🚆 Multi-Operator Live Support (4大交通營運商)
- **MTR (港鐵)**: Complete 10-line railway catalogue (港島綫, 荃灣綫, 觀塘綫, 將軍澳綫, 東鐵綫, 屯馬綫, 東涌綫, 機場快綫, 南港島綫, 迪士尼綫), with all stations, directions (UP/DOWN), and branch terminus filters (Po Lam vs LOHAS Park; Lo Wu vs Lok Ma Chau).
- **KMB (九巴)**: Live route search, direction/bound selection, and stop picker with bulk cached stop names from `data.etabus.gov.hk`.
- **Citybus (城巴)**: Live CTB route search, outbound/inbound direction, and 6-digit padded stop ETA queries from `rt.data.gov.hk`.
- **Green Minibus (專線小巴)**: Regional route selection (港島 HKI, 九龍 KLN, 新界 NT), route search, direction, and ETA queries from `data.etagmb.gov.hk`.

### 3. ⚙️ Management App (路線管理與設定)
- **Favourites View**: Reorder routes up/down, refresh all, delete, or inspect detailed arrival lists.
- **4-in-1 Add Route Wizard**: Cascading pickers with live search and real-time widget preview before saving.
- **Transport Detail View**: Full upcoming arrival schedule with platform numbers, remarks, and quick **Change Stop** modal.
- **Bilingual Interface**: Seamless 1-click toggle between **繁體中文 (Traditional Chinese)** and **English**.
- **System Tray**: Windows taskbar tray icon for background operation, route cycling, and fast widget toggle.
- **100% On-Device Privacy**: All configurations and arrival caches are stored locally in `%APPDATA%/HKTransportWidget/`. No user accounts, analytics, or remote tracking.

---

- **Dynamic Window Resizing**: Drag the bottom-right grip or any window edge to resize the widget smoothly to any dimensions you prefer.
- **Custom Liquid Glass Themes**: Choose from 6 preset color palettes (Obsidian Dark, Frost White, Sapphire Blue, Emerald Green, Amethyst Cyber, Amber Sunset) or pick any custom color with real-time text contrast adaptation.
- **Real-Time Opacity Tuning**: Smooth slider from 20% to 100% transparency with instant live update.
- **Silent Background Launcher**: Run completely invisibly in the system tray without any black terminal window via `run-widget.vbs`.

---

## 🚀 How to Run

### Option 1: Standalone Portable App (No installation required)
Directly run the compiled executable from `release\EasyBoard 1.0.0.exe`. No Node.js or command line required!

### Option 2: Silent Desktop Shortcut
Double-click `run-widget.vbs` or run `create-shortcut.ps1` to place an EasyBoard icon on your Desktop.

### Option 3: Command Line (For Developers)
```bash
# Install dependencies
npm install

# Build & run production mode
npm run build:electron
npm start

# Development live-reload mode
npm run dev
```

### Running Automated Tests
```bash
npm test
```
All unit tests cover MTR schedule parsing, KMB/Citybus/GMB ETA handling, branch filtering, countdown formatting, and stop code cleaners.

# Window_Widget_HKTransport

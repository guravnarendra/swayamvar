# Swayamvar Fullstack 💍

Modern fullstack implementation of **Swayamvar for your Money**:
- **Frontend:** Modern React + Vite (Fast HMR, clean modular components, SVG QR codes, responsive mobile & projector views).
- **Backend:** Node.js + Express + Socket.IO (Atomic room state machine, zero race conditions, sub-millisecond real-time sync).
- **Database:** Supabase (Background snapshot persistence).

---

## 🚀 One-Command Launch

From this directory (`swayamvar-fullstack/`):

```bash
npm run dev
```

This single command starts:
1. **Backend Server:** `http://localhost:4000` (Socket.IO + REST)
2. **Frontend App:** `http://localhost:3000` (Vite + React)

---

## 📁 Project Structure

```
swayamvar-fullstack/
├── package.json          # Root scripts to run both apps concurrently
├── backend/
│   ├── .env              # Supabase keys and PORT configuration
│   ├── package.json
│   └── src/
│       └── server.js     # Express + Socket.IO server & state machine
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── public/img/       # Suitor portraits, character avatars & assets
    └── src/
        ├── App.jsx       # Host & Player role switcher + socket connector
        ├── socket.js     # Socket.IO client singleton
        ├── gameData.js   # 6 Suitors, 4 Rounds, 3 Buckets, Persona data
        ├── styles.css    # Royal Indian wedding design & animations
        └── components/
            ├── Common/   # Petals, Ornament, SuitorBioCard, QRCodeCard
            ├── Host/     # HostCover, HostLobby, HostGallery, HostVoting, HostResults, HostFinale
            └── Player/   # PlayerJoin, PlayerCharacterWait, PlayerGallery, PlayerVoting, PlayerResults, PlayerFinale
```

---

## 🎮 How to Play

### 1. Host (Teacher / Projector)
Open the host screen on a TV, projector or classroom screen:
```
http://localhost:3000/?role=host&room=1995
```
- Click **"Open the Swayamvar"** to reveal the large QR code and live guest list.
- Click **"Begin the Swayamvar"** to introduce the 6 suitors.
- Click **"Proceed to Voting Rounds"** to conduct the 4 questions.
- Reveal results and discussion points, concluding with the 3-bucket **Asset Allocation** finale.

### 2. Player (Students / Mobile Phones)
Scan the QR code on the host screen or open:
```
http://localhost:3000/?role=player&room=1995
```
- Enter your name and gender preference.
- Receive or shuffle your unique Indian character avatar (e.g. *Maharani Ji*, *Family CFO*, *Bua Supreme*).
- Follow along with each suitor's biodata.
- Vote in real-time in all 4 rounds.
- View your personalized investment summary at the finale.

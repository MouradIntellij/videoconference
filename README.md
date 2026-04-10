# VideoConf - Application de Vidéoconférence Collaborative

## 📋 Description

Application web de vidéoconférence collaborative inspirée de Zoom, Webex, Skype et Microsoft Teams. Permet à plusieurs utilisateurs de se connecter à une même salle virtuelle pour communiquer en temps réel via audio et vidéo, échanger des messages instantanés et collaborer à travers un tableau blanc interactif.

## 🛠️ Technologies

- **Frontend:** React 18, Vite, TailwindCSS, ES6+
- **Backend:** Node.js, Express, Socket.IO
- **Temps réel:** WebRTC (pair-à-pair), Socket.IO (signalisation)
- **STUN:** Google STUN servers pour la découverte NAT

## 📁 Structure du Projet

```
videoconference/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   │   ├── VideoGrid.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Whiteboard.jsx
│   │   │   ├── Controls.jsx
│   │   │   └── Room.jsx
│   │   ├── context/       # Contextes React
│   │   │   ├── SocketContext.jsx
│   │   │   └── MediaContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                # Backend Node.js
│   ├── src/
│   │   └── index.js
│   └── package.json
├── package.json          # Root package (workspaces)
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Un navigateur moderne avec support WebRTC

### Étapes

1. **Installer les dépendances:**
```bash
cd C:\LaSalle\Winter2026\TT4\videoconference
npm install
```

2. **Lancer le serveur de développement:**
```bash
npm run dev
```

Cela lancera simultanément:
- Le serveur backend sur `http://localhost:4000`
- Le client frontend sur `http://localhost:5173`

## 📖 Utilisation

1. **Ouvrir le navigateur:** `http://localhost:5173`

2. **Créer une salle:**
   - Entrez votre nom
   - Cliquez sur "Créer une nouvelle salle"
   - Copiez l'ID de la salle généré

3. **Rejoindre une salle:**
   - Entrez votre nom
   - Collez l'ID de la salle
   - Cliquez sur "Rejoindre la salle"

4. **Fonctionnalités:**
   - 🎤 **Audio:** Activer/couper le microphone
   - 📹 **Vidéo:** Activer/désactiver la caméra
   - 💬 **Chat:** Messagerie instantanée dans la salle
   - 🎨 **Tableau blanc:** Dessiner et collaborer en temps réel
   - 📞 **Quitter:** Partir de la réunion

## 🔧 Architecture

### Backend (Socket.IO + Express)
- Gestion des salles virtuelles
- Signalisation WebRTC (offer/answer/ICE)
- Broadcast des messages chat
- Synchronisation du tableau blanc
- Suivi des participants

### Frontend (React + WebRTC)
- Capture des flux média (getUserMedia)
- Connexions pair-à-pair (RTCPeerConnection)
- Gestion des états avec Context API
- Interface responsive avec TailwindCSS

### WebRTC Flow
1. User A joins room → creates peer connection
2. User B joins → Server notifies A
3. A creates offer → sends to B via Socket.IO
4. B receives offer → creates answer → sends to A
5. ICE candidates exchanged → P2P connection established
6. Media streams flow directly between peers

## ⚠️ Limitations

- **STUN seulement:** Pas de support TURN pour les réseaux restrictifs
- **Mesh architecture:** Chaque peer se connecte à tous les autres (limité à ~4-6 participants)
- **Pas de persistance:** Les salles sont éphémères (en mémoire)
- **Pas d'authentification:** Accès libre aux salles

## 🎯 Améliorations Possibles

- [ ] Ajouter un serveur TURN (coturn)
- [ ] Authentification utilisateur
- [ ] Persistance des salles (Redis/PostgreSQL)
- [ ] Partage d'écran
- [ ] Enregistrement des réunions
- [ ] Architecture SFU pour + de participants
- [ ] Qualité vidéo adaptative
- [ ] Chat privé
- [ ] Réactions/emojis
- [ ] Mode présentoir

## 📝 Commandes npm

```bash
# Développement (client + server)
npm run dev

# Seulement le server
npm run dev:server

# Seulement le client
npm run dev:client

# Build de production
npm run build

# Démarrer en production
npm start
```

## 👨‍💻 Auteurs

Projet de stage - TT4 Winter 2026
LaSalle College

## 📄 License

MIT

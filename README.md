# AtlasGo - MVP

Application mobile React Native (Expo) + FastAPI pour découvrir les points d'intérêt (toilettes, parkings, Wi-Fi) sur une carte interactive.

## 🚀 Fonctionnalités

- **Carte interactive** avec géolocalisation
- **Points d'intérêt** : toilettes publiques, parkings, bornes Wi-Fi
- **Filtres** par type de POI
- **Recherche** de lieux
- **Navigation** vers Google Maps/Apple Maps
- **Thème** light/dark automatique
- **Interface moderne** avec micro-animations

## 🛠️ Stack technique

### Frontend (Mobile)
- React Native avec Expo
- TypeScript
- react-native-maps (Google Maps)
- Zustand (state management)
- NativeWind (Tailwind CSS)
- @gorhom/bottom-sheet
- React Navigation

### Backend
- FastAPI (Python)
- OpenStreetMap via Overpass API
- Cache mémoire avec TTL
- Données mock de secours

## 📱 Installation

### Prérequis
- Node.js 18+
- Python 3.8+
- Expo CLI
- Un émulateur iOS/Android ou un appareil physique

### Frontend

```bash
# Installer les dépendances
npm install

# Démarrer l'application
npm start

# Ou pour un appareil spécifique
npm run ios
npm run android
```

### Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Démarrer le serveur
python main.py
```

Le serveur API sera disponible sur `http://localhost:8000`

## 🎨 Design System

### Couleurs (Thème grec)
- **Primary** : #0A66C2 (Bleu Égée)
- **Accent** : #D4A017 (Or)
- **Light** : #F7F9FC / #0B1220
- **Dark** : #0B1220 / #E6EAF2

### Typographie
- **Police** : Inter/Urbanist
- **Tailles** : Tap ≥ 44px

### Composants
- **Rayons** : rounded-2xl partout
- **Ombres** : soft, pas de shadow dur
- **Glassmorphism** : blur 8-12px, opacité 0.75

## 📡 API Endpoints

### GET /places
Récupère les POI autour d'une position

**Paramètres :**
- `lat` : Latitude
- `lng` : Longitude  
- `radius_m` : Rayon en mètres (défaut: 1000)
- `types` : Types de POI séparés par des virgules (toilet,parking,wifi)

**Exemple :**
```
GET /places?lat=48.8566&lng=2.3522&radius_m=1000&types=toilet,parking,wifi
```

### GET /search
Recherche de POI par nom

**Paramètres :**
- `q` : Terme de recherche
- `lat` : Latitude de référence
- `lng` : Longitude de référence

## 🗺️ Configuration des cartes

L'application utilise Google Maps par défaut. Pour configurer :

1. Obtenez une clé API Google Maps
2. Ajoutez-la dans `app.json` :

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "VOTRE_CLE_API"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "VOTRE_CLE_API"
      }
    }
  }
}
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` dans le dossier `backend` :

```env
# API Overpass (optionnel)
OVERPASS_URL=https://overpass-api.de/api/interpreter

# Cache TTL en secondes
CACHE_TTL=300

# Port du serveur
PORT=8000
```

## 📱 Permissions

L'application demande les permissions suivantes :
- **Géolocalisation** : Pour centrer la carte sur la position de l'utilisateur

## 🚀 Déploiement

### Frontend (Expo)
```bash
# Build pour production
expo build:android
expo build:ios

# Ou avec EAS
eas build --platform all
```

### Backend
```bash
# Avec Docker
docker build -t atlasgo-api .
docker run -p 8000:8000 atlasgo-api

# Ou avec uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

Développé avec ❤️ pour AtlasGo

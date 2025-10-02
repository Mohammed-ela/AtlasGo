# 🚀 Guide de démarrage rapide - AtlasGo

## Installation en 5 minutes

### 1. Prérequis
- Node.js 18+ installé
- Python 3.8+ installé
- Expo CLI : `npm install -g @expo/cli`

### 2. Installation des dépendances

```bash
# Frontend
npm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Démarrage

**Terminal 1 - Backend :**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend :**
```bash
npm start
```

### 4. Test sur appareil

1. Installez l'app **Expo Go** sur votre téléphone
2. Scannez le QR code affiché dans le terminal
3. L'app se lance automatiquement !

## 🎯 Fonctionnalités testables

- ✅ **Géolocalisation** : Autorisez l'accès à la position
- ✅ **Filtres** : Toilettes, Parking, Wi-Fi
- ✅ **Recherche** : Tapez un nom de lieu
- ✅ **Détails** : Touchez un marqueur sur la carte
- ✅ **Navigation** : Bouton "Itinéraire" dans les détails
- ✅ **Thème** : Change automatiquement selon l'heure

## 🔧 Configuration Google Maps (optionnel)

1. Obtenez une clé API Google Maps
2. Modifiez `app.json` :
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "VOTRE_CLE"
        }
      }
    }
  }
}
```

## 🐛 Dépannage

**Problème de géolocalisation :**
- Vérifiez les permissions dans les paramètres
- L'app utilise Paris par défaut si refusé

**API ne répond pas :**
- Vérifiez que le backend tourne sur le port 8000
- L'app utilise des données mock en fallback

**Erreur de build :**
- Supprimez `node_modules` et relancez `npm install`
- Vérifiez la version de Node.js

## 📱 Test sur émulateur

**Android :**
```bash
npm run android
```

**iOS :**
```bash
npm run ios
```

## 🎨 Personnalisation

**Couleurs** : Modifiez `tailwind.config.js`
**Données** : Ajoutez des POI dans `backend/mock_data.json`
**API** : Changez l'URL dans `src/services/api.ts`

---

**Prêt !** Votre MVP AtlasGo est fonctionnel ! 🎉

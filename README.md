# YELY Station Mobile (MVP)

Application mobile Station/Caissier pour YELY V3.

## Stack

- Expo SDK 54
- React Native + TypeScript
- Expo Router
- AsyncStorage
- Expo Camera (QR scan)
- Expo Haptics
- fetch API centralisee

## Auth station staff

- `POST /auth/login`
- `GET /auth/me`

Roles autorises cote app station:

- `CASHIER`
- `STATION_MANAGER`
- `STATION_OWNER`
- `YELY_ADMIN`

## Flow scan -> transaction

1. Scan QR chauffeur
2. Resolution chauffeur backend
3. Navigation vers `/transaction/new`
4. Saisie carburant/litres/montant
5. Creation transaction backend
6. Affichage succes transaction
7. Acces detail transaction ou scanner suivant

## Endpoints backend utilises

- Resolution chauffeur:
  - `GET /drivers/resolve-by-qr/{qrCodeToken}`
- Creation transaction:
  - `POST /transactions`
- Detail transaction:
  - `GET /transactions/{id}`
- Historique station (principal):
  - `GET /station-dashboard/me/transactions`
- Fallback historique station:
  - `GET /stations/{id}/transactions`
- Transactions du jour:
  - `GET /stations/{id}/transactions/today`

## Historique et details

- La page `/transactions` affiche les vraies transactions avec pull-to-refresh et pagination.
- Chaque carte transaction ouvre le detail `/transaction/[id]`.

## UX terrain

- Bouton "Scanner suivant" apres succes pour enchaînement rapide.
- Haptics subtils:
  - succes scan
  - erreur scan
  - transaction creee
- Placeholder photo pompe present dans creation/detail (upload reel a venir).

## Installation

```bash
npm install
```

## Lancement

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Variables d'environnement

Copier `.env.example` vers `.env` puis ajuster:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.yely.tech/api/v1
```

## Scripts

- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run typecheck`

## Prochaines etapes

- upload photo pompe
- offline foundation
- sync terrain

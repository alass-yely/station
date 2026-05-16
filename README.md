# YELY Station Mobile (V3)

Application mobile terrain pour les équipes station YELY (focus `CASHIER`).

## Fonctionnel actuel

Le runtime principal est opérationnel:

1. Login cashier
2. Choix pompe
3. Ouverture/restauration de session de travail
4. Scan QR chauffeur
5. Création transaction + upload photo pompe
6. Historique cashier
7. Fermeture de service

## Navigation runtime (cashier)

- `Scanner`
- `Historique`
- `Service` (via la route pompe)
- `Profil`

Redirections:

- Si `mustSelectPump=true` -> `/pump`
- Si session ouverte -> `/scan`

## Endpoints utilisés

Auth et session:

- `POST /auth/station/cashier/login`
- `GET /stations/me/work-sessions/current`
- `POST /stations/me/work-sessions/start`
- `POST /stations/me/work-sessions/{sessionId}/close`

Pompes:

- `GET /stations/{stationId}/pumps`

Scan et transaction:

- `GET /drivers/resolve-by-qr/{qrCodeToken}`
- `POST /uploads/pump-photo`
- `POST /transactions`
- `GET /transactions/{id}`

Historique:

- `GET /cashiers/me/transactions` (cashier)
- `GET /station-dashboard/me/transactions` (station non-cashier)

## UI / Thème YELY

Identité visuelle appliquée:

- Vert YELY: `#0F9D58`
- Gris texte: `#333333`
- Fond app: `#F7F9F8`

Base thème:

- `src/constants/theme.ts`
- `src/theme/colors.ts`

## Structure projet

Un export d’arborescence est disponible dans:

- `PROJECT_STRUCTURE.md`

## Stack technique

- Expo (Router)
- React Native + TypeScript
- AsyncStorage
- Expo Camera
- Expo Image Picker
- Expo Haptics

## Configuration environnement

1. Copier `.env.example` vers `.env`
2. Configurer l’URL backend (ex: `EXPO_PUBLIC_API_BASE_URL`)

## Commandes utiles

```bash
npm install
npm run start
npm run android
npm run typecheck
```

## Notes

- Ce projet contient des guards runtime autour des sessions de travail pour empêcher le scan/transaction hors session ouverte.
- L’historique cashier est mappé sur le format backend actuel (`data` tableau, montants/litres parfois en chaînes).

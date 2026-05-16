# YELY V3 - Mobile Chauffeur

Application mobile chauffeur avec Expo Router, auth reelle, Bottom Tabs, dashboard/transactions/cashback/reseau connectes, et design system UI consolide.

## Prerequis

- Node.js 20+
- npm 10+
- Expo Go compatible SDK 54

## Installation

```bash
npm install
```

## Variables d'environnement

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_BASE_URL=https://api.yely.tech/api/v1
```

## Lancer

```bash
npm run start
```

## Endpoints backend utilises

- `POST /auth/login`
- `POST /auth/drivers/register`
- `GET /auth/me`
- `GET /drivers/me/dashboard`
- `GET /drivers/me/qr`
- `GET /drivers/me/transactions`
- `GET /drivers/me/cashback`
- `GET /drivers/me/referrals/summary`

## Design System consolide

Composants UI reutilisables:

- `StatusBadge` (`src/components/ui/status-badge.tsx`)
- `InlineToast` (`src/components/ui/inline-toast.tsx`)
- `FullscreenLoading` / `FullscreenError`
- `AppHeader` (`src/components/layout/app-header.tsx`)
- `EmptyState` harmonise

Theme:

- `statusColors` centralise dans `src/theme/status.ts`
- spacing avec `tabBarOffset`

## Optimisations UX/Perf

- FlatList optimisees (transactions/cashback/referrals):
- `removeClippedSubviews`
- `initialNumToRender={8}`
- `maxToRenderPerBatch={8}`
- `windowSize={7}`
- `keyboardShouldPersistTaps="handled"`
- Badges statuts unifies et colores via `StatusBadge`.
- Dates transaction/cashback avec heure (`formatDateTime`).
- Timer de copie referral securise (cleanup timeout au unmount).

## Reseau / Parrainage

- Code parrainage visible
- Copie via `expo-clipboard`
- Partage via API `Share`
- Resume bonus + liste filleuls si disponible
- Fallback robuste quand seul le resume est renvoye

## Dependances ajoutees

- `react-native-qrcode-svg`
- `react-native-svg`
- `expo-clipboard`

## Prochaines etapes

1. App Station/Caissier
2. Scan QR station
3. Flux transaction station end-to-end
4. Refresh token automatique
5. Polish UX final cross-app

# MyStudyCompanion (Expo / React Native)

Application mobile pour les étudiants de l'EMSI, conçue pour fonctionner hors ligne. Elle permet de consulter son emploi du temps, de recevoir des alertes et de gérer ses tâches. L'application utilise Google Sheets comme un CMS headless. Elle supporte les liens profonds (deep links), la mise en cache avec AsyncStorage, et (dans les builds de développement) des notifications en arrière-plan pour les cours actuels et les nouvelles alertes.

## Fonctionnalités
- **Emploi du temps et Alertes** depuis Google Sheets (`opensheet.elk.sh`).
- **Cache hors ligne** avec AsyncStorage.
- **Tableau de bord** avec mise en évidence de la session en cours et des cours du jour.
- **Grille d'emploi du temps** complète 5x4 (Lundi–Vendredi, 4 créneaux).
- **Section Alertes & Messages** avec des couleurs de priorité (rouge/orange/vert).
- **Liste de tâches personnelle** (locale, persistante, ajout/modification/suppression, marquer comme fait).
- **Liste de tâches partagée** (depuis l'onglet `TODO` de la même feuille de calcul Google Sheets).
- **Pomodoro Timer** pour aider à la concentration.
- **Graphique de progression** de la liste de tâches sur le tableau de bord.
- **Liens profonds** (`mystudy://open?screen=Alerts&id=123`).
- **Notifications en arrière-plan** (uniquement pour les builds de développement, non supporté par Expo Go).

## Structure du projet
```
App.js
app.json
src/
  background/notificationsTask.js
  components/...
  hooks/useCachedResource.js
  navigation/AppNavigator.js
  navigation/LinkingConfiguration.js
  screens/DashboardScreen.js
  screens/AlertsScreen.js
  screens/ScheduleScreen.js
  screens/TodoScreen.js
  screens/SharedTodoScreen.js
  screens/PomodoroScreen.js
  services/googleSheetsService.js
  storage/storageKeys.js
  utils/time.js
assets/
```

## Configuration de Google Sheets
Utilisez une feuille de calcul Google Sheets avec trois onglets :
- `SCHEDULE` avec les en-têtes : `Day | StartTime | EndTime | Module | Professor | Room | Group | Notes`
- `ALERTS` avec les en-têtes : `Id | Title | Message | Priority | ExpiresAt | CreatedAt | Link`
  - Priorité : `high` (rouge), `medium` (orange), `low` (vert)
  - Exemple de lien : `mystudy://open?screen=Alerts&id=1`
- `TODO` (partagé) avec les en-têtes : `Title | Course | DueAt | Priority | Duration` (Id optionnel)

Partagez la feuille de calcul en mode "Tous les utilisateurs disposant du lien – Lecteur".

## Configuration
Modifiez `src/services/googleSheetsService.js`:
- `SHEET_ID`: à remplacer par l'ID de votre feuille de calcul Google Sheets (la même pour l'emploi du temps, les alertes et la liste de tâches partagée).
- Le code utilise `https://opensheet.elk.sh/${SHEET_ID}/<ONGLET>`.

## Scripts
- Installer les dépendances : `npm install`
- Démarrer (recommandé) : `npx expo start`
- Démarrer + vider le cache : `npx expo start --clear`
- Vérifier la configuration : `npx expo-doctor`
- Build de développement (pour les notifications/tâches de fond) : `eas build --profile development --platform android` (ou `ios`), puis `npx expo start --dev-client`

## Lancement
1) `npm install`
2) Configurez `SHEET_ID` dans `src/services/googleSheetsService.js`
3) `npx expo start`
4) Ouvrez sur un appareil/simulateur ; tirez pour rafraîchir sur le tableau de bord pour charger les données et mettre en cache pour une utilisation hors ligne.

## Liens profonds (Deep links)
- Schéma : `mystudy://`
- Exemple : `mystudy://open?screen=Alerts&id=1`
- Tester sur un simulateur :
  - iOS : `npx uri-scheme open "mystudy://open?screen=Alerts&id=1" --ios`
  - Android : `npx uri-scheme open "mystudy://open?screen=Alerts&id=1" --android`

## Notifications en arrière-plan
- Implémenté dans `src/background/notificationsTask.js`
- Interroge l'emploi du temps et les alertes toutes les ~3 minutes (au mieux, contrôlé par l'OS), envoie une notification locale lors d'un changement de cours actuel ou d'un nouvel ID d'alerte.
- Nécessite l'autorisation de notification et un client de développement/build. **Expo Go ne supporte pas cette fonctionnalité.**
- Dans Expo Go, l'application affiche un avertissement et ignore l'enregistrement des tâches de fond.

## Comportement hors ligne
- Récupération réseau -> mise en cache dans AsyncStorage.
- En cas d'échec, charge depuis le cache (emploi du temps, alertes, tâches partagées).
- Les tâches personnelles sont toujours locales et persistantes.

## Conseils de test & débogage
- Vérifiez le JSON de la feuille de calcul : `https://opensheet.elk.sh/<SHEET_ID>/SCHEDULE` (ou ALERTS/TODO).
- Si les listes sont vides, vérifiez les noms des onglets/en-têtes et le partage.
- Utilisez `npx expo-doctor` pour détecter les problèmes de configuration.
- Pour réinitialiser le cache, désinstallez l'application ou videz AsyncStorage manuellement.

## Déploiement
- Utilisez EAS pour les builds de production/développement :
  - Installez EAS : `npm i -g eas-cli`
  - Configurez `eas.json` (si nécessaire) et lancez `eas build --platform android|ios`
- Poussez sur Git comme d'habitude ; assurez-vous que `.expo/`, `node_modules/` sont ignorés (déjà dans `.gitignore`).

## Dépannage
- “Background notifications limited in Expo Go” : construisez un client de développement (`eas build --profile development`) and run with `npx expo start --dev-client`.
- “Cannot fetch sheet” : vérifiez le partage de la feuille de calcul et les noms des onglets ; confirmez le `SHEET_ID`.
- “Deep link doesn’t open app” : assurez-vous que le schéma `mystudy` est dans `app.json` et testez via `npx uri-scheme`.
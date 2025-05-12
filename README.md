# ProjetSpe4

# 📚 Wiki Collab App

Application collaborative de création de documents en temps réel (type wiki), avec gestion des comptes, édition à plusieurs, et API sécurisée avec JWT.

---

## 🚀 Lancement du projet

### 1. Copier le fichier `.env.example`

Avant de lancer le projet, crée un fichier `.env` à la **racine du projet** :

```bash
cp .env.example .env
```

Puis remplace la valeur de `JWT_SECRET` par une clé secrète personnalisée :

```env
JWT_SECRET=superSecretChiffre123
```

---

### 2. Démarrer le projet (avec Docker)

```bash
npm run dev:all
```

> Démarre MongoDB, le backend Express avec hot reload (Nodemon), et le frontend Vite avec live reload.

---

## ⚙️ Commandes utiles

### Nettoyer tous les conteneurs, volumes et fichiers temporaires

```bash
npm run clean
```

> Équivaut à `docker-compose down -v --remove-orphans`

---

### Relancer tout proprement (nettoyage + build)

```bash
npm run restart
```

> Stoppe tous les services et redémarre depuis zéro avec `--build`

---

### Voir les logs en direct

```bash
npm run logs
```

> Affiche les logs combinés de tous les services (`docker-compose logs -f`)

---

### Arrêter tous les services

```bash
npm run down
```

> Arrête proprement les conteneurs (`docker-compose down`)

---

## 🌐 Accès

- **Frontend React (Vite)** : [http://localhost:5173](http://localhost:5173)
- **Backend API (Express)** : [http://localhost:3001/api](http://localhost:3001/api)

> Exemple : `GET http://localhost:3001/api/hello`

---

## 📦 Structure des services

- `frontend` : Application React (Vite) avec hot reload
- `backend` : API Express avec Nodemon
- `mongo` : Base de données MongoDB

---

## 🔐 Sécurité

Ne jamais exposer votre `JWT_SECRET` en clair. Ne versionnez jamais votre fichier `.env`.
Vous pouvez fournir un fichier `.env.example` dans le dépôt pour faciliter l'onboarding.

---

## 📂 Fichiers importants

- `.env.example` → modèle de configuration
- `docker-compose.yml` → orchestration complète
- `/frontend` → frontend React
- `/backend` → backend Express (API + JWT + MongoDB)

---

## 📌 Remarques

- Le fichier `version:` dans `docker-compose.yml` a été supprimé (obsolète dans Docker Compose V2)
- Le fichier `.env` à la racine est automatiquement lu par Docker Compose

---

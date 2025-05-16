# 📚 Wiki Collab App – Guide de démarrage

Application collaborative de type wiki permettant la création de documents en temps réel, avec édition simultanée, gestion des utilisateurs, authentification sécurisée (JWT), et intégration de services via Docker.

---

## ✅ Pré-requis

Avant de lancer le projet, assure-toi d’avoir les éléments suivants installés sur ta machine :

* **Docker** et **Docker Compose**
* **Node.js** et **npm** (si tu souhaites utiliser les scripts `npm run` manuellement)

---

## ⚙️ Configuration initiale

### 1. Création du fichier `.env`

Commence par copier le fichier d’exemple fourni :

```bash
cp .env.example .env
```

Puis personnalise les variables sensibles dans le fichier `.env` :

```env
JWT_SECRET=superSecretChiffre123
GOOGLE_CLIENT_ID=XXX
GOOGLE_CLIENT_SECRET=XXX
API_URL=http://localhost:3001/
FRONTEND_URL=http://localhost:5173/
ADMIN_EMAIL=admin@email.fr
ADMIN_PASSWORD=admin
```

🛡️ **Important** : remplace `XXX` par tes propres identifiants Google pour activer l’authentification OAuth2.

---

## 🚀 Lancer le projet avec Docker

Lance tous les services (MongoDB, backend, frontend) en une seule commande :

```bash
npm run dev:all
```

Cela démarre :

* MongoDB (base de données)
* Le backend Express avec hot reload (Nodemon)
* Le frontend React avec Vite et live reload

---

## 📦 Structure des services

* `frontend` : Application React (Vite)
* `backend` : API Node.js (Express + JWT)
* `mongo` : Base de données MongoDB

---

## 🌐 Accès aux services

* **Frontend** : [http://localhost:5173](http://localhost:5173)
* **API Backend** : [http://localhost:3001/api](http://localhost:3001/api)

Par exemple : `GET http://localhost:3001/api/hello`

---

## 🛠️ Commandes utiles

| Action                          | Commande          | Description                                                                              |
| ------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| Nettoyer les conteneurs/volumes | `npm run clean`   | Supprime les volumes et orphelins (équivaut à `docker-compose down -v --remove-orphans`) |
| Redémarrer proprement           | `npm run restart` | Nettoie puis relance avec `--build`                                                      |
| Voir les logs                   | `npm run logs`    | Affiche les logs combinés de tous les services                                           |
| Arrêter les services            | `npm run down`    | Arrête proprement tous les conteneurs Docker                                             |

---

## 🔐 Sécurité

* **Ne jamais versionner** le fichier `.env` (gardez-le localement).
* Gardez votre `JWT_SECRET` et vos clés Google confidentielles.
* Partagez uniquement le fichier `.env.example` pour faciliter l’intégration d’autres développeurs.

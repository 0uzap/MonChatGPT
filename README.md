# 🧠 Mini-GPT - Chat IA avec Next.js & Node.js

Bienvenue dans **Mini-GPT**, une application de chatbot basée sur **Next.js** pour le frontend et **Node.js** pour le backend.  
L'application utilise l'API **Hugging Face** pour générer des réponses et enregistre l'historique des conversations dans **MongoDB**.

---

## 🚀 **Installation & Configuration**

### ** Prérequis**
- **Node.js** 
- **MongoDB**
- **Docker** 
- **Un compte Hugging Face** avec un token API valide

### ** Une fois installé**
- **Creer un fichier .env** et y écrire les lignes suivantes:
- PORT=5000
- MONGO_URI=mongodb://localhost:27017/monchatgpt
- HF_API_TOKEN=votre_token_HugginFace

- **Installer les dépendances**
- cd backend
- npm install
- cd ..
- cd frontend
- npm install

- **Creation d'un conteneur Docker**
- docker run -d -p 27017:27017 --name mongodb mongo

- **Lancement de l'application**
- cd backend
- node .\server.js
- cd ..
- cd frontend
- npm run dev

- Vous pourrez ensuite acceder à l'interface de Mini-GPT à cette adresse: "http://localhost:3000" ou en faisant un CTRL + Click sur le lien local s'affichant dans votre terminal


 

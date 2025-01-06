# Utiliser une image Node.js comme base
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./

COPY server.js ./

# Installer les dépendances
RUN npm install

# Exposer le port utilisé par WebSocket
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "server.js"]

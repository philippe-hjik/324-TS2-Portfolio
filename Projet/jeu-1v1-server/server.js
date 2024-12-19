const WebSocket = require('ws');

// Créer un serveur WebSocket qui écoute sur le port 3000
const wss = new WebSocket.Server({ port: 3000 });

// Liste pour stocker les connexions des joueurs
let players = [];

// Écouter les connexions entrantes
wss.on('connection', (ws) => {
    console.log('Un joueur s\'est connecté.');

    // Ajouter le joueur à la liste
    players.push(ws);

    // Vérifier si deux joueurs sont connectés
    if (players.length === 2) {
        console.log('Deux joueurs connectés. Le jeu peut démarrer.');

        // Informer les deux joueurs que le jeu commence
        players.forEach((player, index) => {
            player.send(JSON.stringify({
                type: 'start',
                playerId: index + 1, // Assigner un ID unique à chaque joueur
            }));
        });
    }

    // Gérer les messages reçus d'un client
    ws.on('message', (message) => {
        console.log('Message reçu :', message);

        // Réenvoyer le message à l'autre joueur
        players.forEach((player) => {
            if (player !== ws && player.readyState === WebSocket.OPEN) {
                player.send(message);
            }
        });
    });

    // Gérer la déconnexion d'un joueur
    ws.on('close', () => {
        console.log('Un joueur s\'est déconnecté.');
        players = players.filter(player => player !== ws);
    });

    // Gérer les erreurs
    ws.on('error', (error) => {
        console.error('Erreur WebSocket :', error);
    });
});

console.log('Serveur WebSocket en cours d\'exécution sur le port 3000.');

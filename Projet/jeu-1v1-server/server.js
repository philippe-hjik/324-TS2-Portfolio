const WebSocket = require('ws');

// Créer un serveur WebSocket qui écoute sur le port 3000
const wss = new WebSocket.Server({ port: 3000, host: '0.0.0.0' });


// Liste pour stocker les connexions des joueurs
let players = [];

// Fonction pour extraire l'adresse IP d'un client
function getClientIp(req) {
    return req.socket.remoteAddress.replace('::ffff:', ''); // Supprime le préfixe IPv6 si nécessaire
}

// Écouter les connexions entrantes
wss.on('connection', (ws, req) => {
    const clientIp = getClientIp(req); // Récupérer l'adresse IP du client
    console.log(`Un joueur s'est connecté depuis ${clientIp}.`);

    // Vérifier si un joueur avec la même IP est déjà connecté
    if (players.some(player => player.ip === clientIp)) {
        console.log(`Un joueur avec l'adresse IP ${clientIp} est déjà connecté. Déconnexion.`);
        ws.close(); // Fermer la connexion en double
        return;
    }

    // Ajouter le joueur à la liste
    players.push({ ws, ip: clientIp });

    // Vérifier si deux joueurs distincts sont connectés
    if (players.length === 2) {
        console.log('Deux joueurs distincts connectés. Le jeu peut démarrer.');

        // Informer les deux joueurs que le jeu commence
        players.forEach((player, index) => {
            player.ws.send(JSON.stringify({
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
            if (player.ws !== ws && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(message);
            }
        });
    });

    // Gérer la déconnexion d'un joueur
    ws.on('close', () => {
        console.log(`Un joueur avec l'adresse IP ${clientIp} s'est déconnecté.`);
        players = players.filter(player => player.ws !== ws);
    });

    // Gérer les erreurs
    ws.on('error', (error) => {
        console.error(`Erreur WebSocket avec l'adresse IP ${clientIp} :`, error);
    });
});

console.log('Serveur WebSocket en cours d\'exécution sur le port 3000.');

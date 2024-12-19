const WebSocket = require('ws');

// Créer un serveur WebSocket qui écoute sur le port 3000
const wss = new WebSocket.Server({ port: 3000, host: '0.0.0.0' });

// Liste pour stocker les connexions des joueurs
let players = [];

// Fonction pour extraire l'adresse IP d'un client
function getClientIp(req) {
    return req.socket.remoteAddress.replace('::ffff:', ''); // Supprime le préfixe IPv6 si nécessaire
}

// Gérer les connexions entrantes
wss.on('connection', (ws, req) => {
    const clientIp = getClientIp(req); // Récupérer l'adresse IP du client
    console.log(`Connexion établie depuis ${clientIp}.`);

    // Refuser la connexion si deux joueurs sont déjà connectés
    if (players.length >= 2) {
        console.log(`Connexion refusée pour ${clientIp} : le serveur est plein.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Le serveur est plein. Veuillez réessayer plus tard.' }));
        ws.close();
        return;
    }

    // Assigner le rôle au joueur
    const playerId = players.length + 1; // 1 pour joueur vert, 2 pour joueur rouge
    const playerRole = playerId === 1 ? 'green' : 'red';
    players.push({ ws, ip: clientIp, id: playerId, role: playerRole });

    console.log(`Joueur ${playerRole} (ID: ${playerId}) connecté depuis ${clientIp}.`);

    // Informer le joueur de son rôle
    ws.send(JSON.stringify({ type: 'assignRole', playerId, role: playerRole }));

    // Vérifier si les deux joueurs sont connectés pour démarrer le jeu
    if (players.length === 2) {
        console.log('Deux joueurs connectés. Le jeu peut démarrer.');
        players.forEach(player => {
            player.ws.send(JSON.stringify({ type: 'start', message: 'Le jeu commence maintenant !' }));
        });
    }

    // Gérer les messages reçus d'un client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Diffuser les actions du joueur à l'autre joueur
            players.forEach(player => {
                if (player.ws !== ws && player.ws.readyState === WebSocket.OPEN) {
                    player.ws.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('Erreur lors du traitement du message :', error);
        }
    });

    // Gérer la déconnexion d'un joueur
    ws.on('close', () => {
        console.log(`Déconnexion de ${clientIp} (${playerRole}).`);
        players = players.filter(player => player.ws !== ws);

        // Informer le joueur restant qu'il attend un nouveau joueur
        if (players.length < 2) {
            players.forEach(player => {
                player.ws.send(JSON.stringify({ type: 'waiting', message: 'En attente d\'un autre joueur.' }));
            });
        }
    });

    // Gérer les erreurs
    ws.on('error', (error) => {
        console.error(`Erreur WebSocket avec ${clientIp} (${playerRole}) :`, error);
    });
});

console.log('Serveur WebSocket en cours d\'exécution sur le port 3000.');

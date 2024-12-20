const WebSocket = require('ws');
const crypto = require('crypto');

// Liste des parties
let games = {};

// Fonction pour générer un code de salle unique
function generateRoomCode() {
    return crypto.randomBytes(3).toString('hex'); // Génère un code de 6 caractères
}

// Créer un serveur WebSocket qui écoute sur le port 3000
const wss = new WebSocket.Server({ port: 3000, host: '0.0.0.0' });

// Gérer les connexions des joueurs
wss.on('connection', (ws) => {
    console.log('Un joueur s\'est connecté.');

    // Créer une partie de test dès la connexion
    const roomCode = generateRoomCode();
    games[roomCode] = { players: [ws] };

    // Envoyer un message de bienvenue dès qu'un joueur se connecte
    ws.send(JSON.stringify({ type: 'welcome', message: 'Bienvenue sur le serveur de jeu!' }));

    // Envoyer la liste des parties disponibles dès qu'un joueur se connecte
    ws.send(JSON.stringify({ type: 'gameList', games: Object.keys(games) }));

    ws.on('message', (message) => {
        console.log('Message reçu:', message);

        const data = JSON.parse(message);

        // Créer une nouvelle partie
        if (data.type === 'createGame') {
            const roomCode = generateRoomCode();
            games[roomCode] = { players: [ws] };

            // Envoyer un message au créateur de la partie avec le code de la salle
            ws.send(JSON.stringify({ type: 'gameCreated', roomCode }));

            // Notifier tous les autres joueurs de la nouvelle partie
            broadcastGameList();
        }

        // Rejoindre une partie existante
        if (data.type === 'joinGame') {
            const roomCode = data.roomCode;
            if (games[roomCode] && games[roomCode].players.length < 2) {
                games[roomCode].players.push(ws);

                // Informer les joueurs qu'ils sont dans la même partie
                games[roomCode].players.forEach(player => {
                    player.send(JSON.stringify({ type: 'gameStarted', roomCode }));
                });

                // Notifier tous les autres joueurs de la mise à jour de la liste des parties
                broadcastGameList();
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'La salle est pleine ou n\'existe pas.' }));
            }
        }
    });

    // Gestion de la fermeture de la connexion du joueur
    ws.on('close', () => {
        console.log('Un joueur a quitté.');
        // Retirer le joueur des parties
        Object.keys(games).forEach(roomCode => {
            games[roomCode].players = games[roomCode].players.filter(player => player !== ws);
            if (games[roomCode].players.length === 0) {
                delete games[roomCode];
            }
        });
        broadcastGameList();
    });

    // Fonction pour diffuser la liste des parties à tous les joueurs connectés
    function broadcastGameList() {
        const gameList = Object.keys(games);
        wss.clients.forEach(client => {
            // Filtrer les clients encore connectés
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'gameList', games: gameList }));
            }
        });
    }

    // Pinger les clients pour garder la connexion ouverte
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping(); // Envoie un ping pour garder la connexion ouverte
        }
    }, 30000); // Ping toutes les 30 secondes

    // Nettoyage lorsque la connexion est fermée
    ws.on('close', () => {
        clearInterval(interval);
    });
});

console.log('Serveur WebSocket en écoute sur le port 3000');

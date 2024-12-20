let socket;
let isConnected = false; // Indicateur pour vérifier l'état de la connexion
let reconnectTimeout; // Déclarer reconnectTimeout pour gérer la reconnexion

// Fonction pour établir la connexion WebSocket
function connectWebSocket() {
    socket = new WebSocket('wss://my-websocket-eqd8byb2bzbvg9cg.switzerlandnorth-01.azurewebsites.net'); // Remplacez l'URL par celle de votre serveur

    socket.onopen = () => {
        console.log("Connexion WebSocket réussie !");
        isConnected = true; // Marquer la connexion comme ouverte
    };

    socket.onclose = () => {
        console.log("Connexion WebSocket fermée. Tentative de reconnexion...");
        clearTimeout(reconnectTimeout); // Assurez-vous de nettoyer l'ancien délai de reconnexion
        reconnectTimeout = setTimeout(connectWebSocket, 5000); // Reconnexion après 5 secondes
        isConnected = false;
    };

    socket.onerror = (error) => {
        console.error("Erreur WebSocket :", error);
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Message reçu du serveur :", message);

        // Afficher le message de bienvenue
        if (message.type === 'welcome') {
            alert(message.message); // Affiche le message de bienvenue
        }

        if (message.type === 'gameList') {
            const gameListElement = document.getElementById('gameList');
            gameListElement.innerHTML = ''; // Réinitialiser la liste des parties

            message.games.forEach(game => {
                const li = document.createElement('li');
                li.textContent = `Salle: ${game} (Code)`;
                gameListElement.appendChild(li);
            });
        }

        if (message.type === 'gameCreated') {
            alert(`La partie a été créée avec le code : ${message.roomCode}`);
        }

        if (message.type === 'gameStarted') {
            alert(`Vous avez rejoint la partie avec le code : ${message.roomCode}`);
        }

        if (message.type === 'error') {
            alert(message.message);
        }
    };
}

connectWebSocket(); // Appeler pour initialiser la connexion

// Créer une partie (avec vérification de la connexion avant d'envoyer le message)
document.getElementById('createGameBtn').addEventListener('click', () => {
    if (isConnected) {
        socket.send(JSON.stringify({ type: 'createGame' }));
    } else {
        console.error("WebSocket n'est pas encore connecté. Réessayez plus tard.");
    }
});

// Rejoindre une partie (avec vérification de la connexion avant d'envoyer le message)
document.getElementById('joinGameBtn').addEventListener('click', () => {
    const roomCode = document.getElementById('roomCode').value;
    if (roomCode && isConnected) {
        socket.send(JSON.stringify({ type: 'joinGame', roomCode }));
    } else {
        console.error("WebSocket n'est pas encore connecté ou le code de salle est manquant.");
    }
});

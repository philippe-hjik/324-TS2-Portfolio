let socket;
let isConnected = false;

// Écoute le clic sur le bouton de connexion
document.getElementById('connectBtn').addEventListener('click', () => {
    const serverIp = document.getElementById('serverIp').value;
    const serverPort = document.getElementById('serverPort').value;

    if (!serverIp || !serverPort) {
        alert('Veuillez entrer une adresse IP et un port.');
        return;
    }

    const serverAddress = `ws://${serverIp}:${serverPort}`;
    socket = new WebSocket(serverAddress);

    // Lorsque la connexion est établie
    socket.onopen = () => {
        document.getElementById('connectionStatus').textContent = 'Connecté';
        isConnected = true;
        alert('Connexion établie. En attente d’un autre joueur...');
        socket.send(JSON.stringify({ type: 'join', player: 'player' })); // Signale au serveur qu'un joueur se connecte
    };

    // Gère les messages reçus du serveur
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'start') {
            alert('Un autre joueur est connecté. Le jeu va démarrer !');
            // Redirige vers la page multi.html
            window.location.href = './multi.html';
        }

        if (message.type === 'status') {
            // Mise à jour du statut des joueurs
            document.getElementById('connectionStatus').textContent = `Statut : ${message.status}`;
        }
    };

    // Gère les erreurs
    socket.onerror = (error) => {
        document.getElementById('connectionStatus').textContent = 'Erreur de connexion';
        console.error('Erreur WebSocket :', error);
    };

    // Gère la fermeture de la connexion
    socket.onclose = () => {
        document.getElementById('connectionStatus').textContent = 'Déconnecté';
        isConnected = false;
    };
});

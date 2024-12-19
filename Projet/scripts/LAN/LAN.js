let socket;
let isConnected = false;

document.getElementById('connectBtn').addEventListener('click', () => {
    const serverIp = document.getElementById('serverIp').value;
    const serverPort = document.getElementById('serverPort').value;

    if (!serverIp || !serverPort) {
        alert('Veuillez entrer une adresse IP et un port.');
        return;
    }

    const serverAddress = `ws://${serverIp}:${serverPort}`;
    socket = new WebSocket(serverAddress);

    socket.onopen = () => {
        document.getElementById('connectionStatus').textContent = 'Connecté';
        isConnected = true;
        alert('Connexion établie. En attente d’un autre joueur...');
        socket.send(JSON.stringify({ type: 'join', player: 'player' }));
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'start') {
            alert('Un autre joueur est connecté. Le jeu va démarrer !');
            // Redirige vers la page de jeu
            window.location.href = './1v1.html';
        }
    };

    socket.onerror = (error) => {
        document.getElementById('connectionStatus').textContent = 'Erreur de connexion';
        console.error('Erreur WebSocket :', error);
    };

    socket.onclose = () => {
        document.getElementById('connectionStatus').textContent = 'Déconnecté';
        isConnected = false;
    };
});
